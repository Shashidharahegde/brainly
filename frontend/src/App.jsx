import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePageModal";
import NoteDetailPage from "./pages/NoteDetailPage";
import WorkspaceLayout from "./layouts/WorkspaceLayout";
import AskPage from "./pages/AskPage";
import LogInPage from "./pages/LogInPage";
import PageNoteFound from "./pages/PageNoteFound";
import { GoogleOAuthProvider } from "@react-oauth/google";
import useRefreshHandler from "./utils/refreshHandler";


// const GoogleClientId = process.env.VIT
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function hasStoredToken() {
  try {
    const userInfo = JSON.parse(localStorage.getItem("user-info") || "null");
    return Boolean(userInfo?.token);
  } catch {
    return false;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasStoredToken);
  useRefreshHandler({ setIsAuthenticated });

  function GoogleAuthWrapper() {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LogInPage />
      </GoogleOAuthProvider>
    );
  }

  function PrivateRoute({ element }) {
    return isAuthenticated || hasStoredToken()
      ? element
      : <Navigate to="/login" replace />;
  }


  return (
    <div>
      <Routes>
        <Route element={<PrivateRoute element={<WorkspaceLayout />} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ask" element={<AskPage />} />
        </Route>

        <Route path="/create" element={<PrivateRoute element={<CreatePage />} />} />
        <Route path="/note/:id" element={<PrivateRoute element={<NoteDetailPage />} />} />
        <Route path="/login" element={<GoogleAuthWrapper />} />
        <Route path="*" element={<PageNoteFound />} />
      </Routes>
    </div>
  );
}

export default App;
