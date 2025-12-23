"use client";

import { PropsWithChildren } from "react";
import QueryProvider from "./query-client-provider";
import WalletProvider from "./wallet-provider";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <WalletProvider>{children}</WalletProvider>
    </QueryProvider>
  );
}
