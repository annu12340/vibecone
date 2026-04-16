import { useState, useEffect, memo, useCallback } from "react";
import axios from "axios";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { MapPin, Loader2 } from "lucide-react";
import { StatePanel } from "./map/StatePanel";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const INDIA_TOPO = "/india-states.json";

const PROJECTION_CONFIG = {
  scale: 1200,
  center: [82.5, 22],
};

function getStateColor(count, maxCount) {
  if (!count) return "#E8E6E1";
  const intensity = Math.min(count / Math.max(maxCount, 1), 1);
  if (intensity > 0.6) return "#B45309";
  if (intensity > 0.3) return "#D97706";
  if (intensity > 0) return "#C5A059";
  return "#E8E6E1";
}

const MemoGeography = memo(function MemoGeo({ geo, stateData, maxCount, selectedState, onClick }) {
  const stName = geo.properties.st_nm;
  const cases = stateData[stName] || [];
  const count = cases.length;
  const isSelected = selectedState === stName;
  const fill = getStateColor(count, maxCount);

  return (
    <Geography
      geography={geo}
      onClick={() => { if (count > 0) onClick(stName); }}
      style={{
        default: {
          fill: isSelected ? "#0B192C" : fill,
          stroke: "#FFFFFF",
          strokeWidth: 0.8,
          outline: "none",
          cursor: count > 0 ? "pointer" : "default",
        },
        hover: {
          fill: count > 0 ? (isSelected ? "#0B192C" : "#C5A059") : fill,
          stroke: "#FFFFFF",
          strokeWidth: count > 0 ? 1.5 : 0.8,
          outline: "none",
          cursor: count > 0 ? "pointer" : "default",
        },
        pressed: {
          fill: "#0B192C",
          stroke: "#C5A059",
          strokeWidth: 1.5,
          outline: "none",
        },
      }}
      data-testid={`map-state-${stName.replace(/\s+/g, "-").toLowerCase()}`}
    />
  );
});

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

  const maxCount = Math.max(1, ...Object.values(stateData).map(c => c.length));
  const totalCases = Object.values(stateData).reduce((sum, c) => sum + c.length, 0);
  const statesWithCases = Object.keys(stateData).length;

  const handleStateClick = useCallback((state) => {
    setSelectedState(prev => prev === state ? null : state);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="case-map-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A1428] via-[#0B192C] to-[#11233D] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          <p className="text-xs tracking-[0.15em] uppercase text-[#C5A059] mb-2">Geographic Analysis</p>
          <h1 className="font-playfair text-3xl sm:text-4xl text-white">Cases Across India</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Explore how legal cases are distributed across Indian states. Click on a state to view case details and precedents.
          </p>

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
          <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] p-4 sm:p-6">
            {/* Legend */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">India Case Distribution</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "#E8E6E1" }} />
                  <span className="text-xs text-slate-500">No cases</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "#C5A059" }} />
                  <span className="text-xs text-slate-500">Few</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "#D97706" }} />
                  <span className="text-xs text-slate-500">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "#B45309" }} />
                  <span className="text-xs text-slate-500">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "#0B192C" }} />
                  <span className="text-xs text-slate-500">Selected</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="flex justify-center" data-testid="india-map-container">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={PROJECTION_CONFIG}
                width={600}
                height={620}
                style={{ width: "100%", maxWidth: "700px", height: "auto" }}
                data-testid="india-map-svg"
              >
                <Geographies geography={INDIA_TOPO}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <MemoGeography
                        key={geo.rsmKey}
                        geo={geo}
                        stateData={stateData}
                        maxCount={maxCount}
                        selectedState={selectedState}
                        onClick={handleStateClick}
                      />
                    ))
                  }
                </Geographies>
              </ComposableMap>
            </div>

            {/* State labels for states with cases */}
            {statesWithCases > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
                {Object.entries(stateData).map(([state, cases]) => (
                  <button
                    key={state}
                    onClick={() => handleStateClick(state)}
                    className={`text-xs px-3 py-1.5 border transition-colors ${
                      selectedState === state
                        ? "bg-[#0B192C] text-white border-[#0B192C]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#C5A059] hover:text-[#0B192C]"
                    }`}
                    data-testid={`state-btn-${state.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {state} ({cases.length})
                  </button>
                ))}
              </div>
            )}

            {!selectedState && statesWithCases > 0 && (
              <p className="text-center text-xs text-slate-400 mt-3">Click on a colored state or button to view case details</p>
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
