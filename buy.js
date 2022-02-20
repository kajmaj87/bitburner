import {logger} from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    ns.purchaseServer('work-node', ns.args[0])
}