import { Injectable } from '@angular/core';
import { HelperFunctionService } from './helper-functions.service';

@Injectable({
    providedIn: 'root'
})
export class VoterService {

    constructor(private helper: HelperFunctionService) { }


    async createVoter(voterID, personalAccountID, voterGroupID, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'CreateVoter',
                args: [voterID, personalAccountID, voterGroupID]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);

        } catch (error) {
            console.error(error);
        }
    }

    async editVoterByID(voterID, voterGroupID, field, value, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'EditVoterByID',
                args: [voterID, voterGroupID, field, value]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);

        } catch (error) {
            console.error(error);
        }
    }

    async deleteVoterByID(voterID, voterGroupID, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'DeleteVoterByID',
                args: [voterID, voterGroupID]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);

        } catch (error) {
            console.error(error);
        }
    }

    async listVotersByVoterGroupID(voterGroupID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'ListVotersByVoterGroupID',
                args: [voterGroupID]
            }
            let response = await this.helper.evaluateTransactionUnsigned(transactionProposal);
            return response;

        } catch (error) {
            console.error(error);
        }
    }

    // addVoter(form) {
    //     this.firestore.collection('voter')
    //         .add({
    //             status: form.status,
    //             integrationAccountID: this.accountService.getAccountID(),
    //             projectID: this.projectService.currentProjectID,
    //             voterGroupID: this.voterGroupService.voterGroupID,
    //             createdAt: Timestamp.fromMillis(Date.now()),
    //             updatedAt: Timestamp.fromMillis(Date.now()),
    //         })
    //         .then(function() {
    //             console.log('Document successfully written!');
    //         })
    //         .catch(function(error) {
    //             console.error('Error writing document: ', error);
    //         });
    // }


    // editVoter(form){
    //
    //     const updateRef = this.firestore.collection("voter-groups").doc(this.voterGroupID);
    //
    //     return updateRef.update({
    //         name: form.name,
    //         requestInformation: form.requestInformation,
    //         updatedAt: Timestamp.fromMillis(Date.now())
    //     })
    //         .then(function() {
    //             console.log("Document successfully updated!");
    //         })
    //         .catch(function(error) {
    //             // The document probably doesn't exist.
    //             console.error("Error updating document: ", error);
    //         });
    // }


    // getVoterGroups() {
    //     return this.firestore
    //         .collection('voter-groups', ref => ref.where('projectID', '==', this.projectService.currentProjectID))
    //         .snapshotChanges();
    //
    // }

    // setVoterGroupDetails(id, name, requestInformation){
    //     this.voterGroupID = id;
    //     this.voterGroupName = name;
    //     this.requestInfo = requestInformation;
    // }

    // setCampaignName(name){
    //     this.campaignName = name;
    // }

}
