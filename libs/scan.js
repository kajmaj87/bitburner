export function scan(ns) {
	const moneyRatio = s=>ns.getServerMaxMoney(s)/ns.getServerMoneyAvailable(s)
    return {
        info: s => ({
            host: s,
            rooted: ns.hasRootAccess(s),
            totalRam: ns.getServerMaxRam(s),
            freeRam: ns.getServerMaxRam(s) - ns.getServerUsedRam(s),
            growth: ns.getServerGrowth(s),
            security: ns.getServerSecurityLevel(s),
            minSecurity: ns.getServerMinSecurityLevel(s),
            growthToFull: ns.growthAnalyze(s, moneyRatio(s) > 1 ? moneyRatio(s) : 1),
            growthToHalf: ns.growthAnalyze(s, moneyRatio(s) / 2 > 1 ? moneyRatio(s) / 2 : 1),
            growTime: ns.getGrowTime(s),
            moneyPct: ns.getServerMoneyAvailable(s) / ns.getServerMaxMoney(s),
            moneyIncForThreadSecond: 1 / moneyRatio(s) < 0.99 ? ns.getServerMoneyAvailable(s) * 0.01 / ns.growthAnalyze(s, 1.01) / ns.getGrowTime(s) : 0
        })
    }
}