import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    uname: "",
    password: "",
    re_password: "",
    email: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    role: "USER",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);

  useEffect(() => {
    if (formData.uname.length < 2) {
      setUsernameStatus("");
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability(formData.uname);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.uname]);

  const checkUsernameAvailability = async (username) => {
    setUsernameChecking(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/search/${username}`
      );

      if (response.ok) {
        const exists = await response.json();
        console.log("Username check result:", { username, exists });

        if (exists === true) {
          setUsernameStatus("taken");
        } else {
          setUsernameStatus("available");
        }
      } else {
        setUsernameStatus("");
      }
    } catch (err) {
      console.error("Username check error:", err);
      setUsernameStatus("");
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      uname: "",
      password: "",
      re_password: "",
      email: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      height: "",
      weight: "",
      role: "USER",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.re_password) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          height: Number(formData.height),
          weight: Number(formData.weight),
        }),
      });

      const data = await response.text();

      if (response.ok) {
        setMessage("✅ Registration Successful!");
        resetForm();
      } else {
        setMessage(data || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="h-full flex">
        {/* LEFT SECTION */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6">
            Health
            <span className="text-blue-400"> Tracker</span>
          </h1>

          <p className="text-lg text-slate-300 mb-8 max-w-lg">
            Take control of your health and fitness journey with powerful
            tracking tools and personalized insights.
          </p>

          <div className="space-y-4 max-w-lg">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              ✔ Track Daily Health Metrics
            </div>

            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              ✔ Monitor Calories & Nutrition
            </div>

            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              ✔ Stay Consistent With Goals
            </div>

            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              ✔ Build Better Habits
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">

            <div className="text-center mb-5">
              <h2 className="text-3xl font-bold text-white">
                Create Account 🚀
              </h2>

              <p className="text-slate-300 mt-2">
                Join your health journey today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid md:grid-cols-2 gap-2">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                type="text"
                name="uname"
                placeholder="Username"
                value={formData.uname}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {formData.uname.length >= 2 && (
                <div className="flex items-center gap-2 text-sm">
                  {usernameChecking ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                      <span className="text-slate-300">Checking...</span>
                    </>
                  ) : usernameStatus === "available" ? (
                    <>
                      <span className="text-green-400">✓</span>
                      <span className="text-green-400">Username available</span>
                    </>
                  ) : usernameStatus === "taken" ? (
                    <>
                      <span className="text-red-400">✗</span>
                      <span className="text-red-400">Username taken</span>
                    </>
                  ) : null}
                </div>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid md:grid-cols-2 gap-2">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="password"
                  name="re_password"
                  placeholder="Confirm Password"
                  value={formData.re_password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-2">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-2">
                <input
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-white/90 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || usernameStatus === "taken"}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>

              {message && (
                <p
                  className={`text-center font-medium ${
                    message.includes("Successful")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}