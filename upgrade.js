import { logger } from "/libs/log.js"

/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    const lowest = f => {
        var low = 1_000_000;
        var lowestIndex = -1;
        for (var i = 0; i < ns.hacknet.numNodes(); i++) {
            if (f(i) < low) {
                low = f(i)
                lowestIndex = i
            }
        }
        return lowestIndex;
    }
    while (true) {
        for (var i = 0; i < ns.hacknet.numNodes(); i++) {
            while (ns.hacknet.upgradeLevel(lowest(i => ns.hacknet.getLevelUpgradeCost(i, 1)), 1)) { }
            while (ns.hacknet.upgradeRam(lowest(i => ns.hacknet.getRamUpgradeCost(i, 1)), 1)) { }
            while (ns.hacknet.upgradeCore(lowest(i => ns.hacknet.getCoreUpgradeCost(i, 1)), 1)) { }
        }
        while (true) {
            const id = ns.hacknet.purchaseNode()
            if (id != -1) {
                log.info(`Bought node with id=${id}`)
            } else {
                break;
            }
        }
        await ns.sleep(5000);
    }
}