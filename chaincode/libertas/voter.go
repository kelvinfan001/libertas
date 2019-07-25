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

type Voter struct {
	ID                string
	PersonalAccountID string
	VoterGroupID      string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type VotersList struct {
	Voters []Voter
}

//----------------------------------------------------------------------------------------------------------------
// List lists all the voters that belong to voterGroupID on currentPage
func (t *Libertas) ListVotersByVoterGroupID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// check args
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}
	voterGroupID := args[0]

	// get the voter group
	voterGroupsListBytes, err := stub.GetState("Voter Groups List")
	voterGroupsList := VoterGroupsList{}
	json.Unmarshal(voterGroupsListBytes, &voterGroupsList)

	// fmt.Println(voterGroupsList)

	voterGroup, err := queryVoterGroupsByID(voterGroupID, voterGroupsList.VoterGroups)
	if err != nil {
		return shim.Error(err.Error())
	}

	// fmt.Println(voterGroup.Voters)
	votersList := VotersList{voterGroup.Voters}
	// fmt.Println(votersList.voters)
	votersListBytes, _ := json.Marshal(votersList)

	voters := VotersList{}
	json.Unmarshal(votersListBytes, &voters)

	// fmt.Println(voters)

	return shim.Success(votersListBytes)
}

//----------------------------------------------------------------------------------------------------------------
// Create
func (t *Libertas) CreateVoter(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// checks
	err := _createVoterChecks(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	newVoter := _getNewVoter(stub, args)
	voterGroupID := args[2]

	// update ledger
	err = _updateLedgerVoterList(stub, newVoter, voterGroupID)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New voter added.")
	return shim.Success(nil)
	// return shim.Error(voterGroupsList.VoterGroups[0].Voters[0].ID)
}

func _createVoterChecks(stub shim.ChaincodeStubInterface, args []string) error {
	// check num args
	if len(args) != 3 {
		return errors.New("Incorrect number of arguments. Expecting 3.")
	}

	// check for correct account type TODO:
	// accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution")
	// if !accountTypeOK {
	// 	return errors.New(err.Error())
	// }
	// check if voterGroupID already exists
	voterGroupsListBytes, err := stub.GetState("Voter Groups List")
	voterGroupsList := VoterGroupsList{}
	json.Unmarshal(voterGroupsListBytes, &voterGroupsList)
	voterGroupID := args[2]
	voterGroup, err := queryVoterGroupsByID(voterGroupID, voterGroupsList.VoterGroups)
	if err != nil {
		return errors.New(err.Error())
	}

	voterID := args[0]
	for _, voter := range voterGroup.Voters {
		if voter.ID == voterID {
			return errors.New("Voter with ID: " + voterID + " already exists")
		}
	}

	return nil
}

func _updateLedgerVoterList(stub shim.ChaincodeStubInterface, newVoter Voter, voterGroupID string) error {
	// get the voter group
	voterGroupsListBytes, err := stub.GetState("Voter Groups List")
	if err != nil {
		return err
	}
	voterGroupsList := VoterGroupsList{}
	json.Unmarshal(voterGroupsListBytes, &voterGroupsList)

	voterGroupPtr, err := _getVoterGroupsPointerByID(voterGroupID, &voterGroupsList)
	if err != nil {
		return err
	}

	// update the voter group
	voterGroupPtr.Voters = append(voterGroupPtr.Voters, newVoter)
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	voterGroupPtr.UpdatedAt = transactionTime
	voterGroupsListBytes, _ = json.Marshal(voterGroupsList)
	err = stub.PutState("Voter Groups List", voterGroupsListBytes)

	// fmt.Println(voterGroupsList)
	// fmt.Println(voterGroupsList.VoterGroups[0].Voters)
	// fmt.Println(voterGroupPtr.Voters)
	voterGroupsList = VoterGroupsList{}
	json.Unmarshal(voterGroupsListBytes, &voterGroupsList)
	// fmt.Println(voterGroupsList)

	return nil
}

func _getVoterGroupsPointerByID(id string, voterGroupsList *VoterGroupsList) (*VoterGroup, error) {
	for k := range voterGroupsList.VoterGroups {
		voterGroupPtr := &voterGroupsList.VoterGroups[k]
		if voterGroupPtr.ID == id {
			return voterGroupPtr, nil
		}
	}

	return &VoterGroup{}, errors.New("Voter Group with id: " + id + " does not exist.")
}

func _getNewVoter(stub shim.ChaincodeStubInterface, args []string) Voter {
	id := args[0]
	personalAccountID := args[1]
	voterGroupID := args[2]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	newVoter := Voter{id, personalAccountID, voterGroupID, transactionTime, transactionTime}

	return newVoter
}

//----------------------------------------------------------------------------------------------------------------
// patch
func (t *Libertas) EditVoter(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	return shim.Success(nil)
}

// campaigns can be presidential or city wise >> so one account can belong to mulitple voter groups
