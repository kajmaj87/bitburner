import { bus } from "/libs/comm.js"
import { logger } from "/libs/log.js"
import { scan } from "/libs/scan.js"

/** @param {NS} ns **/
export async function main(ns) {
	const comm = bus(ns)
	const log = logger(ns)
    const scanner = scan(ns)
	var servers = new Set()
	comm.registerReader((hostnames, rawMessage) => {
		hostnames.forEach(h => servers.add(h));
        log.info(`Received server info about ${hostnames} from ${rawMessage.sender}. Total servers known: ${servers.size}`)
	}, 1)
	comm.registerReader(async (message, rawMessage) => {
		log.info(`Received query from ${rawMessage.sender} for servers info`)
		await comm.tell(Array.from(servers.values()).map(scanner.info), rawMessage.senderPort)
	}, 2)
	await comm.readLoop()
}