import { useState } from "react";
import { Link, useLocation } from "react-router-dom";


import { Scale, Users, History, Menu, X, FileText, DollarSign, UserCheck, Award, Users2, Building2, MapPin } from "lucide-react";
import { useUser } from "../context/UserContext";


// Common Users navigation
const COMMON_USER_LINKS = [
  { to: "/submit", label: "Analyze Case", icon: FileText },
  { to: "/judges", label: "Judge Profiles", icon: Users },
  { to: "/map", label: "Case Map", icon: MapPin },
  { to: "/history", label: "Case History", icon: History },
];

// Authorities navigation
const AUTHORITY_LINKS = [
  { to: "/fines", label: "Fines", icon: DollarSign },
  { to: "/prisoners", label: "Prisoners", icon: UserCheck },
  { to: "/reward-fund", label: "Reward Fund", icon: Award },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { role, toggleRole, isCommonUser, isAuthority } = useUser();

  const isActive = (path) => location.pathname === path;
  
  // Select links based on current role
  const navLinks = isCommonUser ? COMMON_USER_LINKS : AUTHORITY_LINKS;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
            <div className="w-8 h-8 bg-[#0B192C] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <span className="font-playfair text-lg font-semibold text-slate-900 leading-none">LexAI</span>
              <span className="block text-[10px] tracking-[0.15em] uppercase text-slate-500 font-ibmplex">Legal Intelligence</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Role Toggle */}
            <div className="flex items-center gap-2 mr-4 px-3 py-1.5 bg-slate-100 rounded-full">
              <button
                onClick={toggleRole}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isCommonUser
                    ? "bg-[#0B192C] text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Users2 className="w-3 h-3" />
                Common User
              </button>
              <button
                onClick={toggleRole}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isAuthority
                    ? "bg-[#0B192C] text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Building2 className="w-3 h-3" />
                Authority
              </button>
            </div>

            {/* Navigation Links */}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                data-testid={`nav-link-${label.toLowerCase().replace(/\s/g, "-")}`}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-ibmplex transition-colors ${
                  isActive(to)
                    ? "text-[#0B192C] font-semibold border-b-2 border-[#C5A059]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}

            
            {/* CTA button - only for common users */}
            {isCommonUser && (
              <Link
                to="/submit"
                data-testid="nav-cta-button"
                className="ml-3 px-4 py-2 bg-[#0B192C] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors"
              >
                New Analysis
              </Link>
            )}

          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-4" data-testid="mobile-menu">
          {/* Role Toggle Mobile */}
          <div className="flex gap-2 py-3 border-b border-slate-200">
            <button
              onClick={() => {
                toggleRole();
                setMobileOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
                isCommonUser
                  ? "bg-[#0B192C] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              Common User
            </button>
            <button
              onClick={() => {
                toggleRole();
                setMobileOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
                isAuthority
                  ? "bg-[#0B192C] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Authority
            </button>
          </div>

          {/* Navigation Links Mobile */}
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 text-sm border-b border-slate-100 ${
                isActive(to) ? "text-[#0B192C] font-medium" : "text-slate-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          
          {/* CTA button mobile - only for common users */}
          {isCommonUser && (
            <Link
              to="/submit"
              onClick={() => setMobileOpen(false)}
              className="block mt-3 px-4 py-3 bg-[#0B192C] text-white text-center text-sm font-medium"
            >
              New Analysis
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
