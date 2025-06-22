import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Layout Components
import AppLayout from './components/layout/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import ProfilePage from './pages/ProfilePage';
import StudentsPage from './pages/StudentsPage';
import ClassesPage from './pages/ClassesPage';
import ReportsPage from './pages/ReportsPage';

// Mock Auth Context - Would be replaced with actual Firebase Auth
export const AuthContext = React.createContext();

function App() {
  // Mock auth state - In a real app, this would use Firebase Auth
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock login function - Would be replaced with Firebase Auth
  const login = (email, password) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (email === 'teacher@example.com' && password === 'password') {
        setCurrentUser({
          uid: '123',
          email,
          displayName: 'Teacher User',
          role: 'teacher',
          photoURL: 'https://randomuser.me/api/portraits/men/1.jpg'
        });
      } else if (email === 'student@example.com' && password === 'password') {
        setCurrentUser({
          uid: '456',
          email,
          displayName: 'Student User',
          role: 'student',
          photoURL: 'https://randomuser.me/api/portraits/women/1.jpg'
        });
      }
      setLoading(false);
    }, 1000);
  };

  // Mock logout function
  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
        <Router>
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />

            <Route path="/" element={currentUser ? <AppLayout /> : <Navigate to="/login" />}>
              <Route index element={<Dashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthContext.Provider>
    </ConfigProvider>
  );
}

export default App;
