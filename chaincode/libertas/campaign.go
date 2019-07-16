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
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// CampaignsList is a list of campaigns.
type CampaignsList struct {
	Campaigns []Campaign
}

// Campaign is a campaign.
type Campaign struct {
	ownerID             string
	ID                  string
	Name                string
	CampaignType        string
	Start               time.Time
	End                 time.Time
	CreatedAt           time.Time
	UpdatedAt           time.Time
	CampaignVoterGroups []VoterGroup
}

// CreateCampaign creates a new campaign.
// Takes in parameters id, name, campaignType, start, and end.
// start and end are number of seconds after Unix epoch.
func (t *Libertas) CreateCampaign(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var ownerID, id, name, campaignType string
	var start, end time.Time
	var campaignVoterGroups []VoterGroup

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5.")
	}

	// Get owner's ID
	ownerID, err := GetCertAttribute(stub, "id")
	if err != nil {
		return shim.Error(err.Error())
	}

	startStr := args[3]
	endStr := args[4]

	// Convert start and end arguments from string to int
	startInt, err := strconv.Atoi(startStr)
	if err != nil {
		return shim.Error(err.Error())
	}
	endInt, err := strconv.Atoi(endStr)
	if err != nil {
		return shim.Error(err.Error())
	}

	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))

	id = args[0]
	name = args[1]
	campaignType = args[2]
	start = time.Unix(int64(startInt), 0)
	end = time.Unix(int64(endInt), 0)

	// Create an empty slice of VoterGroups
	campaignVoterGroups = make([]VoterGroup, 0)

	// Require that the account calling this function is an Institution Account.
	accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution")
	if !accountTypeOK {
		return shim.Error(err.Error())
	}

	// Get list of Campaigns from the ledger
	campaignsListBytes, err := stub.GetState("Campaigns List")
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)

	// If campaign with id already exists in campaignList, return Error
	campaignExists := queryCampaignExistsByID(id, campaignsList.Campaigns)
	if campaignExists {
		return shim.Error("Campaign with this ID already exists.")
	}

	// Else, create Campaign and add it to list
	newCampaign := Campaign{ownerID, id, name, campaignType, start, end, transactionTime,
		transactionTime, campaignVoterGroups}
	campaignsList.Campaigns = append(campaignsList.Campaigns, newCampaign)

	// Update state and put state on ledger
	campaignsListBytes, _ = json.Marshal(campaignsList)

	err = stub.PutState("Campaigns List", campaignsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New Campaign Added")

	return shim.Success(nil)
}

// queryCampaignExistsByID queries the Campaigns array for id and returns whether it exists.
func queryCampaignExistsByID(id string, campaigns []Campaign) bool {

	for _, v := range campaigns {
		if v.ID == id {
			return true
		}
	}

	return false
}

// queryCampaignByID is a helper that queries the Campaigns array for id and returns it.
func queryCampaignByID(id string, campaigns []Campaign) (Campaign, error) {

	for _, v := range campaigns {
		if v.ID == id {
			return v, nil
		}
	}

	return Campaign{}, errors.New("Campaign with id: " + id + " does not exist.")
}

// QueryCampaignByID queries the Campaigns array for id and returns it.
func (t *Libertas) QueryCampaignByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var id string
	id = args[0]

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}

	// Get list of campaigns from the world state.
	campaignsListBytes, err := stub.GetState("Campaigns List")
	if err != nil {
		return shim.Error(err.Error())
	}
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)

	campaign, err := queryCampaignByID(id, campaignsList.Campaigns)

	if err != nil {
		return shim.Error(err.Error())
	}

	campaignBytes, _ := json.Marshal(campaign)

	return shim.Success(campaignBytes)
}

// AddVoterGroupToCampaign adds a VoterGroup to Campaign with ID id.
