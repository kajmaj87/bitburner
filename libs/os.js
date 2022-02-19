export function system(ns) {
    const host = ns.getHostname()
    return {
        willFitInMemory: (s, reserve = 0) => ns.getScriptRam(s) < (ns.getServerMaxRam(host) - reserve - ns.getServerUsedRam(host))
    }
}
