import { logger } from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const libs = ["comm.js", "jobs.js", "log.js", "os.js", "ports.js", "scan.js"]
    const scripts = ["miner.js", "worker.js", "scan.js"]
    const log = logger(ns) 
    ns.run('autocopy.js', 1, 'home', ...libs.map(s => "/libs/" + s), ...scripts)
    await ns.sleep(2000)
    log.info(`Bootstrap done`)
}