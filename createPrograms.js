/** @param {NS} ns **/
export async function main(ns) {
    const programs = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe", "deepscanv1.exe"]
    while(true){
        programs.some(p => ns.createProgram(p))
        await ns.sleep(5)
    }
}   