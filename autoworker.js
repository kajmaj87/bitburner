import { logger } from "libs/log"
import { predict } from "libs/predict"
import { JOBS, growJob, mineJob, weakenJob } from "libs/jobs"
import { bus, PORTS } from "libs/comm"
import { system } from "libs/os"

const WEAKEN_RISE = 0.05
const HACK_FALL = 0.002
const GROW_FALL = 0.004

/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const predictor = predict(ns)
    const os = system(ns)
    const knownTargets = (await comm.ask(PORTS.SERVER_QUERY)).filter(h => h.rooted && h.host != "home" && h.money > 0).map(h => h.host)
    const knownWorkers = [...knownTargets, "home", ...ns.getPurchasedServers()]
    while (true) {
        // var target = forcedTarget
        var processes = knownWorkers.flatMap(ns.ps)
        var effectsOnHosts = predictor.predict(processes)
        const startJob = (job, threadsPerJob, worker) => {
            var pid = 0
            if (threadsPerJob <= 0) {
                return false
            }
            const workerStartTime = Date.now()
            if (job.type == JOBS.MINE) {
                if (ns.getServerRequiredHackingLevel(job.target) <= ns.getHackingLevel()) {
                    pid = ns.exec('miner.js', worker, threadsPerJob, job.target, workerStartTime, ...job.args)
                } else {
                    log.info(`Discarded ${job.type}@${job.target} as it is too hard`)
                }
            }
            if (job.type == JOBS.GROW) {
                pid = ns.exec('grower.js', worker, threadsPerJob, job.target, workerStartTime, ...job.args)
            }
            if (job.type == JOBS.WEAKEN) {
                pid = ns.exec('weakener.js', worker, threadsPerJob, job.target, workerStartTime, ...job.args)
            }
            return pid > 0
        }
        const createJobs = target => {
            const bestMoneyThreshold = 0.8
            const maxSecurityDiff = 1
            const prediction = effectsOnHosts.get(target)
            const security = prediction ? prediction.security : ns.getServerSecurityLevel(target)
            const money = prediction ? prediction.money : ns.getServerMoneyAvailable(target)
            const lowestMoney = prediction ? prediction.lowestMoney : ns.getServerMoneyAvailable(target)
            const minThreadsForJob = 9
            log.info(`Target ${target} security ${security} money ${money} lowest money ${lowestMoney}`)
            var jobs = []
            if (lowestMoney > ns.getServerMaxMoney(target) * bestMoneyThreshold) {
                const threadsNeeded = Math.min(Math.floor(ns.hackAnalyzeThreads(target, lowestMoney - ns.getServerMaxMoney(target) * bestMoneyThreshold)), maxSecurityDiff / HACK_FALL)
                log.info(`${JSON.stringify(mineJob(target, threadsNeeded), null, 2)}`)
                if (threadsNeeded > minThreadsForJob) {
                    jobs.push(mineJob(target, threadsNeeded))
                }
            }
            if (money < ns.getServerMaxMoney(target)) {
                const requiredGrowth = ns.getServerMaxMoney(target) / money
                const threadsNeeded = Math.min(Math.floor(ns.growthAnalyze(target, requiredGrowth)), maxSecurityDiff / GROW_FALL)
                log.info(`${JSON.stringify(growJob(target, threadsNeeded), null, 2)}`)
                if (threadsNeeded > minThreadsForJob) {
                    jobs.push(growJob(target, threadsNeeded))
                }
            }
            if (security > ns.getServerMinSecurityLevel(target)) {
                const threadsNeeded = Math.floor((security - ns.getServerMinSecurityLevel(target)) / WEAKEN_RISE)
                log.info(`${JSON.stringify(weakenJob(target, threadsNeeded), null, 2)}`)
                if (threadsNeeded > minThreadsForJob) {
                    jobs.push(weakenJob(target, threadsNeeded))
                }
            }
            log.info(`Created jobs: ${log.j(jobs)}`)
            return jobs
        }
        const pendingJobs = knownTargets.flatMap(createJobs).sort((a, b) => b.prio - a.prio)
        const ramReserved = 0.1
        log.info(`A total of ${pendingJobs.length} was created`)
        var job = pendingJobs.pop()
        for (var i = 0; i < knownWorkers.length; i++) {
            const worker = knownWorkers[i]
            var jobStarted = true
            log.info(`Worker ${worker} starting. Current job: ${JSON.stringify(job)}`)
            while (job && jobStarted && os.willFitInMemory('grower.js', worker)) {
                const threadsNeeded = Math.min(os.howManyWillFitNow('grower.js', worker, ns.getServerMaxRam(worker) * ramReserved), job.threads)
                log.info(`Threads needed: ${threadsNeeded}`)
                var jobStarted = startJob(job, threadsNeeded, worker)
                log.info(`Job ${JSON.stringify(job)} on ${worker} was started: ${jobStarted}`)
                if (jobStarted) {
                    job.threads -= threadsNeeded
                    job = job.threads > 0 ? job : pendingJobs.pop()
                }
                // await ns.sleep(2000)
            }
        }
        if (pendingJobs.length > 0) {
            log.info(`Not all jobs were started! There are still ${pendingJobs.length} pending jobs`)
            log.info(`Jobs are ${JSON.stringify(pendingJobs, null, 2)}`)
        }
        await ns.sleep(10000)
    }
}
