import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export default function useRefreshHandler({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let token = null;

    try {
      const userInfo = JSON.parse(localStorage.getItem("user-info") || "null");
      token = userInfo?.token ?? null;
    } catch {
      localStorage.removeItem("user-info");
      localStorage.removeItem("token");
      navigate("/login",  { replace: true })
    }

    setIsAuthenticated(Boolean(token));

    if (token && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate, setIsAuthenticated]);
}
