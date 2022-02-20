import { bus } from "/libs/comm.js"
import { logger } from "/libs/log.js"
import { PORTS } from "/libs/ports.js"
import { JOBS } from "/libs/jobs.js"
import { system } from "/libs/os.js"
/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const os = system(ns)
    const reservedMemory = ns.args[0] || 0
    const canStartNextJob = () => os.willFitInMemory('miner.js', reservedMemory) && os.willFitInMemory('grower.js', reservedMemory) && os.willFitInMemory('weakener.js', reservedMemory)
    var workerPID = 0
    comm.registerReader(async jobs => {
        while (jobs.length > 0) {
            if (canStartNextJob()) {
                const job = jobs.pop()
                log.info(`Received job: ${job.type} on ${job.target} (pid: ${workerPID})`)
                if (job.type == JOBS.MINE) {
                    if (ns.getServerRequiredHackingLevel(job.target) <= ns.getHackingLevel()) {
                        ns.run('miner.js', 1, job.target, workerPID, ...job.args)
                    } else {
                        log.info(`Discarded ${job.type}@${job.target} as it is too hard`)
                    }
                }
                if (job.type == JOBS.GROW) {
                    ns.run('grower.js', 1, job.target, workerPID, ...job.args)
                }
                if (job.type == JOBS.WEAKEN) {
                    ns.run('weakener.js', 1, job.target, workerPID, ...job.args)
                }
                workerPID++
            } else {
                await ns.sleep(1000)
            }
        }
    }, PORTS.WORK_QUEUE);
    await comm.readLoop()
}