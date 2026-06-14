import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uname: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();

      let token = responseText;
      let errorMessage = responseText;

      try {
        const json = JSON.parse(responseText);

        if (json.token) {
          token = json.token;
        }

        if (!response.ok && json.message) {
          errorMessage = json.message;
        }
      } catch (parseError) {}

      if (response.ok) {
        token = token?.trim();
        localStorage.setItem("token", token);
        localStorage.setItem("username", formData.uname);

        setMessage("Login Successful 🎉");

        navigate("/profile");
      } else {
        setMessage(errorMessage || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-96px)] flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-100 px-4">

      <div className="grid md:grid-cols-2 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Left Section */}
        <div className="hidden md:flex flex-col justify-center bg-blue-600 text-white p-8">

          <h1 className="text-4xl font-bold mb-4">
            Health Tracker
          </h1>

          <p className="text-blue-100 mb-6 text-sm leading-6">
            Track your health, monitor your progress,
            and stay consistent every day.
          </p>

          <div className="space-y-3 text-sm">

            <div className="flex items-center gap-2">
              <span>✔</span>
              <p>Track Daily Health</p>
            </div>

            <div className="flex items-center gap-2">
              <span>✔</span>
              <p>Monitor Calories</p>
            </div>

            <div className="flex items-center gap-2">
              <span>✔</span>
              <p>Build Better Habits</p>
            </div>

            <div className="flex items-center gap-2">
              <span>✔</span>
              <p>Stay Fit & Consistent</p>
            </div>

          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col justify-center p-8">

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back 👋
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Login to continue your journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Username
              </label>

              <input
                type="text"
                name="uname"
                value={formData.uname}
                onChange={handleChange}
                placeholder="Enter username"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Register */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Register
              </Link>
            </p>

            {/* Message */}
            {message && (
              <div
                className={`text-center p-2 rounded-lg text-sm ${
                  message.includes("Successful")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}