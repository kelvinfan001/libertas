/*
 * Copyright 2019 Sipher Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
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

// Account represents a user account.
type Account struct {
	ID          string
	Name        string
	Email       string
	AccountType string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// AccountsList is a list of accounts.
type AccountsList struct {
	Accounts []Account
}

//----------------------------------------------Create--------------------------------------------------
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
	idOK, err := CheckCertAttribute(stub, "id", id)
	if !idOK {
		return shim.Error(err.Error())
	}
	nameOK, err := CheckCertAttribute(stub, "name", name)
	if !nameOK {
		return shim.Error(err.Error())
	}
	accountTypeOK, err := CheckCertAttribute(stub, "accountType", accountType)
	if !accountTypeOK {
		return shim.Error(err.Error())
	}

	// Get list of accounts from the ledger
	accountsListBytes, err = stub.GetState("Accounts List")
	accountsList := AccountsList{}
	json.Unmarshal(accountsListBytes, &accountsList)

	// If account with id already exists in accountsList, return error
	accountExists := queryAccountExistsByID(id, accountsList.Accounts)
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

//----------------------------------------------Query--------------------------------------------------
// QueryAccountByID queries existing accounts in the ledger for id and returns whether it exists.
func (t *Libertas) QueryAccountByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {

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

	account, err := queryAccountByID(id, accountsList.Accounts)

	if err != nil {
		return shim.Error(err.Error())
	}

	accountBytes, _ := json.Marshal(account)

	return shim.Success(accountBytes)

}

// queryAccountByID is a helper that queries the Accounts array for id and returns the account with id.
func queryAccountByID(id string, accounts []Account) (Account, error) {

	for _, v := range accounts {
		if v.ID == id {
			return v, nil
		}
	}

	return Account{}, errors.New("Account with id: " + id + " does not exist.")
}

// queryByAccountExistsById queries the Accounts array for id and returns whether it exists.
func queryAccountExistsByID(id string, accounts []Account) bool {

	for _, v := range accounts {
		if v.ID == id {
			return true
		}
	}

	return false
}

//----------------------------------------------Edit--------------------------------------------------
func (t *Libertas) InstitutionEditAccountByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3.")
	}

	accountID := args[0]
	accountsList, err := _getAccountsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	account, err := _getAccountPointerByID(accountID, accountsList.Accounts)
	if err != nil {
		return shim.Error(err.Error())
	}

	field := args[1]
	value := args[2]
	switch field {
	case "ID":
		account.ID = value
	case "Name":
		account.Name = value
	case "Email":
		account.Email = value
	case "AccountType":
		account.AccountType = value
	}

	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	account.UpdatedAt = transactionTime

	accountsListBytes, _ := json.Marshal(accountsList)
	err = stub.PutState("Accounts List", accountsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("Edit Success")
	return shim.Success(nil)
}

func (t *Libertas) PersonalEditAccount(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3.")
	}

	accountID := args[0]
	accountsList, err := _getAccountsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}
	account, err := _getAccountPointerByID(accountID, accountsList.Accounts)
	if err != nil {
		return shim.Error(err.Error())
	}

	field := args[1]
	value := args[2]
	switch field {
	case "Name":
		account.Name = value
	case "Email":
		account.Email = value
	}

	transactionTimeProtobuf, _ := stub.GetTxTimestamp()
	// Convert protobuf timestamp to Time data structure
	transactionTime := time.Unix(transactionTimeProtobuf.Seconds, int64(transactionTimeProtobuf.Nanos))
	account.UpdatedAt = transactionTime

	accountsListBytes, _ := json.Marshal(accountsList)
	err = stub.PutState("Accounts List", accountsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("Edit Success")
	return shim.Success(nil)
}

func _getAccountPointerByID(accountID string, accounts []Account) (*Account, error) {
	for k, _ := range accounts {
		account := &accounts[k]
		if account.ID == accountID {
			return account, nil
		}
	}

	return &Account{}, nil
}

//----------------------------------------------Delete--------------------------------------------------

func (t *Libertas) DeleteAccountByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1.")
	}

	accountTypeOK, err := CheckCertAttribute(stub, "accountType", "Institution")
	if !accountTypeOK {
		return shim.Error(err.Error())
	}

	accountID := args[0]
	accountsList, err := _getAccountsList(stub)
	if err != nil {
		return shim.Error(err.Error())
	}

	index, err := _getAccountIndexByID(accountID, accountsList.Accounts)
	accountsList.Accounts = removeAccount(accountsList.Accounts, index)
	if err != nil {
		return shim.Error(err.Error())
	}

	accountsListBytes, _ := json.Marshal(accountsList)
	err = stub.PutState("Accounts List", accountsListBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("Delete Success")
	return shim.Success(nil)
}

func _getAccountIndexByID(accountID string, accounts []Account) (int, error) {
	for index, account := range accounts {
		if accountID == account.ID {
			return index, nil
		}
	}

	return -1, errors.New("The account with ID: " + accountID + " does not exist")
}
