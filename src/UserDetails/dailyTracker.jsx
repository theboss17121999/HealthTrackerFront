import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

export default function DailyTrackerPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

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
        `${API_BASE_URL}/addDailyProgress/${username}`,
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

      if (response.status === 201) {
        setSubmitMessage("✅ Record added successfully");

        setFormData({
          date: "",
          fat: "",
          protein: "",
          carbohydrate: "",
          fiber: "",
        });

        setShowForm(false);
        fetchRecords();
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

    if (!token || !username || !selectedRecord) {
      navigate("/");
      return;
    }

    try {
      const payload = {
        // prefer explicit edit date, otherwise use the existing record date
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
        `${API_BASE_URL}/editDailyProgress/${username}`,
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

      if (response.status === 201) {
        setEditMessage("✅ Record has been changed successfully");
        setSelectedRecord(null);
        fetchRecords();
      } else if (response.status === 409) {
        setEditMessage(responseText || "Record cannot be Edited or does not exists");
      } else {
        setEditMessage(responseText || "Unknown error occurred");
      }
    } catch (err) {
      console.error(err);
      setEditMessage("❌ Server error while updating record");
    }
  };

  const fetchRecords = async () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/DailyTracker/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load records");
      }

      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load daily tracker data.");
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-white text-2xl font-bold">
          Loading Tracker Data...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <h1 className="text-red-400 text-xl">{error}</h1>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Daily Nutrition Tracker 🍎
            </h1>

            <p className="text-slate-300 mt-2">
              Monitor your daily nutrition and progress.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            {showForm ? "Close Form" : "+ Add Record"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <h2 className="text-white text-2xl font-bold mb-5">
              Add Daily Record
            </h2>

            <form
              onSubmit={handleAddRecord}
              className="grid md:grid-cols-2 gap-4"
            >
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                required
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <input
                type="number"
                name="fat"
                placeholder="Fat (g)"
                value={formData.fat}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <input
                type="number"
                name="protein"
                placeholder="Protein (g)"
                value={formData.protein}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <input
                type="number"
                name="carbohydrate"
                placeholder="Carbohydrates (g)"
                value={formData.carbohydrate}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <input
                type="number"
                name="fiber"
                placeholder="Fiber (g)"
                value={formData.fiber}
                onChange={handleFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold"
              >
                Save Record
              </button>
            </form>

            {submitMessage && (
              <p className="mt-4 text-center text-white">
                {submitMessage}
              </p>
            )}
          </div>
        )}

        {selectedRecord && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-2xl font-bold">
                Edit Record
              </h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleUpdateRecord}
              className="grid md:grid-cols-2 gap-4"
            >
              {/* date hidden during edit - backend will use the record's date if not provided */}
              <input
                type="hidden"
                name="date"
                value={editFormData.date}
                onChange={handleEditFormChange}
              />

              <input
                type="number"
                name="fat"
                placeholder="Fat (g)"
                value={editFormData.fat}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <input
                type="number"
                name="protein"
                placeholder="Protein (g)"
                value={editFormData.protein}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <input
                type="number"
                name="carbohydrate"
                placeholder="Carbohydrates (g)"
                value={editFormData.carbohydrate}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <input
                type="number"
                name="fiber"
                placeholder="Fiber (g)"
                value={editFormData.fiber}
                onChange={handleEditFormChange}
                className="rounded-xl px-4 py-3 bg-white/90"
              />

              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl py-3 font-semibold"
              >
                Update Record
              </button>
            </form>

            {editMessage && (
              <p className="mt-4 text-center text-white">
                {editMessage}
              </p>
            )}
          </div>
        )}

        {/* Records */}
        {records.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center">
            <h2 className="text-white text-2xl font-bold">
              No Records Found
            </h2>

            <p className="text-slate-300 mt-2">
              Add your first nutrition entry.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {records.map((record, index) => {
              const nutrients = record.nutrients || {};
              const dateString = formatDateString(
                record.date || record.recordDate
              );

              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition"
                >
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-white">
                      📅 {dateString}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Fat</span>
                      <span className="text-white">
                        {nutrients.fat ?? 0} g
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Protein</span>
                      <span className="text-white">
                        {nutrients.protein ?? 0} g
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Carbohydrates</span>
                      <span className="text-white">
                        {nutrients.carbohydrate ?? 0} g
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-300">Fiber</span>
                      <span className="text-white">
                        {nutrients.fiber ?? 0} g
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => startEdit(record)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-4 py-2 rounded-xl font-semibold"
                    >
                      Edit
                    </button>
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