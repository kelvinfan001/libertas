/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');

async function main() {
    try {
        
        // Create a new file system wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if user is already enrolled.
        const userExists = await wallet.exists('user1');
        if (userExists) {
            console.log('"user1" identity already exists in the wallet');
            return;
        }

        // Check to see if admin user is already enrolled.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('No identity for admin exists in the wallet yet. Run the enrollAdmin.js program first');
            return;
        }

        // Create a new gateway for connecting to peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get CA client object from gateway for interacting with CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into wallet. 
        // register
        const secret = await ca.register({ affiliation: 'sipher.department1', enrollmentID: 'user1', role: 'client' }, adminIdentity);
        // enroll
        const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('SipherMSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('user1', userIdentity);
        console.log('Successfully registered and enrolled user "user1" and importted it into the wallet');
    } catch (error) {
        console.error(`Failed to register user "user1": ${error}`);
        process.exit(1);
    }
}

main();