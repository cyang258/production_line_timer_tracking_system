import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "pages/login/LoginPage.jsx";
import TimerPage from "pages/timer/TimerPage.jsx";
import FinalSubmissionPage from "pages/finalSubmission/FinalSubmissionPage.jsx";
import ProtectedRoute from "contexts/ProtectedRoute.jsx";
import { AuthProvider } from "contexts/FinalSubmissionPageAuthContext";

const App = () => {
  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route
              path="/submission"
              element={
                <ProtectedRoute>
                  <FinalSubmissionPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
};
export default App;
