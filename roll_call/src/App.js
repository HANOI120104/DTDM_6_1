import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

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

// Auth Context
export const AuthContext = React.createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(true);

  // Đăng nhập bằng Firebase Auth và lấy role từ Firestore
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Lấy thông tin user từ Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData = userDoc.exists() ? userDoc.data() : {};
      setCurrentUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        ...userData
      });
    } catch (err) {
      setCurrentUser(null);
      throw err;
    }
    setLoading(false);
  };

  // Đăng xuất
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userData = userDoc.exists() ? userDoc.data() : {};
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        });
      } else {
        setCurrentUser(null);
      }
      setInit(false);
    });
    return () => unsubscribe();
  }, []);

  const contextValue = useMemo(() => ({ currentUser, login, logout, loading }), [currentUser, loading]);

  if (init) return null; // hoặc loading spinner

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthContext.Provider value={contextValue}>
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
