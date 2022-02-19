/** @param {NS} ns **/
export async function main(ns) {
	const servers = ns.scan();
	const thisScript = ns.getRunningScript().filename;
	const origin = ns.args[0]
	const args = ns.args.slice(1)
	ns.tprint(`Running ${thisScript} on ${ns.getHostname()}`)
	const copy = async (scripts, host) => {
		ns.tprint(`Copying ${scripts} to ${host}`)
		await ns.scp(scripts, host)
	}
	await servers.filter(s => s != origin).reduce(async (memo, s) => {
		ns.tprint(`Autohacking ${s}`)
		ns.brutessh(s)
		ns.tprint(`Brutesshd ${s}`)
		try {
			ns.nuke(s)
			ns.tprint(`Nuked ${s}`)
			await memo
			await ns.scp(args, s)
			await ns.scp(thisScript, s)
			ns.tprint(`Copied ${args} and ${thisScript} on ${s}`)
			// await copy(ns.args, s);
			// await copy(thisScript, s);
			ns.killall(s);
			ns.tprint(`Killed all processes on ${s}`)
			ns.tprint(`Starting ${thisScript} on ${s}`)
			ns.exec(thisScript, s, 1, ns.getHostname(), ...args);
		} catch (e) {
			ns.tprint(`Was unable to hack ${s} - skipping rest of steps`)
			await memo
		}
	}, undefined);
	ns.tprint(`Spawing ${args[0]} on this host ${ns.getHostname()}`)
	ns.spawn(args[0], 1, origin);
}