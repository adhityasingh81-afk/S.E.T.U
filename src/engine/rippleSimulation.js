// Deterministic Ripple Effect & Disruption Simulation Engine for North Eastern Region (NER)
// Models cascading impacts across 8 North Eastern States from mountain corridor fractures
import { NODES, LOGISTICS_ROUTES, COMPANY_PROFILE } from '../data/auraSupplyChainData.js';

/**
 * Propagates a disruption through the multi-tier NER lifeline network
 * @param {string} affectedNodeId - ID of the disrupted corridor or depot
 * @param {number} severityPct - Severity percentage (0-100%)
 * @param {number} durationDays - Duration in days
 * @param {string} eventType - Type of event
 * @param {string} fractureType - Multi-dimensional fracture mode ('capacity' | 'lead-time' | 'cost' | 'quality' | 'blackout')
 * @param {Array<string>} activeContainmentIds - List of active containment intervention IDs
 */
export function simulateRippleEffect(
  affectedNodeId = 'wh-sonapur-pass', 
  severityPct = 75, 
  durationDays = 14, 
  eventType = "Mountain Landslide & Road Corridor Severance",
  fractureType = 'capacity',
  activeContainmentIds = []
) {
  const affectedNode = NODES.find(n => n.id === affectedNodeId) || NODES[0];
  
  // Normalize severity according to fracture type
  let effectiveSeverityPct = severityPct;
  if (fractureType === 'blackout') {
    effectiveSeverityPct = 100;
  } else if (fractureType === 'cost') {
    effectiveSeverityPct = Math.round(severityPct * 0.75);
  } else if (fractureType === 'quality') {
    effectiveSeverityPct = Math.round(severityPct * 0.85);
  } else if (fractureType === 'lead-time') {
    effectiveSeverityPct = Math.round(severityPct * 0.9);
  }

  const severityMultiplier = effectiveSeverityPct / 100;

  // ==========================================
  // 1. CRITICALITY AMPLIFIER ENGINE
  // ==========================================
  const isCriticalNode = affectedNode.criticality?.toLowerCase().includes('critical') || affectedNode.criticality?.toLowerCase().includes('ultra') || affectedNode.criticality?.toLowerCase().includes('flagship');
  const isHighNode = affectedNode.criticality?.toLowerCase().includes('high');
  const criticalityScore = isCriticalNode ? 98 : isHighNode ? 84 : affectedNode.type === 'factory' ? 90 : 62;

  // Backup Corridor Availability (0-100, where 100 = abundant backups, 0 = sole road link)
  const altCount = affectedNode.alternativeSuppliers?.length || (affectedNode.id === 'wh-sonapur-pass' ? 0 : 2);
  const backupScore = altCount === 0 ? 10 : altCount === 1 ? 30 : altCount === 2 ? 65 : 90;

  // Inventory Buffer Factor (0-100, lower days = worse buffer vulnerability)
  const bufferDays = affectedNode.inventoryBufferDays || affectedNode.inventoryRunwayDays || affectedNode.bufferDays || 14;
  const bufferScore = Math.min(100, Math.round((bufferDays / 40) * 100));

  // Geographic Isolation Factor (0-100)
  const isMountain = (affectedNode.altitudeMeters || 0) > 800 || affectedNode.region?.includes('Hills');
  const geoConcentrationScore = isMountain ? 92 : 60;

  // Network Centrality Factor (0-100)
  const directDependents = NODES.filter(n => n.dependencies && n.dependencies.includes(affectedNodeId));
  const centralityScore = Math.min(98, 50 + directDependents.length * 15);

  // Compute Network Amplification Multiplier (ranging from 1.1x up to 2.9x)
  const rawAmplifier = 1.0 + (criticalityScore / 100) * 0.7 + ((100 - backupScore) / 100) * 0.55 + ((100 - bufferScore) / 100) * 0.4 + (geoConcentrationScore / 100) * 0.25;
  const amplificationMultiplier = Math.round(rawAmplifier * 10) / 10;

  // ==========================================
  // 2. CONTAINMENT MITIGATION CALCULATIONS
  // ==========================================
  const containmentSavingsMap = {
    'activate-backup': 0.42,      // 42% risk reduction (e.g. NFR rail shuttle)
    'reserve-buffer': 0.24,       // 24% risk reduction (FCI granary release)
    'prioritize-sla': 0.18,       // 18% risk reduction (Green corridor hospital priority)
    'expedite-freight': 0.16,     // 16% risk reduction (Operation Setu tactical air bridge)
  };

  let totalContainmentReduction = 0;
  activeContainmentIds.forEach(id => {
    if (containmentSavingsMap[id]) {
      totalContainmentReduction += containmentSavingsMap[id];
    }
  });
  // Cap mitigation to maximum 82%
  totalContainmentReduction = Math.min(0.82, totalContainmentReduction);

  // ==========================================
  // 3. STEP-BY-STEP PROPAGATION METRICS
  // ==========================================
  const supplierCapacityBefore = 100;
  const supplierCapacityAfter = Math.max(0, Math.round(100 - effectiveSeverityPct));

  // Regional Hub Throughput Loss
  let affectedFactories = [];
  let factoryDropPct = 0;
  if (effectiveSeverityPct > 0) {
    if (affectedNode.type === "supplier") {
      affectedFactories = NODES.filter(n => n.type === "factory" && n.dependencies && n.dependencies.includes(affectedNodeId)).map(n => n.id);
      if (affectedFactories.length === 0) affectedFactories = ["fac-guwahati-hub"];
      factoryDropPct = Math.round(effectiveSeverityPct * 0.85);
    } else if (affectedNode.type === "factory") {
      factoryDropPct = effectiveSeverityPct;
      affectedFactories = [affectedNode.id];
    } else {
      factoryDropPct = Math.round(effectiveSeverityPct * 0.65);
      affectedFactories = ["fac-guwahati-hub"];
    }
  }

  const factoryProductionBefore = 100;
  const uncontainedFactoryProduction = effectiveSeverityPct > 0 ? Math.max(15, Math.round(100 - factoryDropPct)) : 100;
  const factoryProductionAfter = Math.round(uncontainedFactoryProduction + (100 - uncontainedFactoryProduction) * totalContainmentReduction * 0.7);

  // Stockpile Runway Depletion
  const baselineRunwayDays = 28;
  const uncontainedRunwayDays = Math.max(2, Math.round(baselineRunwayDays * (1 - severityMultiplier * 0.82)));
  const inventoryDepletionDays = Math.min(baselineRunwayDays, Math.round(uncontainedRunwayDays + (baselineRunwayDays - uncontainedRunwayDays) * totalContainmentReduction));

  // District Delivery Fulfillment
  const customerFulfillmentBefore = 98.4;
  const uncontainedCustomerFulfillment = effectiveSeverityPct > 0 ? Math.max(28, Math.round((customerFulfillmentBefore - (effectiveSeverityPct * 0.94)) * 10) / 10) : 98.4;
  const customerFulfillmentAfter = Math.round((uncontainedCustomerFulfillment + (customerFulfillmentBefore - uncontainedCustomerFulfillment) * totalContainmentReduction) * 10) / 10;

  // Economic Value-at-Risk (₹ Cr)
  const dailyBaseLossCr = (COMPANY_PROFILE.annualRevenueCr / 365) * severityMultiplier * (amplificationMultiplier * 0.4);
  const emergencyReliefCostsCr = (durationDays * 0.12) * severityMultiplier * (amplificationMultiplier * 0.35);
  const uncontainedTotalRiskCr = effectiveSeverityPct > 0 ? Math.round((dailyBaseLossCr * Math.min(durationDays, 22) + emergencyReliefCostsCr) * 10) / 10 : 0.0;

  const totalRevenueAtRiskCr = Math.round((uncontainedTotalRiskCr * (1 - totalContainmentReduction)) * 10) / 10;
  const capitalSavedCr = Math.round((uncontainedTotalRiskCr - totalRevenueAtRiskCr) * 10) / 10;

  // Recovery Velocity
  const unassistedRecoveryDays = effectiveSeverityPct > 0 ? Math.round(durationDays * 0.45 + 7) : 0;
  const nexusRecoveryDays = effectiveSeverityPct > 0 ? Math.round((unassistedRecoveryDays * (1 - totalContainmentReduction) * 0.22) * 10) / 10 : 0;
  const recoveryVelocityGainPct = unassistedRecoveryDays > 0 ? Math.round(((unassistedRecoveryDays - nexusRecoveryDays) / unassistedRecoveryDays) * 100) : 0;

  // ==========================================
  // 4. "WHAT BREAKS FIRST?" PREDICTIVE FAILURE SEQUENCE
  // ==========================================
  const whatBreaksFirst = [
    {
      order: 1,
      name: "Agartala Integrated Healthcare (Tripura)",
      nodeId: "cust-agartala-hub",
      type: "Cryogenic Medical O2 Depletion",
      estimatedDays: "2.2 Days",
      hours: 52,
      severity: "Critical Starvation",
      impact: "Hospital liquid oxygen tanks fall below critical 48-hour clinical threshold as road tankers are stranded.",
      statusColor: "rose"
    },
    {
      order: 2,
      name: "Aizawl Emergency Supplies Directorate (Mizoram)",
      nodeId: "cust-aizawl-capital",
      type: "High-Altitude POL Fuel Exhaustion",
      estimatedDays: "3.6 Days",
      hours: 86,
      severity: "Stockout Warning",
      impact: "Isolated district diesel generation buffers drop past redline; hill municipal water pumping threatened.",
      statusColor: "amber"
    },
    {
      order: 3,
      name: "Guwahati Central Logistics ICD (Assam)",
      nodeId: "fac-guwahati-hub",
      type: "Corridor Freight Yard Gridlock",
      estimatedDays: "5.4 Days",
      hours: 130,
      severity: "Terminal Backlog",
      impact: "Over 450 outbound relief trucks backed up along Guwahati-Shillong corridor; yard capacity breaches 98%.",
      statusColor: "rose"
    }
  ];

  // ==========================================
  // 5. BLAST RADIUS CLASSIFICATION
  // ==========================================
  const tier1Direct = [
    {
      id: affectedNode.id,
      name: affectedNode.name,
      type: affectedNode.type,
      location: affectedNode.location,
      impactType: "Origin Fracture Epicenter",
      impairedPct: `${effectiveSeverityPct}% Flow Severance`,
      runway: "0 Days (Direct Landslide / Blockage)",
      severity: "critical",
      dependencyPath: "Primary Epicenter"
    },
    {
      id: "cust-agartala-hub",
      name: "Agartala Integrated Healthcare (Tripura)",
      type: "customer",
      location: "Agartala, Tripura",
      impactType: "Direct Life-Line Severance",
      impairedPct: `-${100 - factoryProductionAfter}% Throughput`,
      runway: "2.2 Days Buffer Remaining",
      severity: "critical",
      dependencyPath: `${affectedNode.name} ➔ Agartala Hub`
    },
    {
      id: "cust-aizawl-capital",
      name: "Aizawl Emergency Supplies (Mizoram)",
      type: "customer",
      location: "Aizawl, Mizoram",
      impactType: "Mountain Road Access Cutoff",
      impairedPct: "-68% Inbound Flow",
      runway: "3.6 Days Buffer Remaining",
      severity: "warning",
      dependencyPath: `${affectedNode.name} ➔ Aizawl Depot`
    }
  ];

  const tier2Secondary = [
    {
      id: "fac-guwahati-hub",
      name: "Guwahati Central Multi-Modal ICD",
      type: "factory",
      location: "Guwahati, Assam",
      impactType: "Outbound Freight Gridlock",
      impairedPct: "-55% Dispatch Flow",
      runway: "5.4 Days Yard Capacity",
      severity: "warning",
      dependencyPath: "Guwahati ICD ➔ Sonapur Pass"
    },
    {
      id: "wh-shillong-hub",
      name: "Shillong Regional Cold-Chain Depot",
      type: "warehouse",
      location: "Shillong, Meghalaya",
      impactType: "Highland Transit Congestion",
      impairedPct: "-45% Transshipment",
      runway: "7.0 Days Stock Runway",
      severity: "moderate",
      dependencyPath: "Shillong Hub ➔ Sonapur Corridor"
    },
    {
      id: "wh-dima-hasao-depot",
      name: "Dima Hasao Hill Rail Depot",
      type: "warehouse",
      location: "Haflong, Assam",
      impactType: "Transshipment Load Spike",
      impairedPct: "+90% Diverted Load",
      runway: "8.5 Days Safety Stock",
      severity: "moderate",
      dependencyPath: "Guwahati ➔ Lumding-Badarpur"
    }
  ];

  const tier3Tertiary = [
    {
      id: "cust-imphal-valley",
      name: "Imphal Valley RIMS Hospital Network",
      type: "customer",
      location: "Imphal, Manipur",
      impactType: "Contagion Fuel & Pharma Strain",
      impairedPct: "₹50 Lakhs/day Risk",
      runway: "9.5 Days Buffer",
      severity: "warning",
      dependencyPath: "Dimapur Railhead ➔ Imphal"
    },
    {
      id: "cust-kohima-nagaland",
      name: "Kohima District Disaster Response",
      type: "customer",
      location: "Kohima, Nagaland",
      impactType: "Secondary Surcharge Impact",
      impairedPct: "₹30 Lakhs/day Risk",
      runway: "12.0 Days Runway",
      severity: "moderate",
      dependencyPath: "Dimapur ➔ Kohima"
    },
    {
      id: "cust-itanagar-arunachal",
      name: "Itanagar Lifeline Network",
      type: "customer",
      location: "Itanagar, Arunachal Pradesh",
      impactType: "Regional Transport Divergence",
      impairedPct: "Protected Priority",
      runway: "14.5 Days Runway",
      severity: "healthy",
      dependencyPath: "Tezpur ➔ Itanagar"
    }
  ];

  // ==========================================
  // 6. DETAILED LINKED-LIST CASCADE TIMELINE NODES
  // ==========================================
  const cascadeNodes = [
    {
      id: 'node-t0',
      timeLabel: '0h',
      timeframe: 'T+0h',
      step: 1,
      title: 'Corridor Fracture Inception',
      nodeName: affectedNode.name,
      stage: 'Epicenter Inception',
      status: 'critical',
      color: 'rose',
      metricName: fractureType === 'lead-time' ? 'Transit Time' : fractureType === 'cost' ? 'Freight Rate' : 'Corridor Flow',
      beforeVal: '100% Flow',
      afterVal: `${supplierCapacityAfter}% Flow`,
      badgeText: `${effectiveSeverityPct}% CORRIDOR CUT`,
      description: `${affectedNode.name} suffers sudden passage collapse due to ${eventType}.`,
      rootCause: `Heavy cloudburst triggers slope liquefaction and 180m debris flow across highway in ${affectedNode.location}.`,
      affectedComponents: ['Cryogenic Oxygen Convoys', 'POL Fuel Tankers', 'FCI Essential Grain Trucks'],
      mitigationAction: 'Immediate failover mobilization via NFR rail ro-ro and IWAI NW-2 river barges.'
    },
    {
      id: 'node-t18',
      timeLabel: '18h',
      timeframe: 'T+18h',
      step: 2,
      title: 'Hospital Oxygen Alert',
      nodeName: 'Agartala Integrated Healthcare (Tripura)',
      stage: 'Life-Line Throttling',
      status: 'warning',
      color: 'amber',
      metricName: 'Medical O2 Runway',
      beforeVal: '14 Days',
      afterVal: '2.2 Days',
      badgeText: '2.2d RUNWAY LEFT',
      description: 'Tripura and Mizoram medical centers project rapid depletion of cryogenic liquid oxygen.',
      rootCause: 'Cryogenic bulk tankers unable to traverse blocked mountain bypass.',
      affectedComponents: ['Liquid Medical Oxygen (LMO)', 'ICU Ventilator Manifolds'],
      mitigationAction: 'Deploy Operation Setu IAF C-130J air bridge from Borjhar Air Base.'
    },
    {
      id: 'node-t3d',
      timeLabel: '3d',
      timeframe: 'T+3d',
      step: 3,
      title: 'Hill Fuel Depletion',
      nodeName: 'Aizawl Emergency Supplies Directorate',
      stage: 'Regional Stockout Warning',
      status: 'warning',
      color: 'amber',
      metricName: 'POL Generator Fuel',
      beforeVal: `${baselineRunwayDays} Days`,
      afterVal: `${inventoryDepletionDays} Days`,
      badgeText: `${inventoryDepletionDays}d RUNWAY LEFT`,
      description: 'Mizoram capital buffer tanks breach emergency minimum operating reserve.',
      rootCause: 'Inbound tanker turnaround frozen; local depots rationing fuel for emergency municipal power.',
      affectedComponents: ['High-Altitude Diesel', 'Emergency Power Reserves'],
      mitigationAction: 'Clear MEA diplomatic transit via Bangladesh (Dawki-Tamabil route).'
    },
    {
      id: 'node-t7d',
      timeLabel: '7d',
      timeframe: 'T+7d',
      step: 4,
      title: 'Inter-State Economic Stress',
      nodeName: 'Guwahati Central Logistics ICD',
      stage: 'Regional Yard Congestion',
      status: 'critical',
      color: 'rose',
      metricName: 'Inter-State Fulfillment',
      beforeVal: `${customerFulfillmentBefore}%`,
      afterVal: `${customerFulfillmentAfter}%`,
      badgeText: `-${(customerFulfillmentBefore - customerFulfillmentAfter).toFixed(1)}% FULFILLMENT`,
      description: 'Regional dispatch fulfillment drops significantly as gridlock extends across Jaintia Hills.',
      rootCause: 'Highway queue reaches 450+ trucks; transshipment points at full container capacity.',
      affectedComponents: ['PDS Grain Rations', 'Pharmaceutical Freight Batches'],
      mitigationAction: 'BRO launches double-single Bailey bridge across Sonapur collapse.'
    },
    {
      id: 'node-t14d',
      timeLabel: '14d',
      timeframe: 'T+14d',
      step: 5,
      title: 'Regional Economic Exposure',
      nodeName: 'MDoNER Disaster Exchequor Exposure',
      stage: 'Cumulative Value-at-Risk',
      status: 'terminal-critical',
      color: 'red',
      isTerminalRed: true,
      metricName: 'Cumulative Value at Risk',
      beforeVal: '₹0.0 Cr',
      afterVal: `₹${totalRevenueAtRiskCr} Cr`,
      badgeText: `₹${totalRevenueAtRiskCr} Cr AT RISK`,
      description: `Unmitigated corridor severance produces ₹${totalRevenueAtRiskCr} Cr cumulative economic and relief loss across ${durationDays} days.`,
      rootCause: 'Loss of inter-state commerce, emergency spot air transport premiums, and perishable spoilage.',
      affectedComponents: ['Regional Economic Velocity', 'Emergency Relief Exchequor Funds'],
      mitigationAction: 'Execute NEXUS tri-modal recovery strategy to preserve ₹20.8+ Cr of value.'
    }
  ];

  // Node-by-node status mapping for map and twin views
  const simulatedNodes = NODES.map(node => {
    let nodeStatus = "operational";
    let healthPct = 100;
    let impactNote = "All-weather passage operational. Stockpile within healthy threshold.";

    if (effectiveSeverityPct > 0) {
      if (node.id === affectedNodeId) {
        nodeStatus = "disrupted";
        healthPct = supplierCapacityAfter;
        impactNote = `Direct corridor fracture: ${effectiveSeverityPct}% flow severance for ${durationDays} days.`;
      } else if (affectedFactories.includes(node.id)) {
        nodeStatus = "impaired";
        healthPct = factoryProductionAfter;
        impactNote = `Upstream corridor blockage throttling regional throughput to ${factoryProductionAfter}%.`;
      } else if (node.dependencies && (node.dependencies.includes(affectedNodeId) || node.dependencies.some(d => affectedFactories.includes(d)))) {
        nodeStatus = "impaired";
        healthPct = Math.max(38, Math.round(100 - effectiveSeverityPct * 0.72));
        impactNote = `Downstream buffer depletion. Autonomy reduced to ${inventoryDepletionDays} days.`;
      } else if (node.type === "customer" && node.dependencies && node.dependencies.includes(affectedNodeId)) {
        nodeStatus = "at-risk";
        healthPct = customerFulfillmentAfter;
        impactNote = `Lifeline road access cut off. Supply fulfillment dropped to ${customerFulfillmentAfter}%.`;
      }
    }

    return {
      ...node,
      simulatedStatus: nodeStatus,
      healthPct,
      impactNote,
    };
  });

  const simulatedRoutes = LOGISTICS_ROUTES.map(route => {
    let routeStatus = "active";
    if (effectiveSeverityPct > 0) {
      if (route.origin === affectedNodeId || route.destination === affectedNodeId) {
        routeStatus = "congested";
      } else if (affectedFactories.includes(route.origin)) {
        routeStatus = "reduced-throughput";
      }
    }
    return {
      ...route,
      simulatedStatus: routeStatus,
    };
  });

  return {
    affectedNode,
    severityPct: effectiveSeverityPct,
    rawSeverityPct: severityPct,
    durationDays,
    eventType,
    fractureType,
    activeContainmentIds,
    amplification: {
      criticalityScore,
      backupScore,
      bufferScore,
      geoConcentrationScore,
      centralityScore,
      multiplier: amplificationMultiplier
    },
    metrics: {
      supplierCapacityBefore,
      supplierCapacityAfter,
      factoryProductionBefore,
      factoryProductionAfter,
      inventoryDepletionDays,
      baselineRunwayDays,
      customerFulfillmentBefore,
      customerFulfillmentAfter,
      totalRevenueAtRiskCr,
      uncontainedTotalRiskCr,
      capitalSavedCr,
      unassistedRecoveryDays,
      nexusRecoveryDays,
      recoveryVelocityGainPct,
      totalContainmentReductionPct: Math.round(totalContainmentReduction * 100)
    },
    whatBreaksFirst,
    blastRadius: {
      totalSitesAffected: tier1Direct.length + tier2Secondary.length + tier3Tertiary.length,
      tier1Direct,
      tier2Secondary,
      tier3Tertiary
    },
    cascadeTimeline: cascadeNodes,
    cascadeNodes: cascadeNodes,
    propagationTimeline: cascadeNodes,
    simulatedNodes,
    simulatedRoutes
  };
}
