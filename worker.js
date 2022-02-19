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
    const reservedMemory = args[0] || 0
    var workerPID = 0
    comm.registerReader(job => {
        log.info(`Received job: ${job.type} on ${job.target} (pid: ${workerPID})`)
        if (job.type == JOBS.MINE) {
            ns.run('miner.js', 1, job.target, workerPID)
        }
        if (job.type == JOBS.GROW) {
            ns.run('grow.js', 1, job.target, workerPID)
        }
        if (job.type == JOBS.WEAKEN) {
            ns.run('weaken.js', 1, job.target, workerPID)
        }
        workerPID++
    }, PORTS.WORK_QUEUE, () => os.willFitInMemory('miner.js', reservedMemory));
    await comm.readLoop()
}