// Deterministic Ripple Effect & Disruption Simulation Engine
import { NODES, LOGISTICS_ROUTES, COMPANY_PROFILE } from '../data/auraSupplyChainData';

/**
 * Propagates a disruption through the multi-tier supply network
 * @param {string} affectedNodeId - ID of the disrupted node
 * @param {number} severityPct - Severity percentage (0-100%)
 * @param {number} durationDays - Duration in days
 * @param {string} eventType - Type of event
 * @param {string} fractureType - Multi-dimensional fracture mode ('capacity' | 'lead-time' | 'cost' | 'quality' | 'blackout')
 * @param {Array<string>} activeContainmentIds - List of active containment intervention IDs
 */
export function simulateRippleEffect(
  affectedNodeId = 'sup-taiwan-semi', 
  severityPct = 40, 
  durationDays = 45, 
  eventType = "Supplier Capacity Cut / Geopolitical",
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
  // Supplier Criticality Factor (0-100)
  const isCriticalNode = affectedNode.criticality?.toLowerCase().includes('critical') || affectedNode.criticality?.toLowerCase().includes('flagship');
  const isHighNode = affectedNode.criticality?.toLowerCase().includes('high');
  const criticalityScore = isCriticalNode ? 96 : isHighNode ? 82 : affectedNode.type === 'factory' ? 90 : 58;

  // Backup Availability (0-100, where 100 = abundant backups, 0 = sole source)
  const altCount = affectedNode.alternativeSuppliers?.length || 0;
  const backupScore = altCount === 0 ? 12 : altCount === 1 ? 32 : altCount === 2 ? 68 : 92;

  // Inventory Buffer Factor (0-100, lower days = worse buffer vulnerability)
  const bufferDays = affectedNode.inventoryBufferDays || affectedNode.inventoryRunwayDays || affectedNode.bufferDays || 14;
  const bufferScore = Math.min(100, Math.round((bufferDays / 45) * 100));

  // Geographic Concentration Factor (0-100)
  const isEastAsia = affectedNode.region === 'East Asia';
  const geoConcentrationScore = isEastAsia ? 88 : affectedNode.region === 'Europe' ? 52 : 44;

  // Network Centrality Factor (0-100)
  const directDependents = NODES.filter(n => n.dependencies && n.dependencies.includes(affectedNodeId));
  const centralityScore = affectedNode.type === 'supplier' ? Math.min(98, 45 + directDependents.length * 20) : 85;

  // Compute Network Amplification Multiplier (ranging from 1.1x up to 2.8x)
  const rawAmplifier = 1.0 + (criticalityScore / 100) * 0.7 + ((100 - backupScore) / 100) * 0.5 + ((100 - bufferScore) / 100) * 0.4 + (geoConcentrationScore / 100) * 0.2;
  const amplificationMultiplier = Math.round(rawAmplifier * 10) / 10;
  const effectiveNetworkDamagePct = Math.min(100, Math.round(effectiveSeverityPct * amplificationMultiplier));

  // ==========================================
  // 2. CONTAINMENT MITIGATION CALCULATIONS
  // ==========================================
  const containmentSavingsMap = {
    'activate-backup': 0.42,      // 42% risk reduction
    'reserve-buffer': 0.24,       // 24% risk reduction
    'prioritize-sla': 0.18,       // 18% risk reduction
    'expedite-freight': 0.16,     // 16% risk reduction
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
  // Supplier Capacity / Parameter values Before & After
  const supplierCapacityBefore = 100;
  const supplierCapacityAfter = Math.max(0, Math.round(100 - effectiveSeverityPct));

  // Factory Production Loss
  let affectedFactories = [];
  let factoryDropPct = 0;
  if (effectiveSeverityPct > 0) {
    if (affectedNode.type === "supplier") {
      affectedFactories = NODES.filter(n => n.type === "factory" && n.dependencies && n.dependencies.includes(affectedNodeId)).map(n => n.id);
      if (affectedFactories.length === 0) affectedFactories = ["fac-chennai-main"];
      factoryDropPct = Math.round(effectiveSeverityPct * (amplificationMultiplier >= 2.0 ? 0.95 : 0.85));
    } else if (affectedNode.type === "factory") {
      factoryDropPct = effectiveSeverityPct;
      affectedFactories = [affectedNode.id];
    } else {
      factoryDropPct = Math.round(effectiveSeverityPct * 0.7);
      affectedFactories = NODES.filter(n => n.type === "factory" && n.dependencies && n.dependencies.includes(affectedNodeId)).map(n => n.id);
    }
  }

  const factoryProductionBefore = 100;
  const uncontainedFactoryProduction = effectiveSeverityPct > 0 ? Math.max(15, Math.round(100 - factoryDropPct)) : 100;
  const factoryProductionAfter = Math.round(uncontainedFactoryProduction + (100 - uncontainedFactoryProduction) * totalContainmentReduction * 0.7);

  // Inventory Runway Depletion
  const baselineRunwayDays = 31;
  const uncontainedRunwayDays = Math.max(3, Math.round(baselineRunwayDays * (1 - severityMultiplier * 0.78)));
  const inventoryDepletionDays = Math.min(baselineRunwayDays, Math.round(uncontainedRunwayDays + (baselineRunwayDays - uncontainedRunwayDays) * totalContainmentReduction));

  // Customer Fulfillment Degradation
  const customerFulfillmentBefore = 98.2;
  const uncontainedCustomerFulfillment = effectiveSeverityPct > 0 ? Math.max(32, Math.round((customerFulfillmentBefore - (effectiveSeverityPct * 0.92)) * 10) / 10) : 98.2;
  const customerFulfillmentAfter = Math.round((uncontainedCustomerFulfillment + (customerFulfillmentBefore - uncontainedCustomerFulfillment) * totalContainmentReduction) * 10) / 10;

  // Uncontained Base Revenue at Risk (₹ Cr)
  const dailyBaseLossCr = (COMPANY_PROFILE.annualRevenueCr / 365) * severityMultiplier * (amplificationMultiplier * 0.35);
  const penaltySurchargesCr = (durationDays * 0.08) * severityMultiplier * (amplificationMultiplier * 0.4);
  const uncontainedTotalRiskCr = effectiveSeverityPct > 0 ? Math.round((dailyBaseLossCr * Math.min(durationDays, 25) + penaltySurchargesCr) * 10) / 10 : 0.0;

  // Contained Revenue at Risk
  const totalRevenueAtRiskCr = Math.round((uncontainedTotalRiskCr * (1 - totalContainmentReduction)) * 10) / 10;
  const capitalSavedCr = Math.round((uncontainedTotalRiskCr - totalRevenueAtRiskCr) * 10) / 10;

  // Recovery Velocity
  const unassistedRecoveryDays = effectiveSeverityPct > 0 ? Math.round(durationDays * 0.42 + 8) : 0;
  const nexusRecoveryDays = effectiveSeverityPct > 0 ? Math.round((unassistedRecoveryDays * (1 - totalContainmentReduction) * 0.22) * 10) / 10 : 0;
  const recoveryVelocityGainPct = unassistedRecoveryDays > 0 ? Math.round(((unassistedRecoveryDays - nexusRecoveryDays) / unassistedRecoveryDays) * 100) : 0;

  // ==========================================
  // 4. "WHAT BREAKS FIRST?" PREDICTIVE FAILURE SEQUENCE
  // ==========================================
  const whatBreaksFirst = [
    {
      order: 1,
      name: "Chennai Mega Integrator (Plant 1)",
      nodeId: "fac-chennai-main",
      type: "Factory SMT Starvation",
      estimatedDays: "2.4 Days",
      hours: 58,
      severity: "Critical Starvation",
      impact: "Surface-mount assembly lines stall as SoC buffer drops to 0 units.",
      statusColor: "rose"
    },
    {
      order: 2,
      name: "Jurong Global Hub (Singapore)",
      nodeId: "wh-singapore-hub",
      type: "Logistics Buffer Depletion",
      estimatedDays: "5.7 Days",
      hours: 136,
      severity: "Stockout Warning",
      impact: "Outbound consolidation queue starves; regional distribution buffers exhaust.",
      statusColor: "amber"
    },
    {
      order: 3,
      name: "Apex HyperScale Cloud Systems",
      nodeId: "cust-global-tier1-tech",
      type: "Enterprise SLA Breach",
      estimatedDays: "8.2 Days",
      hours: 196,
      severity: "Contractual Penalty",
      impact: "Guaranteed SLA threshold (<95%) breached; ₹65 Lakhs/day penalty invoked.",
      statusColor: "rose"
    }
  ];

  // ==========================================
  // 5. BLAST RADIUS CLASSIFICATION (TIER 1, 2, 3)
  // ==========================================
  const tier1Direct = [
    {
      id: affectedNode.id,
      name: affectedNode.name,
      type: affectedNode.type,
      location: affectedNode.location,
      impactType: "Origin Fracture Point",
      impairedPct: `${effectiveSeverityPct}% Impairment`,
      runway: "0 Days (Direct Shock)",
      severity: "critical",
      dependencyPath: "Primary Epicenter"
    },
    {
      id: "fac-chennai-main",
      name: "Chennai Mega Integrator (Plant 1)",
      type: "factory",
      location: "Chennai, India",
      impactType: "Direct Sub-Assembly Starvation",
      impairedPct: `-${100 - factoryProductionAfter}% Throughput`,
      runway: "2.4 Days Buffer Remaining",
      severity: "critical",
      dependencyPath: `${affectedNode.name} ➔ Chennai Plant 1`
    },
    {
      id: "fac-penang-module",
      name: "Penang Advanced Module Plant (Plant 2)",
      type: "factory",
      location: "Penang, Malaysia",
      impactType: "Secondary Module Bottleneck",
      impairedPct: "-45% Output",
      runway: "3.8 Days Buffer Remaining",
      severity: "warning",
      dependencyPath: `${affectedNode.name} ➔ Penang Plant 2`
    }
  ];

  const tier2Secondary = [
    {
      id: "wh-singapore-hub",
      name: "Jurong Global Logistics Hub",
      type: "warehouse",
      location: "Singapore",
      impactType: "Global Consolidation Outage",
      impairedPct: "-68% Inbound Flow",
      runway: "5.7 Days Safety Stock",
      severity: "warning",
      dependencyPath: "Chennai Plant 1 ➔ Jurong Hub"
    },
    {
      id: "wh-rotterdam-hub",
      name: "Rotterdam Euro-Gateway Depot",
      type: "warehouse",
      location: "Rotterdam, Netherlands",
      impactType: "Euro Distribution Backlog",
      impairedPct: "-52% Stock Replenishment",
      runway: "7.1 Days Safety Stock",
      severity: "warning",
      dependencyPath: "Jurong Hub ➔ Rotterdam Depot"
    },
    {
      id: "wh-dubai-hub",
      name: "Jebel Ali MENA Gateway",
      type: "warehouse",
      location: "Dubai, UAE",
      impactType: "Regional Gateway Congestion",
      impairedPct: "-38% Stock Flow",
      runway: "9.0 Days Safety Stock",
      severity: "moderate",
      dependencyPath: "Chennai Plant 1 ➔ Dubai Gateway"
    }
  ];

  const tier3Tertiary = [
    {
      id: "cust-global-tier1-tech",
      name: "Apex HyperScale Cloud Systems",
      type: "customer",
      location: "Silicon Valley & Frankfurt",
      impactType: "SLA Penalty Incurred",
      impairedPct: "₹65 Lakhs/day Breach",
      runway: "8.2 Days Until Breach",
      severity: "critical",
      dependencyPath: "Rotterdam Depot ➔ Apex Cloud"
    },
    {
      id: "cust-auto-mobility",
      name: "Stuttgart Autonomous Mobility",
      type: "customer",
      location: "Stuttgart, Germany",
      impactType: "Automotive Line Hold",
      impairedPct: "₹45 Lakhs/day Breach",
      runway: "11.5 Days Until Breach",
      severity: "warning",
      dependencyPath: "Rotterdam Depot ➔ Stuttgart Auto"
    },
    {
      id: "cust-medtech-lifecare",
      name: "MedTech LifeCare Devices",
      type: "customer",
      location: "Boston & Basel",
      impactType: "Critical Healthcare Allocation",
      impairedPct: "Protected Priority",
      runway: "14.0 Days Runway",
      severity: "moderate",
      dependencyPath: "Dallas Hub ➔ MedTech LifeCare"
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
      title: 'Supplier Failure',
      nodeName: affectedNode.name,
      stage: 'Epicenter Inception',
      status: 'critical',
      color: 'rose',
      metricName: fractureType === 'lead-time' ? 'Lead Time' : fractureType === 'cost' ? 'Unit Cost' : fractureType === 'quality' ? 'Defect Rate' : 'Supplier Capacity',
      beforeVal: fractureType === 'lead-time' ? '14 Days' : fractureType === 'cost' ? '₹4,200' : fractureType === 'quality' ? '2.1%' : '100%',
      afterVal: fractureType === 'lead-time' ? '35 Days' : fractureType === 'cost' ? '₹7,140' : fractureType === 'quality' ? '15.4%' : `${supplierCapacityAfter}%`,
      badgeText: `${effectiveSeverityPct}% ${fractureType.toUpperCase()} CUT`,
      description: `${affectedNode.name} suffers sudden operational collapse due to ${eventType}.`,
      rootCause: `Geopolitical export restriction and severe seismic shock affecting primary fab in ${affectedNode.location}.`,
      affectedComponents: ['AuraX 3nm SoC Silicon', 'Multi-Layer High-Frequency Substrates', 'ASIC Controllers'],
      mitigationAction: 'Immediate failover trigger to Apex Silicon (Phoenix) or Kyoto Microelectronics.'
    },
    {
      id: 'node-t18',
      timeLabel: '18h',
      timeframe: 'T+18h',
      step: 2,
      title: 'Factory Starvation',
      nodeName: 'Chennai Mega Integrator (Plant 1)',
      stage: 'Sub-Assembly Throttling',
      status: 'warning',
      color: 'amber',
      metricName: 'SMT Assembly Cadence',
      beforeVal: `${factoryProductionBefore}%`,
      afterVal: `${factoryProductionAfter}%`,
      badgeText: `-${100 - factoryProductionAfter}% CADENCE`,
      description: 'Chennai Plant 1 line buffer rapidly exhausts as component feed stalls.',
      rootCause: 'Lack of upstream silicon chips halts high-speed SMT surface-mount pick-and-place lines.',
      affectedComponents: ['Mainboard PCB Sub-Assemblies', 'AuraVision Edge Controller Units'],
      mitigationAction: 'Deploy emergency air freight of 15,000 units from Kyoto backup facility.'
    },
    {
      id: 'node-t3d',
      timeLabel: '3d',
      timeframe: 'T+3d',
      step: 3,
      title: 'Inventory Exhaustion',
      nodeName: 'Jurong Global Logistics Hub (Singapore)',
      stage: 'Warehouse Safety Stockout',
      status: 'warning',
      color: 'amber',
      metricName: 'Regional Safety Runway',
      beforeVal: `${baselineRunwayDays} Days`,
      afterVal: `${inventoryDepletionDays} Days`,
      badgeText: `${inventoryDepletionDays}d RUNWAY LEFT`,
      description: 'Regional distribution safety reserves in Singapore & Rotterdam breach minimum threshold.',
      rootCause: 'Outbound order fulfillment burns through reserve stock without manufacturing replenishment.',
      affectedComponents: ['Finished Controller Stock', 'Regional Spares Inventory'],
      mitigationAction: 'Re-route regional stock from Dallas DFW master hub via charter freight.'
    },
    {
      id: 'node-t7d',
      timeLabel: '7d',
      timeframe: 'T+7d',
      step: 4,
      title: 'SLA Breach',
      nodeName: 'Apex HyperScale Cloud Systems',
      stage: 'Contractual Default Warning',
      status: 'critical',
      color: 'rose',
      metricName: 'Tier-1 Fulfillment Rate',
      beforeVal: `${customerFulfillmentBefore}%`,
      afterVal: `${customerFulfillmentAfter}%`,
      badgeText: `-${(customerFulfillmentBefore - customerFulfillmentAfter).toFixed(1)}% FULFILLMENT`,
      description: 'Delivery obligations to enterprise clients slip past grace period; penalty clauses trigger.',
      rootCause: 'Backlog in European & Asian distribution gateways exceeds contract delivery buffer.',
      affectedComponents: ['Enterprise Cloud Acceleration Kits', 'Smart Cockpit Module Batches'],
      mitigationAction: 'Activate AI autonomous contractual re-negotiation with Tier-1 enterprise buyers.'
    },
    {
      id: 'node-t14d',
      timeLabel: '14d',
      timeframe: 'T+14d',
      step: 5,
      title: 'Revenue Loss',
      nodeName: 'AURA Corporate Treasury Exposure',
      stage: 'Cumulative Financial Fracture',
      status: 'terminal-critical',
      color: 'red',
      isTerminalRed: true,
      metricName: 'Total Capital Exposure',
      beforeVal: '₹0.0 Cr',
      afterVal: `₹${totalRevenueAtRiskCr} Cr`,
      badgeText: `₹${totalRevenueAtRiskCr} Cr AT RISK`,
      description: `Unmitigated network shock produces ₹${totalRevenueAtRiskCr} Cr cumulative exposure across ${durationDays} days.`,
      rootCause: 'Direct lost sales margin combined with statutory SLA delivery breach penalties.',
      affectedComponents: ['Quarterly Operating Margin', 'Enterprise ARR Renewal Pipeline'],
      mitigationAction: 'Deploy NEXUS multi-agent recovery plan to safeguard 85%+ of capital exposure.'
    }
  ];

  // Node-by-node status mapping for map and twin views
  const simulatedNodes = NODES.map(node => {
    let nodeStatus = "operational";
    let healthPct = 100;
    let impactNote = "Normal operations. Inventory within healthy thresholds.";

    if (effectiveSeverityPct > 0) {
      if (node.id === affectedNodeId) {
        nodeStatus = "disrupted";
        healthPct = supplierCapacityAfter;
        impactNote = `Direct fracture: ${effectiveSeverityPct}% ${fractureType} curtailed for ${durationDays} days.`;
      } else if (affectedFactories.includes(node.id)) {
        nodeStatus = "impaired";
        healthPct = factoryProductionAfter;
        impactNote = `Upstream component shortage throttling throughput to ${factoryProductionAfter}%.`;
      } else if (node.dependencies && (node.dependencies.includes(affectedNodeId) || node.dependencies.some(d => affectedFactories.includes(d)))) {
        nodeStatus = "impaired";
        healthPct = Math.max(40, Math.round(100 - effectiveSeverityPct * 0.7));
        impactNote = `Downstream buffer depletion. Runway reduced to ${inventoryDepletionDays} days.`;
      } else if (node.type === "customer") {
        nodeStatus = "at-risk";
        healthPct = customerFulfillmentAfter;
        impactNote = `Delivery SLA threatened. Fill rate dropped to ${customerFulfillmentAfter}%.`;
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
      multiplier: amplificationMultiplier,
      effectiveNetworkDamagePct,
      formulaExplanation: `${effectiveSeverityPct}% Initial Disruption × ${amplificationMultiplier} Multiplier = ${effectiveNetworkDamagePct}% Operational Shock`
    },
    whatBreaksFirst,
    blastRadius: {
      tier1Direct,
      tier2Secondary,
      tier3Tertiary,
      totalSitesAffected: tier1Direct.length + tier2Secondary.length + tier3Tertiary.length
    },
    containment: {
      activeContainmentIds,
      totalContainmentReductionPct: Math.round(totalContainmentReduction * 100),
      uncontainedRiskCr: uncontainedTotalRiskCr,
      containedRiskCr: totalRevenueAtRiskCr,
      capitalSavedCr: capitalSavedCr,
      uncontainedDowntimeDays: unassistedRecoveryDays,
      containedDowntimeDays: nexusRecoveryDays,
      uncontainedBlastSites: 9,
      containedBlastSites: Math.max(2, Math.round(9 * (1 - totalContainmentReduction)))
    },
    metrics: {
      supplierCapacityBefore,
      supplierCapacityAfter,
      factoryProductionBefore,
      factoryProductionAfter,
      baselineRunwayDays,
      inventoryDepletionDays,
      customerFulfillmentBefore,
      customerFulfillmentAfter,
      totalRevenueAtRiskCr,
      uncontainedTotalRiskCr,
      capitalSavedCr,
      dailyLossRateCr: (totalRevenueAtRiskCr / Math.min(durationDays, 25)).toFixed(2),
      unassistedRecoveryDays,
      nexusRecoveryDays,
      recoveryVelocityGainPct,
    },
    simulatedNodes,
    simulatedRoutes,
    propagationTimeline: cascadeNodes,
    cascadeNodes
  };
}

