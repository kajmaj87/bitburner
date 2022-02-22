
import { findRoot } from "/libs/math.js"
import { logger } from "/libs/log.js"

/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    log.yell(`hack analyze: ${ns.hackAnalyze(ns.args[0])}`)
}