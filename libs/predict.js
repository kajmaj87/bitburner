import { logger } from "/libs/log.js"
import { JOBS } from "/libs/jobs.js"
import { findRoot } from "/libs/math.js"
import { scan } from "/libs/scan.js"

/** @param {NS} ns */
export function predict(ns) {
    const log = logger(ns)
    const scanner = scan(ns)
    const getJobType = name => {
        switch (name) {
            case "miner.js": return JOBS.MINE
            case "grower.js": return JOBS.GROW
            case "weakener.js": return JOBS.WEAKEN
        }
    }
    const getRunInfo = p => ({
        target: p.args[0],
        startTime: p.args[1],
        jobType: getJobType(p.filename),
        threads: p.threads
    })
    const getTimeFn = jobType => {
        switch (jobType) {
            case JOBS.MINE: return ns.getHackTime
            case JOBS.GROW: return ns.getGrowTime
            case JOBS.WEAKEN: return ns.getWeakenTime
        }
    }
    const timeLeft = (runInfo) => {
        const timeFn = getTimeFn(runInfo.jobType)
        // log.info(`Time of ${runInfo.jobType}@${runInfo.host}: ${timeFn(runInfo.host)}`)
        return timeFn(runInfo.target) - (Date.now() - runInfo.startTime)
    }
    const growEffect = (host, threads) => {
        const f = x => ns.growthAnalyze(host, 1 + x) - threads
        return findRoot(f) + 1
    }
    return {
        /** @param {import("NetscriptDefinitions").ProcessInfo[]} processes*/
        predict: (processes) => {
            const count = jobType => processes.filter(p => getJobType(p.filename) == jobType).reduce((sum, p) => sum + p.threads, 0)
            const sorted = processes
                .filter(p => getJobType(p.filename))
                .map(getRunInfo)
                .sort((a, b) => timeLeft(b) - timeLeft(a))
            var hostInfo = Array.from(new Set(sorted.map(p => p.target))) // unique from array
                .reduce((map, h) => {
                    var host = scanner.info(h)
                    log.info(`@${h}:\n${JSON.stringify(host, null, 2)}`)
                    host.startMoney = host.money
                    host.lowestMoney = host.money
                    host.maxSecurity = host.security
                    host.totalMoneyGain = 0 
                    return map.set(h, host)
                }, new Map()
                )
            sorted.forEach(p => {
                const currentHost = hostInfo.get(p.target)
                const recordMaxSecurity = (host) => {
                    if (host.maxSecurity < host.security) {
                        host.maxSecurity = host.security
                    }
                }
                const recordMinMoney = (host) => {
                    if (host.money < host.lowestMoney) {
                        host.lowestMoney = host.money
                    }
                }
                const recordMoneyGain = (host, gain) => {
                    host.totalMoneyGain += gain
                }
                switch (p.jobType) {
                    case JOBS.WEAKEN:
                        if (currentHost.security - 0.05 * p.threads > currentHost.minSecurity) {
                            currentHost.security -= 0.05 * p.threads
                        } else {
                            currentHost.security = currentHost.minSecurity
                        }
                        break;
                    case JOBS.GROW:
                        currentHost.security += 0.004 * p.threads
                        recordMaxSecurity(currentHost)
                        const grownBy = growEffect(p.target, p.threads)
                        if (currentHost.money * grownBy < currentHost.moneyMax) {
                            currentHost.money *= grownBy
                        } else {
                            currentHost.money = currentHost.moneyMax
                        }
                        break;
                    case JOBS.MINE:
                        const moneyGain = currentHost.money * ns.hackAnalyze(p.target) * p.threads * ns.hackAnalyzeChance(p.target)
                        currentHost.security += 0.002 * p.threads
                        currentHost.money -= moneyGain 
                        recordMoneyGain(currentHost, moneyGain)
                        recordMaxSecurity(currentHost)
                        recordMinMoney(currentHost)
                        break;
                }
            })
            log.info(`Totals: ${count(JOBS.MINE)}M/${count(JOBS.GROW)}G/${count(JOBS.WEAKEN)}W`)
            return new Array(...hostInfo.values())        }
    }
}