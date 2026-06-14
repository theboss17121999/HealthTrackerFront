import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LoginPage from "./Authentication_Component/login";
import RegisterPage from "./Authentication_Component/Register";
import ProfilePage from "./UserDetails/profilePage";
import UserListPage from "./UserDetails/userList";
import DailyTrackerPage from "./UserDetails/dailyTracker";

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [isClick, setIsClick] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
  }, [location]);

  const toggleNavBar = () => {
    setIsClick(!isClick);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setUsername("");

    navigate("/");
  };

  return (
    <>
      {/* Header */}
      <header className="bg-slate-200 shadow-md fixed top-0 w-full z-50">
        <div className="flex items-center justify-between px-6 h-16">

          {/* Logo */}
          <div className="text-2xl font-bold text-blue-600">
            Health Tracker
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 font-medium">

            <Link
              to="/"
              className="hover:text-blue-600 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="hover:text-blue-600 transition"
            >
              Register
            </Link>

            <Link
              to="/profile"
              className="hover:text-blue-600 transition"
            >
              Profile
            </Link>

            <Link
              to="/users"
              className="hover:text-blue-600 transition"
            >
              Users
            </Link>

            <Link
              to="/tracker"
              className="hover:text-blue-600 transition"
            >
              Tracker
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {username ? (
              <>
                <span className="font-medium">
                  Hi, {username}
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="font-medium">Guest</span>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-2xl"
              onClick={toggleNavBar}
            >
              {isClick ? "✖" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isClick && (
          <nav className="md:hidden flex flex-col gap-4 p-4 bg-white shadow-md">

            <Link
              to="/"
              onClick={toggleNavBar}
              className="hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={toggleNavBar}
              className="hover:text-blue-600"
            >
              Register
            </Link>

            <Link
              to="/profile"
              onClick={toggleNavBar}
              className="hover:text-blue-600"
            >
              Profile
            </Link>

            <Link
              to="/users"
              onClick={toggleNavBar}
              className="hover:text-blue-600"
            >
              Users
            </Link>

            <Link
              to="/tracker"
              onClick={toggleNavBar}
              className="hover:text-blue-600"
            >
              Tracker
            </Link>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4">
        <Routes>

          <Route
            path="/"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/users"
            element={<UserListPage />}
          />

          <Route
            path="/tracker"
            element={<DailyTrackerPage />}
          />

        </Routes>
      </main>
    </>
  );
}

export default App;