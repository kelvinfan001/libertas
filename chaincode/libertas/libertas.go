/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * TODO: provide better documentation.
 */

package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Libertas represents a project on a network.
type Libertas struct {
}

// Init initializes the chaincode
func (t *Libertas) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Libertas Project Init")
	_, args := stub.GetFunctionAndParameters()
	var err error

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2.")
	}

	// Initialize fields for storing on ledger.
	projectIDVal := args[0]
	projectNameVal := args[1]
	projectCreateTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	projectCreateTimeVal := time.Unix(projectCreateTimeProtobuf.Seconds,
		int64(projectCreateTimeProtobuf.Nanos))

	// Write initial state to ledger
	err = stub.PutState("Project ID", []byte(projectIDVal))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState("Project Name", []byte(projectNameVal))
	if err != nil {
		return shim.Error(err.Error())
	}

	projectCreateTimeValBytes, _ := json.Marshal(projectCreateTimeVal)
	err = stub.PutState("Project Create Time", []byte(projectCreateTimeValBytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	// Initialize accounts list
	accountsList := AccountsList{}
	accountsListBytes, _ := json.Marshal(accountsList)
	err = stub.PutState("Accounts List", accountsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Initialize voter groups list
	voterGroupsList := VoterGroupsList{}
	voterGroupsListBytes, _ := json.Marshal(voterGroupsList)
	err = stub.PutState("Voter Groups List", voterGroupsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Initialize campaign list
	campaignList := CampaignsList{}
	campaignListBytes, _ := json.Marshal(campaignList)
	err = stub.PutState("Campaign List", campaignListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke invokes stuff
func (t *Libertas) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Election Invoke")
	function, args := stub.GetFunctionAndParameters()

	if function == "CreateAccount" { // Account Related Functions
		return t.CreateAccount(stub, args)
	} else if function == "QueryAccountByID" {
		return t.QueryAccountByID(stub, args)
	} else if function == "CreateVoterGroup" {
		return t.CreateVoterGroup(stub, args)
	} else if function == "ListVoters" { // Voter Related Functions
		return t.ListVoters(stub, args)
	} else if function == "CreateVoter" {
		return t.CreateVoter(stub, args)
	} else if function == "EditVoter" {
		return t.EditVoter(stub, args)
	} else if function == "CreateCampaign" {
		return t.CreateCampaign(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"CreateAccount\", \"QueryAccountsByID\", \"CreateVoterGroup\"")
}

func main() {
	err := shim.Start(new(Libertas))
	if err != nil {
		fmt.Printf("Error starting Libertas: %s", err)
	}
}
