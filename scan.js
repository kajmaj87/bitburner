import { bus } from "/libs/comm.js"
import { logger } from "/libs/log.js"

/** @param {NS} ns **/
export async function main(ns) {
	const comm = bus(ns), log = logger(ns)
	const servers = ns.scan();
	log.yell(`Sending server info: ${servers}`)
	await comm.tell(servers)
}