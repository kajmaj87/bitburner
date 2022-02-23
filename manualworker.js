
import { bus, PORTS} from "/libs/comm.js"
import { logger } from "/libs/log.js"
import { JOBS } from "/libs/jobs.js"
import { system } from "/libs/os.js"
/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const os = system(ns)
    const threads = ns.args[1]
    const target = ns.args[0]
    ns.hackAnalyzeThreads
    ns.run('miner.js', threads, target)

}