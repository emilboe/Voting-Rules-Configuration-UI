import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdjustLicenseeInterest } from "./components/AdjustLicenseeInterest";
import { AppShell } from "./components/AppShell";
import { RuleBuilder } from "./components/RuleBuilder";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={<Navigate to="/voting-rules" replace />}
          />
          <Route path="/voting-rules" element={<RuleBuilder />} />
          <Route
            path="/licensee-interest"
            element={<AdjustLicenseeInterest />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
