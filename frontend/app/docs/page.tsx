export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900">AURA Platform Blueprint</h1>
      <p className="text-lg text-slate-600">
        This documentation hub captures the personas, workflows, and technology stack underpinning the AURA
        autonomous upcycling network. The current build ships with a live FastAPI backend integration that powers the
        dashboards, marketplaces, and wallet-driven tokenization flows.
      </p>
      <div className="space-y-4 text-sm text-slate-600">
        <p>
          Refer to the repository&#39;s <code>docs/</code> directory for deeper architecture notes, agent design
          briefs, and integration guides. Connect the frontend to live APIs by updating the data fetching hooks under
          <code>lib/</code> to call the backend BFF or agent gateways.
        </p>
        <div className="space-y-2">
          <p>
            Wallet connectivity now uses the official Aptos Wallet Adapter. The provider lives in
            <code>providers/wallet-provider.tsx</code> and supplies the <code>useWallet</code> hook from
            <code>@aptos-labs/wallet-adapter-react</code> across the app. Tokenization actions sign an on-chain
            transaction and relay the resulting hash back to the backend for reconciliation.
          </p>
          <p>
            Configure the integration through environment variables prefixed with <code>NEXT_PUBLIC_APTOS_*</code>:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code>NEXT_PUBLIC_APTOS_NETWORK</code> — selects <code>mainnet</code>, <code>testnet</code>,
              <code>devnet</code>, <code>localnet</code>, or defaults to testnet.
            </li>
            <li>
              <code>NEXT_PUBLIC_APTOS_CONNECT_DAPP_ID</code> plus optional branding fields (name, image URI) wire the
              Petra web experience via Aptos Connect.
            </li>
            <li>
              <code>NEXT_PUBLIC_APTOS_CONNECT_BACKEND_BASE_URL</code> and
              <code>NEXT_PUBLIC_APTOS_CONNECT_FRONTEND_BASE_URL</code> override the default Petra endpoints.
            </li>
            <li>
              <code>NEXT_PUBLIC_APTOS_FULLNODE_URL</code> and <code>NEXT_PUBLIC_APTOS_INDEXER_URL</code> set custom RPC
              endpoints when building against self-hosted infrastructure.
            </li>
            <li>
              <code>NEXT_PUBLIC_AURA_MODULE_ADDRESS</code> provides the on-chain module identifier used when invoking
              tokenization Move functions.
            </li>
            <li>
              <code>NEXT_PUBLIC_API_BASE_URL</code> points the frontend to the FastAPI backend (defaults to
              <code>http://localhost:8000</code>).
            </li>
          </ul>
          <p>
            Aptos Connect support is registered automatically; install compatible browser wallets (Petra, Martian,
            Fewcha, Rise, etc.) to surface extension-based options in the selector.
          </p>
        </div>
        <p>
          To update the styling system, extend the Tailwind theme inside <code>tailwind.config.ts</code> and adjust
          component tokens under <code>components/ui/</code>.
        </p>
      </div>
    </div>
  );
}
