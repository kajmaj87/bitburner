export function logger(ns){
	const host = ns.getHostname()
	return {
		info: (message) => {
			ns.tprint(`@${host}: ${message}`)
		},
		debug: (message) => {
			ns.print(`@${host}: ${message}`)
		},
		error: (message, e) => {
			ns.tprint(`@${host}: ${message}\nCaused by: ${e}`)
		}
	}
}