import { logger } from "./lib.js"

export function bus(ns) {
	const log = logger(ns)
	const host = ns.getHostname()
	const createQuery = (m, port = 0, replyNeeded = false) => (JSON.stringify({
		sender: host,
		senderPort: port,
		message: JSON.stringify(m),
		replyNeeded: replyNeeded
	}))
	const parseAndCallback = async (message, callback) => {
		try {
			const obj = JSON.parse(message)
			log.info(`Message from ${obj.sender}: ${obj.message}`)
			await callback(JSON.parse(obj.message), obj)
		} catch (e) {
			log.error(`Unable to parse ${message} as JSON`, e)
		}
	}
	var readListeners = []
	return {
		// send some info without caring for answer
		tell: async (message, port = 1) => {
			const toSend = createQuery(message)
			log.info(`Telling on port ${port}: ${toSend}`)
			await ns.writePort(port, toSend)
		},
		// send some info and wait for reply
		ask: async (callback, message, port, interval = 1000, timeout = 5000) => {
			const senderPort = Math.floor(Math.random() * 10) + 10
			const toSend = createQuery(message, senderPort, true)
			log.info(`Asking on port ${port}: ${toSend}`)
			await ns.writePort(port, toSend)
			while (true) {
				const answerPort = ns.getPortHandle(senderPort)
				if (!answerPort.empty()) {
					log.info(`Received answer on port ${senderPort}`)
					const message = answerPort.read()
					await parseAndCallback(message, callback)
					break;
				}
				log.info(`Still waiting for reply on port ${senderPort}...`)
				await ns.sleep(interval)
			}
		},
		registerReader: (callback, port = 1) => {
			log.info(`Registering reader to listen on port ${port}`)
			readListeners.push({ callback: callback, portHandle: ns.getPortHandle(port) })
		},
		readLoop: async (interval = 100) => {
			while (true) {
				await readListeners.reduce(async (memo, listener) => {
					await memo
					if (!listener.portHandle.empty()) {
						const message = listener.portHandle.read()
						await parseAndCallback(message, listener.callback)
					}
				}, undefined)
				await ns.sleep(interval)
			}
		}
	}
}