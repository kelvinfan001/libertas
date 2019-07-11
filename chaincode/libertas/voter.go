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
	PersonalAccountID string
	VoterGroupID      string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

//----------------------------------------------------------------------------------------------------------------
// List lists all the voters that belong to voterGroupID on currentPage
func (t *Libertas) ListVoters(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// voterGroupID := args[0]
	// currentPage := args[1]

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2.")
	}

	return shim.Success(nil)
}

//----------------------------------------------------------------------------------------------------------------
// Create
func (t *Libertas) CreateVoter(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	err := _isArgsValid(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	newVoter := _getNewVoter(stub, args)
	// personalAccountID := args[0]
	voterGroupID := args[1]

	// Get list of accounts from the ledger
	// may need to error check this
	// votersList := _getVoterSlice(voterGroupsList, voterGroupID)
	// check if voter has already been added
	// if _isVoterExists(personalAccountID, votersList) {
	// 	return shim.Error("Voter with given ID already exists")
	// }

	// update ledger
	err = _updateLedgerVoterList(stub, newVoter, voterGroupID)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New voter added.")

	return shim.Success(nil)
}

func _updateLedgerVoterList(stub shim.ChaincodeStubInterface, newVoter Voter, voterGroupID string) error {
	voterGroupsListBytes, err := stub.GetState("Voter Groups List")
	voterGroupsList := VoterGroupsList{}
	json.Unmarshal(voterGroupsListBytes, &voterGroupsList)

	for _, voterGroup := range voterGroupsList.VoterGroups {
		if voterGroup.ID == voterGroupID {
			// add voter
			voterGroup.Voters = append(voterGroup.Voters, newVoter)
			voterGroupsListBytes, _ := json.Marshal(voterGroupsList)
			err = stub.PutState("Voters Groups List", voterGroupsListBytes)
			if err != nil {
				return err
			}
		}
	}

	return err
}

func _getNewVoter(stub shim.ChaincodeStubInterface, args []string) Voter {
	institutionalAccountID := args[0]
	personalAccountID := args[1]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	newVoter := Voter{personalAccountID, institutionalAccountID, transactionTime, transactionTime} // second arg????

	return newVoter
}

func _isArgsValid(stub shim.ChaincodeStubInterface, args []string) error {
	var err error

	if len(args) != 2 {
		return errors.New("Incorrect number of arguments. Expecting 2.")
		// return shim.Error("Incorrect number of arguments. Expecting 2.")
	}

	personalAccountID := args[0]
	voterGroupID := args[1]

	// check if arg matches type
	personalAccountIDOK, err := CheckCertAttribute(stub, "personalAccountID", personalAccountID)
	if !personalAccountIDOK {
		// return shim.Error(err.Error())
		return err
	}
	voterGroupIDOK, err := CheckCertAttribute(stub, "voterGroupID", voterGroupID)
	if !voterGroupIDOK {
		// return shim.Error(err.Error())
		return err
	}

	return nil
}

func _isVoterExists(personalAccountID string, votersList []Voter) bool {
	for _, voter := range votersList {
		if voter.PersonalAccountID == personalAccountID {
			return true
		}
	}

	return false
}

//----------------------------------------------------------------------------------------------------------------
// patch
func (t *Libertas) EditVoter(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	return shim.Success(nil)
}

// campaigns can be presidential or city wise >> so one account can belong to mulitple voter groups
