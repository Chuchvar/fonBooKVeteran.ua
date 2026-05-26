import { useState, useEffect } from "react";
// import './App.css'
import Header from "./components/Header/Header";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { PAGES } from "./constants/url.constants";
import Home from "./pages/Home/Home";
import Landing from "./pages/Landing/Landing";
import Signup from "./pages/Auth/Signup";
// import SignupComplete from "./pages/Auth/SignupComplete";
import Login from "./pages/Auth/Login";
import './global.scss'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Profile from "./pages/Profile/Profile";
import SanatoriumDetail from "./pages/SanatoriumDetail/SanatoriumDetail";
import AdminPanel from "./pages/AdminPanel/AdminPanel";
import SupportChat from "./components/SupportChat/SupportChat";


function App() {
  const location = useLocation()
  const authPages = [PAGES.SIGNUP, PAGES.SIGNUPCOMPLETE, PAGES.LOGIN]
  const isAuthPage = authPages.includes(location.pathname)

  const isAuthenticated = localStorage.getItem('jwt')
  const isLandingPage = location.pathname === PAGES.HOME;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])


  return (
    <div className="App">
      {!isAuthPage && <Header transparent={isLandingPage} theme={theme} toggleTheme={toggleTheme} />}
      <main className="main">
        <div key={location.pathname} className="page-transition">
          <Routes>
            <Route path={PAGES.HOME} element={<Landing />} />
            <Route path={PAGES.CATALOG} element={<Home />} />
            <Route
              path={PAGES.SIGNUP}
              element={<Signup />}
            />
            <Route
              path={PAGES.LOGIN}
              element={<Login />}
            />
            <Route
              path={PAGES.PROFILE}
              element={isAuthenticated ? (
                <Profile />
              ) : (
                <Navigate to={PAGES.LOGIN} replace />
              )}
            />
            <Route
              path={PAGES.ADMIN}
              element={isAuthenticated ? (
                <AdminPanel />
              ) : (
                <Navigate to={PAGES.LOGIN} replace />
              )}
            />
            <Route
              path={`${PAGES.SANATORIUM_DETAIL}/:id`}
              element={<SanatoriumDetail />}
            />
          </Routes>
        </div>
      </main>
      {isAuthenticated && !isAuthPage && <SupportChat />}
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </div>
  );
}

export default App;

