import {logger} from "./libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    const server = ns.args[0]
    const grownBy = await ns.grow(server)
    log.info(`${server} grown by ${grownBy}`)
}