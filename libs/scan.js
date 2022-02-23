import { system } from "/libs/os.js"
export function scan(ns) {
    const os = system(ns)
    const moneyRatio = s => ns.getServerMaxMoney(s) / ns.getServerMoneyAvailable(s)
    const countThreads = (p, s) => os.howManyWillFitMax(p, s, ns.getScriptRam('worker.js'))
    return {
        info: s => ({
            host: s,
            rooted: ns.hasRootAccess(s),
            totalRam: ns.getServerMaxRam(s),
            freeRam: ns.getServerMaxRam(s) - ns.getServerUsedRam(s),
            hackTime: ns.getHackTime(s) / 1000,
            growTime: ns.getGrowTime(s) / 1000,
            weakenTime: ns.getWeakenTime(s) / 1000,
            growth: ns.getServerGrowth(s),
            security: ns.getServerSecurityLevel(s),
            minSecurity: ns.getServerMinSecurityLevel(s),
            hackLevelNeeded: ns.getServerRequiredHackingLevel(s),
            growthToFull: ns.growthAnalyze(s, moneyRatio(s) > 1 ? moneyRatio(s) : 1),
            growthToHalf: ns.growthAnalyze(s, moneyRatio(s) / 2 > 1 ? moneyRatio(s) / 2 : 1),
            money: ns.getServerMoneyAvailable(s),
            moneyMax: ns.getServerMaxMoney(s),
            moneyPct: ns.getServerMoneyAvailable(s) > 0 ? ns.getServerMoneyAvailable(s) / ns.getServerMaxMoney(s) : 1,
            moneyIncForThreadSecond: 1 / moneyRatio(s) < 0.99 ? ns.getServerMoneyAvailable(s) * 0.01 / ns.growthAnalyze(s, 1.01) / ns.getGrowTime(s) : 0,
            moneyPTS: ns.getServerMoneyAvailable(s) * ns.hackAnalyze(s) * ns.hackAnalyzeChance(s) / ns.getHackTime(s) * 1000,
            maxMoneyPTS: ns.getServerMaxMoney(s) * ns.hackAnalyze(s) * ns.hackAnalyzeChance(s) / ns.getHackTime(s) * 1000,
            maxMiners: countThreads('miner.js', s),
            maxGrowers: countThreads('grower.js', s),
            maxWeakeners: countThreads('weakener.js', s),
        })
    }
}