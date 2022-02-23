export const JOBS = { MINE: "mine", WEAKEN: "weaken", GROW: "grow" }

export const mineJob = (host, threads = 1) => ({prio: 3, type: JOBS.MINE, args:[], threads: threads, target: host})
export const growJob = (host, threads = 1) => ({prio: 2, type: JOBS.GROW, args:[], threads: threads, target: host})
export const weakenJob = (host, threads = 1) => ({prio: 1, type: JOBS.WEAKEN, args:[], threads: threads, target: host})