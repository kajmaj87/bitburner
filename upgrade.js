import {logger} from "/libs/log.js"

/** @param {NS} ns **/
export async function main(ns) {
    const log = logger(ns)
    for (var i=0; i<ns.hacknet.numNodes(); i++){
        ns.hacknet.upgradeLevel(i, 200)
        ns.hacknet.upgradeRam(i, 10)
        ns.hacknet.upgradeCore(i, 16)
    }
    while(true){
       const id = ns.hacknet.purchaseNode()
       if(id!=-1){
           log.info(`Bought node with id=${id}`) 
       } else {
           return;
       }
    }
}