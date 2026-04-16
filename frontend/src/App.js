import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import CaseSubmission from "./components/CaseSubmission";
import AnalysisDashboard from "./components/AnalysisDashboard";
import JudgeProfiles from "./components/JudgeProfiles";
import CaseHistory from "./components/CaseHistory";
import FineManagement from "./components/FineManagement";
import PrisonerManagement from "./components/PrisonerManagement";
import RewardFundDashboard from "./components/RewardFundDashboard";

function App() {
  return (
    <div className="App font-ibmplex">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<CaseSubmission />} />
          <Route path="/analysis/:caseId" element={<AnalysisDashboard />} />
          <Route path="/judges" element={<JudgeProfiles />} />
          <Route path="/history" element={<CaseHistory />} />
          <Route path="/fines" element={<FineManagement />} />
          <Route path="/prisoners" element={<PrisonerManagement />} />
          <Route path="/reward-fund" element={<RewardFundDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
