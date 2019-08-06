import { EventEmitter, Injectable } from '@angular/core';
import { HelperFunctionService } from './helper-functions.service';

@Injectable({
    providedIn: 'root'
})
export class CampaignService {
    constructor(private helper: HelperFunctionService) {
    }

    campaignSelected = new EventEmitter();

    async createCampaign(campaignID, campaignName, campaignType, start, end, userID) {
        try {
            // Prepare transaction proposal for creating campaign on chaincode
            const transactionProposal = {
                fcn: 'CreateCampaign',
                args: [campaignID, campaignName, campaignType, start, end]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);

        } catch (error) {
            console.error(error);
        }
    }

    async queryCampaignByID(idToQuery) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'QueryCampaignByID',
                args: [idToQuery]
            }
            let response = await this.helper.evaluateTransactionUnsigned(transactionProposal);
            return response;

        } catch (error) {
            console.error(error);
        }
    }

    async queryCampaignByInstitutionUsername(usernameToQuery) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'QueryCampaignByInstitutionUsername',
                args: [usernameToQuery]
            }
            let response = await this.helper.evaluateTransactionUnsigned(transactionProposal);
            return response;

        } catch (error) {
            console.error(error);
        }
    }

    async editCampaignByID(campaignID, field, value, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'EditCampaignByID',
                args: [campaignID, field, value]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);

        } catch (error) {
            console.error(error);
        }
    }

    async deleteCampaignByID(campaignID, userID) {
        try {
            // Prepare transaction proposal
            const transactionProposal = {
                fcn: 'DeleteCampaignByID',
                args: [campaignID]
            }
            // Submit transaction
            await this.helper.submitTransaction(transactionProposal, userID);

        } catch (error) {
            console.error(error);
        }
    }




    // addCampaign(form, inputStart, inputEnd) {

    //     this.firestore.collection('campaigns')
    //         .add({
    //             name: form.name,
    //             start: inputStart,
    //             end: inputEnd,
    //             options: form.options,
    //             type: form.type,
    //             voterGroups: this.campaignVoterGroups,
    //             integrationAccountID: this.accountService.getAccountID(),
    //             projectID: this.projectService.currentProjectID,
    //             createdAt: Timestamp.fromMillis(Date.now()),
    //             updatedAt: Timestamp.fromMillis(Date.now()),
    //         })
    //         .then(function () {
    //             console.log('Document successfully written!');
    //         })
    //         .catch(function (error) {
    //             console.error('Error writing document: ', error);
    //         });
    // }
    // this.campaignDB
    //     .put({
    //         _id: ( 'campaign: 123456'),
    //         name: form.name,
    //         start: form.start,
    //         end: form.end,
    //         options: form.options,
    //         type: form.type,
    //         voterGroups: form.voterGroups,
    //         integrationAccountID: this.accountService.getAccountID(),
    //         projectID: this.projectService.currentProjectID,
    //         createdAt: Timestamp.fromMillis(Date.now()),
    //         updatedAt: Timestamp.fromMillis(Date.now()),
    //     }).then(
    //     this.campaignDB.get('campaign: 123456').then(function (doc) {
    //         console.log(doc);
    //     })




    // editCampaign(form, inputStart, inputEnd) {

    //     const updateRef = this.firestore.collection('campaigns').doc(this.campaignID);

    //     return updateRef.update({
    //         name: form.name,
    //         start: inputStart,
    //         end: inputEnd,
    //         options: form.options,
    //         type: form.type,
    //         voterGroups: this.campaignVoterGroups,
    //         updatedAt: Timestamp.fromMillis(Date.now())
    //     })
    //         .then(function () {
    //             console.log('Document successfully updated!');
    //         })
    //         .catch(function (error) {
    //             // The document probably doesn't exist.
    //             console.error('Error updating document: ', error);
    //         });
    // }


    // getCampaigns() {
    //     return this.firestore
    //         .collection('campaigns', ref => ref.where('projectID', '==', this.projectService.currentProjectID))
    //         .snapshotChanges();

    // }

    // getCampaign() {
    //     return this.firestore
    //         .collection('campaigns').doc(this.campaignID).snapshotChanges();

    // }


    // deleteCampaign(id) {
    //     const deleteRef = this.firestore.collection('campaigns').doc(id);
    //     return deleteRef.delete().then(function () {
    //         console.log('Document successfully deleted!');
    //     })
    //         .catch(function (error) {
    //             // The document probably doesn't exist.
    //             console.error('Error deleting document: ', error);
    //         });
    // }


    // setCampaignDetails(id, name, start, end, type, options, voterGroups) {
    //     this.campaignName = name;
    //     this.campaignID = id;
    //     this.campaignStart = start;
    //     this.campaignEnd = end;
    //     this.campaignType = type;
    //     this.campaignOptions = options,
    //         this.campaignVoterGroups = voterGroups;
    // }

    // setCampaignEdit(input) {
    //     this.edit = input;
    // }

    // insertVoterGroup(voterGroup) {
    //     if (this.campaignVoterGroups.includes(voterGroup)) {
    //         return;
    //     } else {
    //         this.campaignVoterGroups.push(voterGroup);
    //     }
    // }

    // removeVoterGroup(voterGroup) {
    //     const remove = this.campaignVoterGroups.indexOf(voterGroup);
    //     this.campaignVoterGroups.splice(remove, 1);
    // }

    // getVGforCampaign() {
    //     return this.campaignVoterGroups;
    // }


}
