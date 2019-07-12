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

// Tests QueryAccount
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
	got := returnInvoke(t, stub, [][]byte{[]byte("QueryAccountsByID"), []byte("kelvinfan")})
	if string(got.GetPayload()) != "true" {
		t.Errorf("Account: kelvinfan should exist. Instead, got not exist.")
	}
}
