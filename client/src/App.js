import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from 'pages/login/LoginPage.jsx';
import TimerPage from 'pages/timer/TimerPage.jsx';
import FinalSubmissionPage from 'pages/finalSubmission/FinalSubmissionPage.jsx';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/submission" element={<FinalSubmissionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;