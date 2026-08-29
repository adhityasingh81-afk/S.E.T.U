import { NODES, LOGISTICS_ROUTES, COMPANY_PROFILE } from '../../src/data/auraSupplyChainData.js';

/**
 * Propagates a disruption through the multi-tier supply network
 */
export function simulateRipple(affectedNodeId, severityPct = 40, durationDays = 45, eventType = "Supplier Disruption") {
  const affectedNode = NODES.find(n => n.id === affectedNodeId) || NODES[0];
  const severityMultiplier = Number(severityPct) / 100;
  const duration = Number(durationDays);

  // Step 1: Upstream / Affected Node Impact
  const supplierCapacityBefore = 100;
  const supplierCapacityAfter = Math.max(10, Math.round(100 - severityPct));

  // Step 2: Factory Production Loss
  let factoryDropPct = 0;
  let affectedFactories = [];
  
  if (severityPct > 0) {
    if (affectedNode.type === "supplier") {
      affectedFactories = NODES.filter(n => n.type === "factory" && n.dependencies && n.dependencies.includes(affectedNodeId)).map(n => n.id);
      if (affectedFactories.length === 0) {
        affectedFactories = ["fac-chennai-main"];
      }
      factoryDropPct = Math.round(severityPct * 0.95);
    } else if (affectedNode.type === "factory") {
      factoryDropPct = severityPct;
      affectedFactories = [affectedNode.id];
    } else {
      factoryDropPct = Math.round(severityPct * 0.7);
      affectedFactories = NODES.filter(n => n.type === "factory" && n.dependencies && n.dependencies.includes(affectedNodeId)).map(n => n.id);
    }
  }

  const factoryProductionBefore = 100;
  const factoryProductionAfter = severityPct > 0 ? Math.max(15, Math.round(100 - (factoryDropPct * 0.95))) : 100;

  // Step 3: Inventory Runway Depletion
  const baselineRunwayDays = 31;
  const inventoryDepletionDays = Math.max(4, Math.round(baselineRunwayDays * (1 - severityMultiplier * 0.71)));

  // Step 4: Customer Fulfillment Degradation
  const customerFulfillmentBefore = 98.2;
  const customerFulfillmentAfter = severityPct > 0 ? Math.max(35, Math.round((customerFulfillmentBefore - (severityPct * 0.92)) * 10) / 10) : 98.2;

  // Step 5: Revenue at Risk (₹ Cr)
  const dailyBaseLossCr = (COMPANY_PROFILE.annualRevenueCr / 365) * severityMultiplier * 0.65;
  const penaltySurchargesCr = (duration * 0.08) * severityMultiplier;
  const totalRevenueAtRiskCr = severityPct > 0 ? Math.round((dailyBaseLossCr * Math.min(duration, 25) + penaltySurchargesCr) * 10) / 10 : 0.0;

  // Step 6: Recovery velocity comparison
  const unassistedRecoveryDays = severityPct > 0 ? Math.round(duration * 0.42 + 8) : 0;
  const nexusRecoveryDays = severityPct > 0 ? Math.round((unassistedRecoveryDays * 0.17) * 10) / 10 : 0;
  const recoveryVelocityGainPct = unassistedRecoveryDays > 0 ? Math.round(((unassistedRecoveryDays - nexusRecoveryDays) / unassistedRecoveryDays) * 100) : 0;

  // Step 7: Node-by-node status mapping
  const simulatedNodes = NODES.map(node => {
    let nodeStatus = "operational";
    let healthPct = 100;
    let impactNote = "Normal operations. Inventory within healthy thresholds.";

    if (severityPct > 0) {
      if (node.id === affectedNodeId) {
        nodeStatus = "disrupted";
        healthPct = supplierCapacityAfter;
        impactNote = `Direct fracture: ${severityPct}% capacity curtailed for ${duration} days.`;
      } else if (affectedFactories.includes(node.id)) {
        nodeStatus = "impaired";
        healthPct = factoryProductionAfter;
        impactNote = `Upstream component shortage throttling throughput to ${factoryProductionAfter}%.`;
      } else if (node.dependencies && (node.dependencies.includes(affectedNodeId) || node.dependencies.some(d => affectedFactories.includes(d)))) {
        nodeStatus = "impaired";
        healthPct = Math.max(40, Math.round(100 - severityPct * 0.7));
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

  // Step 8: Route status mapping
  const simulatedRoutes = LOGISTICS_ROUTES.map(route => {
    let routeStatus = "active";
    if (severityPct > 0) {
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

  // Step 9: Downstream Timeline Stepper
  const propagationTimeline = [
    {
      step: 1,
      timeframe: "T+0 to T+24 Hours",
      title: "Fracture Inception",
      description: `${affectedNode.name} alerts of ${severityPct}% operational impairment due to ${eventType}.`,
      metricName: "Supplier Capacity",
      beforeVal: `${supplierCapacityBefore}%`,
      afterVal: `${supplierCapacityAfter}%`,
      status: "critical",
    },
    {
      step: 2,
      timeframe: "T+24 to T+72 Hours",
      title: "Factory Starvation",
      description: "Sub-assembly buffer at Chennai Plant 1 begins rapid burn-down. Production cadence drops.",
      metricName: "Factory Production Rate",
      beforeVal: `${factoryProductionBefore}%`,
      afterVal: `${factoryProductionAfter}%`,
      status: "warning",
    },
    {
      step: 3,
      timeframe: "T+3 to T+7 Days",
      title: "Inventory Buffer Exhaustion",
      description: "Regional warehouse safety stock in Singapore & Rotterdam plunges below critical threshold.",
      metricName: "Inventory Runway",
      beforeVal: `${baselineRunwayDays} Days`,
      afterVal: `${inventoryDepletionDays} Days`,
      status: "warning",
    },
    {
      step: 4,
      timeframe: "T+8 to T+14 Days",
      title: "Customer SLA Breach",
      description: "Shipment commitments to enterprise clients slip; SLA penalty clauses activate.",
      metricName: "Customer Fulfillment",
      beforeVal: `${customerFulfillmentBefore}%`,
      afterVal: `${customerFulfillmentAfter}%`,
      status: "critical",
    },
    {
      step: 5,
      timeframe: "Cumulative Exposure",
      title: "Revenue Impact",
      description: `Unmitigated disruption results in extensive contractual penalties and unfulfilled orders across ${duration} days.`,
      metricName: "Revenue at Risk",
      beforeVal: "₹0.0 Cr",
      afterVal: `₹${totalRevenueAtRiskCr} Cr`,
      status: "critical",
    },
  ];

  return {
    affectedNode,
    severityPct: Number(severityPct),
    durationDays: duration,
    eventType,
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
      dailyLossRateCr: Math.round(dailyBaseLossCr * 10) / 10,
      unassistedRecoveryDays,
      nexusRecoveryDays,
      recoveryVelocityGainPct,
      affectedFactoriesCount: affectedFactories.length
    },
    simulatedNodes,
    simulatedRoutes,
    propagationTimeline,
    timestamp: new Date().toISOString()
  };
}
