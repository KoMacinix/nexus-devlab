import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import GeoIntel from "./pages/GeoIntel";
import StockOS from "./pages/StockOS";
import Arena from "./pages/Arena";
import Forge from "./pages/Forge";
import ShowPass from "./pages/ShowPass";
import FloraNet from "./pages/FloraNet";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/geointel" element={<GeoIntel />} />
          <Route path="/stockos" element={<StockOS />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/forge" element={<Forge />} />
          <Route path="/showpass" element={<ShowPass />} />
          <Route path="/floranet" element={<FloraNet />} />
        </Routes>
      </main>
      <footer className="text-center py-8 text-nexus-muted text-xs font-mono border-t border-nexus-border">
        NEXUS DevLab — Ko · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
