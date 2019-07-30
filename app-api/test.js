const networkAPIModule = require('./network-APIs');

async function main() {
    
    // let response = await networkAPIModule.queryAccountByID('kelvinfan', 'kelvinfan', 'SipherMSP');


    let response = await networkAPIModule.createAccount('kelvinfan', 'Kelvin Fan', 'kelvin@sipher.co', 'Personal', 'jOqqscIynoMZ', 'SipherMSP'); //* no need to try/catch because createAccount already handles error

    console.log(response);

    
}

main();
