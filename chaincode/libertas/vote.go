/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 */

package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Vote stuff
type Vote struct {
	PersonalAccountID string
	CampaignID        string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// Ballot stuff
type Ballot struct {
	voteList []Vote
}

//----------------------------------------------------------------------------------------------------------------
// List lists all the voters that belong to voterGroupID on currentPage
// func (t *Libertas) ListVoters(stub shim.ChaincodeStubInterface, args []string) pb.Response {
// 	voterGroupID := args[0]
// 	// currentPage := args[1]

// 	if len(args) != 1 {
// 		return shim.Error("Incorrect number of arguments. Expecting 2.")
// 	}

// 	// Get list of accounts from the world state.
// 	voterGroupsListBytes, err := stub.GetState("Voter Groups List")
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}
// 	voterGroupsList := VoterGroupsList{}
// 	json.Unmarshal(voterGroupsListBytes, &voterGroupsList)

// 	voters, err := getVotersByGroupID(voterGroupsList, voterGroupID)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}
// 	votersList := VotersList{voters}
// 	votersListBytes, _ := json.Marshal(votersList)

// 	return shim.Success(votersListBytes)
// }

// func getVotersByGroupID(voterGroupsList VoterGroupsList, voterGroupID string) ([]Voter, error) {
// 	for _, voterGroup := range voterGroupsList.VoterGroups {
// 		if voterGroup.ID == voterGroupID {
// 			// add voter
// 			return voterGroup.Voters, nil
// 		}
// 	}

// 	var voters []Voter
// 	err := errors.New("Houston, we have a problem")
// 	return voters, err
// }

//----------------------------------------------------------------------------------------------------------------

// campaign has ballot struct >> contains a list of voters

// Create
func (t *Libertas) CreateVote(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2.")
	}

	newVote := _getNewVote(stub, args)

	// get list of Campaigns from the ledger
	campaignsListBytes, err := stub.GetState("Campaigns List")
	if err != nil {
		return shim.Error(err.Error())
	}
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)

	// update ledger
	campaignID := args[1]
	err = _updateLedgerBallot(stub, campaignID, campaignsList, newVote)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New vote added.")

	return shim.Success(nil)
}

func _updateLedgerBallot(stub shim.ChaincodeStubInterface, campaignID string, campaignsList CampaignsList, newVote Vote) error {
	campaign, err := queryCampaignByID(campaignID, campaignsList.Campaigns)
	if err != nil {
		return err
	}

	campaign.CampaignBallot.voteList = append(campaign.CampaignBallot.voteList, newVote)

	campaignsListBytes, _ := json.Marshal(campaignsList)
	err = stub.PutState("Campaigns List", campaignsListBytes)
	if err != nil {
		return err
	}

	return nil
}

func _getNewVote(stub shim.ChaincodeStubInterface, args []string) Vote {
	personalAccountID := args[0]
	campaignID := args[1]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	newVote := Vote{personalAccountID, campaignID, transactionTime, transactionTime} // second arg????

	return newVote
}
