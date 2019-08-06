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
	OwnerID             string
	ID                  string
	Name                string
	CampaignType        string
	CampaignBallotBox   []Vote
	Start               time.Time
	End                 time.Time
	CreatedAt           time.Time
	UpdatedAt           time.Time
	CampaignVoterGroups []VoterGroup
}

//----------------------------------------------Create--------------------------------------------------

// CreateCampaign creates a new campaign.
// Takes in parameters id, name, campaignType, start, and end.
// start and end are number of seconds after Unix epoch.
func (t *Libertas) CreateCampaign(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// checks
	err := _createCampaignChecks(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	// update ledger
	newCampaign, err := _getNewCampaign(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = _updateLedgerCampaignsList(stub, newCampaign)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New campaign added.")

	return shim.Success(nil)
}

func _updateLedgerCampaignsList(stub shim.ChaincodeStubInterface, newCampaign Campaign) error {
	// Get list of Campaigns from the ledger
	campaignsListBytes, err := stub.GetState("Campaigns List")
	if err != nil {
		return err
	}
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)

	// add newCampaign to list of campaigns
	campaignsList.Campaigns = append(campaignsList.Campaigns, newCampaign)

	// update the ledger state
	// Update state and put state on ledger
	campaignsListBytes, _ = json.Marshal(campaignsList)
	err = stub.PutState("Campaigns List", campaignsListBytes)
	if err != nil {
		return err
	}

	return nil
}

func _getNewCampaign(stub shim.ChaincodeStubInterface, args []string) (Campaign, error) {
	var ownerID, id, name, campaignType string
	var start, end time.Time
	var campaignVoterGroups []VoterGroup

	// Get owner's ID
	ownerID, err := GetCertAttribute(stub, "id") // TODO:
	// if err != nil {
	// 	return Campaign{}, err
	// }

	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))

	id = args[0]
	name = args[1]
	campaignType = args[2]

	startStr := args[3]
	endStr := args[4]

	start, end, err = _translateTimeStamps(startStr, endStr)
	if err != nil {
		return Campaign{}, err
	}

	// Create an empty slice of VoterGroups
	campaignVoterGroups = make([]VoterGroup, 0)
	campaignBallotBox := make([]Vote, 0)
	newCampaign := Campaign{ownerID, id, name, campaignType, campaignBallotBox, start, end, transactionTime,
		transactionTime, campaignVoterGroups}

	// newCampaign := Campaign{ownerID, id, name, campaignType, campaignBallotBox, transactionTime,
	// 	transactionTime, campaignVoterGroups}

	return newCampaign, nil
}

func _translateTimeStamps(startStr string, endStr string) (time.Time, time.Time, error) {
	var start, end time.Time

	// Convert start and end arguments from string to int
	startInt, err := strconv.ParseInt(startStr, 10, 64)
	if err != nil {
		return start, end, err
	}
	endInt, err := strconv.ParseInt(endStr, 10, 64)
	if err != nil {
		return start, end, err
	}

	start = time.Unix(int64(startInt), 0)
	end = time.Unix(int64(endInt), 0)

	return start, end, nil
}

func _createCampaignChecks(stub shim.ChaincodeStubInterface, args []string) error {
	// check num args
	if len(args) != 5 {
		return errors.New("Incorrect number of arguments. Expecting 5.")
	}

	// check for correct account type
	// accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution") // TODO:
	// if !accountTypeOK {
	// 	return err
	// }

	// Get list of Campaigns from the ledger
	campaignsListBytes, err := stub.GetState("Campaigns List")
	if err != nil {
		return err
	}
	campaignsList := CampaignsList{}
	json.Unmarshal(campaignsListBytes, &campaignsList)
	id := args[0]
	isCampaignExists := _getCampaignExists(id, campaignsList.Campaigns)
	if isCampaignExists {
		return errors.New("Campaign with ID: " + id + " already exists")
	}

	return nil
}

func _getCampaignExists(id string, campaigns []Campaign) bool {
	for _, campaign := range campaigns {
		if campaign.ID == id {
			return true
		}
	}

	return false
}

//------------------------------------------Query----------------------------------------------

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

	// fmt.Println(campaign)

	campaignBytes, _ := json.Marshal(campaign)
	return shim.Success(campaignBytes)
}

func queryCampaignByID(campaignID string, campaigns []Campaign) (Campaign, error) {
	for _, campaign := range campaigns {
		if campaign.ID == campaignID {
			return campaign, nil
		}
	}

	return Campaign{}, errors.New("The campaign with ID: " + campaignID + " does not exist")
}

func (t *Libertas) QueryCampaignByInstitutionUsername(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}

	// Get list of campaigns from the world state.
	campaignsList, err := _getCampaignsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}

	username := args[0]
	result := make([]Campaign, 0)
	for _, campaign := range campaignsList.Campaigns {
		if campaign.OwnerID == username {
			result = append(result, campaign)
		}
	}

	campaignsBytes, _ := json.Marshal(result)
	return shim.Success(campaignsBytes)
}

//----------------------------------------------Edit--------------------------------------------------

func (t *Libertas) EditCampaignByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3.")
	}

	campaignID := args[0]
	campaignsList, err := _getCampaignsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	campaign, err := _queryCampaignPtrByID(campaignID, &campaignsList)
	if err != nil {
		return shim.Error(err.Error())
	}

	field := args[1]
	value := args[2]
	switch field {
	case "ID":
		campaign.ID = value
	case "Name":
		campaign.Name = value
	case "CampaignType":
		campaign.CampaignType = value
	case "Start":
		dummy := "0"
		start, _, err := _translateTimeStamps(value, dummy)
		if err != nil {
			return shim.Error(err.Error())
		}
		campaign.Start = start
	case "End":
		dummy := "0"
		_, end, err := _translateTimeStamps(dummy, value)
		if err != nil {
			return shim.Error(err.Error())
		}
		campaign.End = end
	}

	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	campaign.UpdatedAt = transactionTime

	campaignsListBytes, _ := json.Marshal(campaignsList)
	err = stub.PutState("Campaigns List", campaignsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

//----------------------------------------------Delete--------------------------------------------------

func (t *Libertas) DeleteCampaignByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}

	accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution")
	if !accountTypeOK {
		return shim.Error(err.Error())
	}

	campaignID := args[0]
	campaignsList, err := _getCampaignsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}

	index, err := _getCampaignIndexByID(campaignID, campaignsList.Campaigns)
	campaignsList.Campaigns = removeCampaign(campaignsList.Campaigns, index)
	if err != nil {
		return shim.Error(err.Error())
	}

	campaignsListBytes, _ := json.Marshal(campaignsList)
	err = stub.PutState("Campaigns List", campaignsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func _getCampaignIndexByID(campaignID string, campaigns []Campaign) (int, error) {
	for index, campaign := range campaigns {
		if campaignID == campaign.ID {
			return index, nil
		}
	}

	return -1, errors.New("The campaign with ID: " + campaignID + " does not exist")
}
