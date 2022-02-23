import { logger } from "libs/log"

/** @param {NS} ns **/
export function analyzer(ns) {
    const log = logger(ns)
    return {
        threadsNeeded: (host, moneyDrop) => {
            const currentMoney = ns.getServerMoneyAvailable(host)
            const dropSize = moneyDrop / currentMoney
            const hackThreads = ns.hackAnalyzeThreads(host, moneyDrop) 
            const growThreads = ns.growthAnalyze(host, 1 / (1-dropSize)) 
            const hackCost = 0.002
            const growCost = 0.004
            const weakenGain = 0.05
            const weakenThreads = (hackThreads * hackCost + growThreads * growCost)/weakenGain
            // log.yell(`drop ${dropSize} hack ${hackThreads} grow ${growThreads} weaken ${weakenThreads}`)
            return hackThreads + growThreads + weakenThreads 
        }
    }
}