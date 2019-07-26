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
type VoterGroupsList struct {
	VoterGroups []VoterGroup
}

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

//----------------------------------------------Create--------------------------------------------------
// CreateVoterGroup creates a new voter group
func (t *Libertas) CreateVoterGroup(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	err := _createVoterGroupChecks(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	//  create VoterGroup and add it to list
	newVoterGroup, err := _getVoterGroup(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}
	_updateLedgerVoterGroup(stub, newVoterGroup)

	fmt.Println("New Voter Group added")
	return shim.Success(nil)
}

func _updateLedgerVoterGroup(stub shim.ChaincodeStubInterface, newVoterGroup VoterGroup) error {
	voterGroupsList, err := _getVoterGroupsList(stub)
	if err != nil {
		return err
	}

	voterGroupsList.VoterGroups = append(voterGroupsList.VoterGroups, newVoterGroup)

	// Update state and put state on ledger
	voterGroupsListBytes, _ := json.Marshal(voterGroupsList)

	err = stub.PutState("Voter Groups List", voterGroupsListBytes)
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
	voterGroupsList, err := _getVoterGroupsList(stub)
	if err != nil {
		return nil
	}

	// If voter group with id already exists in voterGroupsList, return Error
	voterGroupExists := queryVoterGroupsByIDExists(voterGroupID, voterGroupsList.VoterGroups)
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

//----------------------------------------------Query--------------------------------------------------
// QueryAccountByID queries existing accounts in the ledger for id and returns whether it exists.
func (t *Libertas) QueryVoterGroupsByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	voterGroupID := args[0]

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}

	// Get list of VoterGroups from the ledger
	voterGroupsList, err := _getVoterGroupsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}

	voterGroup, err := queryVoterGroupsByID(voterGroupID, voterGroupsList.VoterGroups)
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

//----------------------------------------------Edit--------------------------------------------------

func (t *Libertas) EditVoterGroup(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	return shim.Success(nil)
}
