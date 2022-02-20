import { logger } from "/libs/log.js"
import { scan } from "/libs/scan.js"
import { bus } from "/libs/comm.js"
import { PORTS } from "/libs/ports.js"

/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
    const log = logger(ns)
    const scanner = scan(ns)
    const hostnames = ns.args.length > 0 ? ns.args : (await comm.ask(() => { }, "", PORTS.SERVER_QUERY)).map(s => s.host)
    const servers = [...hostnames, ...ns.getPurchasedServers()].map(h=>scanner.info(h))
    servers.forEach(s => log.yell(`Server info:\n${JSON.stringify(s, null, 2)}`))
    const bestToHack = servers.filter(s=>s.host != "home").sort((a, b) => b.moneyPTS - a.moneyPTS)[0]
    const bestToGrow = servers.filter(s=>s.host != "home").sort((a, b) => b.maxMoneyPTS - a.maxMoneyPTS)[0]
    const sumMiners = servers.map(s=>s.maxMiners).reduce((a,b)=>a+b,0)
    const sumGrowers = servers.map(s=>s.maxGrowers).reduce((a,b)=>a+b,0)
    const sumWeakeners = servers.map(s=>s.maxWeakeners).reduce((a,b)=>a+b,0)
    log.yell(`Best server to hack: ${bestToHack.host} (${bestToHack.moneyPTS} $pTs)`)
    log.yell(`Best server to grow: ${bestToGrow.host} (potential: ${bestToGrow.maxMoneyPTS} $pTs)`)
    log.yell(`Total threads that could be spawned: ${sumMiners}M/${sumGrowers}G/${sumWeakeners}W`)
}