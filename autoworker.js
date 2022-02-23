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
    const knownWorkers = () => [...knownTargets, "home", ...ns.getPurchasedServers()]
    while (true) {
        // var target = forcedTarget
        var processes = knownWorkers().flatMap(ns.ps)
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
            const bestMoneyThreshold = 0.05
            const maxSecurityDiff = 1
            const prediction = effectsOnHosts.get(target)
            const security = prediction ? prediction.security : ns.getServerSecurityLevel(target)
            const money = prediction ? prediction.money : ns.getServerMoneyAvailable(target)
            const lowestMoney = prediction ? prediction.lowestMoney : ns.getServerMoneyAvailable(target)
            const minThreadsForJob = 0
            var jobs = []
            if (lowestMoney > ns.getServerMaxMoney(target) * bestMoneyThreshold) {
                const moneyGain = lowestMoney - ns.getServerMaxMoney(target) * bestMoneyThreshold
                const threadsNeeded = Math.min(Math.floor(ns.hackAnalyzeThreads(target, moneyGain)), maxSecurityDiff / HACK_FALL)
                log.debug(`${JSON.stringify(mineJob(target, threadsNeeded), null, 2)}`)
                var job = mineJob(target, threadsNeeded)
                job.potentialGain = moneyGain * ns.hackAnalyzeChance(target)
                if (threadsNeeded > minThreadsForJob) {
                    jobs.push(job)
                }
            }
            if (money < ns.getServerMaxMoney(target)) {
                const requiredGrowth = ns.getServerMaxMoney(target) / money
                const threadsNeeded = Math.min(Math.floor(ns.growthAnalyze(target, requiredGrowth)), maxSecurityDiff / GROW_FALL)
                log.debug(`${JSON.stringify(growJob(target, threadsNeeded), null, 2)}`)
                if (threadsNeeded > minThreadsForJob) {
                    jobs.push(growJob(target, threadsNeeded))
                }
            }
            if (security > ns.getServerMinSecurityLevel(target)) {
                const threadsNeeded = Math.floor((security - ns.getServerMinSecurityLevel(target)) / WEAKEN_RISE)
                log.debug(`${JSON.stringify(weakenJob(target, threadsNeeded), null, 2)}`)
                if (threadsNeeded > minThreadsForJob) {
                    jobs.push(weakenJob(target, threadsNeeded))
                }
            }
            log.info(`Created jobs: ${log.j(jobs)}`)
            return jobs
        }
        var pendingJobs = knownTargets.flatMap(createJobs).sort((a, b) => b.prio - a.prio)
        const ramReserved = 0.2
        const jobsSummary = {
            mine: pendingJobs.filter(j => j.type == JOBS.MINE).map(j => j.threads).reduce((sum, th) => sum + th, 0),
            grow: pendingJobs.filter(j => j.type == JOBS.GROW).map(j => j.threads).reduce((sum, th) => sum + th, 0),
            weaken: pendingJobs.filter(j => j.type == JOBS.WEAKEN).map(j => j.threads).reduce((sum, th) => sum + th, 0),
            potentialGainsInMln: pendingJobs.filter(j => j.potentialGain).map(j => j.potentialGain).reduce((sum, th) => sum + th, 0) / 1_000_000
        }
        log.info(`A total of ${pendingJobs.length} jobs were created`)
        var job = pendingJobs.pop()
        for (var i = 0; i < knownWorkers().length; i++) {
            const worker = knownWorkers()[i]
            var jobStarted = true
            if (!job) {
                log.info(`Worker ${worker} had no jobs left to do`)
            }
            while (job && jobStarted && os.willFitInMemory('grower.js', worker)) {
                const threadsNeeded = Math.min(os.howManyWillFitNow('grower.js', worker, ns.getServerMaxRam(worker) * ramReserved), job.threads)
                var jobStarted = startJob(job, threadsNeeded, worker)
                log.debug(`Job ${JSON.stringify(job)} on ${worker} was started: ${jobStarted}`)
                if (jobStarted) {
                    job.threads -= threadsNeeded
                    job = job.threads > 0 ? job : pendingJobs.pop()
                }
            }
        }
        if (pendingJobs.length > 0) {
            log.info(`Not all jobs were started! There are still ${pendingJobs.map(j => j.threads).reduce((s, t) => s + t, 0)} pending threads`)
        }
        log.info(`Jobs that were created this turn: ${log.j(jobsSummary)}`)
        log.info(`Last run at: ${new Date()}`)
        await ns.sleep(10000)
    }
}
