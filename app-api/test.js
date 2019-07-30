const networkAPIModule = require('./network-APIs');

// networkAPIModule.createAccount('kelvinfan', 'Kelvin Fan', 'kelvin@sipher.co', 'Personal', 'jOqqscIynoMZ', 'SipherMSP');

async function main() {
    let ret = await networkAPIModule.queryAccountByID('kelvinfan', 'kelvinfan', 'SipherMSP');
    console.log(ret)
}

main();


// networkAPIModule.printFoo();

// try {
//     let ret = await networkAPIModule.queryAccountByID('kelvinfan', 'kelvinfan', 'SipherMSP');
//     console.log(ret);
// } catch (error) {
//     console.log(error)
// }
// console.log(ret)