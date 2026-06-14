import React, { useEffect, useState } from "react";
import { API_BASE_URL, getAuthHeaders } from "../apiConfig";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unable to get users. Please login via admin.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch( `${API_BASE_URL}/users`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authorization required. Please login via admin.");
          return;
        }

        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data);
      setActionMessage("");
    } catch (err) {
      console.error(err);
      setError("Unable to get users. Please login via admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (event, userId) => {
    event?.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unable to delete user. Please login via admin.");
      return;
    }

    const confirmDelete = window.confirm(
      "Delete this user? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/deleteUser/${userId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authorization required. Please login via admin.");
          return;
        }

        const errorText = await response.text();
        setError(errorText || "Delete failed");
        return;
      }

      setActionMessage("User deleted successfully.");
      setUsers((prev) => prev.filter((user) => (user.uname || user.id) !== userId));
    } catch (err) {
      console.error(err);
      setError("Unable to delete user. Please login via admin.");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-white text-2xl font-semibold">
          Loading Users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-red-400 text-xl font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            Users Directory 👥
          </h1>

          <p className="text-slate-300 mt-2">
            View all registered users in the Health Tracker system.
          </p>

          {actionMessage && (
            <div className="mt-4 rounded-2xl bg-green-500/10 border border-green-400/20 p-4 text-green-100">
              {actionMessage}
            </div>
          )}
        </div>

        {/* Empty State */}
        {users.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center">
            <h2 className="text-white text-2xl font-semibold">
              No Users Found
            </h2>

            <p className="text-slate-300 mt-2">
              There are currently no registered users.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <div
                key={user.uname || user.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition duration-300"
              >
                {/* Avatar */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {user.firstName} {user.lastName}
                      </h2>

                      <p className="text-slate-300">
                        @{user.uname}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => handleDeleteUser(event, user.uname || user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">
                      Username
                    </span>

                    <span className="text-white">
                      {user.uname}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">
                      Email
                    </span>

                    <span className="text-white text-right break-all">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">
                      Gender
                    </span>

                    <span className="text-white">
                      {user.gender || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">
                      Height
                    </span>

                    <span className="text-white">
                      {user.height ? `${user.height} cm` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Weight
                    </span>

                    <span className="text-white">
                      {user.weight ? `${user.weight} kg` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}