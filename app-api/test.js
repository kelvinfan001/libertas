const networkAPIModule = require('./network-APIs');

async function main() {

    // let response = await networkAPIModule.createAccount('kelvinfan', 'Kelvin Fan', 'kelvin@sipher.co', 'Personal', 'DAgMRJhERxHw', 'SipherMSP'); //* no need to try/catch because createAccount already handles error

    // response = await networkAPIModule.queryAccountByID('kailonghuang');
    // console.log(response);


    response = await networkAPIModule.personalEditAccount('Email', 'MODIFIED@MODIFIED.COM', 'kelvinfan');
    console.log(response);

    // response = await networkAPIModule.queryAccountByID('kelvinfan', 'kelvinfan', 'SipherMSP');
    // console.log(response);

    // response = await networkAPIModule.listBallotByCampaignID('campaignID');
    // response = await networkAPIModule.listVotersByVoterGroupID('voterGroupID');

    // console.log(response)

}

main();
