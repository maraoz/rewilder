import { Box, Button, Divider, Heading, Input, Text } from "@chakra-ui/react";
import { ChainId, useEthers, useSendTransaction } from "@usedapp/core";
import { ethers, providers, utils } from "ethers";
import React, { useReducer } from "react";
import { Greeter as LOCAL_CONTRACT_ADDRESS } from "../artifacts/contracts/contractAddress";
import Greeter from "../artifacts/contracts/Greeter.sol/Greeter.json";
import Layout from "../components/layout/Layout";

console.log("LOCAL_CONTRACT_ADDRESS", LOCAL_CONTRACT_ADDRESS);

/**
 * Constants & Helpers
 */

const localProvider = new providers.StaticJsonRpcProvider(
  "http://localhost:8545"
);

const ROPSTEN_CONTRACT_ADDRESS = "0x6b61a52b1EA15f4b8dB186126e980208E1E18864";

/**
 * Component
 */
const initialState = {
  greeting: "",
  inputValue: "",
  isLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    // Track the greeting from the blockchain
    case "SET_GREETING":
      return {
        ...state,
        greeting: action.greeting,
      };
    case "SET_INPUT_VALUE":
      return {
        ...state,
        inputValue: action.inputValue,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading,
      };
    default:
      throw new Error();
  }
}

function HomeIndex() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { account, chainId, library } = useEthers();

  const isLocalChain =
    chainId === ChainId.Localhost || chainId === ChainId.Hardhat;

  const CONTRACT_ADDRESS =
    chainId === ChainId.Ropsten
      ? ROPSTEN_CONTRACT_ADDRESS
      : LOCAL_CONTRACT_ADDRESS;

  // Use the localProvider as the signer to send ETH to our wallet
  const { sendTransaction } = useSendTransaction({
    signer: localProvider.getSigner(),
  });

  // call the smart contract, read the current greeting value
  async function fetchContractGreeting() {
    if (library) {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Greeter.abi,
        library
      );
      try {
        const data = await contract.greet();
        dispatch({ type: "SET_GREETING", greeting: data });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log("Error: ", err);
      }
    }
  }

  // call the smart contract, send an update
  async function setContractGreeting() {
    if (!state.inputValue) return;
    if (library) {
      dispatch({
        type: "SET_LOADING",
        isLoading: true,
      });
      const signer = library.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Greeter.abi,
        signer
      );
      const transaction = await contract.setGreeting(state.inputValue);
      await transaction.wait();
      fetchContractGreeting();
      dispatch({
        type: "SET_LOADING",
        isLoading: false,
      });
    }
  }

  function sendFunds() {
    sendTransaction({
      to: account,
      value: utils.parseEther("0.1"),
    });
  }

  return (
    <Layout>
      <Text mt="8" fontSize="md">
        This page only works on the ROPSTEN Testnet or on a Local Chain.
      </Text>
      <Box maxWidth="container.sm" p="8" mt="8" bg="gray.100">
        <Text fontSize="xl">Contract Address: {CONTRACT_ADDRESS}</Text>
        <Divider my="8" borderColor="gray.400" />
        <Box>
          <Text fontSize="lg">Greeting: {state.greeting}</Text>
          <Button mt="2" colorScheme="teal" onClick={fetchContractGreeting}>
            Fetch Greeting
          </Button>
        </Box>
        <Divider my="8" borderColor="gray.400" />
        <Box>
          <Input
            bg="white"
            type="text"
            placeholder="Enter a Greeting"
            onChange={(e) => {
              dispatch({
                type: "SET_INPUT_VALUE",
                inputValue: e.target.value,
              });
            }}
          />
          <Button
            mt="2"
            colorScheme="teal"
            isLoading={state.isLoading}
            onClick={setContractGreeting}
          >
            Set Greeting
          </Button>
        </Box>
        <Divider my="8" borderColor="gray.400" />
        <Text mb="4">This button only works on a Local Chain.</Text>
        <Button
          colorScheme="teal"
          onClick={sendFunds}
          isDisabled={!isLocalChain}
        >
          Send Funds From Local Hardhat Chain
        </Button>
      </Box>
    </Layout>
  );
}

export default HomeIndex;