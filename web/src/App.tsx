import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import Workspace from "./pages/Workspace";
import Exam from "./pages/Exam";
import Thesis from "./pages/Thesis";

const links = [
  { to: "/", label: "Today" },
  { to: "/code", label: "Code" },
  { to: "/exam", label: "Exam" },
  { to: "/thesis", label: "Thesis" },
];

export default function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <span className="logo">DevGym</span>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/code" element={<Challenges />} />
          <Route path="/code/:slug" element={<Workspace />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/thesis" element={<Thesis />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
