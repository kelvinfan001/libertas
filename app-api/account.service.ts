import {EventEmitter, Injectable} from '@angular/core';
import {HelperFunctionService} from './helper-functions.service';

// Import required modules
const path = require('path');
const registrationEnrollmentModule = require('./utils/userEnrollment');
const { FileSystemWallet } = require('fabric-network');

// Set environment variables for connecting with API Server and CA, all following variables modifiable
const walletPath = path.join(__dirname, 'wallet');
const mspID = 'SipherMSP'; // TODO: hardcoded for now, query from server in future.
const caURL = "https://155.138.134.91:7054/";
const caTLSCACertsPath = "../tlsca.libertas.sipher.co-cert.pem";
const caName = "ca-sipher";

@Injectable()
export class AccountService {

    constructor(private helper: HelperFunctionService) {}

    accountId: string;
    accountSelected = new EventEmitter();

    /**
     * Creates an account on chaincode. 
     * @param {string} id 
     * @param {string} name 
     * @param {string} email 
     * @param {string} accountType 
     * @param {string} enrollmentSecret 
     * @param {string} mspID 
     */
    async createAccount(id, name, email, accountType, enrollmentSecret) {
        try {
            const wallet = new FileSystemWallet(walletPath);
            let userExists = await wallet.exists(id);
            if (!userExists) {
                // Enroll user (directly communicating with CA)
                await registrationEnrollmentModule.enrollUser(caURL, caTLSCACertsPath, caName, walletPath, id,
                    enrollmentSecret, mspID);
            } else {
                console.warn('Warning: User with id ' + id + ' already exists in wallet and enrolled with CA.');
            }
            // Prepare transaction proposal for creating account on chaincode
            const transactionProposal = {
                fcn: 'CreateAccount',
                args: [id, name, email, accountType],
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, id);

        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Returns the account with ID.
     * @param {string} idToQuery
     * @param {string} userID
     * @param {string} mspID
     */
    async queryAccountByID(idToQuery) {
        try {
            // Prepare transaction proposal for querying account by id on chaincode
            const transactionProposal = {
                fcn: 'QueryAccountByID',
                args: [idToQuery]
            }
            let response = await this.helper.evaluateTransactionUnsigned(transactionProposal);
            return response;

        } catch (error) {
            console.error(error);
        }
    }

    async personalEditAccount(field, value, userID) {
        try {
            // Prepare transaction proposal for editing account by id on chaincode
            const transactionProposal = {
                fcn: 'PersonalEditAccount', // todo: might change fcn name
                args: [userID, field, value]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);

        } catch (error) {
            console.error(error);
        }
    }


    // TODO: deprecated
    // importAccount(email: string, accountName: string, accountType: string) {
    //     return this.firestore.collection('account').add({
    //         name: accountName,
    //         type: accountType,
    //         email: firebase.auth().currentUser.email,
    //         createdAt: Timestamp.fromMillis(Date.now()),
    //         updatedAt: Timestamp.fromMillis(Date.now())
    //     }).then(res => {
    //         this.accountId = res.id;
    //         this.router.navigate([this.accountId, 'projects', '']);
    //     }).catch(
    //         error => console.log(error)
    //     );
    // }

    // getAccountID() {
    //     return this.accountId;
    // }

    // setAccountID(id) {
    //     this.accountId = id;
    // }

    // getAccounts() {
    //     return this.firestore
    //         .collection('account', ref => ref.where('email', '==', firebase.auth().currentUser.email))
    //         .snapshotChanges();

    // }
    }

