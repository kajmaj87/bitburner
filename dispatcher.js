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
    // clean old messages before we start to take effects immidiately
    workQueue.clear()
    while (true) {
        var addedJobs = 0
        if (!workQueue.full()) {
            if (forceTarget) {
                while (!workQueue.full()) {
                    var job = { args: [], target: forceTarget }
                    const rnd = Math.random();
                    job.type = rnd < weakenRatio ? JOBS.WEAKEN : rnd < mineRatio ? JOBS.MINE : JOBS.GROW
                    log.info(`Override mode! Dispatching task ${job.type}@${job.target}`)
                    await comm.tell(job, PORTS.WORK_QUEUE)
                    addedJobs++
                }
            } else {
                await comm.ask(async servers => {
                    addedJobs = 0
                    while (!workQueue.full()) {
                        const hosts = servers.filter(s => s.rooted && s.host != 'home')
                        const target = randomElement(hosts)
                        var job = { args: [] }
                        if (target.moneyPct < Math.random() - 0.1) {
                            job.type = JOBS.GROW
                            job.args.push(target.moneyPct)
                        } else {
                            const securityDelta = target.security / target.minSecurity - 1
                            if (Math.random() < securityDelta / 20) {
                                job.type = JOBS.WEAKEN
                                job.args.push(securityDelta)
                            } else {
                                job.type = JOBS.MINE
                            }
                        }
                        job.target = target.host
                        log.info(`Work queue is not full yet, dispatching task ${job.type}@${job.target}: ${job.args}`)
                        await comm.tell(job, PORTS.WORK_QUEUE)
                        addedJobs++
                    }
                }, "", 2)
            }
        }
        log.info(`Dispatcher added ${addedJobs} jobs to queue`)
        log.info(`Waiting...`)
        await ns.sleep(1010 - addedJobs * 20)
    }
}