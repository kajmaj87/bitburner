import { JOBS } from "./libs/jobs.js"
import { PORTS } from "./libs/ports.js"
import { bus } from "/libs/comm.js"
import { logger } from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
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
    while (true) {
        var addedJobs = 0
        while (!workQueue.full()) {
            const jobs = Array(JOBS_PER_BATCH).fill().map(() => createJob(forceTarget))
            log.info(`Batch mode! Dispatching tasks ${countJobs(jobs, JOBS.MINE)}M/${countJobs(jobs, JOBS.GROW)}G/${countJobs(jobs, JOBS.WEAKEN)}W`);
            await comm.tell(jobs, PORTS.WORK_QUEUE)
            addedJobs++
        }
        log.info(`Dispatcher added ${addedJobs} jobs to queue`)
        log.info(`Waiting...`)
        await ns.sleep(1010 - addedJobs * 20)
    }
}