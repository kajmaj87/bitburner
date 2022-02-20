export function system(ns) {
    const host = ns.getHostname()
    return {
        willFitInMemory: (s, reserve = 0) => ns.getScriptRam(s) < (ns.getServerMaxRam(host) - reserve - ns.getServerUsedRam(host)),
        howManyWillFit: (s, reserve = 0, host = host) => Math.floor(Math.max((ns.getServerMaxRam(host) - reserve)/ns.getScriptRam(s), 0))
    }
}
