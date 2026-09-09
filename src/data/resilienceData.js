// Proactive Resilience Planner Data & Structural Weakness Analysis for North Eastern Region (NER)
// Under MDoNER / North Eastern Council (NEC)

export const STRUCTURAL_VULNERABILITIES = [
  {
    id: "vuln-sonapur-corridor",
    title: "Single Mountain Highway Dependency at NH-6 Sonapur Pass",
    severity: "Critical Lifeline Risk",
    severityLevel: "high",
    category: "Mountain Chokepoint Vulnerability",
    currentFinding: "86% of road-based freight to Tripura, Mizoram, and Southern Assam passes through a single 2.4km landslide-prone sector at Sonapur Tunnel in Meghalaya.",
    affectedProducts: [
      "Cryogenic Liquid Medical Oxygen (LMO) & Cylinders",
      "High-Altitude POL Fuel & Military-Grade Diesel",
      "PDS Essential Foodgrains (FCI Fortified Rice & Wheat)"
    ],
    annualRevenueExposedCr: 182.0,
    recommendation: "Pre-position Border Roads Organisation (BRO) quick-launch Bailey bridges and establish intermodal rail-waterway failover via NFR Lumding and IWAI Pandu port.",
    capexInvestmentCr: 2.4,
    avoidedDisruptionLossCr: 16.8,
    netBenefitCr: 14.4,
    resilienceGain: 9,
    implementationTimeWeeks: 4,
    status: "Priority Requisition — MDoNER Approved",
  },
  {
    id: "vuln-siliguri-neck",
    title: "Siliguri 'Chicken's Neck' Continental Transit Chokehold",
    severity: "High Strategic Risk",
    severityLevel: "high",
    category: "Gateway Single Point of Failure",
    currentFinding: "All mainland rail and highway logistics funnel through the 22km Siliguri Corridor, with freight queues extending up to 36 hours during peak monsoon floods.",
    affectedProducts: ["All 8 North Eastern State Supply Lines"],
    annualRevenueExposedCr: 110.0,
    recommendation: "Accelerate Jogighopa Multi-Modal Logistics Park (MMLP) river-rail transshipment and establish Indo-Bangladesh protocol transit clearance through Dawki/Tamabil.",
    capexInvestmentCr: 1.6,
    avoidedDisruptionLossCr: 9.4,
    netBenefitCr: 7.8,
    resilienceGain: 7,
    implementationTimeWeeks: 6,
    status: "Inter-Ministerial Review",
  },
  {
    id: "vuln-cryo-oxygen-buffer",
    title: "Thin Cryogenic Medical Oxygen Buffer in Mountain District Hospitals",
    severity: "Severe Healthcare Vulnerability",
    severityLevel: "medium",
    category: "Critical Life-Support Buffer",
    currentFinding: "District medical colleges in Agartala, Aizawl, and Kohima maintain an average of only 3.8 days of cryogenic liquid oxygen reserves during normal operation.",
    affectedProducts: ["Cryogenic Liquid Medical Oxygen (LMO) & Cylinders", "Cold-Chain Emergency Vaccines"],
    annualRevenueExposedCr: 74.0,
    recommendation: "Deploy decentralized Pressure Swing Adsorption (PSA) oxygen generator plants and 30-day cryogenic storage tanks at state capital depots.",
    capexInvestmentCr: 0.95,
    avoidedDisruptionLossCr: 6.2,
    netBenefitCr: 5.25,
    resilienceGain: 6,
    implementationTimeWeeks: 3,
    status: "Approved for Emergency Funding",
  },
];

export const RADAR_PROJECTIONS = [
  { dimension: "All-Weather Route Diversity", current: 68, projected: 88, fullMark: 100 },
  { dimension: "High-Altitude Stockpile Autonomy", current: 76, projected: 92, fullMark: 100 },
  { dimension: "Medical Cryogenic Reserves", current: 71, projected: 94, fullMark: 100 },
  { dimension: "Multimodal Failover Readiness", current: 85, projected: 97, fullMark: 100 },
  { dimension: "Disaster Recovery Velocity", current: 92, projected: 99, fullMark: 100 },
  { dimension: "Terrain & Monsoon Adaptability", current: 74, projected: 90, fullMark: 100 },
];
