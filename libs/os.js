/** @param {NS} ns*/
export function system(ns) {
    const host = ns.getHostname()
    const freeRAM = host => ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
    return {
        willFitInMemory: (s, targetHost, threads = 1, reserve = 0) => {
            const hostToCheck = targetHost ? targetHost : host
            return ns.getScriptRam(s) * threads < (ns.getServerMaxRam(targetHost) - reserve - ns.getServerUsedRam(targetHost))
        },
        freeRAM: freeRAM,
        howManyWillFitNow: (s, targetHost, reserve = 0) => {
            const hostToCheck = targetHost ? targetHost : host
            return Math.floor(Math.max((freeRAM(hostToCheck) - reserve) / ns.getScriptRam(s), 0))
        },
        howManyWillFitMax: (s, targetHost, reserve = 0) => {
            const hostToCheck = targetHost ? targetHost : host
            return Math.floor(Math.max((ns.getServerMaxRam(hostToCheck) - reserve) / ns.getScriptRam(s), 0))
        }
    }
}
