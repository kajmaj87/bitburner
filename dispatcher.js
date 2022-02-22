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
        while (!workQueue.full() && couldAddJob) {
            if (forceTarget && weakenRatio && mineRatio) {
                const jobs = Array(JOBS_PER_BATCH).fill().map(() => createJob(forceTarget))
                log.info(`Batch mode! Dispatching tasks ${countJobs(jobs, JOBS.MINE)}M/${countJobs(jobs, JOBS.GROW)}G/${countJobs(jobs, JOBS.WEAKEN)}W`);
                await comm.tell(jobs, PORTS.WORK_QUEUE)
                addedJobs++
            } else {
                const maxSecurityDiff = 5
                const diffToStartWeaken = 0.5
                const minMoneyRatio = 0.75
                const growStartRatio = 0.8
                const effectsOnHosts = predictor.predict(knownWorkers.map(h => h.host).flatMap(ns.ps))
                log.info(`I have predictions`)
                if (effectsOnHosts.length == 0) {
                    var job = { type: JOBS.WEAKEN, target: forceTarget, args: [] }
                log.info(`No known effects, sending weaken`)
                    await comm.tell([job], PORTS.WORK_QUEUE)
                } else {
                    const securityIsLow = h => h.maxSecurity < h.minSecurity + maxSecurityDiff
                    const securityCanBeLowered = h => h.security > h.minSecurity + diffToStartWeaken
                    const moneyIsGood = h => h.lowestMoney / h.moneyMax > minMoneyRatio
                    const moneyCanGrow = h => h.money / h.moneyMax < growStartRatio
                    log.info(`Starting reduce`)
                    await effectsOnHosts.reduce(async (m, h) => {
                        await m
                        var job
                        if (moneyIsGood(h) && securityIsLow(h)) {
                            job = { type: JOBS.MINE, target: forceTarget, args: [] }
                        }
                        if (securityIsLow(h) && moneyCanGrow(h)) {
                            job = { type: JOBS.GROW, target: forceTarget, args: [] }
                        }
                        if (securityCanBeLowered(h)) {
                            job = { type: JOBS.WEAKEN, target: forceTarget, args: [] }
                        }
                        if (job) {
                            log.info(`Starting ${job.type}@${job.target}`)
                            await comm.tell([job], PORTS.WORK_QUEUE)
                        } else {
                            log.info(`Could not find a good job to start`)
                            couldAddJob = false
                        }
                    }, undefined)
                }
            }
        }
        // log.info(`Dispatcher added ${addedJobs} jobs to queue`)
        log.info(`Waiting...`)
        await ns.sleep(100)
    }
}