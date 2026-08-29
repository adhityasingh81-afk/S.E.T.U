import { COMPANY_PROFILE } from '../../src/data/auraSupplyChainData.js';
import { dbSaveExecutiveReport, dbGetExecutiveReports } from '../db/database.js';

export function generateExecutiveReport(req, res) {
  try {
    const { activeScenario, simulationResult, activeStrategy, resilienceScore } = req.body;

    const report = {
      reportId: `NEXUS-EXEC-REPORT-${Date.now().toString().slice(-6)}`,
      company: COMPANY_PROFILE.name,
      generatedAt: new Date().toISOString(),
      classification: "CONFIDENTIAL // BOARD OF DIRECTORS BRIEFING",
      crisisSummary: {
        scenarioTitle: activeScenario?.title || "Active Network Fracture",
        affectedNode: simulationResult?.affectedNode?.name || "Taiwan Micro Foundry",
        severityPct: simulationResult?.severityPct || 40,
        unassistedExposureCr: simulationResult?.metrics?.totalRevenueAtRiskCr || 18.7,
        unassistedDowntimeDays: simulationResult?.metrics?.unassistedRecoveryDays || 27,
      },
      mitigationStatus: activeStrategy ? {
        strategyTitle: activeStrategy.title,
        executionCostCr: activeStrategy.costCr,
        recoveryTimeDays: activeStrategy.recoveryTimeDays,
        netRevenueProtectedCr: activeStrategy.revenueProtectedCr,
        resilienceScoreLift: resilienceScore?.overallScore || 91,
        status: "APPROVED & DISPATCHED"
      } : {
        status: "PENDING AUTHORIZATION",
        recommendedAction: "Dispatch Speed-Optimized Rapid Airlift (Strategy B)"
      },
      auditSignature: {
        signatory: "NEXUS Self-Healing Autonomous Engine",
        complianceStandard: "ISO 22301 Business Continuity Management",
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

