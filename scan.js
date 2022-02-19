import { bus } from "/libs/comm.js"
import { logger } from "/libs/log.js"
import { scan } from "/libs/scan.js"

/** @param {NS} ns **/
export async function main(ns) {
	const comm = bus(ns), log = logger(ns)
    const scanner = scan(ns)
	const servers = ns.scan();
	const sendServerInfo = async function (memo, s) {
		log.info(`Sending server info for ${s}`)
		await memo
		await comm.tell(scanner.info(s))
	}
	await servers.reduce(sendServerInfo, undefined)
}