import { bus } from "./libs/comm.js"
import { logger } from "./libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
	const comm = bus(ns), log = logger(ns)
	const servers = ns.scan();
	const moneyRatio = s=>ns.getServerMaxMoney(s)/ns.getServerMoneyAvailable(s)
	const sendServerInfo = async function (memo, s) {
		log.info(`Sending server info for ${s}`)
		await memo
		await comm.tell({
			host: s,
			totalRam: ns.getServerMaxRam(s),
			freeRam: ns.getServerMaxRam(s) - ns.getServerUsedRam(s),
			growth: ns.getServerGrowth(s),
			growthToFull: ns.growthAnalyze(s, moneyRatio(s)),
			growthToHalf: ns.growthAnalyze(s, moneyRatio(s) / 2 > 1 ? moneyRatio(s)/2 : 1),
			moneyPct: ns.getServerMoneyAvailable(s)/ns.getServerMaxMoney(s),
			moneyIncForThread: 1/moneyRatio(s) < 0.99 ? ns.getServerMoneyAvailable(s) * 0.01 / ns.growthAnalyze(s, 1.01) : 0
		})
	}
	await servers.reduce(sendServerInfo, undefined)
}