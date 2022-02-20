
/** @param {NS} ns **/
export async function main(ns) {
    for (var i=0; i<ns.hacknet.numNodes(); i++){
        ns.hacknet.upgradeLevel(i, 200)
        ns.hacknet.upgradeRam(i, 10)
        ns.hacknet.upgradeCore(i, 16)
    }
}