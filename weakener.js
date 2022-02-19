import {logger} from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    const server = ns.args[0]
    const weakenedBy = await ns.weaken(server)
    log.info(`${server} weakened by ${weakenedBy}`)
}