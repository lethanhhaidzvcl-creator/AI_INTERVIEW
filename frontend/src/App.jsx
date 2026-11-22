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