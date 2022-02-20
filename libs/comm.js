import { logger } from "/libs/log.js"

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
			log.debug(`Message from ${obj.sender}: ${obj.message}`)
			const msg = JSON.parse(obj.message)
			await callback(msg, obj)
			return msg
		} catch (e) {
			log.error(`Unable to parse ${message} as JSON`, e)
		}
	}
	var readListeners = []
	return {
		// send some info without caring for answer
		tell: async (message, port = 1) => {
			const toSend = createQuery(message)
			log.debug(`Telling on port ${port}: ${toSend}`)
			await ns.writePort(port, toSend)
		},
		// send some info and wait for reply
		ask: async (callback, message, port, interval = 1000, timeout = 5000) => {
			const senderPort = Math.floor(Math.random() * 10) + 10
			const toSend = createQuery(message, senderPort, true)
			log.debug(`Asking on port ${port}: ${toSend}`)
			await ns.writePort(port, toSend)
			while (true) {
				const answerPort = ns.getPortHandle(senderPort)
				if (!answerPort.empty()) {
					log.info(`Received answer on port ${senderPort}`)
					const message = answerPort.read()
					return await parseAndCallback(message, callback)
				}
				log.info(`Still waiting for reply on port ${senderPort}...`)
				await ns.sleep(interval)
			}
		},
		peek: (port) => {
			const portHandle = ns.getPortHandle(port)
			if (!portHandle.empty()) {
				const obj = JSON.parse(portHandle.peek())
				return JSON.parse(obj.message)
			} else {
				return {}
			}
		},
		registerReader: (callback, port = 1, predicate = () => true) => {
			log.info(`Registering reader to listen on port ${port}`)
			readListeners.push({ callback: callback, portHandle: ns.getPortHandle(port), predicate: predicate })
		},
		readLoop: async (interval = 10) => {
			while (true) {
				await readListeners.reduce(async (memo, listener) => {
					await memo
					if (!listener.portHandle.empty() && listener.predicate()) {
						const message = listener.portHandle.read()
						await parseAndCallback(message, listener.callback)
					}
				}, undefined)
				await ns.sleep(interval)
			}
		}
	}
}