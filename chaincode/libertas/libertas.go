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

	//Initialize voter groups list
	voterGroupsList := VoterGroupsList{}
	voterGroupsListBytes, _ := json.Marshal(voterGroupsList)
	err = stub.PutState("Voter Groups List", voterGroupsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// Initialize campaign list
	campaignList := CampaignsList{}
	campaignListBytes, _ := json.Marshal(campaignList)
	err = stub.PutState("Campaigns List", campaignListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke invokes funcitions
func (t *Libertas) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Election Invoke")
	function, args := stub.GetFunctionAndParameters()

	switch function {
	case "CreateAccount": // Account-related functions
		return t.CreateAccount(stub, args)
	case "QueryAccountByID":
		return t.QueryAccountByID(stub, args)
	case "EditAccountByID":
		return t.EditAccountByID(stub, args)
	case "DeleteAccountByID":
		return t.DeleteAccountByID(stub, args)
	case "CreateVoterGroup": // Votergroup-related functions
		return t.CreateVoterGroup(stub, args)
	case "QueryVoterGroupsByID":
		return t.QueryVoterGroupsByID(stub, args)
	case "EditVoterGroupByID":
		return t.EditVoterGroupByID(stub, args)
	case "DeleteVoterGroupByID":
		return t.DeleteVoterGroupByID(stub, args)
	case "ListVotersByVoterGroupID": // Voter-related functions
		return t.ListVotersByVoterGroupID(stub, args)
	case "CreateVoter":
		return t.CreateVoter(stub, args)
	case "EditVoterByID":
		return t.EditVoterByID(stub, args)
	case "DeleteVoterByID":
		return t.DeleteVoterByID(stub, args)
	case "CreateCampaign": // Campaign-related functions
		return t.CreateCampaign(stub, args)
	case "QueryCampaignByID":
		return t.QueryCampaignByID(stub, args)
	case "QueryCampaignByInstitutionUsername":
		return t.QueryCampaignByInstitutionUsername(stub, args)
	case "EditCampaignByID":
		return t.EditCampaignByID(stub, args)
	case "DeleteCampaignByID":
		return t.DeleteCampaignByID(stub, args)
	case "CreateVote": // Vote-related functions
		return t.CreateVote(stub, args)
	case "ListBallotByCampaignID":
		return t.ListBallotByCampaignID(stub, args)
		// case "EditVote":
		// 	return t.EditVoteByID(stub, args)

	}

	return shim.Error("Invalid invoke function name.")
}

func main() {
	err := shim.Start(new(Libertas))
	if err != nil {
		fmt.Printf("Error starting Libertas: %s", err)
	}
}
