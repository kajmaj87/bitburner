import {bus} from "./libs/comm.js"
/** @param {NS} ns **/
export async function main(ns) {
	const port = ns.args[0]
	const comm = bus(ns)
	await comm.readLoop(m=>ns.tprint(`Received ${m}`), port)
}