# Product Requirements Document (PRD)

## Project: NEXUS / S.E.T.U. (Strategic Emergency Transport & Utility Resilience Platform)
- **Document Version:** 2.0 (Post-SOS & GIS Route Integration)
- **Classification:** Strategic Defense & Critical Infrastructure / Enterprise Supply Chain Intelligence
- **Status:** Active / Production-Ready
- **Primary Stakeholders:** Ministry of Development of North Eastern Region (MDoNER), National Disaster Management Authority (NDMA), North East Frontier Railway (NFR), Border Roads Organisation (BRO), Inland Waterways Authority of India (IWAI), Enterprise Chief Supply Chain Officers (CSCOs)

---

## 1. Executive Summary & Product Vision

### 1.1 Vision
To deliver India’s first **autonomous, self-healing supply chain and disaster crisis resilience platform**, capable of detecting critical corridor fractures, simulating cascading regional economic and humanitarian shocks, orchestrating multimodal rerouting in real-time, and guaranteeing **zero-connectivity SOS field emergency dispatch** from deep mountainous disaster cuts.

### 1.2 Mission
To safeguard national and enterprise lifelines across vulnerable geostrategic corridors (such as the 22-km Siliguri Corridor / "Chicken’s Neck", NH-6 Sonapur Pass, Lumding-Badarpur railway lines, and National Waterway 2) by combining:
1. **Macro-Level Intelligence:** Real-time digital twin monitoring, cascade ripple simulation, and multi-agent Pareto recovery optimization.
2. **Micro-Level Field Survivability:** Offline-first progressive web application (PWA) telemetry, emergency SMS gateway dispatch, and snapped GIS road-corridor routing.

---

## 2. Problem Statement & Strategic Context

### 2.1 The Vulnerability of Critical Corridors
- **Single Point of Failure (SPOF):** The Northeast region and frontier corridors depend on singular mountain passes and narrow transit corridors. A single landslide on NH-6 in East Jaintia Hills or a rail washout in the Dima Hasao hills cuts off fuel, cryogenic medical oxygen, and food rations to entire states (Meghalaya, Tripura, Mizoram, Barak Valley) within 48–72 hours.
- **The "Fog of Disaster":** Responders in mountain landslide zones, flash flood basins, or cellular dead zones cannot transmit incident severity or request specialized equipment (Bailey bridges, heavy excavators, cryogenic rail rakes) because existing systems fail without 4G/5G connectivity.
- **Siloed Multimodal Coordination:** Road (BRO), Rail (NFR), River (IWAI), and Air assets operate in isolated silos, resulting in uncoordinated relief and delayed failover activation.

---

## 3. Target User Personas & Use Cases

| Persona | Role | Key Needs & JTBD (Jobs-To-Be-Done) |
| :--- | :--- | :--- |
| **Col. Vikramaditya Rathore** | BRO Task Force Commander / Disaster Ground Ops | Needs to submit instant incident disruption telemetry from mountain dead zones without worrying about cellular connectivity; needs instant route clearance intelligence. |
| **Austin Robertson / S. K. Barua** | Chief Supply Chain Officer / NFR Logistics Director | Needs macro visibility across all 15 operational nodes; needs AI to calculate buffer depletion runway, revenue at risk, and optimal multimodal failover strategies. |
| **Dr. Ananya Roy** | NDMA Strategic Cell Director | Needs to receive instant field SOS alerts in the Bell Notification Center; needs exportable executive crisis briefs to allocate national contingency reserves. |

---

## 4. Product Architecture & System Topology

```
+-----------------------------------------------------------------------------------+
|                           NEXUS / S.E.T.U. PLATFORM                              |
+-----------------------------------------------------------------------------------+
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  MACRO COCKPIT &     │      │   GIS ROUTING &      │      │   OFFLINE SOS PWA    │
│  ANALYTICS ENGINE    │      │   DISRUPTION ENGINE  │      │   & FIELD TELEMETRY  │
├──────────────────────┤      ├──────────────────────┤      ├──────────────────────┤
│ • Digital Twin Graph │      │ • Leaflet OSM/Esri   │      │ • Service Worker Caching│
│ • Ripple Simulator   │      │ • Snapped Highway GIS│      │ • IndexedDB Offline Q│
│ • Pareto Optimizer   │      │ • Rail & River Ro-Ro │      │ • Background Sync API│
│ • AI Negotiation Room│      │ • Pass Failover Logic│      │ • Twilio Gateway SMS │
└──────────────────────┘      └──────────────────────┘      └──────────────────────┘
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         ▼
                 ┌──────────────────────────────────────────────┐
                 │ CENTRAL NOTIFICATION & DISPATCH HUB (BELL)   │
                 ├──────────────────────────────────────────────┤
                 │ • Real-time Red Beacon Alerts                │
                 │ • Unread Badge Count Across All Tabs         │
                 │ • Cross-Tab localStorage State Sync          │
                 │ • Inter-Agency SMS Dispatch Confirmation     │
                 └──────────────────────────────────────────────┘
```

