import { bus } from "./libs/comm.js"
import { logger } from "./libs/log.js"
/** @param {NS} ns **/
export async function main(ns) {
	const comm = bus(ns)
	const log = logger(ns)
	var servers = new Map()
	comm.registerReader((serverInfo, rawMessage) => {
		servers.set(serverInfo.host, serverInfo)
		log.info(`Received server info about ${serverInfo.host} from ${rawMessage.sender}. Total servers known: ${servers.size}`)
	}, 1)
	comm.registerReader(async (message, rawMessage) => {
		log.info(`Received query from ${rawMessage.sender} for servers info`)
		await comm.tell(Array.from(servers.values()), rawMessage.senderPort)
	}, 2)
	await comm.readLoop()
}