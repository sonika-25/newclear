import { Routes, Route, Navigate } from "react-router-dom";
import UILayout from "./components/UILayout"
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />}/>
      <Route element={<UILayout/>}>
        <Route path="/home" element={<HomePage />}/>
        <Route path="/schedule" element={<SchedulePage/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />}/>
    </Routes>
  );
}