/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * TODO: provide better documentation.
 */

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Account represents a user account.
type Account struct {
	ID        string
	Name      string
	Email     string
	Kind      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// AccountsList is a list of accounts
type AccountsList struct {
	Accounts []Account
}

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

	// Initialize fields for storing on ledger
	projectID := "Project ID"
	projectIDVal := args[0]
	projectName := "Project Name"
	projectNameVal := args[1]
	projectCreateTime := "Project Create Time"
	projectCreateTimeProtobuf, _ := stub.GetTxTimestamp()

	// Convert protobuf timestamp to Time data structure
	projectCreateTimeVal := time.Unix(projectCreateTimeProtobuf.Seconds, int64(projectCreateTimeProtobuf.Nanos))

	// Write state to ledger
	err = stub.PutState(projectID, []byte(projectIDVal))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(projectName, []byte(projectNameVal))
	if err != nil {
		return shim.Error(err.Error())
	}

	projectCreateTimeValBytes, _ := json.Marshal(projectCreateTimeVal)
	err = stub.PutState(projectCreateTime, []byte(projectCreateTimeValBytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke invokes stuff
func (t *Libertas) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Election Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "CreateAccount" {
		// Create a new account
		return t.CreateAccount(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"newAccount\"")
}

// CreateAccount creates an account, if it doesn't already exist. Only admin can create account.
func (t *Libertas) CreateAccount(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var id, name, email, kind string
	var accountsListBytes []byte
	var err error

	id = args[0]
	name = args[1]
	email = args[2]
	kind = args[3]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4.")
	}

	// TODO: THIS PART IS NOT WORKING. COMMENTING OUT FOR NOW. DEPENDENCY PROBELMS. VENDOR???
	// Get the identity of the person calling this function.
	id, err = cid.GetID(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	// Check if caller is admin.
	// TODO: SHOULD CHECK CERTIFICATE TO BE MORE RIGOROUS!
	if id != "admin" {
		return shim.Error("Cannot find admin credentials")
	}

	// Get list of accounts from the ledger
	accountsListBytes, err = stub.GetState("Accounts List")
	accountsList := AccountsList{}
	json.Unmarshal(accountsListBytes, &accountsList)

	// If account with id already exists in accountsList, return error
	accountExists := queryById(id, accountsList.Accounts)
	if accountExists {
		return shim.Error("This ID already exists")
	}

	// Else, create Account and add account to list
	newAccount := Account{id, name, email, kind, transactionTime, transactionTime}
	accountsList.Accounts = append(accountsList.Accounts, newAccount)

	// Update state and put state on ledger
	accountsListBytes, _ = json.Marshal(accountsList)

	err = stub.PutState("Accounts List", accountsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New account added.")

	return shim.Success(nil)
}

// QueryById queries existing accounts in the ledger for id and returns whether it exists.
func (t *Libertas) QueryById(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var id string
	id = args[0]

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}

	// Get list of accounts from the world state.
	accountsListBytes, err := stub.GetState("Accounts List")
	if err != nil {
		return shim.Error(err.Error())
	}
	accountsList := AccountsList{}
	json.Unmarshal(accountsListBytes, &accountsList)

	exists := queryById(id, accountsList.Accounts)

	// Buffer is a string indicating whether the id exists.
	var buffer bytes.Buffer

	if exists {
		buffer.WriteString("true")
	} else {
		buffer.WriteString("false")
	}

	return shim.Success(buffer.Bytes())

}

// queryById queries the Accounts array for id and returns whether it exists.
func queryById(id string, accounts []Account) bool {

	for _, v := range accounts {
		if v.ID == id {
			return true
		}
	}

	return false
}

func main() {
	err := shim.Start(new(Libertas))
	if err != nil {
		fmt.Printf("Error starting Account: %s", err)
	}
}
