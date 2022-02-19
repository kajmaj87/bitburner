import {bus} from "/libs/comm.js"
/** @param {NS} ns **/
export async function main(ns) {
	const comm = bus(ns)
	const times = ns.args[2] || 1
	for (var i = 0; i < times; i++) {
		await comm.tell(JSON.parse(ns.args[1]), ns.args[0])
		await ns.sleep(100)
	}
}