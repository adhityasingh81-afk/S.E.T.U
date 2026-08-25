# NEXUS: Self-Healing Autonomous Supply Chain Platform

An enterprise AI-driven self-healing supply chain simulation and decision-intelligence platform built for high-tech electronics manufacturing.

---

## 🚀 Quick Start Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (included with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Local Development Server
```bash
npm run dev
```

The application will be accessible at:
👉 **http://localhost:5173/**

---

## 🛠️ Tech Stack
- **Core**: React 18, Vite 5
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer, Custom Glassmorphism UI
- **Icons**: Lucide React
- **Data Visualizations**: Recharts, SVG Topological Network Graphs

---

## 📂 Project Structure
```
HACKAVENGERS_2.0/
├── src/
│   ├── components/
│   │   ├── auth/                 # Multi-user authentication & persona switcher
│   │   ├── command-center/       # Global operations dashboard & live crisis metrics
│   │   ├── common/               # Background animations & reusable widgets
│   │   ├── counterfactual/       # ROI & Counterfactual "What-If" engine
│   │   ├── digital-twin/         # Topological network graph & node inspect drawer
│   │   ├── executive-report/     # Board-ready exportable crisis brief modal
│   │   ├── fracture-mode/        # Ripple cascade failure simulator
│   │   ├── layout/               # Header & Sidebar navigation
│   │   ├── negotiation-room/     # Autonomous AI supplier bargaining room & MOU generator
│   │   ├── recovery-cockpit/     # Pareto multi-agent recovery strategy optimizer
│   │   └── resilience-planner/   # 6-dimension resilience radar & budget allocation
│   ├── data/                     # Scenarios, users, network nodes, and mock datasets
│   ├── engine/                   # Ripple simulation, resilience calculator, recovery optimizer
│   ├── App.jsx                   # Root application state & tab router
│   ├── index.css                 # Design system tokens & Tailwind imports
│   └── main.jsx                  # React DOM entry point & error boundary
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## ✨ Key Features & Capabilities
1. **Interactive Digital Twin**: Visualizes multi-tier supply chain dependencies across suppliers, assembly mega-hubs, transit corridors, and enterprise customers.
2. **Fracture Mode (Ripple Cascade Simulator)**: Simulates real-time buffer exhaustion (e.g. TSMC 40% seismic cut causing 9-day runway at Chennai Hub) and calculates financial revenue at risk.
3. **Recovery Cockpit**: Generates 3 Pareto-optimal recovery pathways (Cost-First, Speed-First, Resilience-First) with dynamic slider weight tuning and Explainable AI (XAI) decision rationale.
4. **Autonomous AI Negotiation Room**: Multi-round automated concession bargaining with secondary suppliers and instant Memorandum of Understanding (MOU) generation.
5. **Counterfactual & ROI Comparison**: Quantifies the net business value and payback period of proactive intervention (+₹17.9 Cr revenue protected) vs. inaction.
