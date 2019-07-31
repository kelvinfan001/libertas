const networkAPIModule = require('./network-APIs');

async function main() {

    // let response = await networkAPIModule.createAccount('kelvinfan', 'Kelvin Fan', 'kelvin@sipher.co', 'Personal', 'SUUSdvJGviwI', 'SipherMSP'); //* no need to try/catch because createAccount already handles error

    response = await networkAPIModule.queryAccountByID('kelvinfa');
    console.log(response);

    // response = await networkAPIModule.editAccountByID('kelvinfan', 'Email', 'MODIFIED@MODIFIED.COM', 'SipherMSP');
    // console.log(response);

    // response = await networkAPIModule.queryAccountByID('kelvinfan', 'kelvinfan', 'SipherMSP');
    // console.log(response);

    
}

main();
