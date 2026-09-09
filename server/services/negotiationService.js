import { NEGOTIATION_SUPPLIERS } from '../../src/engine/negotiationEngine.js';

/**
 * Autonomous AI Supplier Negotiation Service
 */
export function getSuppliersList() {
  return NEGOTIATION_SUPPLIERS.map(s => ({
    id: s.id,
    name: s.name,
    repName: s.repName,
    repRole: s.repRole,
    repAvatar: s.repAvatar,
    initialOffer: s.initialOffer,
    negotiatedOffer: s.negotiatedOffer,
  }));
}

export function getSupplierDetails(supplierId) {
  return NEGOTIATION_SUPPLIERS.find(s => s.id === supplierId) || NEGOTIATION_SUPPLIERS[0];
}

export function processNegotiationRound(supplierId, currentStep = 1, userProposal = null) {
  const supplier = getSupplierDetails(supplierId);
  const dialogueScript = supplier.dialogueScript;
  const targetStep = Math.min(dialogueScript.length, Math.max(1, currentStep));
  
  return {
    supplierId,
    supplierName: supplier.name,
    step: targetStep,
    totalSteps: dialogueScript.length,
    currentMessage: dialogueScript[targetStep - 1],
    transcript: dialogueScript.slice(0, targetStep),
    isCompleted: targetStep >= dialogueScript.length,
    agreedTerms: targetStep >= dialogueScript.length ? supplier.negotiatedOffer : null
  };
}

export function generateMOUDocument(supplierId, customTerms = {}) {
  const supplier = getSupplierDetails(supplierId);
  const terms = {
    ...supplier.negotiatedOffer,
    ...customTerms
  };

  const documentId = `MOU-MDONER-${supplier.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;

  return {
    documentId,
    title: "INTER-AGENCY EMERGENCY SERVICE AGREEMENT & REQUISITION (MOU) FOR NER LIFELINE RESTORATION",
    generatedAt: new Date().toISOString(),
    parties: {
      buyer: {
        name: "Ministry of Development of North Eastern Region (MDoNER) & North Eastern Council (NEC)",
        signatory: "Autonomous Inter-Agency Requisition Agent (Authorized by Secretary MDoNER)",
        location: "Shillong & Guwahati, India"
      },
      supplier: {
        name: supplier.name,
        signatory: `${supplier.repName}, ${supplier.repRole}`,
        location: "Guwahati / Siliguri / Shillong"
      }
    },
    clauses: [
      {
        clause: "1. Priority Lifeline Allocation",
        details: `Partner agency guarantees immediate deployment of ${terms.capacityUnits.toLocaleString()} units/tonnes with Green Corridor transit clearance.`
      },
      {
        clause: "2. Requisition Tariff & Zero-Surge Agreement",
        details: `Agreed operational tariff locked at ₹${terms.unitPriceINR.toLocaleString()} INR (inclusive of 0% emergency surcharge under NDMA protocol).`
      },
      {
        clause: "3. Turnaround & Transit Guarantee",
        details: `Point-to-point delivery timeframe capped at ${terms.leadTimeDays} business days via dedicated priority corridor.`
      },
      {
        clause: "4. Standing Inter-State Logistics Charter",
        details: `MDoNER commits to a ${terms.minimumContractMonths}-month standing inter-state logistics reservation with guaranteed treasury settlement.`
      },
      {
        clause: "5. Disaster Management Statutory Clearance",
        details: "Priority right-of-way and statutory fuel/security clearance authorized under NDMA Section 38."
      }
    ],
    financialSummary: {
      totalContractValueINR: terms.capacityUnits * terms.unitPriceINR,
      estimatedSavingsCr: terms.estimatedCostSavingsCr || 1.15,
      status: "EXECUTED & DIGITALLY VERIFIED"
    }
  };
}
