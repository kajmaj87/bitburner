import { bus } from "./libs/comm.js"
import { logger } from "./libs/lib.js"
/** @param {NS} ns **/
export async function main(ns) {
	const comm = bus(ns)
	const log = logger(ns)
	var servers = {}
	comm.registerReader((serverInfo, rawMessage) => {
		servers[serverInfo.host] = serverInfo
		log.info(`Received server info about ${serverInfo.host} from ${rawMessage.sender}.`)
	}, 1)
	comm.registerReader(async (message, rawMessage) => {
		log.info(`Received query from ${rawMessage.sender} for servers info`)
		await comm.tell(servers, rawMessage.senderPort)
	}, 2)
	await comm.readLoop()
}