import Contact from './pages/Contact.jsx';
import AdminPositions from "./pages/admin/AdminPositions";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InterviewHistory from './pages/InterviewHistory.jsx';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import InterviewRoom from './pages/InterviewRoom.jsx';
import InterviewSetup from './pages/InterviewSetup.jsx';

const InterviewResult = lazy(() => import('./pages/InterviewResult.jsx'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <AdminProtectedRoute>
              <AdminQuestions />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/positions"
          element={
            <AdminProtectedRoute>
              <AdminPositions />
            </AdminProtectedRoute>
          }
        />
        <Route path="/interview" element={<InterviewSetup />} />
        <Route path="/interview/room" element={<InterviewRoom />} />
        <Route path="/interview/history" element={<InterviewHistory />} />
        <Route
          path="/interview/results/:sessionId"
          element={
            <Suspense fallback={<p role="status">Đang mở trang kết quả…</p>}>
              <InterviewResult />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;