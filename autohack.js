import { logger } from "/libs/log.js"
import { hack} from "/libs/hack.js"
/** @param {NS} ns **/
export async function main(ns) {
    const servers = ns.scan();
    const thisScript = ns.getRunningScript().filename;
    const origin = ns.args[0] || "home"
    const libs = ["/libs/log.js", "/libs/hack.js"]
    const log = logger(ns)
    const hacker = hack(ns)
    log.info(`Running ${thisScript} on ${ns.getHostname()}`)
    const copy = async (scripts, host) => {
        log.info(`Copying ${scripts} to ${host}`)
        await ns.scp(scripts, host)
    }
    await servers.filter(s => s != origin).reduce(async (memo, s) => {
        await memo
        log.info(`Autohacking ${s}`)
        if (hacker.root(s)) {
            await copy(libs, s)
            await copy(thisScript, s)
            ns.killall(s);
            log.info(`Killed all processes on ${s}`)
            log.info(`Starting ${thisScript} on ${s}`)
            ns.exec(thisScript, s, 1, ns.getHostname());
        }
    }, undefined);
}