---

## 5. Detailed Functional Requirements (FRDs)

### Module 1: Interactive Command Center & Digital Twin (FR-1)
- **FR-1.1:** Render interactive 3D geo-topology map displaying all 15 key logistics hubs (Guwahati, Sonapur Pass, Badarpur Siding, Pandu River Port, Agartala Depot, etc.).
- **FR-1.2:** Display live health telemetry: composite Resilience Score (0–100), Active Corridor Fracture status, Buffer Depletion Runway (days), and Value at Risk (₹ Cr).
- **FR-1.3:** Hub inspection drawer with stock capacity metrics, historical disruption frequency, and multimodal failover links.

### Module 2: Fracture Mode & Ripple Cascade Simulator (FR-2)
- **FR-2.1:** Simulate sudden corridor cuts (e.g., 75% capacity drop on NH-6 or rail washout).
- **FR-2.2:** Compute second-order and third-order shockwaves: downstream hospital oxygen stock depletion, POL tanker stranding, and industrial production stoppages.
- **FR-2.3:** Calculate blast radius and net financial loss trajectory over 15 to 90 days.

### Module 3: Autonomous Multi-Agent Recovery Cockpit (FR-3)
- **FR-3.1:** Generate 3 Pareto-optimal mitigation strategies:
  - *Strategy A (Speed-First):* Air-bridge + Ro-Ro express (18-hour restore, premium cost).
  - *Strategy B (Cost-First):* River barge flotilla via NW-2 Pandu (lowest cost, 48-hour transit).
  - *Strategy C (Balanced Tri-Modal):* Integrated Rail-Road-Water failover (+₹20.8 Cr net value preserved).
- **FR-3.2:** Dynamic weight slider allowing executives to balance Cost vs. Speed vs. Resilience.
- **FR-3.3:** Explainable AI (XAI) rationale providing step-by-step reasoning for chosen routes.

### Module 4: AI Supplier Negotiation Room (FR-4)
- **FR-4.1:** Autonomous agent bargaining between primary buyers and emergency logistics contractors.
- **FR-4.2:** Multi-turn concession trading (discount waivers, expedited dispatch SLAs, penalty caps).
- **FR-4.3:** 1-click legal Memorandum of Understanding (MOU) generation with cryptographic timestamp.

### Module 5: Interactive GIS Road & Rail Corridor Engine ("Find My Route") (FR-5)
- **FR-5.1:** Embedded Leaflet GIS map with real road geometry snapped to OpenStreetMap/Esri highway coordinates (NH-6, NH-27, and NFR railway lines).
- **FR-5.2:** Dynamic route inspection: origin/destination selector with automatic status tagging (`Nominal Route`, `Severed Corridor`, or `Active Multimodal Reroute`).
- **FR-5.3:** Color-coded status overlays: Emerald Green for nominal, Crimson Red with dashed animation for blocked passes, Amber for active detour.
- **FR-5.4:** Multi-provider tile layers with zero watermarks (OpenStreetMap, Esri Streets, Esri Topo, Esri Satellite).

### Module 6: Offline-First SOS Emergency Telemetry (`/sos`) (FR-6)
- **FR-6.1:** Dedicated minimal lightweight route at `/sos` loadable entirely offline via Service Worker (`public/sw.js`).
- **FR-6.2:** Form inputs:
  - Disruption nature: Preset quick-select buttons & custom text input.
  - Severity level: Critical, Severe, Moderate.
  - Strategic logistics node dropdown.
  - Auto-captured GPS location via Geolocation API with accuracy meter (±15m) and manual override.
  - Timestamp locked to Indian Standard Time (IST).
  - Optional field situational notes.
- **FR-6.3:** Zero-Connectivity Guarantee:
  - When offline, alert payload is saved into browser IndexedDB (`nexus-sos-db`, store `pending-sos`).
  - Automatic background sync when connectivity returns (Chrome `SyncManager` + iOS Safari `visibilitychange` & `pageshow` fallbacks).
  - Web Audio synthetic chime (587 Hz D5 -> 880 Hz A5) and device vibration pattern (`100ms-50ms-150ms`).
