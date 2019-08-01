import {EventEmitter, Injectable} from '@angular/core';
import {HelperFunctionService} from './helper-functions.service';

@Injectable({
    providedIn: 'root'
})
export class VoterGroupService {

    constructor(private helper: HelperFunctionService) { }

    voterGroupID;
    voterGroupName;
    requestInfo;
    voterGroupSelected = new EventEmitter();
    edit;

    vglist = [];

    async createVoterGroup(voterGroupID, campaignID, voterGroupName, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'CreateVoterGroup',
                args: [voterGroupID, campaignID, voterGroupName]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);
    
        } catch (error) {
            console.error(error);
        }
    }
    
    async queryVoterGroupsByID(voterGroupIDToQuery) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'QueryVoterGroupsByID',
                args: [voterGroupIDToQuery]
            }
            let response = await this.helper.evaluateTransactionUnsigned(transactionProposal);
            return response;
    
        } catch (error) {
            console.error(error);
        }
    }
    
    async editVoterGroupByID(voterGroupID, field, value, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'EditVoterGroupByID',
                args: [voterGroupID, field, value]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);
    
        } catch (error) {
            console.error(error);
        }
    }
    
    async deleteVoterGroupByID(voterGroupID, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'DeleteVoterGroupByID',
                args: [voterGroupID]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);
    
        } catch (error) {
            console.error(error);
        }
    }
    


    // addVoterGroup(form) {
    //     this.firestore.collection('voter-groups')
    //         .add({
    //             name: form.name,
    //             requestInformation: form.requestInformation,
    //             integrationID: this.accountService.getAccountID(),
    //             projectID: this.projectService.currentProjectID,
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


    // editVoterGroup(form) {

    //     const updateRef = this.firestore.collection('voter-groups').doc(this.voterGroupID);

    //     return updateRef.update({
    //         name: form.name,
    //         requestInformation: form.requestInformation,
    //         updatedAt: Timestamp.fromMillis(Date.now())
    //     })
    //         .then(function() {
    //             console.log('Document successfully updated!');
    //         })
    //         .catch(function(error) {
    //             // The document probably doesn't exist.
    //             console.error('Error updating document: ', error);
    //         });
    // }


    // getVoterGroups() {
    //     return this.firestore
    //         .collection('voter-groups', ref => ref.where('projectID', '==', this.projectService.currentProjectID))
    //         .snapshotChanges();
    // }

    // setVoterGroupDetails(id, name, requestInformation) {
    //     this.voterGroupID = id;
    //     this.voterGroupName = name;
    //     this.requestInfo = requestInformation;
    // }

    // setVoterGroupID(id) {
    //     this.voterGroupID = id;
    // }

    // setVoterGroupEdit(input) {
    //     this.edit = input;
    // }

}
