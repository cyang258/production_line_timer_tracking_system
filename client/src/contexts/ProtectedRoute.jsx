import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./FinalSubmissionPageAuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/timer", { replace: true });
    }
  }, [isAuthenticated]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
