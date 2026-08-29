/**
 * NEXUS Frontend API Client Layer
 * Handles communication with the Node.js Express backend with seamless client-side fallback.
 */

import { simulateRippleEffect } from '../engine/rippleSimulation.js';
import { generateRecoveryStrategies as clientGenerateStrategies } from '../engine/recoveryOptimizer.js';
import { calculateResilienceScore as clientCalculateScore } from '../engine/resilienceCalculator.js';
import { getSupplierNegotiation as clientGetNegotiation, NEGOTIATION_SUPPLIERS } from '../engine/negotiationEngine.js';
import { NODES, LOGISTICS_ROUTES, COMPANY_PROFILE } from '../data/auraSupplyChainData.js';
import { CRISIS_SCENARIOS } from '../data/scenariosData.js';
import { RADAR_PROJECTIONS, STRUCTURAL_VULNERABILITIES } from '../data/resilienceData.js';
import { DEMO_USERS } from '../data/usersData.js';

const API_BASE = '/api';

/**
 * Generic Fetch Helper with Timeout and Fallback
 */
async function fetchWithFallback(endpoint, options = {}, fallbackFn) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return data;
  } catch (err) {
    // Graceful offline fallback
    if (fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

export const nexusApi = {
  /**
   * Health Check
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', mode: 'client-fallback' };
    }
  },

  /**
   * Scenarios
   */
  async getScenarios() {
    return fetchWithFallback(
      '/simulate/scenarios',
      { method: 'GET' },
      () => CRISIS_SCENARIOS
    );
  },

  /**
   * Network Nodes & Routes
   */
  async getNodes() {
    return fetchWithFallback(
      '/network/nodes',
      { method: 'GET' },
      () => NODES
    );
  },

  async getRoutes() {
    return fetchWithFallback(
      '/network/routes',
      { method: 'GET' },
      () => LOGISTICS_ROUTES
    );
  },

  async getCompanyProfile() {
    return fetchWithFallback(
      '/network/company',
      { method: 'GET' },
      () => COMPANY_PROFILE
    );
  },

  /**
   * Deterministic Ripple Simulation
   */
  async runSimulation(affectedNodeId, severityPct, durationDays, eventType) {
    return fetchWithFallback(
      '/simulate/ripple',
      {
        method: 'POST',
        body: JSON.stringify({ affectedNodeId, severityPct, durationDays, eventType })
      },
      () => simulateRippleEffect(affectedNodeId, severityPct, durationDays, eventType)
    );
  },

  /**
   * Pareto Recovery Optimizer
   */
  async getRecoveryStrategies(disruptionState, weights) {
    return fetchWithFallback(
      '/recovery/optimize',
      {
        method: 'POST',
        body: JSON.stringify({ disruptionState, weights })
      },
      () => ({
        strategies: clientGenerateStrategies(disruptionState, weights),
        evaluatedAt: new Date().toISOString()
      })
    );
  },

  /**
   * Resilience Scoring
   */
  async calculateResilience(activeStrategy, isDisrupted, severityPct) {
    return fetchWithFallback(
      '/resilience/score',
      {
        method: 'POST',
        body: JSON.stringify({ activeStrategy, isDisrupted, severityPct })
      },
      () => clientCalculateScore(activeStrategy, isDisrupted, severityPct)
    );
  },

  /**
   * Radar Dimensions & Budget Projections
   */
  async getResilienceRadar(budgetAllocations) {
    return fetchWithFallback(
      `/resilience/radar?budgetAllocations=${encodeURIComponent(JSON.stringify(budgetAllocations || {}))}`,
      { method: 'GET' },
      () => {
        const budgets = budgetAllocations || { bufferStock: 1.2, supplierDiversification: 1.5, routeRedundancy: 0.8 };
        const lift = Math.round((budgets.bufferStock * 4) + (budgets.supplierDiversification * 5) + (budgets.routeRedundancy * 3));
        return {
          radarDimensions: RADAR_PROJECTIONS,
          vulnerabilities: STRUCTURAL_VULNERABILITIES,
          budgetAllocations: budgets,
          projectedResilienceLift: lift,
          projectedScore: Math.min(98, 64 + lift)
        };
      }
    );
  },

  /**
   * Negotiation Engine
   */
  async getNegotiationSuppliers() {
    return fetchWithFallback(
      '/negotiation/suppliers',
      { method: 'GET' },
      () => NEGOTIATION_SUPPLIERS
    );
  },

  async advanceNegotiation(supplierId, currentStep, userProposal) {
    return fetchWithFallback(
      '/negotiation/advance',
      {
        method: 'POST',
        body: JSON.stringify({ supplierId, currentStep, userProposal })
      },
      () => {
        const supplier = clientGetNegotiation(supplierId);
        const dialogue = supplier.dialogueScript;
        const targetStep = Math.min(dialogue.length, Math.max(1, currentStep));
        return {
          supplierId,
          supplierName: supplier.name,
          step: targetStep,
          totalSteps: dialogue.length,
          currentMessage: dialogue[targetStep - 1],
          transcript: dialogue.slice(0, targetStep),
          isCompleted: targetStep >= dialogue.length,
          agreedTerms: targetStep >= dialogue.length ? supplier.negotiatedOffer : null
        };
      }
    );
  },

  async generateMOU(supplierId, customTerms) {
    return fetchWithFallback(
      '/negotiation/mou',
      {
        method: 'POST',
        body: JSON.stringify({ supplierId, customTerms })
      },
      () => {
        const supplier = clientGetNegotiation(supplierId);
        const terms = { ...supplier.negotiatedOffer, ...customTerms };
        return {
          documentId: `MOU-AURA-${supplier.id.toUpperCase()}-${Date.now().toString().slice(-6)}`,
          title: "MEMORANDUM OF UNDERSTANDING (MOU) FOR EXPEDITED SEMICONDUCTOR ALLOCATION",
          generatedAt: new Date().toISOString(),
          parties: {
            buyer: {
              name: "AURA Devices Inc.",
              signatory: "Autonomous AI Procurement Agent",
              location: "Bengaluru, India"
            },
            supplier: {
              name: supplier.name,
              signatory: `${supplier.repName}, ${supplier.repRole}`,
              location: "Kansai / Phoenix"
            }
          },
          clauses: [
            { clause: "1. Volume & Allocation Commitment", details: `Supplier guarantees immediate allocation of ${terms.capacityUnits.toLocaleString()} units.` },
            { clause: "2. Unit Pricing & Currency", details: `Agreed baseline unit pricing locked at ₹${terms.unitPriceINR.toLocaleString()} INR.` },
            { clause: "3. Logistics & Transit Guarantee", details: `Dock-to-dock delivery timeframe capped at ${terms.leadTimeDays} business days via direct air freight.` },
            { clause: "4. Master Service Agreement Extension", details: `Buyer commits to a ${terms.minimumContractMonths}-month dual-sourcing minimum volume allocation.` },
            { clause: "5. Non-Performance Penalty", details: "Daily 2.5% penalty credit for every 24-hour delay exceeding the SLA delivery window." }
          ],
          financialSummary: {
            totalContractValueINR: terms.capacityUnits * terms.unitPriceINR,
            estimatedSavingsCr: terms.estimatedCostSavingsCr || 1.15,
            status: "EXECUTED & DIGITALLY VERIFIED"
          }
        };
      }
    );
  },

  /**
   * Authentication
   */
  async login(email, password, persona) {
    return fetchWithFallback(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, persona })
      },
      () => {
        const user = DEMO_USERS.find(u => u.persona === persona) || DEMO_USERS[0];
        return { user, token: `mock-jwt-token-${user.id}` };
      }
    );
  }
};
