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

  const documentId = `MOU-AURA-${supplier.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;

  return {
    documentId,
    title: "MEMORANDUM OF UNDERSTANDING (MOU) FOR EXPEDITED SEMICONDUCTOR ALLOCATION",
    generatedAt: new Date().toISOString(),
    parties: {
      buyer: {
        name: "AURA Devices Inc.",
        signatory: "Autonomous AI Procurement Agent (Authorized by Executive Committee)",
        location: "Bengaluru, India"
      },
      supplier: {
        name: supplier.name,
        signatory: `${supplier.repName}, ${supplier.repRole}`,
        location: "Kansai / Phoenix"
      }
    },
    clauses: [
      {
        clause: "1. Volume & Allocation Commitment",
        details: `Supplier guarantees immediate allocation of ${terms.capacityUnits.toLocaleString()} units with priority line reservation.`
      },
      {
        clause: "2. Unit Pricing & Currency",
        details: `Agreed baseline unit pricing locked at ₹${terms.unitPriceINR.toLocaleString()} INR (inclusive of capped ${terms.rushSurchargePct}% emergency surge fee).`
      },
      {
        clause: "3. Logistics & Transit Guarantee",
        details: `Dock-to-dock delivery timeframe capped at ${terms.leadTimeDays} business days via direct air freight.`
      },
      {
        clause: "4. Master Service Agreement Extension",
        details: `Buyer commits to a ${terms.minimumContractMonths}-month dual-sourcing minimum volume allocation post-crisis.`
      },
      {
        clause: "5. Non-Performance Penalty",
        details: "Daily 2.5% penalty credit for every 24-hour delay exceeding the SLA delivery window."
      }
    ],
    financialSummary: {
      totalContractValueINR: terms.capacityUnits * terms.unitPriceINR,
      estimatedSavingsCr: terms.estimatedCostSavingsCr || 1.15,
      status: "EXECUTED & DIGITALLY VERIFIED"
    }
  };
}
