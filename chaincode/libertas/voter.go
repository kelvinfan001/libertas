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

type Voter struct {
	ID                string
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
	// checks
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3.")
	}
	accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution")
	if !accountTypeOK {
		return shim.Error(err.Error())
	}

	newVoter := _getNewVoter(stub, args)
	voterGroupID := args[1]

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

	voterGroup, err := queryVoterGroupsByID(voterGroupID, voterGroupsList.VoterGroups)
	if err != nil {
		return err
	}

	voterGroup.Voters = append(voterGroup.Voters, newVoter)
	voterGroupsListBytes, _ = json.Marshal(voterGroupsList)
	err = stub.PutState("Voters Groups List", voterGroupsListBytes)

	return nil
}

func _getNewVoter(stub shim.ChaincodeStubInterface, args []string) Voter {
	id := args[0]
	personalAccountID := args[1]
	voterGroupID := args[2]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	newVoter := Voter{id, personalAccountID, voterGroupID, transactionTime, transactionTime} // second arg????

	return newVoter
}

//----------------------------------------------------------------------------------------------------------------
// patch
func (t *Libertas) EditVoter(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	return shim.Success(nil)
}

// campaigns can be presidential or city wise >> so one account can belong to mulitple voter groups
