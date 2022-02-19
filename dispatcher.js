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
            await comm.ask(async servers => {
                const hosts = servers.filter(s => s.rooted && s.host != 'home')
                const target = randomElement(hosts)
                var job = {}
                if(target.moneyPct < Math.random() - 0.1){
                    job.type = JOBS.GROW
                } else {
                    const securityDelta = target.security/target.minSecurity - 1
                    if(Math.random() < securityDelta / 20) {
                        job.type = JOBS.WEAKEN
                    } else {
                        job.type = JOBS.MINE
                    }
                }
                job.target = target.host
                log.info(`Work queue is not full yet, dispatching task ${job.type}@${job.target}`)
                await comm.tell(job, PORTS.WORK_QUEUE)
            }, "", 2)
        }
        await ns.sleep(100)
    }
}