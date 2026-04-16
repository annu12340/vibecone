import { useState, useRef, useCallback, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { X, ZoomIn, ZoomOut, Maximize2, Info, GitBranch, Scale, ArrowRight } from "lucide-react";

/**
 * PrecedentTreeModal - Force-directed graph visualization for legal precedent family trees
 * Shows how cases cite, overturn, and influence each other
 */

// Relationship type colors
const RELATIONSHIP_COLORS = {
  cites: "#64748b",        // slate - normal citation
  influenced_by: "#C5A059", // gold - influence relationship
  overturned_by: "#dc2626", // red - overturned
};

// Node colors based on type
const NODE_COLORS = {
  landmark: "#C5A059",     // gold for landmark cases
  current: "#0B192C",      // navy for current case context
  normal: "#475569",       // slate for normal cases
  overturned: "#ef4444",   // red for overturned cases
};

function buildGraphData(precedentCases, currentCaseTitle) {
  if (!precedentCases || precedentCases.length === 0) {
    return { nodes: [], links: [] };
  }

  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  // Add current case as the central node
  const currentNode = {
    id: "current_case",
    name: currentCaseTitle || "Current Case",
    court: "Under Analysis",
    year: new Date().getFullYear(),
    outcome: "Pending analysis",
    relevance: "The case currently being analyzed",
    importance_score: 100,
    is_landmark: false,
    is_current: true,
    isOverturned: false,
  };
  nodes.push(currentNode);
  nodeMap.set("current_case", currentNode);

  // Process all precedent cases
  precedentCases.forEach((c, index) => {
    const nodeId = c.id || `case_${index}`;
    const isOverturned = c.overturned_by !== null && c.overturned_by !== undefined;
    
    const node = {
      id: nodeId,
      name: c.case_name || `Case ${index + 1}`,
      court: c.court || "Unknown Court",
      year: c.year || "N/A",
      outcome: c.outcome || "Outcome not specified",
      relevance: c.relevance || "",
      importance_score: c.importance_score || 50,
      is_landmark: c.is_landmark || false,
      is_current: false,
      isOverturned,
      cites: c.cites || [],
      influenced_by: c.influenced_by || [],
      overturned_by: c.overturned_by || null,
    };
    
    nodes.push(node);
    nodeMap.set(nodeId, node);
  });

  // Create links between cases
  precedentCases.forEach((c, index) => {
    const sourceId = c.id || `case_${index}`;
    
    // Citation links (this case cites other cases)
    if (c.cites && Array.isArray(c.cites)) {
      c.cites.forEach(targetId => {
        if (nodeMap.has(targetId)) {
          links.push({
            source: sourceId,
            target: targetId,
            type: "cites",
            label: "cites",
          });
        }
      });
    }

    // Influence links (this case was influenced by other cases)
    if (c.influenced_by && Array.isArray(c.influenced_by)) {
      c.influenced_by.forEach(targetId => {
        if (nodeMap.has(targetId)) {
          links.push({
            source: targetId,
            target: sourceId,
            type: "influenced_by",
            label: "influenced",
          });
        }
      });
    }

    // Overturned links
    if (c.overturned_by && nodeMap.has(c.overturned_by)) {
      links.push({
        source: c.overturned_by,
        target: sourceId,
        type: "overturned_by",
        label: "overturned",
      });
    }

    // Connect all precedent cases to current case (they're all relevant)
    links.push({
      source: sourceId,
      target: "current_case",
      type: "cites",
      label: "precedent for",
    });
  });

  return { nodes, links };
}

function NodeTooltip({ node, position }) {
  if (!node) return null;

  return (
    <div
      className="absolute z-50 bg-white border-2 border-slate-200 shadow-xl p-4 max-w-xs pointer-events-none"
      style={{
        left: position.x + 15,
        top: position.y + 15,
        transform: "translate(0, -50%)",
      }}
    >
      {/* Color bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ 
          backgroundColor: node.is_current 
            ? NODE_COLORS.current 
            : node.is_landmark 
              ? NODE_COLORS.landmark 
              : node.isOverturned 
                ? NODE_COLORS.overturned 
                : NODE_COLORS.normal 
        }}
      />
      
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Scale className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-playfair font-semibold text-slate-900 text-sm leading-tight">
              {node.name}
            </p>
            <p className="text-xs text-slate-500">{node.court} — {node.year}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{node.outcome}</p>

        {node.relevance && (
          <p className="text-xs text-slate-500 italic border-l-2 border-[#C5A059] pl-2">
            {node.relevance}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          {node.is_current && (
            <span className="text-xs px-2 py-0.5 bg-[#0B192C] text-white">Current Case</span>
          )}
          {node.is_landmark && (
            <span className="text-xs px-2 py-0.5 bg-[#C5A059] text-white">Landmark</span>
          )}
          {node.isOverturned && (
            <span className="text-xs px-2 py-0.5 bg-red-500 text-white">Overturned</span>
          )}
          <span className="text-xs text-slate-400 ml-auto">
            Importance: {node.importance_score || 50}/100
          </span>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white/95 border border-slate-200 p-4 text-xs space-y-3 z-10">
      <p className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">Legend</p>
      
      {/* Node types */}
      <div className="space-y-1.5">
        <p className="text-slate-400 uppercase tracking-wider text-[9px]">Case Types</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2" style={{ backgroundColor: NODE_COLORS.current, borderColor: NODE_COLORS.current }} />
          <span className="text-slate-600">Current Case</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2" style={{ backgroundColor: NODE_COLORS.landmark, borderColor: NODE_COLORS.landmark }} />
          <span className="text-slate-600">Landmark Case</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2" style={{ backgroundColor: NODE_COLORS.normal, borderColor: NODE_COLORS.normal }} />
          <span className="text-slate-600">Precedent Case</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2" style={{ backgroundColor: NODE_COLORS.overturned, borderColor: NODE_COLORS.overturned }} />
          <span className="text-slate-600">Overturned Case</span>
        </div>
      </div>

      {/* Link types */}
      <div className="space-y-1.5">
        <p className="text-slate-400 uppercase tracking-wider text-[9px]">Relationships</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5" style={{ backgroundColor: RELATIONSHIP_COLORS.cites }} />
          <span className="text-slate-600">Citation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5" style={{ backgroundColor: RELATIONSHIP_COLORS.influenced_by, opacity: 0.8 }} />
          <span className="text-slate-600">Influence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5" style={{ backgroundColor: RELATIONSHIP_COLORS.overturned_by }} />
          <span className="text-slate-600">Overturned</span>
        </div>
      </div>

      {/* Size note */}
      <p className="text-slate-400 pt-1 border-t border-slate-100">
        Node size = Importance score
      </p>
    </div>
  );
}

function SelectedCasePanel({ node, onClose }) {
  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-white border-2 border-slate-200 shadow-xl z-10">
      {/* Header bar */}
      <div 
        className="h-1.5 w-full"
        style={{ 
          backgroundColor: node.is_current 
            ? NODE_COLORS.current 
            : node.is_landmark 
              ? NODE_COLORS.landmark 
              : node.isOverturned 
                ? NODE_COLORS.overturned 
                : NODE_COLORS.normal 
        }}
      />
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-playfair font-semibold text-slate-900 text-base leading-tight">
              {node.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{node.court}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200">
            {node.year}
          </span>
          {node.is_current && (
            <span className="text-xs px-2 py-1 bg-[#0B192C] text-white">Current Case</span>
          )}
          {node.is_landmark && (
            <span className="text-xs px-2 py-1 bg-[#C5A059] text-white">Landmark</span>
          )}
          {node.isOverturned && (
            <span className="text-xs px-2 py-1 bg-red-500 text-white">Overturned</span>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Outcome</p>
          <p className="text-sm text-slate-700 leading-relaxed">{node.outcome}</p>
        </div>

        {node.relevance && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Relevance to Your Case</p>
            <p className="text-sm text-slate-600 italic border-l-2 border-[#C5A059] pl-2">
              {node.relevance}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Importance Score</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-slate-100">
                <div 
                  className="h-full bg-[#C5A059]" 
                  style={{ width: `${node.importance_score || 50}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-700">{node.importance_score || 50}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrecedentTreeModal({ isOpen, onClose, precedentCases, currentCaseTitle }) {
  const graphRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Build graph data from precedent cases
  const graphData = buildGraphData(precedentCases, currentCaseTitle);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Center graph when opened
  useEffect(() => {
    if (isOpen && graphRef.current) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [isOpen]);

  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoom(1.5, 400);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoom(0.67, 400);
    }
  }, []);

  const handleFit = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  }, []);

  const handleNodeHover = useCallback((node, event) => {
    setHoveredNode(node);
    if (node && event) {
      setTooltipPos({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  // Custom node rendering
  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.name?.split(" v.")[0] || node.name || "Case";
    const fontSize = Math.max(10, 12 / globalScale);
    ctx.font = `${fontSize}px IBM Plex Sans, sans-serif`;
    
    // Determine node color and size
    let nodeColor = NODE_COLORS.normal;
    if (node.is_current) {
      nodeColor = NODE_COLORS.current;
    } else if (node.is_landmark) {
      nodeColor = NODE_COLORS.landmark;
    } else if (node.isOverturned) {
      nodeColor = NODE_COLORS.overturned;
    }

    // Size based on importance score (min 5, max 15)
    const baseSize = 5 + ((node.importance_score || 50) / 100) * 10;
    const nodeSize = node.is_current ? baseSize + 3 : baseSize;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    // Add border for landmark/current cases
    if (node.is_landmark || node.is_current) {
      ctx.strokeStyle = "#C5A059";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw label
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#1e293b";
    
    // Position label below node
    const labelY = node.y + nodeSize + fontSize;
    ctx.fillText(label.substring(0, 20) + (label.length > 20 ? "..." : ""), node.x, labelY);
  }, []);

  // Custom link rendering
  const linkCanvasObject = useCallback((link, ctx) => {
    const start = link.source;
    const end = link.target;

    if (!start || !end || typeof start.x !== "number") return;

    // Get link color based on type
    const linkColor = RELATIONSHIP_COLORS[link.type] || RELATIONSHIP_COLORS.cites;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = linkColor;
    ctx.lineWidth = link.type === "overturned_by" ? 2 : 1;
    
    // Dashed line for influence
    if (link.type === "influenced_by") {
      ctx.setLineDash([5, 3]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw arrow
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 8;
    const nodeRadius = 15;
    
    const arrowX = end.x - nodeRadius * Math.cos(angle);
    const arrowY = end.y - nodeRadius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
      arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = linkColor;
    ctx.fill();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B192C] flex flex-col" data-testid="precedent-tree-modal">
      {/* Header */}
      <div className="bg-[#0B192C] border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#C5A059]/20 text-[#C5A059]">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-playfair text-xl text-white">Precedent Family Tree</h2>
            <p className="text-sm text-slate-400">
              Trace the legal DNA of your case through citation relationships
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 mr-4">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleFit}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Fit to View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            data-testid="close-tree-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Graph container */}
      <div className="flex-1 relative bg-[#F8F9FA]">
        {graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No precedent cases available yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Precedent data will appear once the Legal Scholar analysis completes
              </p>
            </div>
          </div>
        ) : (
          <>
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height - 80}
              nodeCanvasObject={nodeCanvasObject}
              linkCanvasObject={linkCanvasObject}
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              nodeRelSize={4}
              linkDirectionalArrowLength={0}
              linkDirectionalArrowRelPos={1}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.25}
              cooldownTime={3000}
              warmupTicks={100}
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              linkDistance={120}
              dagMode={null}
              minZoom={0.3}
              maxZoom={5}
            />

            {/* Legend */}
            <Legend />

            {/* Tooltip on hover */}
            {hoveredNode && !selectedNode && (
              <NodeTooltip node={hoveredNode} position={tooltipPos} />
            )}

            {/* Selected case panel */}
            {selectedNode && (
              <SelectedCasePanel 
                node={selectedNode} 
                onClose={() => setSelectedNode(null)} 
              />
            )}

            {/* Instructions */}
            <div className="absolute bottom-4 right-4 bg-white/95 border border-slate-200 p-3 text-xs text-slate-500 z-10">
              <p className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />
                <span>Drag nodes to rearrange • Scroll to zoom • Click node for details</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
