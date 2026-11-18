import InterviewRoom from './pages/InterviewRoom.jsx';
import InterviewSetup from './pages/InterviewSetup.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/interview" element={<InterviewSetup />} />
        <Route path="/interview/room" element={<InterviewRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;