- **FR-6.4:** Clean light theme matching NEXUS Extej design system (`bg-[#f8fafc]`, crisp white cards, red emergency highlight rings).

### Module 7: Centralized Notification Center & Bell Icon Integration (FR-7)
- **FR-7.1:** Universal Bell icon in the top header with live unread badge counter (pulsing crimson badge).
- **FR-7.2:** Real-time routing: Dispatched and queued SOS field alerts immediately push into the Notification Center.
- **FR-7.3:** Notification item displays:
  - 🚨 SOS Beacon Icon & Calamity Title
  - Confirmation status badge (`GATEWAY CONFIRMED ✅` or `OFFLINE QUEUED ⏳`)
  - Twilio Emergency SMS Ref ID & Target Phone Number
  - Coordinates and timestamp
- **FR-7.4:** Interactive detail modal opening directly from the notification for instant dispatch inspection.
- **FR-7.5:** Inter-agency Message Inbox entry automatically acknowledging receipt from `"NDMA / MDoNER Strategic Cell"`.

---

## 6. Non-Functional Requirements (NFRs)

| Dimension | Specification | Verification Method |
| :--- | :--- | :--- |
| **Offline Reliability** | `/sos` route must load and function with 0kbps network; zero packet loss of filed alerts. | Simulated browser DevTools offline mode & IndexedDB inspection. |
| **Response Latency** | Initial page render under 1.2s; SOS submission visual feedback under 650ms. | Chrome Lighthouse audit & Web Vitals benchmarks. |
| **Build & Bundle Integrity** | Zero syntax errors, zero missing imports, zero dead-code warnings. | Vite production compiler (`npm run build`). |
| **Aesthetic Standard** | Crisp, state-of-the-art Extej light theme, high-contrast typography, zero generic color schemes. | Visual peer review against modern enterprise design systems. |
| **Cross-Platform Compatibility** | Full responsiveness across mobile smartphones (field responders), tablets, and desktop command walls. | Responsive viewport verification (320px to 4K). |

---

## 7. Data Models & API Specifications

### 7.1 SOS Telemetry Alert Payload (JSON)
```json
{
  "id": "sos-1788945600000-abc12",
  "disruptionType": "Mountain Landslide / Rockfall",
  "severity": "Critical",
  "coordinates": {
    "latitude": 25.1234,
    "longitude": 92.3456,
    "accuracy": 15
  },
  "nodeId": "wh-sonapur-pass",
  "nodeName": "NH-6 Sonapur Mountain Pass Chokepoint & Depot",
  "timestamp": 1788945600000,
  "note": "20+ POL tankers stranded near Sonapur tunnel entrance. Road cracked.",
  "queuedAt": 1788945600100,
  "status": "dispatched",
  "smsSid": "SM_NDMA_7894521"
}
```

### 7.2 Notification Center Event Schema
```typescript
interface CrisisNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'crisis' | 'negotiation' | 'recovery';
  unread: boolean;
  actionTab?: string;
  actionLabel?: string;
  isSos?: boolean;
  status?: 'dispatched' | 'queued';
  smsSid?: string;
  nodeName?: string;
  coordinates?: { latitude: number; longitude: number; accuracy: number };
}
```

---

## 8. Success Metrics & Key Performance Indicators (KPIs)

1. **Mean Time to Alert (MTTA):** Time from field incident detection to NDMA strategic cell receipt reduced from **4.2 hours to < 3 seconds** (or 0.5s after transient reconnection).
2. **Offline Loss Rate:** **0.00% alert data loss** in cellular blackouts due to persistent client-side IndexedDB caching.
3. **Failover Execution Speed:** Multi-modal reroute selection (Rail Ro-Ro vs. River Flotilla) calculated in **< 1.8 seconds**.
4. **Economic Value Protected:** Proven capability to preserve **+₹17.9 Cr to +₹20.8 Cr** per simulated crisis event.

---

## 9. Release Roadmap & Milestones

- **Phase 1 (Complete):** Core AI Simulation Engine, Fracture Mode, Pareto Recovery Cockpit, and AI Supplier Negotiation Room.
- **Phase 2 (Complete):** Dedicated `/sos` PWA, Service Worker offline caching, IndexedDB transaction queue, and SMS dispatch gateway.
- **Phase 3 (Complete):** Snapped Leaflet GIS Road/Rail Corridor Map with nominal and severed route inspection.
- **Phase 4 (Complete):** Full Extej Light Theme conversion and centralized Bell Notification Center integration.
- **Phase 5 (Future Horizon):** Direct satellite transceiver hardware integration (ISRO NavIC / IRNSS IoT beacon dongles) for zero-cellular deep wilderness tracking.
