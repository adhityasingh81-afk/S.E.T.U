import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { NODES, LOGISTICS_ROUTES, COMPANY_PROFILE } from '../../src/data/auraSupplyChainData.js';
import { CRISIS_SCENARIOS } from '../../src/data/scenariosData.js';
import { DEMO_USERS } from '../../src/data/usersData.js';
import { STRUCTURAL_VULNERABILITIES } from '../../src/data/resilienceData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure db directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'nexus.db');
const db = new DatabaseSync(dbPath);

/**
 * Initialize Tables & Migrations
 */
export function initDatabase() {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      persona TEXT NOT NULL,
      avatar TEXT,
      quote TEXT,
      clearance TEXT,
      hero_image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Supply Chain Network Nodes Table
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      country TEXT,
      region TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      criticality TEXT NOT NULL,
      tier INTEGER DEFAULT 1,
      baseline_capacity_units INTEGER DEFAULT 50000,
      current_utilization_pct REAL DEFAULT 85.0,
      inventory_buffer_days INTEGER DEFAULT 30,
      daily_burn_rate INTEGER DEFAULT 1200,
      unit_cost_inr REAL DEFAULT 4200.0,
      raw_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Logistics Routes Table
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      source_node_id TEXT NOT NULL,
      target_node_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      transit_days INTEGER NOT NULL,
      cost_per_unit_inr REAL NOT NULL,
      reliability_pct REAL DEFAULT 95.0,
      status TEXT DEFAULT 'ACTIVE',
      raw_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Crisis Scenarios Table
    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      badge TEXT,
      description TEXT,
      affected_node_id TEXT NOT NULL,
      affected_node_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      severity_pct REAL NOT NULL,
      duration_days INTEGER NOT NULL,
      geographic_region TEXT,
      estimated_initial_loss_cr REAL,
      ripple_summary TEXT,
      default_strategy_recommendation TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Simulation Audit Log Table
    CREATE TABLE IF NOT EXISTS simulations (
      id TEXT PRIMARY KEY,
      affected_node_id TEXT NOT NULL,
      affected_node_name TEXT,
      severity_pct REAL NOT NULL,
      duration_days INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      total_revenue_at_risk_cr REAL,
      unassisted_recovery_days REAL,
      inventory_depletion_days REAL,
      affected_nodes_count INTEGER,
      simulation_payload_json TEXT,
      simulated_at TEXT DEFAULT (datetime('now'))
    );

    -- Executed & Generated MOUs Table
    CREATE TABLE IF NOT EXISTS mous (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      title TEXT NOT NULL,
      total_contract_value_inr REAL,
      estimated_savings_cr REAL,
      clauses_json TEXT,
      financial_summary_json TEXT,
      status TEXT DEFAULT 'EXECUTED & DIGITALLY VERIFIED',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Executive Reports Table
    CREATE TABLE IF NOT EXISTS executive_reports (
      id TEXT PRIMARY KEY,
      scenario_title TEXT,
      affected_node TEXT,
      severity_pct REAL,
      revenue_at_risk_cr REAL,
      mitigation_status TEXT,
      report_json TEXT NOT NULL,
      generated_at TEXT DEFAULT (datetime('now'))
    );

    -- Resilience Vulnerabilities Table
    CREATE TABLE IF NOT EXISTS resilience_vulnerabilities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      capex_investment_cr REAL NOT NULL,
      avoided_disruption_loss_cr REAL NOT NULL,
      net_benefit_cr REAL NOT NULL,
      is_approved INTEGER DEFAULT 0,
      raw_json TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- SOS Emergency Alerts Table
    CREATE TABLE IF NOT EXISTS sos_alerts (
      id TEXT PRIMARY KEY,
      disruption_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      node_id TEXT,
      node_name TEXT,
      timestamp INTEGER NOT NULL,
      note TEXT,
      queued_at INTEGER,
      status TEXT DEFAULT 'SENT',
      sms_sid TEXT,
      sms_provider TEXT,
      recipient_phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes for fast querying
    CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
    CREATE INDEX IF NOT EXISTS idx_nodes_criticality ON nodes(criticality);
    CREATE INDEX IF NOT EXISTS idx_simulations_time ON simulations(simulated_at);
    CREATE INDEX IF NOT EXISTS idx_mous_supplier ON mous(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_reports_time ON executive_reports(generated_at);
    CREATE INDEX IF NOT EXISTS idx_sos_alerts_time ON sos_alerts(created_at);
  `);

  seedInitialData();
  console.log(`🗄️  NEXUS SQLite Database Initialized & Connected at: ${dbPath}`);
}

/**
 * Seed baseline data if tables are empty
 */
function seedInitialData() {
  // 1. Seed Users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, name, role, persona, avatar, quote, clearance, hero_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of DEMO_USERS) {
      insertUser.run(
        u.id || '',
        u.email || '',
        u.name || '',
        u.role || '',
        u.persona || '',
        u.avatar || null,
        u.quote || null,
        u.clearance || null,
        u.heroImage || null
      );
    }
  }

  // 2. Seed Nodes
  const nodeCount = db.prepare('SELECT COUNT(*) as count FROM nodes').get().count;
  if (nodeCount === 0) {
    const insertNode = db.prepare(`
      INSERT INTO nodes (id, name, type, category, location, country, region, lat, lng, criticality, tier, baseline_capacity_units, current_utilization_pct, inventory_buffer_days, daily_burn_rate, unit_cost_inr, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const n of NODES) {
      insertNode.run(
        String(n.id || ''),
        String(n.name || ''),
        String(n.type || 'supplier'),
        String(n.category || 'Components'),
        String(n.location || ''),
        String(n.country || n.region || ''),
        String(n.region || ''),
        Number(n.lat || 0),
        Number(n.lng || 0),
        String(n.criticality || 'Medium'),
        Number(n.tier || 1),
        Number(n.baselineCapacityUnits || n.capacityUnitsPerMonth || 50000),
        Number(n.currentUtilizationPct || n.currentUtilization || 85.0),
        Number(n.inventoryBufferDays || 30),
        Number(n.dailyBurnRate || 1200),
        Number(n.unitCostINR || 4200.0),
        JSON.stringify(n)
      );
    }
  }

  // 3. Seed Routes
  const routeCount = db.prepare('SELECT COUNT(*) as count FROM routes').get().count;
  if (routeCount === 0) {
    const insertRoute = db.prepare(`
      INSERT INTO routes (id, source_node_id, target_node_id, mode, transit_days, cost_per_unit_inr, reliability_pct, status, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of LOGISTICS_ROUTES) {
      insertRoute.run(
        String(r.id || ''),
        String(r.source || ''),
        String(r.target || ''),
        String(r.mode || 'Sea Freight'),
        Number(r.transitDays || 14),
        Number(r.costPerUnitINR || 500),
        Number(r.reliabilityPct || 95),
        String(r.status || 'ACTIVE'),
        JSON.stringify(r)
      );
    }
  }

  // 4. Seed Scenarios
  const scenarioCount = db.prepare('SELECT COUNT(*) as count FROM scenarios').get().count;
  if (scenarioCount === 0) {
    const insertScenario = db.prepare(`
      INSERT INTO scenarios (id, title, badge, description, affected_node_id, affected_node_name, event_type, severity_pct, duration_days, geographic_region, estimated_initial_loss_cr, ripple_summary, default_strategy_recommendation, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    for (const s of CRISIS_SCENARIOS) {
      insertScenario.run(
        String(s.id || ''),
        String(s.title || ''),
        String(s.badge || ''),
        String(s.description || ''),
        String(s.affectedNodeId || ''),
        String(s.affectedNodeName || ''),
        String(s.eventType || ''),
        Number(s.severityPct || 40),
        Number(s.durationDays || 30),
        String(s.geographicRegion || ''),
        Number(s.estimatedInitialLossCr || 15.0),
        String(s.rippleSummary || ''),
        String(s.defaultStrategyRecommendation || 'strat-speed-opt')
      );
    }
  }

  // 5. Seed Vulnerabilities
  const vulnCount = db.prepare('SELECT COUNT(*) as count FROM resilience_vulnerabilities').get().count;
  if (vulnCount === 0) {
    const insertVuln = db.prepare(`
      INSERT INTO resilience_vulnerabilities (id, title, category, severity, capex_investment_cr, avoided_disruption_loss_cr, net_benefit_cr, is_approved, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of STRUCTURAL_VULNERABILITIES) {
      insertVuln.run(
        String(v.id || ''),
        String(v.title || ''),
        String(v.category || ''),
        String(v.severity || ''),
        Number(v.capexInvestmentCr || 0),
        Number(v.avoidedDisruptionLossCr || 0),
        Number(v.netBenefitCr || 0),
        v.id === 'vuln-buffer-safety' ? 1 : 0,
        JSON.stringify(v)
      );
    }
  }
}

/**
 * ========================================================
 * Database Query & Mutation API Helpers
 * ========================================================
 */

// --- Users ---
export function dbGetUsers() {
  return db.prepare('SELECT * FROM users ORDER BY id ASC').all();
}

export function dbGetUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
}

export function dbGetUserByPersona(persona) {
  return db.prepare('SELECT * FROM users WHERE persona = ?').get(persona);
}

export function dbSaveUser(u) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, name, role, persona, avatar, quote, clearance, hero_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    u.id || `usr-${Date.now()}`,
    u.email,
    u.name || 'Enterprise Operator',
    u.role || 'Authorized Operator',
    u.persona || 'custom',
    u.avatar || null,
    u.quote || 'Authorized user connected to NEXUS Network.',
    u.clearance || 'Tier-1 Command',
    u.heroImage || null
  );
  return dbGetUserByEmail(u.email);
}


// --- Nodes & Network ---
export function dbGetNodes(filter = {}) {
  let query = 'SELECT * FROM nodes WHERE 1=1';
  const params = [];
  if (filter.type) {
    query += ' AND type = ?';
    params.push(filter.type);
  }
  if (filter.tier) {
    query += ' AND tier = ?';
    params.push(Number(filter.tier));
  }
  query += ' ORDER BY criticality DESC, name ASC';
  const rows = db.prepare(query).all(...params);
  return rows.map(r => r.raw_json ? JSON.parse(r.raw_json) : r);
}

export function dbGetNodeById(id) {
  const row = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
  if (!row) return null;
  return row.raw_json ? JSON.parse(row.raw_json) : row;
}

export function dbGetRoutes() {
  const rows = db.prepare('SELECT * FROM routes ORDER BY id ASC').all();
  return rows.map(r => r.raw_json ? JSON.parse(r.raw_json) : r);
}

// --- Scenarios ---
export function dbGetScenarios() {
  return db.prepare('SELECT * FROM scenarios ORDER BY is_custom ASC, id ASC').all();
}

export function dbGetScenarioById(id) {
  return db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id);
}

export function dbCreateScenario(sc) {
  const insert = db.prepare(`
    INSERT INTO scenarios (id, title, badge, description, affected_node_id, affected_node_name, event_type, severity_pct, duration_days, geographic_region, estimated_initial_loss_cr, ripple_summary, default_strategy_recommendation, is_custom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  insert.run(
    sc.id || `scenario-custom-${Date.now()}`,
    sc.title,
    sc.badge || 'Custom Scenario',
    sc.description || 'User-defined crisis simulation',
    sc.affectedNodeId,
    sc.affectedNodeName || 'Custom Supply Node',
    sc.eventType || 'Manual Disruption Injection',
    sc.severityPct || 40,
    sc.durationDays || 30,
    sc.geographicRegion || 'Global',
    sc.estimatedInitialLossCr || 15.0,
    sc.rippleSummary || 'Custom disruption propagation simulated.',
    sc.defaultStrategyRecommendation || 'strat-speed-opt'
  );
  return dbGetScenarioById(sc.id);
}

// --- Simulations Audit ---
export function dbSaveSimulation(sim) {
  const id = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const insert = db.prepare(`
    INSERT INTO simulations (id, affected_node_id, affected_node_name, severity_pct, duration_days, event_type, total_revenue_at_risk_cr, unassisted_recovery_days, inventory_depletion_days, affected_nodes_count, simulation_payload_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    id,
    sim.affectedNodeId || sim.affectedNode?.id || 'unknown',
    sim.affectedNode?.name || sim.affectedNodeName || 'Node',
    sim.severityPct || 40,
    sim.durationDays || 45,
    sim.eventType || 'Capacity Disruption',
    sim.metrics?.totalRevenueAtRiskCr || 18.7,
    sim.metrics?.unassistedRecoveryDays || 27,
    sim.metrics?.inventoryDepletionDays || 9,
    sim.affectedNodes?.length || 1,
    JSON.stringify(sim)
  );
  return { id, ...sim };
}

export function dbGetRecentSimulations(limit = 10) {
  return db.prepare('SELECT * FROM simulations ORDER BY simulated_at DESC LIMIT ?').all(limit);
}

// --- MOUs ---
export function dbSaveMOU(mou) {
  const id = mou.documentId || `MOU-${Date.now()}`;
  const insert = db.prepare(`
    INSERT INTO mous (id, supplier_id, supplier_name, title, total_contract_value_inr, estimated_savings_cr, clauses_json, financial_summary_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    id,
    mou.parties?.supplier?.id || mou.supplierId || 'sup-phoenix-semi',
    mou.parties?.supplier?.name || mou.supplierName || 'Phoenix Silicon',
    mou.title || 'MOU for Expedited Allocation',
    mou.financialSummary?.totalContractValueINR || 0,
    mou.financialSummary?.estimatedSavingsCr || 1.15,
    JSON.stringify(mou.clauses || []),
    JSON.stringify(mou.financialSummary || {}),
    mou.financialSummary?.status || 'EXECUTED & DIGITALLY VERIFIED'
  );
  return mou;
}

export function dbGetMOUs() {
  return db.prepare('SELECT * FROM mous ORDER BY created_at DESC').all();
}

// --- Executive Reports ---
export function dbSaveExecutiveReport(report) {
  const insert = db.prepare(`
    INSERT INTO executive_reports (id, scenario_title, affected_node, severity_pct, revenue_at_risk_cr, mitigation_status, report_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    report.reportId,
    report.crisisSummary?.scenarioTitle || 'Active Network Fracture',
    report.crisisSummary?.affectedNode || 'Taiwan Micro Foundry',
    report.crisisSummary?.severityPct || 40,
    report.crisisSummary?.unassistedExposureCr || 18.7,
    report.mitigationStatus?.status || 'PENDING',
    JSON.stringify(report)
  );
  return report;
}

export function dbGetExecutiveReports(limit = 10) {
  return db.prepare('SELECT * FROM executive_reports ORDER BY generated_at DESC LIMIT ?').all(limit);
}

// --- SOS Alerts ---
export function dbSaveSosAlert(alert) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO sos_alerts (id, disruption_type, severity, latitude, longitude, accuracy, node_id, node_name, timestamp, note, queued_at, status, sms_sid, sms_provider, recipient_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    alert.id || `sos-${Date.now()}`,
    alert.disruptionType || 'Unspecified Disruption',
    alert.severity || 'Critical',
    alert.coordinates?.latitude != null ? Number(alert.coordinates.latitude) : null,
    alert.coordinates?.longitude != null ? Number(alert.coordinates.longitude) : null,
    alert.coordinates?.accuracy != null ? Number(alert.coordinates.accuracy) : null,
    alert.nodeId || null,
    alert.nodeName || null,
    alert.timestamp || Date.now(),
    alert.note || null,
    alert.queuedAt || null,
    alert.status || 'SENT',
    alert.smsSid || null,
    alert.smsProvider || 'Twilio',
    alert.recipientPhone || null
  );
  return dbGetSosAlertById(alert.id);
}

export function dbGetSosAlertById(id) {
  return db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(id);
}

export function dbGetSosAlerts(limit = 25) {
  return db.prepare('SELECT * FROM sos_alerts ORDER BY created_at DESC LIMIT ?').all(limit);
}

// --- Database Metrics & Stats ---
export function dbGetStats() {
  return {
    usersCount: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    nodesCount: db.prepare('SELECT COUNT(*) as c FROM nodes').get().c,
    routesCount: db.prepare('SELECT COUNT(*) as c FROM routes').get().c,
    scenariosCount: db.prepare('SELECT COUNT(*) as c FROM scenarios').get().c,
    simulationsCount: db.prepare('SELECT COUNT(*) as c FROM simulations').get().c,
    mousCount: db.prepare('SELECT COUNT(*) as c FROM mous').get().c,
    reportsCount: db.prepare('SELECT COUNT(*) as c FROM executive_reports').get().c,
    sosAlertsCount: db.prepare('SELECT COUNT(*) as c FROM sos_alerts').get().c,
    databaseEngine: 'SQLite (Node 24 Built-in DatabaseSync)',
    dbPath
  };
}

export { db };
