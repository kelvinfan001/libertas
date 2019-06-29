/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"fmt"

	// need to "go get" this
	"github.com/golang/protobuf/ptypes/timestamp"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// Account represents a user account.
type Account struct {
	ID        string
	Name      string
	Email     string
	Kind      string
	CreatedAt timestamp.Timestamp
	UpdatedAt timestamp.Timestamp
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
	projectCrateTime := "Project Create Time"
	projectCreateTimeVal := stub.GetTxTimestamp

	// Write state to ledger
	err = stub.PutState(projectID, []byte(projectIDVal))
	if er != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(projectName, []byte(projectNameVal))
	if er != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(projectCreateTime, []byte(projectCreateTimeVal))
	if er != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke invokes stuff
func (t *Libertas) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Election Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "newAccount" {
		// Create a new account
		return t.newAccount(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"newAccount\"")
}

// CreateAccount creates an account, if it doesn't already exist. Only admin can create account.
func (t *Libertas) CreateAccount(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var id, name, email, kind string
	var accountBytes []byte
	var err error

	id = args[0]
	name = args[1]
	email = args[2]
	kind = args[3]

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4.")
	}

	creator := stub.GetCreator()
	// TODO: do stuff to verify creator is an admin!

	// Get list of accounts from the ledger
	accountsListBytes, err = stub.GetState("Accounts List")
	accountsList = convertAccountsListFromByte(accountsListBytes)

	// If account with id already exists in accountsList, return error
	accountExists := queryById(id, accountsArray)
	if (accountExists) {
		return shim.Error("This ID already exists")
	}
	newAccount := Accout{id, name, email, kind}
	// Else, create Account and add account to list
	accountsList.Accounts = append(newAccount)

	// Update state and put state on ledger
	accountsListBytes = convertAccountsListToByte(AccountsList)

	err = stub.PutState("Accounts List", accountsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("New account added.")

	return shim.Success(nil)
}

// QueryById queries existing accounts in the ledger for id and returns whether it exists.
func (t *Libertas) QueryById(stub shim.ChaincodeStubInterface. args []string) pb.Response {
	var id string

	id = args[0]

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}
}

// queryById queries the Accounts array for id and returns whether it exists.
func queryById(id string, accounts []Account) bool {

}

func convertAccountsListFromByte(toConvert []byte) AccountsList {

}

func main() {
	err := shim.Start(new(Libertas))
	if err != nil {
		fmt.Printf("Error starting Account: %s", err)
	}
}
