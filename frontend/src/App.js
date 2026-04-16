import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";
import RoleGuard from "./components/RoleGuard";
import LandingPage from "./components/LandingPage";
import CaseSubmission from "./components/CaseSubmission";
import AnalysisDashboard from "./components/AnalysisDashboard";
import JudgeProfiles from "./components/JudgeProfiles";
import JudgeDetailPage from "./components/JudgeDetailPage";
import CaseHistory from "./components/CaseHistory";
import CaseMap from "./components/CaseMap";

import FineManagement from "./components/FineManagement";
import PrisonerManagement from "./components/PrisonerManagement";
import RewardFundDashboard from "./components/RewardFundDashboard";

function App() {
  return (
    <UserProvider>
      <div className="App font-ibmplex">
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Common User routes */}
            <Route path="/submit" element={
              <RoleGuard requiredRole="commonUser">
                <CaseSubmission />
              </RoleGuard>
            } />
            <Route path="/analysis/:caseId" element={
              <RoleGuard requiredRole="commonUser">
                <AnalysisDashboard />
              </RoleGuard>
            } />
            <Route path="/judges" element={
              <RoleGuard requiredRole="commonUser">
                <JudgeProfiles />
              </RoleGuard>
            } />
            <Route path="/judges/:judgeId" element={
              <RoleGuard requiredRole="commonUser">
                <JudgeDetailPage />
              </RoleGuard>
            } />
            <Route path="/history" element={
              <RoleGuard requiredRole="commonUser">
                <CaseHistory />
              </RoleGuard>
            } />
            <Route path="/map" element={
              <RoleGuard requiredRole="commonUser">
                <CaseMap />
              </RoleGuard>
            } />
            
            {/* Authority routes */}
            <Route path="/fines" element={
              <RoleGuard requiredRole="authority">
                <FineManagement />
              </RoleGuard>
            } />
            <Route path="/prisoners" element={
              <RoleGuard requiredRole="authority">
                <PrisonerManagement />
              </RoleGuard>
            } />
            <Route path="/reward-fund" element={
              <RoleGuard requiredRole="authority">
                <RewardFundDashboard />
              </RoleGuard>
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </UserProvider>

  );
}

export default App;
