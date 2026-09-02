import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandCenter } from './components/command-center/CommandCenter';
import { DigitalTwinView } from './components/digital-twin/DigitalTwinView';
import { FractureSimulator } from './components/fracture-mode/FractureSimulator';
import { RecoveryCockpit } from './components/recovery-cockpit/RecoveryCockpit';
import { NegotiationRoom } from './components/negotiation-room/NegotiationRoom';
import { CounterfactualView } from './components/counterfactual/CounterfactualView';
import { ResiliencePlanner } from './components/resilience-planner/ResiliencePlanner';
import { ExecutiveReportModal } from './components/executive-report/ExecutiveReportModal';
import { LoginPage } from './components/auth/LoginPage';
import { BackgroundAnimation } from './components/common/BackgroundAnimation';
import { DEMO_USERS } from './data/usersData';
import { NODES } from './data/auraSupplyChainData';

import { CRISIS_SCENARIOS } from './data/scenariosData';
import { simulateRippleEffect } from './engine/rippleSimulation';
import { calculateResilienceScore } from './engine/resilienceCalculator';
import { generateRecoveryStrategies } from './engine/recoveryOptimizer';
import { nexusApi } from './api/nexusApi';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_USERS[0];
  });

  const [activeTab, setActiveTab] = useState('command-center');
  const [activeScenario, setActiveScenario] = useState(CRISIS_SCENARIOS[0]);
  const [isDisrupted, setIsDisrupted] = useState(true); // Default to primary scenario active for immediate demonstration
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [activePersona, setActivePersona] = useState('exec');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // Check backend health on mount
  useEffect(() => {
    nexusApi.checkHealth().then(res => {
      setBackendOnline(res?.status === 'healthy');
    }).catch(() => setBackendOnline(false));
  }, []);

  // Run initial simulation for Taiwan Semiconductor 40% fracture
  const [simulationResult, setSimulationResult] = useState(() => {
    return simulateRippleEffect(
      CRISIS_SCENARIOS[0].affectedNodeId,
      CRISIS_SCENARIOS[0].severityPct,
      CRISIS_SCENARIOS[0].durationDays,
      CRISIS_SCENARIOS[0].eventType
    );
  });

  // Calculate composite resilience score
  const resilienceScore = calculateResilienceScore(activeStrategy, isDisrupted, simulationResult?.severityPct || 40);

  // Scenario launcher
  const handleSelectScenario = async (scenario) => {
    setActiveScenario(scenario);
    setIsDisrupted(true);
    setActiveStrategy(null);
    try {
      const result = await nexusApi.runSimulation(
        scenario.affectedNodeId,
        scenario.severityPct,
        scenario.durationDays,
        scenario.eventType
      );
      setSimulationResult(result);
    } catch {
      const fallbackResult = simulateRippleEffect(
        scenario.affectedNodeId,
        scenario.severityPct,
        scenario.durationDays,
        scenario.eventType
      );
      setSimulationResult(fallbackResult);
    }
  };

  // Custom simulation trigger
  const handleRunCustomSimulation = async (nodeId, severity = 45, duration = 30, eventType = 'Simulated Node Fracture', fractureType = 'capacity', activeContainmentIds = []) => {
    setIsDisrupted(true);
    setActiveStrategy(null);
    const targetNode = NODES.find(n => n.id === nodeId);
    const customScenario = {
      id: `fracture-${nodeId}`,
      title: `Fracture: ${targetNode ? targetNode.name.split('(')[0].trim() : nodeId}`,
      affectedNodeId: nodeId,
      severityPct: severity,
      durationDays: duration,
      eventType: eventType,
      fractureType: fractureType,
    };
    setActiveScenario(customScenario);
    try {
      const result = await nexusApi.runSimulation(nodeId, severity, duration, eventType, fractureType, activeContainmentIds);
      setSimulationResult(result);
    } catch {
      const fallbackResult = simulateRippleEffect(nodeId, severity, duration, eventType, fractureType, activeContainmentIds);
      setSimulationResult(fallbackResult);
    }
  };

  // Reset network to baseline nominal
  const handleResetNetwork = async (speak = true) => {
    setIsDisrupted(false);
    setActiveStrategy(null);
    setActiveScenario(null);
    if (speak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Simulation reset.");
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    try {
      const nominalResult = await nexusApi.runSimulation('sup-taiwan-semi', 0, 0, 'Nominal Baseline');
      setSimulationResult(nominalResult);
    } catch {
      const nominalResult = simulateRippleEffect('sup-taiwan-semi', 0, 0, 'Nominal Baseline');
      setSimulationResult(nominalResult);
    }
  };

  // Apply a recovery strategy
  const handleApplyStrategy = (strategy) => {
    setActiveStrategy(strategy);
  };

  // Handle Login Success
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActivePersona(user.persona || 'exec');
    setIsAuthenticated(true);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800 flex flex-col font-sans selection:bg-brand-500 selection:text-white relative">
      {/* Ambient Animated Mesh Background */}
      <BackgroundAnimation />

      {/* Top Navigation Header */}
      <Header
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        isDisrupted={isDisrupted}
        onResetNetwork={handleResetNetwork}
        activePersona={activePersona}
        onChangePersona={setActivePersona}
        onOpenReport={() => setIsReportOpen(true)}
        activeStrategy={activeStrategy}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onLogout={handleLogout}
        onNavigateToTab={setActiveTab}
        backendOnline={backendOnline}
      />

      {/* Main Body with Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDisrupted={isDisrupted}
          activeScenario={activeScenario}
          metrics={simulationResult?.metrics}
          resilienceScore={resilienceScore}
          activeStrategy={activeStrategy}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-[#f4f6fa]">
          {activeTab === 'command-center' && (
            <CommandCenter
              resilienceScore={resilienceScore}
              isDisrupted={isDisrupted}
              activeScenario={activeScenario}
              metrics={simulationResult?.metrics}
              activeStrategy={activeStrategy}
              onLaunchScenario={handleSelectScenario}
              onNavigateToTab={setActiveTab}
              onResetNetwork={handleResetNetwork}
            />
          )}

          {activeTab === 'digital-twin' && (
            <DigitalTwinView
              simulatedNodes={simulationResult?.simulatedNodes}
              simulatedRoutes={simulationResult?.simulatedRoutes}
              isDisrupted={isDisrupted}
              activeScenario={activeScenario}
              onTriggerDisruption={(nodeId) => {
                handleRunCustomSimulation(nodeId, 45, 30, 'Simulated Node Fracture');
                setActiveTab('fracture-mode');
              }}
            />
          )}

          {activeTab === 'fracture-mode' && (
            <FractureSimulator
              onRunSimulation={handleRunCustomSimulation}
              activeScenario={activeScenario}
              simulationResult={simulationResult}
              onNavigateToRecovery={() => setActiveTab('recovery-cockpit')}
              isDisrupted={isDisrupted}
              onResetNetwork={handleResetNetwork}
            />
          )}

          {activeTab === 'recovery-cockpit' && (
            <RecoveryCockpit
              simulationResult={simulationResult}
              activeStrategy={activeStrategy}
              onApplyStrategy={handleApplyStrategy}
              onNavigateToNegotiation={() => setActiveTab('negotiation-room')}
              onNavigateToCounterfactual={() => setActiveTab('counterfactual')}
            />
          )}

          {activeTab === 'negotiation-room' && (
            <NegotiationRoom
              onSignTermSheet={(neg) => {
                const strats = generateRecoveryStrategies(simulationResult);
                const strat = strats.find(s => s.id === 'strat-resilience-opt') || strats[0];
                handleApplyStrategy(strat);
              }}
            />
          )}

          {activeTab === 'counterfactual' && (
            <CounterfactualView
              simulationResult={simulationResult}
              onApplyStrategy={handleApplyStrategy}
              onNavigateToRecovery={() => setActiveTab('recovery-cockpit')}
            />
          )}

          {activeTab === 'resilience-planner' && (
            <ResiliencePlanner />
          )}
        </main>
      </div>

      {/* Executive Crisis Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        activeScenario={activeScenario}
        isDisrupted={isDisrupted}
        activeStrategy={activeStrategy}
        simulationResult={simulationResult}
        resilienceScore={resilienceScore}
      />
    </div>
  );
}
