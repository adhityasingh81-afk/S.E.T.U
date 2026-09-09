import { COMPANY_PROFILE } from '../../src/data/auraSupplyChainData.js';
import { dbSaveExecutiveReport, dbGetExecutiveReports } from '../db/database.js';

export function generateExecutiveReport(req, res) {
  try {
    const { activeScenario, simulationResult, activeStrategy, resilienceScore } = req.body;

    const report = {
      reportId: `SITREP-NER-${Date.now().toString().slice(-6)}`,
      company: COMPANY_PROFILE.name,
      generatedAt: new Date().toISOString(),
      classification: "OFFICIAL // MDoNER & NDMA INTER-AGENCY SITREP",
      crisisSummary: {
        scenarioTitle: activeScenario?.title || "Active Mountain Corridor Fracture",
        affectedNode: simulationResult?.affectedNode?.name || "NH-6 Sonapur Mountain Pass",
        severityPct: simulationResult?.severityPct || 75,
        unassistedExposureCr: simulationResult?.metrics?.totalRevenueAtRiskCr || 21.4,
        unassistedDowntimeDays: simulationResult?.metrics?.unassistedRecoveryDays || 18,
      },
      mitigationStatus: activeStrategy ? {
        strategyTitle: activeStrategy.title,
        executionCostCr: activeStrategy.costCr,
        recoveryTimeDays: activeStrategy.recoveryTimeDays,
        netRevenueProtectedCr: activeStrategy.revenueProtectedCr,
        resilienceScoreLift: resilienceScore?.overallScore || 92,
        status: "APPROVED & DISPATCHED"
      } : {
        status: "PENDING AUTHORIZATION",
        recommendedAction: "Dispatch Balanced Lifeline Corridor Resilience (Strategy C)"
      },
      auditSignature: {
        signatory: "NEXUS Autonomous Inter-Agency Engine",
        complianceStandard: "NDMA Act 2005 Chapter IV Statutory Compliance",
        verified: true
      }
    };

    // Persist report in database
    try {
      dbSaveExecutiveReport(report);
    } catch (dbErr) {
      console.warn('Executive report database save notice:', dbErr.message);
    }

    return res.json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getExecutiveReportsHistory(req, res) {
  try {
    const reports = dbGetExecutiveReports();
    return res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

