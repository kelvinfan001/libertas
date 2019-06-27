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
	email     string
	Type      string
	CreatedAt timestamp.Timestamp
	UpdatedAt timestamp.Timestamp
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

func main() {
	err := shim.Start(new(Libertas))
	if err != nil {
		fmt.Printf("Error starting Account: %s", err)
	}
}
