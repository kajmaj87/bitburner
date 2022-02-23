
import { findRoot } from "/libs/math.js"
import { logger } from "/libs/log.js"
import { analyzer } from "libs/analyzer"

/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    const anal = analyzer(ns)
    const host = ns.args[0]
    for (var d = 0.01; d < 0.9; d += 0.01) {
        const moneyDrop = d
        const moneyGain = ns.getServerMoneyAvailable(host) * moneyDrop
        const threadsNeeded = anal.threadsNeeded(host, moneyGain)
        log.yell(`Droprate: ${moneyDrop.toFixed(2)} Money gain per thread: ${(moneyGain / threadsNeeded).toFixed(1)} using ${threadsNeeded.toFixed(1)} threads`)
    }
        // log.yell(`Threads required to drop money by ${moneyDrop} of current amount: ${threadsNeeded}`)
}