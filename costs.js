import {logger} from "/libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    Array(21).fill().forEach((x,i)=>log.yell(`Server with ${2**i} RAM costs ${ns.getPurchasedServerCost(2**i)/1_000_000}`))
}