/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const addAffiliationModule = require('./addAffiliation.js');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const walletPath = path.join(process.cwd(), 'wallet')
const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');

async function main() {

    try {
        addAffiliationModule.addAffiliation(walletPath, ccpPath, 'voting_district1')
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }


    // try {
    //     // Create a new file system wallet for managing identities.
    //     const walletPath = path.join(process.cwd(), 'wallet');
    //     const wallet = new FileSystemWallet(walletPath);

    //     // Check to see if an admin user exists in wallet.
    //     const adminExists = await wallet.exists('admin');
    //     if (!adminExists) {
    //         console.log('No identity for admin exists in the wallet yet. Run the enrollAdmin.js program first');
    //         return;
    //     }

    //     // Create a new gateway for connecting to peer node.
    //     const gateway = new Gateway();
    //     await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

    //     // Get CA client object from gateway for interacting with CA.
    //     const ca = gateway.getClient().getCertificateAuthority();
    //     const adminIdentity = gateway.getCurrentIdentity();

    //     try {
    //         await ca.newAffiliationService().create({ "name": "voting_district1" }, adminIdentity);
    //     } catch (error) {
    //         console.error(`Failed to add affiliation "voting_district1": ${error}`);
    //         process.exit(1);
    //     }

    //     console.log('Succesffuly added affiliation "voting_district1"');

    // } catch (error) {
    //     console.error(`Failed to add affiliation "voting_district1": ${error}`);
    //     process.exit(1);
    // }
}

main()