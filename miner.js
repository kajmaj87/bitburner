import { logger } from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    const server = ns.args[0]
    const moneyGained = await ns.hack(server)
    log.info(`Hacked ${server} for ${moneyGained}`)
}