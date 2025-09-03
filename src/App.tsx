import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FullLayout from "./layout/FullLayout"; 
import GuideSelfProfile from "./pages/GuideSelf/GuideSelfProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Admin Layout + ทุกเมนูจัดการ */}
        <Route path="/*" element={<FullLayout />} />

        {/* ✅ Guide Self Profile */}
        <Route path="/my-profile" element={<GuideSelfProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
