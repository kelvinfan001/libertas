/*
 * Copyright 2019 Sipher Inc
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func TestLibertas_Init(t *testing.T) {
	scc := new(Libertas)
	stub := shim.NewMockStub("libertas", scc)

	// Init "Project ID"="123", "Project Name"="Derp Project"
	checkInit(t, stub, [][]byte{[]byte("init"), []byte("123"), []byte("Derp Project")})

	checkState(t, stub, "Project ID", "123")
	checkState(t, stub, "Project Name", "Derp Project")
	// TODO: check state for 'Project Create Time'
}

// Cannot test create account due to lack of support to mock certificates.

// Tests QueryAccountExists
func TestLibertas_QueryAccount(t *testing.T) {
	scc := new(Libertas)
	stub := shim.NewMockStub("libertas", scc)

	// Init "Project ID"="123", "Project Name"="Derp Project"
	checkInit(t, stub, [][]byte{[]byte("init"), []byte("123"), []byte("Derp Project")})
	stub.MockTransactionStart("derp")

	// Create some accounts
	accountsList := AccountsList{}
	newAccount1 := Account{"kelvinfan", "Kelvin Fan", "kelvin@sipher.co", "Personal", time.Now(), time.Now()}
	newAccount2 := Account{"kailonghuang", "Kailong Huang", "kailong@sipher.co", "Personal", time.Now(), time.Now()}
	accountsList.Accounts = append(accountsList.Accounts, newAccount1)
	accountsList.Accounts = append(accountsList.Accounts, newAccount2)
	accountsListBytes, _ := json.Marshal(accountsList)
	// Put on state
	stub.PutState("Accounts List", accountsListBytes)

	checkStateAccountListExists(t, stub)

	// Query for account with id "kelvinfan"
	got := returnInvoke(t, stub, [][]byte{[]byte("QueryAccountByID"), []byte("kelvinfan")})
	payload := got.GetPayload()
	account := Account{}
	json.Unmarshal(payload, &account)
	if account.ID != "kelvinfan" {
		t.Errorf("The queried account kelvinfan should have id kelvinfan.")
	}
}

// Test Campaigns
// func TestLibertas_Campaign(t *testing.T) {
// 	scc := new(Libertas)
// 	stub := shim.NewMockStub("libertas", scc)

// 	// Init "Project ID"="123", "Project Name"="Derp Project"
// 	checkInit(t, stub, [][]byte{[]byte("init"), []byte("123"), []byte("Derp Project")})
// 	stub.MockTransactionStart("derp")

// 	// Create some accounts
// 	accountsList := AccountsList{}
// 	newAccount1 := Account{"kelvinfan", "Kelvin Fan", "kelvin@sipher.co", "Personal", time.Now(), time.Now()}
// 	newAccount2 := Account{"cityoftoronto", "City of Toronto", "city@toronto.ca", "Institution", time.Now(), time.Now()}
// 	accountsList.Accounts = append(accountsList.Accounts, newAccount1)
// 	accountsList.Accounts = append(accountsList.Accounts, newAccount2)
// 	accountsListBytes, _ := json.Marshal(accountsList)
// 	// Put on state
// 	stub.PutState("Accounts List", accountsListBytes)

// 	// Create a campaign
// 	checkInvoke(t, stub, [][]byte{[]byte("CreateCampaign"), []byte("torontomayoralelection"), []byte("Toronto Mayoral Election"), []byte("Mayoral Election"), []byte("0"), []byte("200000")})
// }

// Cannot test campaign due to lack of support for mock certificates.
