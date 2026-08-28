import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Database from "./pages/Database";
import Personnel from "./pages/Personnel";
import Facilities from "./pages/Facilities";
import Incidents from "./pages/Incidents";
import Terminal from "./pages/Terminal";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/database" element={<Database />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/terminal" element={<Terminal />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
