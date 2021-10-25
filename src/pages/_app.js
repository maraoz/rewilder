import React from "react";
import { useDisclosure } from "@chakra-ui/react";
import { DAppProvider } from "@usedapp/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";

import config from "../config.js";
import { addressFor } from "../lib/addresses";
import ConnectWalletModal from "../components/ConnectWalletModal";
import WalletModalContext from "../lib/walletModalContext";

// css
import '../../public/assets/css/airbnb-font.css';
import '../../public/assets/css/bootstrap.min.css';
import '../../public/assets/css/main.css';
import '@fortawesome/fontawesome-svg-core/styles.css'

import { config as fontawesomeConfig } from '@fortawesome/fontawesome-svg-core'
fontawesomeConfig.autoAddCss = false

// required for dev networks
config.DAppProviderConfig.multicallAddresses[config.chainId] = addressFor("Multicall")

export const queryClient = new QueryClient();


const MyApp = ({ Component, pageProps }) => {

  const { onOpen, isOpen, onClose } = useDisclosure();
  const modalComponent = <ConnectWalletModal onOpen={onOpen} isOpen={isOpen} onClose={onClose} ></ConnectWalletModal>;

  return (
    <DAppProvider config={config.DAppProviderConfig}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.reactQueryState}>
          <WalletModalContext.Provider value={{ modalComponent, onOpen, isOpen, onClose }}>
            <Component {...pageProps} />
          </WalletModalContext.Provider>
        </Hydrate>
      </QueryClientProvider>
    </DAppProvider>
  );
};

export default MyApp;
