/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 */

package main

import (
	"encoding/json"
	"errors"
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
// type Ballot struct {
// 	VoteList []Vote
// }

//----------------------------------------------Query---------------------------------------------------
func (t *Libertas) ListBallotByCampaignID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// check args
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}
	campaignID := args[0]

	// get the campaign
	campaignsListBytes, err := stub.GetState("Campaigns List")
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)

	campaign, err := queryCampaignByID(campaignID, campaignsList.Campaigns)
	if err != nil {
		return shim.Error(err.Error())
	}

	ballot := campaign.CampaignBallot
	ballotBytes, _ := json.Marshal(ballot)

	return shim.Success(ballotBytes)
}

//----------------------------------------------Create--------------------------------------------------

// campaign has ballot struct >> contains a list of voters

// Create
func (t *Libertas) CreateVote(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	err := _createVoteChecks(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	// update ledger
	newVote := _getNewVote(stub, args)
	campaignID := args[1]
	err = _updateLedgerBallot(stub, campaignID, newVote)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New vote added.")

	return shim.Success(nil)
}

func _createVoteChecks(stub shim.ChaincodeStubInterface, args []string) error {
	// check num args
	if len(args) != 2 {
		return errors.New("Incorrect number of arguments. Expecting 2.")
	}

	// check for correct account, only personal accounts can vote
	accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Personal")
	if !accountTypeOK {
		return errors.New(err.Error())
	}

	// check if personalAccountID is unique in this campaign
	personalID := args[0]
	campaignID := args[1]
	campaignsListBytes, err := stub.GetState("Campaigns List")
	if err != nil {
		return err
	}
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)
	campaign, err := queryCampaignByID(campaignID, campaignsList.Campaigns)
	if err != nil {
		return err
	}

	isPersonalIDExists := _getPersonalIDExists(personalID, campaign)
	if isPersonalIDExists {
		return errors.New("Voter with ID: " + personalID + " has already voted in campaign with ID: " + campaignID)
	}

	return nil
}

func _getPersonalIDExists(personalID string, campaign Campaign) bool {
	for _, vote := range campaign.CampaignBallot {
		if vote.PersonalAccountID == personalID {
			return true
		}
	}

	return false
}

func _updateLedgerBallot(stub shim.ChaincodeStubInterface, campaignID string, newVote Vote) error {
	// Get list of Campaigns from the ledger
	campaignsListBytes, err := stub.GetState("Campaigns List")
	if err != nil {
		return err
	}
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)

	campaign, err := _queryCampaignPtrByID(campaignID, &campaignsList)
	if err != nil {
		return err
	}

	campaign.CampaignBallot = append(campaign.CampaignBallot, newVote)

	campaignsListBytes, _ = json.Marshal(campaignsList)
	err = stub.PutState("Campaigns List", campaignsListBytes)
	if err != nil {
		return err
	}

	return nil
}

func _queryCampaignPtrByID(campaignID string, campaignsList *CampaignsList) (*Campaign, error) {
	for k, _ := range campaignsList.Campaigns {
		if campaignsList.Campaigns[k].ID == campaignID {
			return &campaignsList.Campaigns[k], nil
		}
	}

	return &Campaign{}, errors.New("The campaign with ID: " + campaignID + " does not exist")
}

func _getNewVote(stub shim.ChaincodeStubInterface, args []string) Vote {
	personalAccountID := args[0]
	campaignID := args[1]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	newVote := Vote{personalAccountID, campaignID, transactionTime, transactionTime}

	return newVote
}
