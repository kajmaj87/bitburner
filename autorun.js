import { logger } from "/libs/log.js";
/** @param {NS} ns **/
export async function main(ns) {
    const servers = ns.scan();
    const thisScript = ns.getRunningScript().filename;
    const origin = ns.args[0]
    const args = ns.args.slice(1)
    const log = logger(ns)
    log.info(`Running ${thisScript} on ${ns.getHostname()}`)
    await servers.filter(s => s != origin).reduce(async (memo, s) => {
        await memo
        log.info(`Starting ${thisScript} on ${s}`)
        ns.exec(thisScript, s, 1, ns.getHostname(), ...args);
    }, undefined);
    if (ns.getHostname() != "home") {
        ns.spawn(args[0], 1, ...args.slice(1))
    }
}   