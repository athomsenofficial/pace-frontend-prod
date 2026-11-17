import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Features from "@/pages/Features";
import HowTo from "@/pages/HowTo";
import InitialMel from "@/pages/InitialMel";
import FinalMel from "@/pages/FinalMel";
import MpfRoster from "@/pages/MpfRoster";
import MemoGenerator from "@/pages/MemoGenerator";
import PromotionCalculator from "@/pages/PromotionCalculator";
import BtzCalculator from "@/pages/BtzCalculator";
import { RostersIndexPage } from "@/features/rosters/RostersIndexPage";
import { RunRoute } from "@/features/rosters/RunPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/how-to" element={<HowTo />} />
        <Route path="/initial-mel" element={<InitialMel />} />
        <Route path="/final-mel" element={<FinalMel />} />
        <Route path="/mpf-roster" element={<MpfRoster />} />
        <Route path="/memo-generator" element={<MemoGenerator />} />
        <Route path="/calculators" element={<Navigate to="/calculators/promotion" replace />} />
        <Route path="/calculators/promotion" element={<PromotionCalculator />} />
        <Route path="/calculators/btz" element={<BtzCalculator />} />
        <Route path="/rosters" element={<RostersIndexPage />} />
        {/* One route for every run the API offers: dos-reenlistment, deros-option,
            re-code-review, cjr-window, btz-quarterly, and any added later. */}
        <Route path="/rosters/:runId" element={<RunRoute />} />
        <Route path="/rosters/*" element={<Navigate to="/rosters" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
