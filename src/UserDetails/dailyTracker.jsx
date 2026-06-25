import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthHeaders } from "../apiConfig";

export default function DailyTrackerPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [customUserId, setCustomUserId] = useState("");
  const [viewingUserId, setViewingUserId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(7);
  const [sortBy, setSortBy] = useState("date");
  const [ascending, setAscending] = useState(true);
  const [totalPages, setTotalPages] = useState(null);
  const [totalRecords, setTotalRecords] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    fat: "",
    protein: "",
    carbohydrate: "",
    fiber: "",
  });

  const [editFormData, setEditFormData] = useState({
    date: "",
    fat: "",
    protein: "",
    carbohydrate: "",
    fiber: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const startEdit = (record) => {
    setSelectedRecord(record);
    setEditFormData({
      date: record.date || record.recordDate || "",
      fat: record.nutrients?.fat ?? "",
      protein: record.nutrients?.protein ?? "",
      carbohydrate: record.nutrients?.carbohydrate ?? "",
      fiber: record.nutrients?.fiber ?? "",
    });
    setEditMessage("");
    setShowForm(false);
  };

  const cancelEdit = () => {
    setSelectedRecord(null);
    setEditFormData({
      date: "",
      fat: "",
      protein: "",
      carbohydrate: "",
      fiber: "",
    });
    setEditMessage("");
    setDeleteMessage("");
  };

  const fetchRecords = async (
    userId = null,
    pageNumber = page,
    pageSize = size,
    sortField = sortBy,
    sortAsc = ascending
  ) => {
    const token = localStorage.getItem("token");
    const loggedInUsername = localStorage.getItem("username");
    const userToFetch = userId || loggedInUsername;

    if (!token || !loggedInUsername) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: pageNumber,
        size: pageSize,
        sortBy: sortField,
        ascending: sortAsc,
      });

      const response = await fetch(
        `${API_BASE_URL}/DailyTrackerPage/${userToFetch}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setRecords([]);
        setTotalPages(null);
        setTotalRecords(null);
        if (userId) setViewingUserId(userId);
        return;
      }

      const data = await response.json();
      const recordsPayload = Array.isArray(data)
        ? data
        : data.content ?? data.records ?? data.items ?? [];

      setRecords(recordsPayload);
      setPage(pageNumber);
      setSize(pageSize);
      setSortBy(sortField);
      setAscending(sortAsc);
      setTotalPages(!Array.isArray(data) ? data.totalPages ?? null : null);
      setTotalRecords(
        !Array.isArray(data)
          ? data.totalElements ?? data.total ?? recordsPayload.length
          : recordsPayload.length
      );

      if (userId) {
        setViewingUserId(userId);
      } else {
        setViewingUserId("");
      }
    } catch (err) {
      console.error(err);
      setRecords([]);
      setTotalPages(null);
      setTotalRecords(null);
      setError("Unable to load daily tracker data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    const confirmed = window.confirm(
      "Delete this tracker entry? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      const targetUser = viewingUserId || username;
      const recordDate = record?.date || record?.recordDate;

      if (!token || !username || !recordDate) {
        setDeleteMessage("❌ Missing required data. Please reload the page.");
        return;
      }

      const date = new Date(recordDate);
      const formattedDate = date.toISOString().split("T")[0];

      const response = await fetch(
        `${API_BASE_URL}/deleteTracker/${targetUser}/${formattedDate}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(token),
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        setDeleteMessage("✅ Record deleted successfully");
        fetchRecords(viewingUserId);
      } else {
        setDeleteMessage(responseText || "Unable to delete record");
      }
    } catch (err) {
      console.error(err);
      setDeleteMessage("❌ Server error while deleting record");
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      navigate("/");
      return;
    }

    try {
      const targetUser = viewingUserId || username;
      const payload = {
        date: formData.date,
        nutrients: {
          fat: Number(formData.fat) || 0,
          protein: Number(formData.protein) || 0,
          carbohydrate: Number(formData.carbohydrate) || 0,
          fiber: Number(formData.fiber) || 0,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/addDailyProgress/${targetUser}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        setSubmitMessage("✅ Record added successfully");
        setFormData({
          date: "",
          fat: "",
          protein: "",
          carbohydrate: "",
          fiber: "",
        });
        setShowForm(false);
        fetchRecords(viewingUserId);
      } else {
        setSubmitMessage(responseText || "Unable to save record");
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage("❌ Server error");
    }
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const targetUser = viewingUserId || username;

    if (!token || !username || !selectedRecord) {
      setEditMessage("❌ Missing required data");
      return;
    }

    try {
      const payload = {
        date: editFormData.date || selectedRecord?.date || selectedRecord?.recordDate,
        nutrients: {
          ...(selectedRecord.nutrients?.id ? { id: selectedRecord.nutrients.id } : {}),
          fat: Number(editFormData.fat) || 0,
          protein: Number(editFormData.protein) || 0,
          carbohydrate: Number(editFormData.carbohydrate) || 0,
          fiber: Number(editFormData.fiber) || 0,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/editDailyProgress/${targetUser}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        setEditMessage("✅ Record has been changed successfully");
        setSelectedRecord(null);
        setEditFormData({
          date: "",
          fat: "",
          protein: "",
          carbohydrate: "",
          fiber: "",
        });
        fetchRecords(viewingUserId);
      } else if (response.status === 409) {
        setEditMessage(responseText || "Record cannot be Edited or does not exist");
      } else {
        setEditMessage(responseText || "Unknown error occurred");
      }
    } catch (err) {
      console.error(err);
      setEditMessage("❌ Server error while updating record");
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setError("");

    if (!customUserId.trim()) {
      setViewingUserId("");
      setPage(0);
      await fetchRecords(null, 0, size, sortBy, ascending);
      return;
    }

    setPage(0);
    setLoading(true);
    await fetchRecords(customUserId.trim(), 0, size, sortBy, ascending);
  };

  const handleResetToMyData = () => {
    setCustomUserId("");
    setError("");
    setPage(0);
    fetchRecords(null, 0, size, sortBy, ascending);
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      fetchRecords(viewingUserId || null, page - 1, size, sortBy, ascending);
    }
  };

  const handleNextPage = () => {
    if (totalPages !== null) {
      if (page < totalPages - 1) {
        fetchRecords(viewingUserId || null, page + 1, size, sortBy, ascending);
      }
    } else if (records.length === size) {
      fetchRecords(viewingUserId || null, page + 1, size, sortBy, ascending);
    }
  };

  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setPage(0);
    fetchRecords(viewingUserId || null, 0, size, newSort, ascending);
  };

  const handleOrderToggle = () => {
    setPage(0);
    fetchRecords(viewingUserId || null, 0, size, sortBy, !ascending);
  };

  const handleSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setPage(0);
    fetchRecords(viewingUserId || null, 0, newSize, sortBy, ascending);
  };

  const formatDateString = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return "Unknown Date";
    }
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <h1 className="text-white text-2xl font-bold">Loading Tracker Data...</h1>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Daily Nutrition Tracker 🍎</h1>
            <p className="text-slate-300 mt-2">Monitor your daily nutrition and progress.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            {showForm ? "Close Form" : "+ Add Record"}
          </button>
        </div>

        {/* Admin Search Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
          <h2 className="text-white text-xl font-bold mb-4">Search User Tracker (Admin)</h2>
          <form onSubmit={handleSearchUser} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter username to view their tracker data (Leave blank to view your own)"
              value={customUserId}
              onChange={(e) => setCustomUserId(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 bg-white/90 text-slate-900"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Search
            </button>
            {viewingUserId && (
              <button
                type="button"
                onClick={handleResetToMyData}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                View My Data
              </button>
            )}
          </form>
          {viewingUserId && (
            <p className="text-indigo-300 mt-3 text-sm">
              Currently viewing tracker data for: <span className="font-semibold">{viewingUserId}</span>
            </p>
          )}
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-slate-300 text-sm">
              Sort by
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="mt-2 w-full rounded-xl bg-slate-800 text-white px-3 py-2"
              >
                <option value="date">Date</option>
                <option value="fat">Fat</option>
                <option value="protein">Protein</option>
                <option value="carbohydrate">Carbs</option>
                <option value="fiber">Fiber</option>
              </select>
            </label>

            <label className="text-slate-300 text-sm">
              Sort order
              <button
                type="button"
                onClick={handleOrderToggle}
                className="mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2"
              >
                {ascending ? "Ascending" : "Descending"}
              </button>
            </label>

            <label className="text-slate-300 text-sm">
              Page size
              <select
                value={size}
                onChange={handleSizeChange}
                className="mt-2 w-full rounded-xl bg-slate-800 text-white px-3 py-2"
              >
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-400 text-sm">
              Page {page + 1}
              {totalPages !== null ? ` of ${totalPages}` : ""}
              {totalRecords !== null ? ` · ${totalRecords} records` : ""}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={page === 0}
                className="rounded-xl px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={totalPages !== null ? page >= totalPages - 1 : records.length < size}
                className="rounded-xl px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <h2 className="text-white text-2xl font-bold mb-5">Add Daily Record</h2>
            <form onSubmit={handleAddRecord} className="grid md:grid-cols-2 gap-4">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                required
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <input
                type="number"
                name="fat"
                placeholder="Fat (g)"
                value={formData.fat}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <input
                type="number"
                name="protein"
                placeholder="Protein (g)"
                value={formData.protein}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <input
                type="number"
                name="carbohydrate"
                placeholder="Carbohydrates (g)"
                value={formData.carbohydrate}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <input
                type="number"
                name="fiber"
                placeholder="Fiber (g)"
                value={formData.fiber}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold"
              >
                Save Record
              </button>
            </form>
            {submitMessage && <p className="mt-4 text-center text-white">{submitMessage}</p>}
          </div>
        )}

        {/* Edit Form */}
        {selectedRecord && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-2xl font-bold">Edit Record</h2>
              <button type="button" onClick={cancelEdit} className="text-slate-300 hover:text-white underline text-sm">
                Cancel
              </button>
            </div>
            <form onSubmit={handleUpdateRecord} className="grid md:grid-cols-2 gap-4">
              <input type="hidden" name="date" value={editFormData.date} />
              <input
                type="number"
                name="fat"
                placeholder="Fat (g)"
                value={editFormData.fat}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <input
                type="number"
                name="protein"
                placeholder="Protein (g)"
                value={editFormData.protein}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <input
                type="number"
                name="carbohydrate"
                placeholder="Carbohydrates (g)"
                value={editFormData.carbohydrate}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <input
                type="number"
                name="fiber"
                placeholder="Fiber (g)"
                value={editFormData.fiber}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90 text-slate-900"
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl py-3 font-semibold"
              >
                Update Record
              </button>
            </form>
            {editMessage && <p className="mt-4 text-center text-white">{editMessage}</p>}
            {deleteMessage && <p className="mt-4 text-center text-white">{deleteMessage}</p>}
          </div>
        )}

        {/* Grid/Records View Area */}
        {records.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/10">
            <h2 className="text-white text-2xl font-bold">No Records Found</h2>
            <p className="text-slate-300 mt-2">There is no nutritional progress entry logged for this account.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {records.map((record, index) => {
              const nutrients = record.nutrients || {};
              const dateString = formatDateString(record.date || record.recordDate);

              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition"
                >
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-xl font-bold text-white">📅 {dateString}</h2>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(record)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-4 py-2 rounded-xl font-semibold text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(record)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Fat</span>
                      <span className="text-white font-medium">{nutrients.fat ?? 0} g</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Protein</span>
                      <span className="text-white font-medium">{nutrients.protein ?? 0} g</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Carbohydrates</span>
                      <span className="text-white font-medium">{nutrients.carbohydrate ?? 0} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Fiber</span>
                      <span className="text-white font-medium">{nutrients.fiber ?? 0} g</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}