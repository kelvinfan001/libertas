/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
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

// VoterGroupsList is a list of voter groups.
// type VoterGroupsList struct {
// 	VoterGroups []VoterGroup
// }

// VoterGroup is a group of voters.
type VoterGroup struct {
	ownerID    string
	ID         string
	CampaignID string
	Name       string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	Voters     []Voter
}

// CreateVoterGroup creates a new voter group
func (t *Libertas) CreateVoterGroup(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	err := _createVoterGroupChecks(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	// update ledger
	_updateLedgerVoterGroup(stub, args)

	fmt.Println("New Voter Group added")
	return shim.Success(nil)
}

func _updateLedgerVoterGroup(stub shim.ChaincodeStubInterface, args []string) error {
	// update the voter group list for the campaign with ID campaignID
	campaignID := args[1]
	campaignsList, err := _getCampaignsList(stub)
	if err != nil {
		return err
	}
	campaign, err := _queryCampaignPtrByID(campaignID, &campaignsList)
	if err != nil {
		return err
	}

	//  create VoterGroup and add it to list
	newVoterGroup, err := _getVoterGroup(stub, args)
	if err != nil {
		return err
	}
	campaign.CampaignVoterGroups = append(campaign.CampaignVoterGroups, newVoterGroup)

	// Update state and put state on ledger
	campaignsListBytes, _ := json.Marshal(campaignsList)

	err = stub.PutState("Campaigns List", campaignsListBytes)
	if err != nil {
		return err
	}

	return nil
}

func _createVoterGroupChecks(stub shim.ChaincodeStubInterface, args []string) error {
	if len(args) != 3 {
		return errors.New("Incorrect number of arguments. Expecting 3.")
	}

	// Require that the account calling this function is an Institution Account.
	accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution")
	if !accountTypeOK {
		return err
	}

	// check voter group id is unique in list of voter groups
	voterGroupID := args[0]
	campaignID := args[1]
	campaignsList, err := _getCampaignsList(stub)
	if err != nil {
		return err
	}
	campaign, err := queryCampaignByID(campaignID, campaignsList.Campaigns)
	if err != nil {
		return err
	}

	// If voter group with id already exists in voterGroupsList, return Error
	voterGroupExists := queryVoterGroupsByIDExists(voterGroupID, campaign.CampaignVoterGroups)
	if voterGroupExists {
		return errors.New("Voter group with this ID already exists.")
	}

	return nil
}

func _getVoterGroup(stub shim.ChaincodeStubInterface, args []string) (VoterGroup, error) {
	var id, campaignID, name, ownerID string
	var voters []Voter

	// Get owner's ID
	ownerID, err := GetCertAttribute(stub, "id")
	if err != nil {
		return VoterGroup{}, err
	}

	id = args[0]
	campaignID = args[1]
	name = args[2]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))

	// Create an empty slice of voters
	voters = make([]Voter, 0)

	newVoterGroup := VoterGroup{ownerID, id, campaignID, name, transactionTime, transactionTime, voters}
	return newVoterGroup, nil
}

// QueryAccountByID queries existing accounts in the ledger for id and returns whether it exists.
func (t *Libertas) QueryVoterGroupsByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	voterGroupID := args[0]
	campaignID := args[1]

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2.")
	}

	// Get list of VoterGroups from the ledger
	// voterGroupsListBytes, err := stub.GetState("Voter Groups List")
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	// voterGroupsList := VoterGroupsList{}
	// json.Unmarshal(voterGroupsListBytes, &voterGroupsList)
	campaignsList, err := _getCampaignsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	campaign, err := queryCampaignByID(campaignID, campaignsList.Campaigns)
	if err != nil {
		return shim.Error(err.Error())
	}

	voterGroup, err := queryVoterGroupsByID(voterGroupID, campaign.CampaignVoterGroups)
	if err != nil {
		return shim.Error(err.Error())
	}

	voterGroupBytes, _ := json.Marshal(voterGroup)

	return shim.Success(voterGroupBytes)

}

// queryByVoterGroupsID queries the VoterGroups array for id and returns whether it exists.
func queryVoterGroupsByID(id string, voterGroups []VoterGroup) (VoterGroup, error) {
	for _, v := range voterGroups {
		if v.ID == id {
			return v, nil
		}
	}

	return VoterGroup{}, errors.New("Voter Group with id: " + id + " does not exist.")
}

func queryVoterGroupsByIDExists(id string, voterGroups []VoterGroup) bool {
	for _, v := range voterGroups {
		if v.ID == id {
			return true
		}
	}

	return false
}
