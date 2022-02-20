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
		await ns.scp(args, s)
		await ns.scp(thisScript, s)
		log.info(`Copied ${args} and ${thisScript} on ${s}`)
		ns.killall(s);
		log.info(`Killed all processes on ${s}`)
		log.info(`Starting ${thisScript} on ${s}`)
		ns.exec(thisScript, s, 1, ns.getHostname(), ...args);
	}, undefined);
}