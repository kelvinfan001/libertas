'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', 'connection-sipher.json');

async function main() {
    try {
        // Create a new file system wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if an admin user exists in wallet.
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

        // // Create a new CA client for interacting with the CA.
        // const caInfo = ccp.certificateAuthorities['ca.libertas.sipher.co'];
        // const caTLSCACertsPath = path.resolve(__dirname, '..', '..', 'libertas-dev-network', caInfo.tlsCACerts.path);
        // const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
        // const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        try {
            await ca.newAffiliationService().create({ "name": "voting_district1" }, adminIdentity);
        } catch (error) {
            console.error(`Failed to add affiliation "voting_district1": ${error}`);
            process.exit(1);
        }

        console.log('Succesffuly added affiliation "voting_district1"');

    } catch (error) {
        console.error(`Failed to add affiliation "voting_district1": ${error}`);
        process.exit(1);
    }
}

main()