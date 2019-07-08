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
	"errors"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Account represents a user account.
type Account struct {
	ID          string
	Name        string
	Email       string
	AccountType string
	CreatedAt   time.Time
	UpdatedAt   time.Time
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
	} else if function == "QueryByID" {
		return t.QueryByID(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"CreateAccount\", \"QueryByID\"")
}

// CreateAccount creates an account, if it doesn't already exist. Only admin can create account.
func (t *Libertas) CreateAccount(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var id, name, email, accountType string
	var accountsListBytes []byte

	id = args[0]
	name = args[1]
	email = args[2]
	accountType = args[3]
	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4.")
	}

	// Get the identity of the user calling this function and check if arguments match attributes.
	idOK, err := checkParameters(stub, "id", id)
	if !idOK {
		return shim.Error(err.Error())
	}
	nameOK, err := checkParameters(stub, "name", name)
	if !nameOK {
		return shim.Error(err.Error())
	}
	accountTypeOK, err := checkParameters(stub, "accountType", accountType)
	if !accountTypeOK {
		return shim.Error(err.Error())
	}

	// Get list of accounts from the ledger
	accountsListBytes, err = stub.GetState("Accounts List")
	accountsList := AccountsList{}
	json.Unmarshal(accountsListBytes, &accountsList)

	// If account with id already exists in accountsList, return error
	accountExists := queryByID(id, accountsList.Accounts)
	if accountExists {
		return shim.Error("This ID already exists")
	}

	// Else, create Account and add account to list
	newAccount := Account{id, name, email, accountType, transactionTime, transactionTime}
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

// QueryByID queries existing accounts in the ledger for id and returns whether it exists.
func (t *Libertas) QueryByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {

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

	exists := queryByID(id, accountsList.Accounts)

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
func queryByID(id string, accounts []Account) bool {

	for _, v := range accounts {
		if v.ID == id {
			return true
		}
	}

	return false
}

// checkParameters checks whether parameter matches with the caller's certificates attributes.
// Returns true if attribute matches.
func checkParameters(stub shim.ChaincodeStubInterface, attribute string, parameter string) (bool, error) {
	val, ok, err := cid.GetAttributeValue(stub, attribute)
	if err != nil {
		return false, err
	}
	if !ok {
		return false, errors.New("The client identity does not possess attribute: " + attribute)
	}
	if val != parameter {
		return false, errors.New("User is not registered with " + parameter + ". Must create account with registered attributes. See README.md for more details.")
	}
	return true, nil
}

func main() {
	err := shim.Start(new(Libertas))
	if err != nil {
		fmt.Printf("Error starting Libertas: %s", err)
	}
}
