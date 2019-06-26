/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const enrollAdmin = require('./enrollAdmin.js');

// const FabricCAServices = require('fabric-ca-client');
// const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
// const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');
// const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
// const ccp = JSON.parse(ccpJSON);

const networkDirPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network')

async function main() {

    try {
        enrollAdmin.enroll(ccpPath, 'ca.libertas.sipher.co', networkDirPath, path.join(process.cwd(), 'wallet'), 'admin', 'adminpw', 'SipherMSP');
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }


    // try {

    //     // Create a new CA client for interacting with the CA.
    //     const caInfo = ccp.certificateAuthorities['ca.libertas.sipher.co'];
    //     const caTLSCACertsPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', caInfo.tlsCACerts.path);
    //     const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
    //     const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    //     // Create a new file system based wallet for managing identities.
    //     const walletPath = path.join(process.cwd(), 'wallet'); // create a wallet folder
    //     const wallet = new FileSystemWallet(walletPath);
    //     console.log(`Wallet path: ${walletPath}`);

    //     // Check to see if we've already enrolled the admin user.
    //     const adminExists = await wallet.exists('admin');
    //     if (adminExists) {
    //         console.log('An identity for the admin user "admin" already exists in the wallet');
    //         return;
    //     }

    //     // Enroll the admin user, and import the new identity into the wallet.
    //     const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    //     const identity = X509WalletMixin.createIdentity('SipherMSP', enrollment.certificate, enrollment.key.toBytes());
    //     await wallet.import('admin', identity);
    //     console.log('Succesffuly enrolled admin user "admin" and imported credntials into wallet.');
    // } catch (error) {
    //     console.error(`Failed to enroll admin user "admin": ${error}`);
    //     process.exit(1);
    // }

}

main()