export function system(ns) {
    const host = ns.getHostname()
    return {
        willFitInMemory: (s, reserve = 0, threads = 1) => ns.getScriptRam(s) * threads < (ns.getServerMaxRam(host) - reserve - ns.getServerUsedRam(host)),
        howManyWillFit: (s, reserve = 0, targetHost) => {
            const hostToCheck = targetHost ? targetHost : host
            return Math.floor(Math.max((ns.getServerMaxRam(hostToCheck) - reserve) / ns.getScriptRam(s), 0))
        }
    }
}
