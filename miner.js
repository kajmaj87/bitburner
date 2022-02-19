import { logger } from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    const moneyGained = await ns.hack(ns.args[0])
    log.info(`Hacked ${ns.args[0]} for ${moneyGained}`)
}