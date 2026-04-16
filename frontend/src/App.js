import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import CaseSubmission from "./components/CaseSubmission";
import AnalysisDashboard from "./components/AnalysisDashboard";
import JudgeProfiles from "./components/JudgeProfiles";
import CaseHistory from "./components/CaseHistory";

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
