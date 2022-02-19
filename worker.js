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
    var workerPID = 0
    comm.registerReader(job => {
        log.info(`Received job: ${job.type} on ${job.target} (pid: ${workerPID})`)
        if (job.type == JOBS.MINE) {
            ns.run('miner.js', 1, job.target, workerPID)
        }
        if (job.type == JOBS.GROW) {

        }
        if (job.type == JOBS.WEAKEN) {

        }
        workerPID++
    }, PORTS.WORK_QUEUE, () => {
        const canFit = os.willFitInMemory('miner.js')
        log.info(`Checking if should receive message: ${canFit}`)
        return canFit
    });
    await comm.readLoop()
}