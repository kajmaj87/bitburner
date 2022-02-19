import { bus } from "/libs/comm.js"
import { logger } from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const host = ns.getHostname()
    const growScript = 'grow.js'
    const reservedMemory = ns.args[0] || 16
    var growPID = 0
    while (true) {
        if (willFitInMemory(growScript, reservedMemory)) {
            await comm.ask(async servers => {
                const bestGrow = servers.map(s => ({
                    host: s.host,
                    rooted: s.rooted,
                    time: s.growTime,
                    rate: s.moneyIncForThreadSecond
                })).filter(s=>s.rooted).sort((a, b) => b.rate - a.rate)[0]
                log.info(`Best server to grow is ${bestGrow.host}. Money inc per thread: ${bestGrow.rate}`)
                log.info(`Server will grow in ${bestGrow.time}s.`)
                log.info(`Starting a grower for ${bestGrow.host}`)
                ns.run(growScript, 1, bestGrow.host, growPID)
                growPID++
            }, "", 2)
        } else {
            const sleep = 15000
            log.info(`Unable to fit next script in memory, waiting for ${sleep}ms`)
            await ns.sleep(sleep)
        }
        await ns.sleep(100)
    }
}