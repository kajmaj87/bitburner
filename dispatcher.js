import { JOBS } from "./libs/jobs.js"
import { bus, PORTS } from "libs/comm"
import { logger } from "/libs/log.js"
import { predict } from "libs/predict"
/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const predictor = predict(ns)
    const workQueue = ns.getPortHandle(PORTS.WORK_QUEUE)
    const randomElement = (list) => list[Math.floor((Math.random() * list.length))]
    const forceTarget = ns.args[0]
    const weakenRatio = ns.args[1]
    const mineRatio = ns.args[2]
    const JOBS_PER_BATCH = 100
    const createJob = (target) => {
        var job = { args: [], target: target }
        const rnd = Math.random();
        job.type = rnd < weakenRatio ? JOBS.WEAKEN : rnd < mineRatio ? JOBS.MINE : JOBS.GROW
        return job
    }
    const countJobs = (jobs, type) => jobs.filter(job => job.type == type).length
    // clean old messages before we start to take effects immidiately
    workQueue.clear()
    const knownWorkers = [...(await comm.ask(PORTS.SERVER_QUERY)), "home", ...ns.getPurchasedServers()]
    while (true) {
        var addedJobs = 0
        var couldAddJob = true
        while (!workQueue.full()) {
            const maxSecurityDiff = 5
            const diffToStartWeaken = 0.5
            const minMoneyRatio = 0.85
            const growStartRatio = 0.9
            const processes = knownWorkers.map(h => h.host).flatMap(ns.ps)
            const getnextjob = (fututrejobs, processes) => {
                const futureprocesses = fututrejobs.map(j => ({
                    filename: j.type == jobs.mine ? 'miner.js' : j.type == jobs.grow ?  'grower.js' : 'weakener.js',
                    args: [j.target, date.now()],
                    threads: 1
                }))
                const effectsonhosts = predictor.predict([...processes, ...futureprocesses])
                if (effectsonhosts.length == 0) {
                    return [{ type: jobs.weaken, target: forcetarget, args: [] }]
                } else {
                    const securityislow = h => h.maxsecurity < h.minsecurity + maxsecuritydiff
                    const securityistoolow = h => h.security < h.minsecurity
                    const securitycanbelowered = h => h.security > h.minsecurity + difftostartweaken
                    const moneyisgood = h => h.lowestmoney / h.moneymax > minmoneyratio
                    const moneycangrow = h => h.money / h.moneymax < growstartratio
                    log.info(`starting reduce`)
                    return effectsonhosts.map(h => {
                        var job
                        if (moneyisgood(h) && securityislow(h)) {
                            job = { type: jobs.mine, target: forcetarget, args: [] }
                        } else {
                            job = { type: jobs.grow, target: forcetarget, args: [] }
                        }
                        if (securitycanbelowered(h) && !securityistoolow(h)) {
                            job = { type: jobs.weaken, target: forcetarget, args: [] }
                        }
                        return job
                    }).filter(j => j) // remove undefined jobs
                }
            }
            // const newJobs = Array(JOBS_PER_BATCH).fill().reduce((fututreJobs, i) => [...fututreJobs, ...getNextJob(fututreJobs, processes)], [])
            await comm.tell(getNextJob([], processes), PORTS.WORK_QUEUE)
        }
        // log.info(`Dispatcher added ${addedJobs} jobs to queue`)
        log.info(`Waiting...`)
        await ns.sleep(100)
    }
}