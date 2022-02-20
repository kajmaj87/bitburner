import { logger } from "/libs/log.js"

export function hack(ns) {
    const HACKING_PROGRAMS = [
        { name: "BruteSSH.exe", callback: ns.brutessh },
        { name: "HTTPWorm.exe", callback: ns.httpworm },
        { name: "FTPCrack.exe", callback: ns.ftpcrack },
        { name: "relaySMTP.exe", callback: ns.relaysmtp },
        { name: "sqlInject.exe", callback: ns.sqlinject }
    ]
    const NUKE = { name: "NUKE.exe", callback: ns.nuke }
    return {
        root: s => {
            var sucessfulHacks = []
            const log = logger(ns)
            const run = (program, callback) => {
                log.info(`Running ${program} on ${s}`)
                try {
                    callback(s)
                    sucessfulHacks.push(program)
                } catch (e) {
                    log.debug(`Program ${program} not installed`)
                }
            }
            HACKING_PROGRAMS.forEach(p => run(p.name, p.callback))
            if (sucessfulHacks.length >= ns.getServerNumPortsRequired(s)) {
                run(NUKE.name, NUKE.callback)
                log.yell(`Gained root access on ${s}`)
                return ns.hasRootAccess(s)
            } else {
                log.yell(`Could not root ${s}`)
                return ns.hasRootAccess(s)
            }
        },
    }
}