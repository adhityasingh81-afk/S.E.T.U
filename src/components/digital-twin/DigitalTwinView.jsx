import React, { useState, useMemo, useEffect } from 'react';
import { 
  Network, 
  Map, 
  Search, 
  Filter, 
  Factory, 
  Truck, 
  Warehouse, 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  X, 
  ExternalLink,
  Shield,
  Clock,
  Layers,
  Zap,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Sparkles,
  MapPin,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  Navigation,
  Globe2
} from 'lucide-react';
import { feature } from 'topojson-client';
import { geoMercator, geoPath, geoGraticule10 } from 'd3-geo';
import worldAtlasData from 'world-atlas/countries-110m.json';
import { NODES, LOGISTICS_ROUTES } from '../../data/auraSupplyChainData';

export function DigitalTwinView({
  simulatedNodes,
  simulatedRoutes,
  isDisrupted,
  onTriggerDisruption,
  activeScenario
}) {
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'map' | 'cards'
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [dragStart, setDragStart] = useState({ clientX: 0, clientY: 0, panX: 0, panY: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  const handleMapMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDraggingMap(true);
    setHasDragged(false);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      panX: mapPan.x,
      panY: mapPan.y
    });
  };

  const handleMapMouseMove = (e) => {
    if (!isDraggingMap) return;
    const dx = e.clientX - dragStart.clientX;
    const dy = e.clientY - dragStart.clientY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setHasDragged(true);
    }
    setMapPan({
      x: dragStart.panX + dx,
      y: dragStart.panY + dy
    });
  };

  const handleMapMouseUp = () => {
    setIsDraggingMap(false);
  };

  const nodes = simulatedNodes || NODES;
  const routes = simulatedRoutes || LOGISTICS_ROUTES;

  // Selected Node state (defaults to currently disrupted node or active scenario or first node)
  const [selectedNodeId, setSelectedNodeId] = useState(
    () => nodes.find(n => n.simulatedStatus === 'disrupted')?.id || activeScenario?.affectedNodeId || 'sup-taiwan-semi'
  );

  // Auto-sync selected node if a new disruption is triggered
  useEffect(() => {
    const currentDisrupted = nodes.find(n => n.simulatedStatus === 'disrupted');
    if (currentDisrupted) {
      setSelectedNodeId(currentDisrupted.id);
    }
  }, [nodes]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Toggle selection helper: clicking the same selected node deselects it
  const handleToggleNodeSelect = (nodeId) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
  };

  // Cartographic world geography from Natural Earth
  const landData = useMemo(() => feature(worldAtlasData, worldAtlasData.objects.land), []);
  const countriesData = useMemo(() => feature(worldAtlasData, worldAtlasData.objects.countries).features, []);
  const graticuleData = useMemo(() => geoGraticule10(), []);

  // Standard Mercator projection calibrated for global supply chain viewport (1000 x 500)
  const geoProjection = useMemo(() => {
    return geoMercator()
      .scale(132)
      .center([10, 20])
      .translate([500, 245]);
  }, []);

  const geoPathGenerator = useMemo(() => geoPath(geoProjection), [geoProjection]);

  // Accurate Projection conversion for World Map
  const projectGeoToSVG = (lat, lng) => {
    const coords = geoProjection([lng, lat]);
    if (!coords) return { x: 500, y: 250 };
    return { x: coords[0], y: coords[1] };
  };

  // Topological Layout for Graph View (1050 x 580 coordinate space)
  const graphLayout = useMemo(() => {
    const nodePositions = {};

    const tier1 = nodes.filter(n => n.type === 'supplier' && n.tier === 1);
    const tier2 = nodes.filter(n => n.type === 'supplier' && n.tier === 2);
    const suppliers = [...tier1, ...tier2];
    const factories = nodes.filter(n => n.type === 'factory');
    const warehouses = nodes.filter(n => n.type === 'warehouse');
    const customers = nodes.filter(n => n.type === 'customer');

    // Column 1: Suppliers (x: 100)
    suppliers.forEach((n, i) => {
      nodePositions[n.id] = {
        x: 100,
        y: 45 + i * 65,
        data: n
      };
    });

    // Column 2: Factories (x: 380)
    factories.forEach((n, i) => {
      nodePositions[n.id] = {
        x: 380,
        y: 110 + i * 150,
        data: n
      };
    });

    // Column 3: Regional Warehouses (x: 660)
    warehouses.forEach((n, i) => {
      nodePositions[n.id] = {
        x: 660,
        y: 80 + i * 120,
        data: n
      };
    });

    // Column 4: Enterprise Customers (x: 920)
    customers.forEach((n, i) => {
      nodePositions[n.id] = {
        x: 920,
        y: 50 + i * 90,
        data: n
      };
    });

    return nodePositions;
  }, [nodes]);

  // Generate connection links based on node dependencies for Graph
  const graphLinks = useMemo(() => {
    const calculatedLinks = [];

    nodes.forEach(targetNode => {
      if (targetNode.dependencies && targetNode.dependencies.length > 0) {
        targetNode.dependencies.forEach(sourceId => {
          if (graphLayout[sourceId] && graphLayout[targetNode.id]) {
            const isSourceDisrupted = graphLayout[sourceId].data.simulatedStatus === 'disrupted';
            const isTargetImpaired = targetNode.simulatedStatus === 'impaired' || targetNode.simulatedStatus === 'at-risk';

            calculatedLinks.push({
              id: `${sourceId}->${targetNode.id}`,
              source: graphLayout[sourceId],
              target: graphLayout[targetNode.id],
              sourceId,
              targetId: targetNode.id,
              isDisrupted: isSourceDisrupted,
              isImpaired: isTargetImpaired,
            });
          }
        });
      }
    });

    return calculatedLinks;
  }, [nodes, graphLayout]);

  // Generate Geographic SVG Corridors for Map
  const mapCorridors = useMemo(() => {
    const corridors = [];

    routes.forEach(route => {
      const fromNode = nodes.find(n => n.id === (route.from || route.origin));
      const toNode = nodes.find(n => n.id === (route.to || route.destination));

      if (fromNode && toNode) {
        const fromPos = projectGeoToSVG(fromNode.lat, fromNode.lng);
        const toPos = projectGeoToSVG(toNode.lat, toNode.lng);

        // Great circle bezier control point
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const cx = (fromPos.x + toPos.x) / 2 - dy * 0.12;
        const cy = (fromPos.y + toPos.y) / 2 - Math.min(50, Math.max(15, dist * 0.15));

        const pathD = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;
        const originDisrupted = fromNode.simulatedStatus === 'disrupted';
        const destDisrupted = toNode.simulatedStatus === 'disrupted';

        corridors.push({
          id: route.id,
          name: route.name,
          mode: route.mode,
          transitDays: route.transitTimeDays || route.transitDays,
          isDisrupted: route.isDisrupted || route.simulatedStatus === 'congested' || originDisrupted || destDisrupted,
          pathD,
          fromPos,
          toPos,
          fromNode,
          toNode
        });
      }
    });

    return corridors;
  }, [nodes, routes, geoProjection]);

  const filteredNodes = nodes.filter(node => {
    const matchesType = selectedTypeFilter === 'all' || node.type === selectedTypeFilter;
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getNodeTypeMeta = (type) => {
    switch (type) {
      case 'supplier':
        return { label: 'Supplier', icon: Factory, color: 'text-brand-600 bg-orange-50 border-orange-200' };
      case 'factory':
        return { label: 'Assembly Plant', icon: Layers, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'warehouse':
        return { label: 'Distribution Hub', icon: Warehouse, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'customer':
        return { label: 'Enterprise Client', icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      default:
        return { label: 'Node', icon: Building2, color: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
  };

  const activeHighlightedId = selectedNode?.id || hoveredNode?.id;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Top Filter Bar */}
      <div className="extej-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 text-brand-600">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-sans">
              Supply Chain Digital Twin
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
                {nodes.length} Connected Hubs
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Interactive topological dependency network & global logistics corridors
            </p>
          </div>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search hubs, components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#f8fafc] border border-slate-200 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 w-44 shadow-inner"
            />
          </div>

          {/* Node Filter */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-1 text-xs font-bold text-slate-600">
            {['all', 'supplier', 'factory', 'warehouse', 'customer'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-3 py-1 rounded-full capitalize transition-all cursor-pointer ${
                  selectedTypeFilter === type ? 'btn-orange-pill text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                {type === 'all' ? 'All Hubs' : type === 'factory' ? 'Factories' : type + 's'}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-1 text-xs font-bold">
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'graph' ? 'btn-orange-pill text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Graph</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'map' ? 'btn-orange-pill text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>World Map</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'cards' ? 'btn-orange-pill text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Card Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Canvas */}
        <div className="lg:col-span-8">
          <div className="extej-card p-5 min-h-[620px] relative overflow-hidden bg-white border border-slate-200 flex flex-col justify-between">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>

            {/* ================= VIEW 1: TOPOLOGICAL INTERACTIVE GRAPH ================= */}
            {viewMode === 'graph' && (
              <div className="relative z-10 space-y-3 flex-1 flex flex-col">
                {/* Column Headers */}
                <div className="grid grid-cols-4 text-center font-extrabold uppercase text-[10px] tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                  <div className="text-left pl-2 text-brand-600">1. Suppliers (Tier 1/2)</div>
                  <div className="text-purple-600">2. Assembly Plants</div>
                  <div className="text-amber-600">3. Regional Warehouses</div>
                  <div className="text-right pr-2 text-emerald-600">4. Enterprise Clients</div>
                </div>

                {/* SVG Interactive Canvas */}
                <div className="w-full h-[530px] overflow-auto relative rounded-2xl bg-[#fafbfc] border border-slate-200/80 shadow-inner">
                  <svg 
                    className="w-full h-full min-w-[950px] min-h-[520px]" 
                    viewBox="0 0 1020 540"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.2s ease-out' }}
                  >
                    {/* Connection links */}
                    {graphLinks.map((link) => {
                      const sx = link.source.x + 65;
                      const sy = link.source.y;
                      const tx = link.target.x - 65;
                      const ty = link.target.y;
                      const mx = (sx + tx) / 2;

                      const isLinkActive = activeHighlightedId === link.sourceId || activeHighlightedId === link.targetId;
                      const pathD = `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`;

                      return (
                        <g key={link.id}>
                          {isLinkActive && (
                            <path
                              d={pathD}
                              fill="none"
                              stroke={link.isDisrupted ? "#f43f5e" : "#ff7a1a"}
                              strokeWidth="5"
                              opacity="0.25"
                            />
                          )}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={link.isDisrupted ? "#f43f5e" : isLinkActive ? "#ff6b00" : "#cbd5e1"}
                            strokeWidth={link.isDisrupted ? "3" : isLinkActive ? "2.5" : "1.5"}
                            className={link.isDisrupted ? "animated-edge-disrupted-smooth" : isLinkActive ? "animated-edge-smooth" : ""}
                          />
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {Object.entries(graphLayout).map(([nodeId, pos]) => {
                      const node = pos.data;
                      const isNodeDisrupted = node.simulatedStatus === 'disrupted';
                      const isNodeImpaired = node.simulatedStatus === 'impaired';
                      const isNodeSelected = selectedNode?.id === nodeId;
                      const isNodeHovered = hoveredNode?.id === nodeId;
                      const isConnectedToActive = activeHighlightedId && (
                        node.dependencies?.includes(activeHighlightedId) ||
                        nodes.find(n => n.id === activeHighlightedId)?.dependencies?.includes(nodeId)
                      );

                      const pillColor = isNodeDisrupted 
                        ? '#f43f5e' 
                        : node.type === 'supplier' 
                        ? '#ff6b00' 
                        : node.type === 'factory' 
                        ? '#8b5cf6' 
                        : node.type === 'warehouse' 
                        ? '#f59e0b' 
                        : '#10b981';

                      return (
                        <g
                          key={nodeId}
                          transform={`translate(${pos.x}, ${pos.y})`}
                          className="cursor-pointer select-none"
                          onClick={() => handleToggleNodeSelect(nodeId)}
                          onMouseEnter={() => setHoveredNode(node)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          {/* Pulse halo if disrupted */}
                          {isNodeDisrupted && (
                            <rect
                              x="-68"
                              y="-24"
                              width="136"
                              height="48"
                              rx="14"
                              fill="rgba(244,63,94,0.25)"
                              className="animate-pulse"
                            />
                          )}

                          {/* Node Card */}
                          <rect
                            x="-65"
                            y="-22"
                            width="130"
                            height="44"
                            rx="12"
                            fill={isNodeSelected ? "#fff7ed" : "#ffffff"}
                            stroke={isNodeSelected ? "#ff6b00" : isNodeDisrupted ? "#f43f5e" : isNodeImpaired ? "#f59e0b" : isConnectedToActive ? "#ff6b00" : "#e2e8f0"}
                            strokeWidth={isNodeSelected ? "2.5" : isNodeDisrupted ? "2" : isConnectedToActive ? "2" : "1.2"}
                            filter="drop-shadow(0 4px 10px rgba(0,0,0,0.03))"
                            className="transition-all"
                          />

                          {/* Color bar */}
                          <rect
                            x="-65"
                            y="-22"
                            width="5"
                            height="44"
                            rx="2"
                            fill={pillColor}
                          />

                          {/* Text */}
                          <text
                            x="-52"
                            y="-5"
                            fill="#0f172a"
                            fontSize="10.5"
                            fontWeight="800"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                          >
                            {node.name.split('(')[0].slice(0, 14)}
                          </text>

                          <text
                            x="-52"
                            y="11"
                            fill="#64748b"
                            fontSize="9"
                            fontWeight="600"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                          >
                            {isNodeDisrupted ? '⚠️ FRACTURED' : isNodeImpaired ? '⚡ IMPAIRED' : node.region || 'Active'}
                          </text>

                          <circle
                            cx="52"
                            cy="0"
                            r="4"
                            fill={isNodeDisrupted ? "#f43f5e" : isNodeImpaired ? "#f59e0b" : "#10b981"}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Zoom buttons */}
                  <div className="absolute top-3 right-3 bg-white/90 border border-slate-200 p-1 rounded-xl shadow-sm flex items-center gap-1 backdrop-blur-sm">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Reset Zoom"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= VIEW 2: ACCURATE GEOGRAPHIC WORLD MAP ================= */}
            {viewMode === 'map' && (
              <div className="relative z-10 space-y-3 flex-1 flex flex-col">
                <div className="text-xs text-slate-500 font-semibold flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-brand-500" />
                    <span className="text-slate-800 font-bold">Global Multi-Modal Logistics Corridors</span>
                  </div>
                  <span className="text-brand-600 font-mono text-[11px] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                    4 Continents • 10 Active Corridors
                  </span>
                </div>

                {/* Real Continental Map Stage */}
                <div 
                  className="w-full h-[530px] overflow-hidden relative rounded-2xl bg-[#eef4fb] border border-slate-200/90 shadow-inner flex items-center justify-center select-none"
                  onMouseDown={handleMapMouseDown}
                  onMouseMove={handleMapMouseMove}
                  onMouseUp={handleMapMouseUp}
                  onMouseLeave={handleMapMouseUp}
                  style={{ cursor: isDraggingMap ? 'grabbing' : 'grab' }}
                >
                  <svg 
                    className="w-full h-full" 
                    viewBox="0 0 1000 500"
                  >
                    <defs>
                      {/* Ocean Graticule Lines */}
                      <pattern id="mapGridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#dbe7f5" strokeWidth="0.8" />
                      </pattern>

                      {/* Corridor Gradients */}
                      <linearGradient id="normalCorridorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff7a1a" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="disruptedCorridorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>

                    {/* Ocean Grid Background */}
                    <rect width="1000" height="500" fill="#f0f6fc" />
                    <rect width="1000" height="500" fill="url(#mapGridPattern)" opacity="0.6" />

                    {/* TRANSFORMABLE MAP WORLD LAYER */}
                    <g 
                      transform={`translate(${mapPan.x}, ${mapPan.y}) scale(${mapZoom})`}
                      style={{ transformOrigin: '500px 250px', transition: isDraggingMap ? 'none' : 'transform 0.2s ease-out' }}
                    >
                      {/* Graticule Lines (Latitude & Longitude Grid) */}
                      <path 
                        d={geoPathGenerator(graticuleData)} 
                        fill="none" 
                        stroke="#dbe8f5" 
                        strokeWidth="0.75" 
                        strokeDasharray="2 4" 
                      />

                      {/* Equator & Meridians Reference */}
                      <line x1="0" y1="245" x2="1000" y2="245" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="0.8" opacity="0.6" />

                      {/* RENDER ACCURATE REAL-WORLD CONTINENTAL LANDMASSES */}
                      <path
                        d={geoPathGenerator(landData)}
                        fill="#dce7f3"
                        stroke="#b6cde3"
                        strokeWidth="1.1"
                        className="transition-all duration-300"
                      />

                      {/* RENDER DETAILED REAL COUNTRY BOUNDARIES */}
                      <g fill="none" stroke="#cbdde8" strokeWidth="0.65" opacity="0.8">
                        {countriesData.map((country, idx) => (
                          <path key={country.id || idx} d={geoPathGenerator(country)} />
                        ))}
                      </g>

                      {/* RENDER DYNAMIC TRADE CORRIDORS (Great Circle Curved Beziers) */}
                      {mapCorridors.map((corridor) => (
                        <g key={corridor.id}>
                          {/* Glow halo behind corridor */}
                          <path
                            d={corridor.pathD}
                            fill="none"
                            stroke={corridor.isDisrupted ? "#f43f5e" : "#ff7a1a"}
                            strokeWidth={corridor.isDisrupted ? "6" : "4"}
                            opacity="0.25"
                          />
                          {/* Main animated corridor */}
                          <path
                            d={corridor.pathD}
                            fill="none"
                            stroke={corridor.isDisrupted ? "#f43f5e" : "#0284c7"}
                            strokeWidth={corridor.isDisrupted ? "3" : "2.2"}
                            className={corridor.isDisrupted ? "animated-edge-disrupted-smooth" : "animated-edge-smooth"}
                          />
                        </g>
                      ))}

                      {/* RENDER ALL GEOGRAPHIC SUPPLY CHAIN HUB NODES */}
                      {filteredNodes.map((node) => {
                        const pos = projectGeoToSVG(node.lat, node.lng);
                        const isDisruptedNode = node.simulatedStatus === 'disrupted';
                        const isImpairedNode = node.simulatedStatus === 'impaired';
                        const isSelected = selectedNode?.id === node.id;
                        const isHovered = hoveredNode?.id === node.id;

                        const nodeColor = isDisruptedNode 
                          ? '#f43f5e' 
                          : node.type === 'supplier' 
                          ? '#ff6b00' 
                          : node.type === 'factory' 
                          ? '#8b5cf6' 
                          : node.type === 'warehouse' 
                          ? '#f59e0b' 
                          : '#10b981';

                        return (
                          <g
                            key={node.id}
                            transform={`translate(${pos.x}, ${pos.y})`}
                            className="cursor-pointer select-none group"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!hasDragged) {
                                handleToggleNodeSelect(node.id);
                              }
                            }}
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                          >
                            {/* Counter-scale node elements so node size stays fixed regardless of zoom */}
                            <g transform={`scale(${1 / mapZoom})`} style={{ transition: isDraggingMap ? 'none' : 'transform 0.2s ease-out' }}>
                              {/* Ping Animation on Disrupted Node */}
                              {isDisruptedNode && (
                                <circle cx="0" cy="0" r="16" fill="rgba(244,63,94,0.3)" className="animate-ping" />
                              )}

                              {/* Outer halo */}
                              <circle
                                cx="0"
                                cy="0"
                                r={isSelected ? "11" : isHovered ? "9" : "6.5"}
                                fill={nodeColor}
                                stroke="#ffffff"
                                strokeWidth={isSelected ? "3" : "2"}
                                className="transition-all shadow-md"
                              />

                              {/* Clean Node Label Pill (Avoid overlapping by offsetting based on latitude) */}
                              <g transform={`translate(${node.lng > 0 ? 10 : -90}, ${node.lat > 30 ? -12 : 14})`}>
                                <rect
                                  x="0"
                                  y="-8"
                                  width={Math.min(node.name.split('(')[0].length * 6.8 + 12, 110)}
                                  height="17"
                                  rx="5"
                                  fill="rgba(255, 255, 255, 0.92)"
                                  stroke={isSelected ? "#ff6b00" : isDisruptedNode ? "#f43f5e" : "#cbd5e1"}
                                  strokeWidth={isSelected ? "1.5" : "0.8"}
                                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                                />
                                <text
                                  x="5"
                                  y="4"
                                  fill="#0f172a"
                                  fontSize="8.5"
                                  fontWeight="700"
                                  fontFamily="Plus Jakarta Sans, sans-serif"
                                >
                                  {node.name.split('(')[0].slice(0, 13)}
                                </text>
                              </g>
                            </g>
                          </g>
                        );
                      })}
                    </g>
                  </svg>

                  {/* Map Zoom Controls */}
                  <div className="absolute top-3 right-3 bg-white/95 border border-slate-200 p-1.5 rounded-2xl shadow-md flex items-center gap-1 backdrop-blur-sm z-20">
                    <button
                      onClick={() => setMapZoom(prev => Math.min(prev + 0.25, 2.5))}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Zoom In Map"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMapZoom(prev => Math.max(prev - 0.25, 0.75))}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Zoom Out Map"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setMapZoom(1);
                        setMapPan({ x: 0, y: 0 });
                      }}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Reset Map View"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Map Status Legend */}
                  <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-200 px-3.5 py-2.5 rounded-2xl text-[11px] text-slate-700 shadow-md space-y-1.5 backdrop-blur-sm z-20">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Globe2 className="w-3.5 h-3.5 text-brand-500" />
                      Live Maritime & Air Corridors
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Suppliers
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Factories
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Gateways
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Clients
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= VIEW 3: CARD GRID VIEW ================= */}
            {viewMode === 'cards' && (
              <div className="relative z-10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredNodes.map(node => (
                    <NodeCard 
                      key={node.id} 
                      node={node} 
                      isSelected={selectedNode?.id === node.id}
                      onClick={() => handleToggleNodeSelect(node.id)} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Node Telemetry Inspector */}
        <div className="lg:col-span-4 extej-card p-6 space-y-5 animate-fade-in-up">
          {selectedNode ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getNodeTypeMeta(selectedNode.type).color}`}>
                      {getNodeTypeMeta(selectedNode.type).label}
                    </span>
                    {selectedNode.tier && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Tier {selectedNode.tier}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 font-sans mt-1">
                    {selectedNode.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    {selectedNode.location}
                  </p>
                </div>

                {/* Deselect Button */}
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Deselect node"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Health & Status Barometer */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Node Status:</span>
                  <span className={`font-bold uppercase tracking-wider ${
                    selectedNode.simulatedStatus === 'disrupted' 
                      ? 'text-rose-600' 
                      : selectedNode.simulatedStatus === 'impaired' 
                      ? 'text-amber-600' 
                      : 'text-emerald-600'
                  }`}>
                    {selectedNode.simulatedStatus || 'Operational'}
                  </span>
                </div>
                {selectedNode.impactNote && (
                  <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200/60 font-medium">
                    "{selectedNode.impactNote}"
                  </p>
                )}
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {selectedNode.capacityUnitsPerMonth && (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block font-semibold">Monthly Capacity</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedNode.capacityUnitsPerMonth.toLocaleString()} Units</span>
                  </div>
                )}
                {selectedNode.leadTimeDays && (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block font-semibold">Lead Time</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedNode.leadTimeDays} Days</span>
                  </div>
                )}
                {selectedNode.unitCostINR && (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block font-semibold">Unit Baseline Cost</span>
                    <span className="font-bold text-slate-900 font-mono">₹{selectedNode.unitCostINR.toLocaleString()}</span>
                  </div>
                )}
                {selectedNode.reliabilityScore && (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block font-semibold">Reliability Score</span>
                    <span className="font-bold text-emerald-600 font-mono">{selectedNode.reliabilityScore}%</span>
                  </div>
                )}
                {selectedNode.inventoryRunwayDays && (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block font-semibold">Inventory Runway</span>
                    <span className="font-bold text-amber-600 font-mono">{selectedNode.inventoryRunwayDays} Days</span>
                  </div>
                )}
                {selectedNode.monthlyContractINR && (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block font-semibold">Contract Value</span>
                    <span className="font-bold text-brand-600 font-mono">{selectedNode.monthlyContractINR}</span>
                  </div>
                )}
              </div>

              {/* Direct Simulation Action */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Direct Fracture Action
                </span>
                <button
                  onClick={() => onTriggerDisruption(selectedNode.id)}
                  className="w-full btn-orange-pill py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Simulate Fracture on {selectedNode.name.split('(')[0]}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Global Network Telemetry Overview (When Deselected) */
            <div className="space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-brand-50 text-brand-700 border-brand-200">
                    Topology Overview
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-sans mt-1">
                  Global Supply Chain Mesh
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {nodes.length} Operational Hubs & Interconnected Routes
                </p>
              </div>

              {/* Overall Network State */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Network State:</span>
                  <span className={`font-bold uppercase tracking-wider ${
                    isDisrupted ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {isDisrupted ? 'Disruption Active' : 'All Hubs Nominal'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  {isDisrupted 
                    ? (activeScenario?.description || 'Active shock simulation in progress.')
                    : 'All primary semiconductors, substrates, PCB plants, and assembly corridors are operational.'}
                </p>
              </div>

              {/* Hub Summary Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] block font-semibold">Tier-1 Suppliers</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {nodes.filter(n => n.type === 'supplier' && n.tier === 1).length} Hubs
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] block font-semibold">Tier-2 Suppliers</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {nodes.filter(n => n.type === 'supplier' && n.tier === 2).length} Hubs
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] block font-semibold">Assembly Plants</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {nodes.filter(n => n.type === 'factory').length} Facilities
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                  <span className="text-slate-400 text-[10px] block font-semibold">Distribution Hubs</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {nodes.filter(n => n.type === 'warehouse').length} Gateways
                  </span>
                </div>
              </div>

              {/* Interactive Inspector Hint */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/60 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Node Inspector</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Click on any node in the graph, map, or card list to inspect its capacity, cost, and reliability metrics. Click it again to deselect.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NodeCard({ node, isSelected, onClick }) {
  const isDisrupted = node.simulatedStatus === 'disrupted';
  const isImpaired = node.simulatedStatus === 'impaired';

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
        isSelected
          ? 'bg-orange-50/50 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
          : isDisrupted
          ? 'bg-rose-50 border-rose-300 hover:border-rose-400'
          : isImpaired
          ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
          : 'bg-[#fcfdfd] border-slate-200 hover:border-brand-400 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-bold text-slate-800 truncate font-sans">
          {node.name.split('(')[0]}
        </span>
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
          isDisrupted ? 'bg-rose-500 animate-ping' : isImpaired ? 'bg-amber-500' : 'bg-emerald-500'
        }`}></span>
      </div>

      <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{node.category}</p>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5 text-slate-400" />
          {node.region}
        </span>
        <span className="font-mono font-bold text-slate-700">
          {node.capacityUnitsPerMonth ? `${Math.round(node.capacityUnitsPerMonth / 1000)}k/mo` : node.monthlyContractINR || 'Active'}
        </span>
      </div>
    </div>
  );
}
