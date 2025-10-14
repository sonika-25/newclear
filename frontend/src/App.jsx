import { Routes, Route, Navigate } from "react-router-dom";
import UILayout from "./components/UILayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";
import SchedulePage from "./pages/EvidencePage";
import ManagementPage from "./pages/ManagementPage";
import SelectionPage from "./pages/SelectionPage";
import SelectSchedulePage from "./pages/SelectSchedulePage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
           <Route
                path="/select"
                element={
                    <ProtectedRoute>
                        <SelectionPage />
                    </ProtectedRoute>
                }
            /> 
            <Route
                path="/select-schedule"
                element={
                    <ProtectedRoute>
                        <SelectSchedulePage />
                    </ProtectedRoute>
                }
            />
            <Route element={<UILayout />}>
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/schedule"
                    element={
                        <ProtectedRoute>
                            <SchedulePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/management"
                    element={
                        <ProtectedRoute>
                            <ManagementPage />
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/evidence"
                    element={
                        <ProtectedRoute>
                            <EvidencePage />
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
