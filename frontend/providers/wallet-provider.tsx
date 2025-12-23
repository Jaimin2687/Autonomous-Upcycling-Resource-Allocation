"use client";

import { PropsWithChildren, useEffect, useMemo } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { DappConfig } from "@aptos-labs/wallet-adapter-core";
import { Network } from "@aptos-labs/ts-sdk";
import type { AptosConnectWalletConfig } from "@aptos-connect/wallet-adapter-plugin";
import { registerAptosConnect } from "@aptos-connect/wallet-adapter-plugin";

export { useWallet } from "@aptos-labs/wallet-adapter-react";

function resolveNetwork(): Network {
  const value = process.env.NEXT_PUBLIC_APTOS_NETWORK?.toLowerCase();
  switch (value) {
    case "mainnet":
      return Network.MAINNET;
    case "devnet":
      return Network.DEVNET;
    case "localnet":
      return Network.LOCAL;
    case "custom":
      return Network.CUSTOM;
    default:
      return Network.TESTNET;
  }
}

function buildAptosConnectConfig(network: Network): {
  dappConfig: DappConfig;
  registrationConfig: AptosConnectWalletConfig;
} {
  const backendBaseURL = process.env.NEXT_PUBLIC_APTOS_CONNECT_BACKEND_BASE_URL;
  const frontendBaseURL = process.env.NEXT_PUBLIC_APTOS_CONNECT_FRONTEND_BASE_URL;
  const dappImageURI = process.env.NEXT_PUBLIC_APTOS_CONNECT_DAPP_IMAGE_URI;
  const dappName = process.env.NEXT_PUBLIC_APTOS_CONNECT_DAPP_NAME;
  const dappId = process.env.NEXT_PUBLIC_APTOS_CONNECT_DAPP_ID;
  const preferredWalletName = process.env.NEXT_PUBLIC_APTOS_CONNECT_PREFERRED_WALLET;
  const fullnode = process.env.NEXT_PUBLIC_APTOS_FULLNODE_URL;
  const indexer = process.env.NEXT_PUBLIC_APTOS_INDEXER_URL;

  const aptosConnect: AptosConnectWalletConfig = {
    network,
  };

  if (backendBaseURL) {
    aptosConnect.backendBaseURL = backendBaseURL;
  }
  if (frontendBaseURL) {
    aptosConnect.frontendBaseURL = frontendBaseURL;
  }
  if (dappImageURI) {
    aptosConnect.dappImageURI = dappImageURI;
  }
  if (dappName) {
    aptosConnect.dappName = dappName;
  }
  if (preferredWalletName) {
    aptosConnect.preferredWalletName = preferredWalletName;
  }
  if (fullnode || indexer) {
    aptosConnect.aptosClientConfig = {
      ...(fullnode ? { fullnode } : {}),
      ...(indexer ? { indexer } : {}),
    };
  }

  const dappConfig: DappConfig = {
    network,
    aptosConnect: { ...aptosConnect },
  };

  if (dappId) {
    dappConfig.aptosConnectDappId = dappId;
    aptosConnect.dappId = dappId;
  }

  return {
    dappConfig,
    registrationConfig: aptosConnect,
  };
}

export default function WalletProvider({ children }: PropsWithChildren) {
  const network = useMemo(resolveNetwork, []);

  const { dappConfig, registrationConfig } = useMemo(
    () => buildAptosConnectConfig(network),
    [network]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    registerAptosConnect(registrationConfig);
  }, [registrationConfig]);

  return (
    <AptosWalletAdapterProvider autoConnect dappConfig={dappConfig}>
      {children}
    </AptosWalletAdapterProvider>
  );
}

