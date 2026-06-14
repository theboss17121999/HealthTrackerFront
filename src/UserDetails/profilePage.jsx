import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthHeaders, resolveUserProfileEndpoints } from "../apiConfig";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (!token) {
        navigate("/");
        return;
      }

      const endpoints = resolveUserProfileEndpoints(username, token);

      if (endpoints.length === 0) {
        navigate("/");
        return;
      }

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        console.debug("Trying profile endpoint", { endpoint });

        response = await fetch(endpoint, {
          method: "GET",
          headers: getAuthHeaders(token),
        });

        if (response.ok) {
          break;
        }

        lastError = response;
      }

      if (!response || !response.ok) {
        if (lastError?.status === 401 || lastError?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          navigate("/");
          return;
        }

        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmed = window.confirm(
      "Delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (!token || !username) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/deleteUser/${username}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/");
      } else {
        const message = await response.text();
        setError(message || "Unable to delete account");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to delete account");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-slate-100">
        <div className="bg-white px-8 py-6 rounded-xl shadow-lg">
          <p className="text-lg font-medium text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-slate-100">
        <div className="bg-red-100 text-red-700 px-8 py-6 rounded-xl shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  const bmi = (
    userData.weight /
    ((userData.height / 100) * (userData.height / 100))
  ).toFixed(1);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-100 via-white to-blue-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-6">

              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                {userData.firstName?.charAt(0)}
                {userData.lastName?.charAt(0)}
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </h1>

                <p className="text-lg text-gray-500 mt-1">
                  @{userData.uname}
                </p>
              </div>

            </div>

            <button
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-md"
            >
              Delete Account
            </button>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-2">Email</p>
            <p className="text-lg font-semibold text-gray-800 break-words">
              {userData.email}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-2">Gender</p>
            <p className="text-lg font-semibold text-gray-800">
              {userData.gender}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-2">Date of Birth</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(userData.dateOfBirth).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-2">Height</p>
            <p className="text-lg font-semibold text-gray-800">
              {userData.height} cm
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-2">Weight</p>
            <p className="text-lg font-semibold text-gray-800">
              {userData.weight} kg
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-2">BMI</p>
            <p className="text-3xl font-bold text-blue-600">
              {bmi}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}