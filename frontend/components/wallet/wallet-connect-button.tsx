"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@/providers/wallet-provider";
import { ChevronDownIcon, PowerIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

function shorten(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletConnectButton() {
  const { connect, disconnect, wallets, account, connected } = useWallet();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | undefined>();
  const [isConnecting, setConnecting] = useState(false);

  const availableWallets = useMemo(() => wallets, [wallets]);

  const handleConnect = async () => {
    try {
      const walletName = selectedWallet ?? availableWallets[0]?.name;
      if (!walletName) {
        return;
      }
      setConnecting(true);
      await connect(walletName);
      setMenuOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet", error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } finally {
      setMenuOpen(false);
    }
  };

  if (availableWallets.length === 0) {
    return (
      <button
        type="button"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm"
        disabled
      >
        No wallet detected
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
          connected ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-600"
        )}
      >
        {connected && account?.address
          ? shorten(account.address.toString())
          : "Connect Wallet"}
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {isMenuOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="space-y-2 text-sm text-slate-600">
            {!connected ? (
              <>
                <label htmlFor="wallet-select" className="block text-xs uppercase tracking-wide text-slate-400">
                  Select wallet
                </label>
                <select
                  id="wallet-select"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none"
                  value={selectedWallet ?? availableWallets[0]?.name}
                  onChange={(event) => setSelectedWallet(event.target.value)}
                >
                  {availableWallets.map((wallet) => (
                    <option key={wallet.name} value={wallet.name}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isConnecting ? "Connecting…" : "Connect"}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">Connected wallet</p>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                  <p className="text-sm font-semibold">
                    {account?.address ? shorten(account.address.toString()) : "Unknown"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-600"
                >
                  <PowerIcon className="h-4 w-4" aria-hidden="true" />
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
