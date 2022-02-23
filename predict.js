import { predict } from "libs/predict"
import { logger } from "libs/log"
import { bus, PORTS } from "libs/comm"
/** @param {NS} ns **/
export async function main(ns) {
    const predictor = predict(ns)
    const log = logger(ns)
    const comm = bus(ns)
    const getAllProcesses = async () => {
        const hackedServers = (await comm.ask(PORTS.SERVER_QUERY)).map(s => {
            log.yell(`Got host: ${s.host}`)
            return s.host
        })
        const servers = [...ns.getPurchasedServers(), ...hackedServers, "home"]
        return servers.flatMap(ns.ps)
    }
    const processes = ns.args[0] ? ns.ps(ns.args[0]) : await getAllProcesses()
    predictor.predict(processes).forEach(h => {
        log.yell(`Stats for @${h.host}:`)
        log.yell(`Security at end ${h.security}`)
        log.yell(`Highest security ${h.maxSecurity}`)
        log.yell(`Money at start ${h.startMoney}`)
        log.yell(`Expexted money at end ${h.money}`)
        log.yell(`Lowest expected money ${h.lowestMoney}`)
        log.yell(`Total expected money gain: ${h.totalMoneyGain}`)
    })
}