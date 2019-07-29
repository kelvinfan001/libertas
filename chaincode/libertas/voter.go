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

	voterGroupsList, err := _getVoterGroupsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	voterGroup, err := queryVoterGroupsByID(voterGroupID, voterGroupsList.VoterGroups)
	if err != nil {
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	votersBytes, _ := json.Marshal(voterGroup.Voters)

	return shim.Success(votersBytes)
}

//----------------------------------------------------------------------------------------------------------------
// Create
func (t *Libertas) CreateVoter(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// checks
	err := _createVoterChecks(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	// update ledger
	voterGroupID := args[2]
	newVoter := _getNewVoter(stub, args)
	err = _updateLedgerVoterList(stub, voterGroupID, newVoter)
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

	// check for correct account type
	accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution")
	if !accountTypeOK {
		return errors.New(err.Error())
	}
	// check if voter already exists in voter group
	voterGroupID := args[2]
	voterGroupsList, err := _getVoterGroupsList(stub)
	if err != nil {
		return err
	}
	voterGroup, err := queryVoterGroupsByID(voterGroupID, voterGroupsList.VoterGroups)
	if err != nil {
		return err
	}

	voterID := args[0]
	for _, voter := range voterGroup.Voters {
		if voter.ID == voterID {
			return errors.New("Voter with ID: " + voterID + " already exists")
		}
	}

	return nil
}

func _updateLedgerVoterList(stub shim.ChaincodeStubInterface, voterGroupID string, newVoter Voter) error {
	// get the voter group
	voterGroupsList, err := _getVoterGroupsList(stub)
	if err != nil {
		return err
	}
	voterGroupPtr, err := _getVoterGroupsPointerByID(voterGroupID, voterGroupsList.VoterGroups)
	if err != nil {
		return err
	}

	// update the voter group
	voterGroupPtr.Voters = append(voterGroupPtr.Voters, newVoter)
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	voterGroupPtr.UpdatedAt = transactionTime
	voterGroupsListBytes, _ := json.Marshal(voterGroupsList)
	err = stub.PutState("Voter Groups List", voterGroupsListBytes)
	if err != nil {
		return err
	}

	return nil
}

func _getVoterGroupsPointerByID(id string, voterGroups []VoterGroup) (*VoterGroup, error) {
	for k := range voterGroups {
		voterGroupPtr := &voterGroups[k]
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

//----------------------------------------------Edit--------------------------------------------------
//
func (t *Libertas) EditVoter(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	return shim.Success(nil)
}

// campaigns can be presidential or city wise >> so one account can belong to mulitple voter groups
