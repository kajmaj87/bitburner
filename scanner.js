import { bus } from "/libs/comm.js"
import { logger } from "/libs/log.js"
import { scan } from "/libs/scan.js"
/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const scanner = scan(ns)
    const scanningInterval = 30000
    while (true) {
        await comm.ask(async servers => {
            log.info(`Scanner activated. Scanning ${servers.length} servers`)
            await servers.map(s => s.host).reduce(async (memo, s) => {
                await memo
                await comm.tell(scanner.info(s))
            }, undefined)
        }, "", 2)
        await ns.sleep(scanningInterval)
    }
}