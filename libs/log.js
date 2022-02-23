export function logger(ns){
	ns.disableLog('ALL')
	const host = ns.getHostname()
	return {
		yell: (message) => {
			ns.tprint(`@${host}: ${message}`)
			ns.print(`@${host}: ${message}`)
		},
		info: (message) => {
			ns.print(`@${host}: ${message}`)
		},
		debug: (message) => {
			ns.print(`@${host}: ${message}`)
		},
		error: (message, e) => {
			ns.tprint(`@${host}: ${message}\nCaused by: ${e}`)
		},
		j: (message) => JSON.stringify(message, null, 2)
	}
}