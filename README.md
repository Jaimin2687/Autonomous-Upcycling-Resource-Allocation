# AURA Platform

_Autonomous Upcycling & Resource Allocation_

AURA is a full-stack platform enabling autonomous negotiation, verified tokenization, and settlement of waste recycling transactions on the Aptos blockchain. Waste producers and recyclers interact through an AI-powered marketplace, where agent services autonomously negotiate terms, verify material authenticity, and orchestrate logistics—all backed by immutable on-chain certificates.

**Status:** Functional vertical slice with interactive dashboards, live agent negotiation, wallet-driven tokenization, and end-to-end backend integration. Production readiness requires security hardening, compliance review, and scalability optimization.

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Aptos](https://aptoslabs.com/) - Layer 1 blockchain
- [TanStack Query](https://tanstack.com/query) - Data synchronization
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [SQLModel](https://sqlmodel.tiangolo.com/) - SQL databases with Python

---

---

## 🏗️ Architecture Overview

The platform comprises four integrated layers working together to automate waste recycling transactions:

```
┌────────────────────────────────────────────────────────────────┐
│                  EXPERIENCE LAYER (Frontend)                   │
│  Next.js 14 App Router | Aptos Wallet Adapter | TanStack Query│
│  Mission Control • Marketplace • Producer Console • Analytics  │
└────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌────────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Backend Services)              │
│           FastAPI REST API | SQLModel + SQLite DB              │
│  Producers • Lots • Negotiations • Verifications • Tokenization│
└────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌────────────────────────────────────────────────────────────────┐
│               AGENT LAYER (Autonomous Services)                │
│  Producer Agents | Recycler Agents | Compliance Agents         │
│  Negotiation Policies • Price Discovery • Validation Workflows │
└────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌────────────────────────────────────────────────────────────────┐
│            ON-CHAIN LAYER (Aptos Blockchain)                   │
│  Move Smart Contracts | Lot Tokenization | Certification NFTs  │
│  Wallet Integration • Transaction Signing • Immutable Records  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
aura/
├── frontend/                  # Next.js 14 web application
│   ├── app/                   # App Router pages & layouts
│   │   ├── app/               # Dashboard routes (mission control, marketplace, etc.)
│   │   ├── docs/              # Documentation page
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── charts/            # Data visualization (Recharts)
│   │   ├── layout/            # Navigation, headers, footers
│   │   ├── maps/              # Mapbox logistics visualization
│   │   ├── ui/                # Reusable UI components
│   │   └── wallet/            # Wallet connect button
│   ├── hooks/                 # TanStack Query hooks for data fetching
│   ├── lib/                   # API client, utilities, type definitions
│   ├── providers/             # React context providers (wallet, query client)
│   └── .env.example           # Environment variable template
│
├── backend/                   # FastAPI REST service
│   ├── app/
│   │   ├── main.py            # FastAPI app & route definitions
│   │   ├── models.py          # Pydantic request/response schemas
│   │   ├── db_models.py       # SQLModel database entities
│   │   ├── crud.py            # Database CRUD operations
│   │   ├── seed.py            # Initial data loader
│   │   ├── db.py              # Database session management
│   │   └── services/          # Business logic services
│   │       ├── aptos.py       # Aptos blockchain integration
│   │       └── agent_matcher.py # Agent matchmaking logic
│   ├── data/                  # Seed data (JSON files, SQLite DB)
│   ├── tests/                 # Unit & integration tests
│   └── requirements.txt       # Python dependencies
│
├── agents/                    # Autonomous agent services
│   ├── aura_agents/
│   │   ├── base.py            # Base agent abstract class
│   │   ├── client.py          # Backend HTTP client
│   │   ├── producer.py        # Producer agent (lot negotiation)
│   │   ├── recycler.py        # Recycler agent (strategy execution)
│   │   ├── compliance.py      # Compliance/verification agent
│   │   ├── policies.py        # Negotiation policy algorithms
│   │   ├── config.py          # Agent configuration loader
│   │   └── runner.py          # Agent orchestration
│   ├── main.py                # CLI entrypoint (Typer)
│   ├── tests/                 # Unit tests
│   └── agent-settings.sample.yaml # Configuration template
│
├── blockchain/                # Aptos Move smart contracts
│   ├── sources/
│   │   ├── waste_lot.move             # Lot NFT tokenization
│   │   ├── certification.move         # Recycler certification
│   │   ├── escrow_settlement.move     # Escrowed settlements
│   │   ├── roles.move                 # Role-based access control
│   │   └── oracle_interface.move      # External oracle integration
│   ├── Move.toml              # Move package manifest
│   └── build/                 # Compiled Move bytecode
│
├── infrastructure/            # IaC (Terraform/Terragrunt)
│   ├── terraform/modules/     # Reusable infrastructure modules
│   ├── live/                  # Environment configs (local, staging, prod)
│   └── terragrunt.hcl         # Root configuration
│
├── .github/workflows/         # CI/CD pipelines
│   └── ci.yml                 # GitHub Actions (test, lint, build)
│
└── docs/                      # Additional documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** (for frontend)
- **Python** 3.9+ (for backend & agents)
- **Aptos CLI** (optional, for blockchain development)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/aura.git
cd aura
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional)
cp .env.example .env  # Edit if needed

# Run backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend starts at **http://localhost:8000** with:
- Auto-generated seed data (producers, lots, agents)
- Interactive API docs at **/docs**
- Health check at **/health**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (use legacy-peer-deps for Aptos packages)
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings (see Configuration section)

# Run development server
npm run dev
```

Frontend starts at **http://localhost:3000** with:
- Landing page at **/**
- Mission Control at **/app**
- Marketplace at **/app/marketplace**
- Producer Console at **/app/producer**

### 4. Agents Setup (Optional)

```bash
cd agents

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure agents (optional)
cp agent-settings.sample.yaml agent-settings.yaml

# Start agent service
python main.py start
```

Agents poll the backend and execute:
- Autonomous negotiation loops
- Price discovery
- Verification workflows

---

## 💡 Core Features

### 1. **Mission Control Dashboard** (`/app`)

Real-time operational intelligence for the entire marketplace:

- **KPIs:** Open interest, lot count, negotiation metrics, settlement velocity
- **Live Order Book:** Active lots sorted by priority with status indicators
- **Negotiation Activity:** Real-time agent activity feed
- **Compliance Queue:** Pending verifications requiring attention
- **Timeline:** Recent system events and milestones
- **Run Matchmaking:** Trigger agent negotiation manually

### 2. **Marketplace Explorer** (`/app/marketplace`)

Live trading floor for waste lots:

- **Order Book:** Aggregated verified lots with price floors and quantities
- **Market Depth:** Inventory visualization by lifecycle stage
- **Spread Analytics:** Bid-ask spread trends and samples
- **AI Recommendations:** Agent-generated trading suggestions
- **Event Stream:** Real-time updates from negotiations and tokenization

### 3. **Producer Console** (`/app/producer`)

Waste producer workflow management:

- **Producer Selection:** Switch between registered producer accounts
- **Lot Pipeline:** View all lots with status, quantity, and pricing
- **Verification:** Submit lots for AI + manual verification
- **Tokenization:** Connect wallet and mint on-chain certificates
- **AI Suggestions:** Agent-generated optimization recommendations
- **Status Tracking:** Monitor lot progression through workflow

### 4. **Autonomous Negotiation**

AI-powered agent services:

- **Agent Matching:** Automatic pairing of producers and recyclers
- **Price Discovery:** Multi-round bidding with configurable strategies
- **Counter-Offers:** Iterative negotiation until agreement or timeout
- **Risk Assessment:** Automated compliance and quality checks
- **Settlement:** Finalized agreements recorded on-chain

### 5. **Aptos Wallet Integration**

Blockchain connectivity:

- **Multi-Wallet Support:** Petra, Martian, Rise, Fewcha, and more
- **Transaction Signing:** User approval for on-chain operations
- **Certificate Minting:** NFT creation with metadata
- **Balance Tracking:** Real-time wallet state monitoring
- **Network Selection:** Mainnet, Testnet, Devnet support

### 6. **RESTful Backend API**

Complete marketplace operations:

**Producers:**
- `POST /producers` – Register new producer
- `GET /producers` – List all producers
- `GET /producers/{id}` – Get producer details with lots

**Waste Lots:**
- `POST /waste-lots` – Register lot for sale
- `GET /waste-lots` – List all lots
- `GET /waste-lots/{id}` – Get lot details
- `POST /lots/{id}/verify` – Submit verification
- `POST /lots/{id}/tokenize` – Record token mint

**Marketplace:**
- `GET /marketplace/snapshot` – Complete market state
- `POST /marketplace/matchmaking` – Trigger agent matching

**Negotiations:**
- `GET /negotiations` – List all negotiations
- `GET /negotiations/{id}` – Get negotiation details
- `POST /negotiations/{id}/decide` – Submit agent decision

**Agents:**
- `GET /agents` – List active agents
- `POST /agents` – Register new agent

**Proofs:**
- `POST /upcycling-proofs` – Submit proof
- `GET /upcycling-proofs/{id}` – Get proof details
- `POST /upcycling-proofs/{id}/validate` – Validate proof

Full API documentation available at **http://localhost:8000/docs**

---

## 🔧 Configuration

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
# Backend API endpoint
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Aptos network configuration
NEXT_PUBLIC_APTOS_NETWORK=testnet

# Move module address for tokenization
NEXT_PUBLIC_AURA_MODULE_ADDRESS=0xa11ce

# Optional: Aptos Connect configuration
NEXT_PUBLIC_APTOS_CONNECT_DAPP_ID=your-dapp-id
NEXT_PUBLIC_APTOS_CONNECT_DAPP_NAME=AURA
NEXT_PUBLIC_APTOS_CONNECT_DAPP_IMAGE_URI=https://your-domain.com/logo.png

# Optional: Custom RPC endpoints
NEXT_PUBLIC_APTOS_FULLNODE_URL=https://fullnode.testnet.aptoslabs.com/v1
NEXT_PUBLIC_APTOS_INDEXER_URL=https://indexer.testnet.aptoslabs.com/v1/graphql

# Optional: Mapbox for logistics visualization
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### Backend Environment Variables

Create `backend/.env`:

```bash
# Database connection (SQLite for development)
DATABASE_URL=sqlite+aiosqlite:///./data/aura.db

# Aptos network configuration
APTOS_NETWORK=testnet
APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com
```

### Agent Configuration

Create `agents/agent-settings.yaml`:

```yaml
backend:
  base_url: "http://localhost:8000"
  timeout: 30.0

agents:
  producer:
    enabled: true
    poll_interval: 5.0
  recycler:
    enabled: true
    poll_interval: 5.0
  compliance:
    enabled: true
    poll_interval: 10.0

logging:
  level: "INFO"
```

---

## 🧪 Testing & Validation

### Backend Tests

```bash
cd backend
source .venv/bin/activate
pytest -v
```

### Frontend Lint & Build

```bash
cd frontend
npm run lint
npm run build
```

### API Health Check

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

### Marketplace Data Test

```bash
curl http://localhost:8000/marketplace/snapshot | jq .
```

### End-to-End Manual Test

1. **Start backend** (Terminal 1):
   ```bash
   cd backend && uvicorn app.main:app --reload
   ```

2. **Start frontend** (Terminal 2):
   ```bash
   cd frontend && npm run dev
   ```

3. **Browse application**:
   - Open http://localhost:3000
   - Navigate to Mission Control (/app)
   - View marketplace data (/app/marketplace)
   - Connect wallet and test tokenization (/app/producer)

4. **Optional - Start agents** (Terminal 3):
   ```bash
   cd agents && python main.py start
   ```

---



**Version:** 0.1.0 (Functional Beta)  
**Last Updated:** December 23, 2025  
**Status:** Active Development
