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
    while (true) {
        if (!workQueue.full()) {
            log.info(`Work queue is not full yet, dispatching task`)
            await comm.ask(async servers => {
                const hosts = servers.filter(s => s.rooted && s.host != 'home').map(s => s.host)
                const rnd = Math.random()
                var job = {}
                if (rnd < 0.05) {
                    job.type = JOBS.WEAKEN
                } else if (rnd < 0.15) {
                    job.type = JOBS.GROW
                } else if (rnd < 1) {
                    job.type = JOBS.MINE
                }
                job.target = randomElement(hosts)
                // log.info(`Rnd ${rnd} ==> ${job.type}@${job.target}`)
                await comm.tell(job, PORTS.WORK_QUEUE)
            }, "", 2)
        }
        await ns.sleep(100)
    }
}