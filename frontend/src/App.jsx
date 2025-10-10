import { Routes, Route, Navigate } from "react-router-dom";
import UILayout from "./components/UILayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";
import ManagementPage from "./pages/ManagementPage";
import SelectSchedulePage from "./pages/SelectSchedulePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
    const { user, loading } = useAuth();

    if (loading) {
        // Temporary global loading screen
        return <div>Loading app...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
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
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
