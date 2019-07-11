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
	PersonalAccountID string
	VoterGroupID      string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type VotersList struct {
	Voters []Voter
}

type VoterChaincode struct {
}

// Init interface method
func (t *VoterChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Voter Chaincode Init")
	// _, args := stub.GetFunctionAndParameters()

	// if len(args) != 2 { // vat
	// 	return shim.Error("Incorrect number of arguments. Expecting 2.")
	// }

	votersList := VotersList{}
	voterssListBytes, _ := json.Marshal(accountsList)
	err = stub.PutState("Voters List", accountsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke interface method
func (t *VoterChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Voter Chaincode Invoke")
	function, args := stub.GetFunctionAndParameters()

	if function == "List" {
		return t.List(stub, args)
	} else if function == "Create" {
		return t.Create(stub, args)
	} else if function == "Edit" {
		return t.Edit(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"List\", \"Create\", \"Edit\"")
}

// List lists all the voters that belong to voterGroupID on currentPage
func (t *VoterChaincode) List(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	voterGroupID := args[0]
	currentPage := args[1]

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2.")
	}

	return shim.Success(nil)
}

// Create
func (t *VoterChaincode) Create(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
	isArgsValid, err := !isArgsValid(args)
	if (!isArgsValid) {
		return err;
	}

	newVoter := getNewVoter(args)
	
	// Get list of accounts from the ledger
	votersListBytes, err = stub.GetState("Voter List")
	votersList := VotersList{}
	json.Unmarshal(votersListBytes, &votersList)

	// check if voter has already been added
	if isVoterExists(personalAccountID, votersList) {
		return shim.Error("Voter with given ID already exists")
	}

	// add voter
	votersList.Voters = append(votersList.Voters, newVoter)

	// put state on ledger
	votersListBytes, _ = json.Marshal(votersList)
	err = stub.PutState("Voters List", votersListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New voter added.")

	return shim.Success(nil)
}

func getNewVoter(stub shim.ChaincodeStubInterface, args []string) Voter {
	institutionalAccountID := args[0]
	personalAccountID := args[1]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	newVoter := Voter{personalAccountID, institutionalAccountID, transactionTime, transactionTime} // second arg????

	return newVoter
}

// TODO: finish this
func isArgsValid(args string[]) bool, pb.Response {
	if len(args) != 2 {
		return false, shim.Error("Incorrect number of arguments. Expecting 2.")
	}

	institutionalAccountID := args[0]
	personalAccountID := args[1]

	// Get the identity of the user calling this function and check if arguments match attributes.
	iIDOK, err := checkParameters(stub, "id", id) // 
	if !idOK {
		return false, shim.Error(err.Error())
	}
	pIDOK, err := checkParameters(stub, "name", name)
	if !nameOK {
		return false, shim.Error(err.Error())
	}
}

func isVoterExists(personalAccountID string, votersList []Voter) bool {
	for _, voter := range votersList {
		if voter.PersonalAccountID == personalAccountID {
			return true
		}
	}

	return false
}

// patch
func (t *VoterChaincode) Edit(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	return shim.Success(nil)
}

func main() {
	err := shim.Start(new(VoterChaincode))
	if err != nil {
		fmt.Printf("Error starting VoterChaincode: %s", err)
	}
}

// one network, one project >> not possible for a given network to have multiple voters for a given account