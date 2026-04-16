import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Loader2 } from "lucide-react";
import { STATE_POSITIONS, INDIA_OUTLINE } from "./map/stateData";
import { StatePanel } from "./map/StatePanel";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function MapMarker({ state, count, x, y, maxCount, isSelected, onClick }) {
  const minR = 8;
  const maxR = 24;
  const r = maxCount > 0 ? minR + ((count / maxCount) * (maxR - minR)) : minR;
  const intensity = maxCount > 0 ? Math.min(count / maxCount, 1) : 0;

  // Color interpolation from gold to deep red based on density
  const hue = 40 - (intensity * 30); // 40 (gold) to 10 (red-ish)
  const sat = 60 + (intensity * 30);

  return (
    <g
      className="cursor-pointer"
      onClick={() => onClick(state)}
      data-testid={`map-marker-${state.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {/* Glow ring */}
      <circle
        cx={x} cy={y} r={r + 4}
        fill="none"
        stroke={isSelected ? "#C5A059" : "transparent"}
        strokeWidth={2}
        className="transition-all duration-300"
      />
      {/* Pulse animation for selected */}
      {isSelected && (
        <circle cx={x} cy={y} r={r + 6} fill="none" stroke="#C5A059" strokeWidth={1} opacity={0.4}>
          <animate attributeName="r" from={r + 6} to={r + 16} dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Main circle */}
      <circle
        cx={x} cy={y} r={r}
        fill={`hsl(${hue}, ${sat}%, 45%)`}
        fillOpacity={0.85}
        stroke="#fff"
        strokeWidth={1.5}
        className="transition-all duration-300 hover:fill-opacity-100"
      />
      {/* Count label */}
      {count > 0 && (
        <text
          x={x} y={y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={r > 14 ? 10 : 8}
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {count}
        </text>
      )}
      {/* State label below */}
      <text
        x={x} y={y + r + 12}
        textAnchor="middle"
        fill={isSelected ? "#0B192C" : "#64748B"}
        fontSize={9}
        fontWeight={isSelected ? "600" : "400"}
        className="pointer-events-none select-none"
      >
        {state}
      </text>
    </g>
  );
}

export default function CaseMap() {
  const [stateData, setStateData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/cases/by-state`);
        setStateData(res.data.states || {});
      } catch (err) {
        console.error("Failed to fetch case map data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxCount = Math.max(1, ...Object.values(stateData).map(cases => cases.length));
  const totalCases = Object.values(stateData).reduce((sum, cases) => sum + cases.length, 0);
  const statesWithCases = Object.keys(stateData).length;

  const handleStateClick = (state) => {
    setSelectedState(prev => prev === state ? null : state);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="case-map-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A1428] via-[#0B192C] to-[#11233D] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          <p className="text-xs tracking-[0.15em] uppercase text-[#C5A059] mb-2">Geographic Analysis</p>
          <h1 className="font-playfair text-3xl sm:text-4xl text-white">Cases Across India</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Explore how legal cases are distributed across Indian states. Click on a state marker to view case details and precedents.
          </p>

          {/* Stats row */}
          {!loading && (
            <div className="flex items-center gap-6 mt-5">
              <div>
                <p className="text-2xl font-bold text-white">{totalCases}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Cases</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-[#C5A059]">{statesWithCases}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">States</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin mr-2" />
            <p className="text-sm text-slate-500">Loading case map...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] p-6 sm:p-8">
            {/* Legend */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">India Case Distribution Map</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(40, 60%, 45%)" }} />
                  <span className="text-xs text-slate-500">Few cases</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(25, 75%, 45%)" }} />
                  <span className="text-xs text-slate-500">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(10, 90%, 45%)" }} />
                  <span className="text-xs text-slate-500">High density</span>
                </div>
              </div>
            </div>

            {/* SVG Map */}
            <div className="flex justify-center">
              <svg
                viewBox="60 10 420 480"
                className="w-full max-w-2xl"
                data-testid="india-map-svg"
              >
                {/* India outline */}
                <path
                  d={INDIA_OUTLINE}
                  fill="#F1F5F9"
                  stroke="#CBD5E1"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />

                {/* Grid lines for visual texture */}
                {[100, 150, 200, 250, 300, 350, 400].map(y => (
                  <line key={`h-${y}`} x1="70" y1={y} x2="440" y2={y} stroke="#E2E8F0" strokeWidth={0.3} strokeDasharray="4 4" />
                ))}
                {[150, 200, 250, 300, 350, 400].map(x => (
                  <line key={`v-${x}`} x1={x} y1="20" x2={x} y2="470" stroke="#E2E8F0" strokeWidth={0.3} strokeDasharray="4 4" />
                ))}

                {/* State markers */}
                {Object.entries(STATE_POSITIONS).map(([state, pos]) => {
                  const cases = stateData[state] || [];
                  if (cases.length === 0) {
                    // Empty state - show small grey dot
                    return (
                      <g key={state}>
                        <circle cx={pos.x} cy={pos.y} r={3} fill="#CBD5E1" fillOpacity={0.5} />
                        <text
                          x={pos.x} y={pos.y + 14}
                          textAnchor="middle" fill="#94A3B8" fontSize={7}
                          className="pointer-events-none select-none"
                        >{state}</text>
                      </g>
                    );
                  }
                  return (
                    <MapMarker
                      key={state}
                      state={state}
                      count={cases.length}
                      x={pos.x}
                      y={pos.y}
                      maxCount={maxCount}
                      isSelected={selectedState === state}
                      onClick={handleStateClick}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Hint text */}
            {!selectedState && statesWithCases > 0 && (
              <p className="text-center text-xs text-slate-400 mt-4">Click on a state marker to view case details</p>
            )}
          </div>
        )}
      </div>

      {/* Side panel overlay */}
      {selectedState && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedState(null)}
            data-testid="panel-backdrop"
          />
          <StatePanel
            state={selectedState}
            cases={stateData[selectedState] || []}
            onClose={() => setSelectedState(null)}
          />
        </>
      )}
    </div>
  );
}
