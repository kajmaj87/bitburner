import { logger } from "/libs/log.js"
import { scan } from "/libs/scan.js"
import { bus } from "/libs/comm.js"
import {PORTS} from "/libs/ports.js"

/** @param {NS} ns **/
export async function main(ns) {
    const comm = bus(ns)
	const log = logger(ns)
    const scanner = scan(ns)
    const servers = ns.args.length > 0 ? ns.args : (await comm.ask(()=>{},"", PORTS.SERVER_QUERY)).map(s=>s.host)
    servers.forEach(s=>log.yell(`Server info:\n${JSON.stringify(scanner.info(s), null, 2)}`))
}