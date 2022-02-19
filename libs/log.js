export function logger(ns){
	ns.disableLog('ALL')
	const host = ns.getHostname()
	return {
		info: (message) => {
			ns.print(`@${host}: ${message}`)
		},
		debug: (message) => {
			ns.print(`@${host}: ${message}`)
		},
		error: (message, e) => {
			ns.tprint(`@${host}: ${message}\nCaused by: ${e}`)
		}
	}
}