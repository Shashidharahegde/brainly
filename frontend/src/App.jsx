import React from "react";
import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePageModal";
import NoteDetailPage from "./pages/NoteDetailPage";
import toast from "react-hot-toast";
import WorkspaceLayout from "./layouts/WorkspaceLayout";
import AskPage from "./pages/AskPage";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<WorkspaceLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ask" element={<AskPage />} />
        </Route>

        <Route path="/create" element={<CreatePage />} />
        <Route path="/note/:id" element={<NoteDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
