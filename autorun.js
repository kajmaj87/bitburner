/** @param {NS} ns **/
export async function main(ns) {
	const servers = ns.scan();
	const thisScript = ns.getRunningScript().filename;
	const origin = ns.args[0]
	const args = ns.args.slice(1)
	ns.tprint(`Running ${thisScript} on ${ns.getHostname()}`)
	await servers.filter(s => s != origin).reduce(async (memo, s) => {
		await memo
		ns.tprint(`Copied ${args} and ${thisScript} on ${s}`)
		ns.killall(s);
		ns.tprint(`Killed all processes on ${s}`)
		ns.tprint(`Starting ${thisScript} on ${s}`)
		ns.exec(thisScript, s, 1, ns.getHostname(), ...args);
	}, undefined);
	ns.spawn(args[0], 1, ...args.slice(1))
}