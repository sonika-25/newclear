import { Routes, Route, Navigate } from "react-router-dom";
import UILayout from "./components/UILayout"
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";
import ManagementPage from "./pages/ManagementPage";
import SelectionPage from "./pages/SelectionPage";
import EvidencePage from "./pages/EvidencePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />}/>
      <Route path="/select" element={<SelectionPage/>}/>

      <Route element={<UILayout/>}>
        <Route path="/home" element={<HomePage />}/>
        <Route path="/schedule" element={<SchedulePage/>}/>
        <Route path="/management" element={<ManagementPage/>}/>
        <Route path="/evidence" element={<EvidencePage/>}/>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />}/>
    </Routes>
  );
}