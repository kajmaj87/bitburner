import { logger } from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const libs = ["comm.js", "jobs.js", "log.js", "os.js", "ports.js", "scan.js"]
    const scripts = ["miner.js", "grower.js", "weakener.js", "worker.js", "scan.js", "autorun.js", "autocopy.js"]
    const log = logger(ns)
    log.yell(`Bootstrap script started`)
    log.yell(`Killing all other running scripts on home`)
    ns.ps("home").filter(s => s.filename != 'bootstrap.js').forEach(s => {
        log.info(`Killing ${s.filename} (pid=${s.pid})`)
        ns.kill(s.pid)
    })
    log.yell(`Clearing all ports`)
    Array(20).fill().forEach((x, p) => {
        const port = ns.getPortHandle(p + 1)
        port.clear()
    })
    ns.run('autocopy.js', 1, 'home', ...libs.map(s => "/libs/" + s), ...scripts)
    log.yell(`Finished autocopy.js`)
    await ns.sleep(2000)
    log.yell(`Repository running pid=${ns.run('repository.js', 1)}`)
    ns.run('autorun.js', 1, 'home', 'scan.js')
    log.yell(`Scans running`)
    await ns.sleep(2000)
    ns.run('autorun.js', 1, 'home', 'worker.js')
    log.yell(`Workers on hacked nodes running`)
    await ns.sleep(2000)
    ns.getPurchasedServers().forEach(s=>{
        ns.exec('worker.js', s)
        log.yell(`worker.js@${s} started`)
    })
    log.yell(`Worker on home running pid=${ns.run('worker.js', 1, 16)}`)
    await ns.sleep(10000)
    if (ns.args.length == 3) {
        log.yell(`Dispatcher running pid=${ns.run('dispatcher.js', 1, ...ns.args)}`)
    } else {
        log.yell(`Dispatcher not started - no startup args provided`)
    }
    log.yell(`Bootstrap done`)
}