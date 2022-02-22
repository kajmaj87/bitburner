import { bus, PORTS} from "/libs/comm.js"
import { logger } from "/libs/log.js"
import { JOBS } from "/libs/jobs.js"
import { system } from "/libs/os.js"
/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const os = system(ns)
    const reservedMemory = ns.args[0] || 0
    const canStartNextJob = (threads) =>
        os.willFitInMemory('miner.js', threads, reservedMemory)
        && os.willFitInMemory('grower.js', threads, reservedMemory)
        && os.willFitInMemory('weakener.js', threads, reservedMemory)
    const maxJobs = 50
    const threadsPerJob = 1//Math.ceil(os.howManyWillFit('miner.js')/maxJobs)
    comm.registerReader(async jobs => {
        while (jobs.length > 0) {
            if (canStartNextJob(threadsPerJob)) {
                const job = jobs.pop()
                const workerStartTime = Date.now()
                log.info(`Received job: ${job.type}@${job.target} (pid: ${workerStartTime})`)
                if (job.type == JOBS.MINE) {
                    if (ns.getServerRequiredHackingLevel(job.target) <= ns.getHackingLevel()) {
                        ns.run('miner.js', threadsPerJob, job.target, workerStartTime, ...job.args)
                    } else {
                        log.info(`Discarded ${job.type}@${job.target} as it is too hard`)
                    }
                }
                if (job.type == JOBS.GROW) {
                    ns.run('grower.js', threadsPerJob, job.target, workerStartTime, ...job.args)
                }
                if (job.type == JOBS.WEAKEN) {
                    ns.run('weakener.js', threadsPerJob, job.target, workerStartTime, ...job.args)
                }
            } else {
                await ns.sleep(1000)
            }
        }
    }, PORTS.WORK_QUEUE);
    await comm.readLoop()
}