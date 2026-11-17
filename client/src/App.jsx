
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "https://feedback-backend-n69k.onrender.com/api/feedback";

const emptyForm = {
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: ""
};

function App() {
  const [feedback, setFeedback] = useState({ ...emptyForm });
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchFeedbacks() {
    try {
      const response = await axios.get(API);
      setAllFeedbacks(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Load error:", error);
      setErrorMessage(
        "Cannot connect to the server. Make sure the backend is running on port 5000."
      );
    }
  }

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFeedback(previous => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, feedback);
        alert("Feedback updated successfully!");
      } else {
        await axios.post(API, feedback);
        alert("Feedback submitted successfully!");
      }

      setFeedback({ ...emptyForm });
      setEditId(null);
      await fetchFeedbacks();
    } catch (error) {
      console.error("Submit error:", error.response?.data || error);

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to save feedback. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item) {
    setFeedback({
      q1: item.q1,
      q2: item.q2,
      q3: item.q3,
      q4: item.q4,
      q5: item.q5 || ""
    });
    setEditId(item.id);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);

      if (editId === id) {
        setFeedback({ ...emptyForm });
        setEditId(null);
      }

      await fetchFeedbacks();
      alert("Feedback deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to delete feedback."
      );
    }
  }

  function handleCancel() {
    setFeedback({ ...emptyForm });
    setEditId(null);
    setErrorMessage("");
  }

  return (
    <main className="container">
      <header className="page-header">
        <h1>Feedback Form</h1>
        <p>We value your feedback and suggestions.</p>
      </header>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <label htmlFor="q1">Name *</label>
        <input
          id="q1"
          name="q1"
          value={feedback.q1}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        <label htmlFor="q2">Department *</label>
        <input
          id="q2"
          name="q2"
          value={feedback.q2}
          onChange={handleChange}
          placeholder="Enter your department"
          required
        />

        <label htmlFor="q3">Session Title *</label>
        <input
          id="q3"
          name="q3"
          value={feedback.q3}
          onChange={handleChange}
          placeholder="Enter session title"
          required
        />

        <label htmlFor="q4">Feedback *</label>
        <textarea
          id="q4"
          name="q4"
          value={feedback.q4}
          onChange={handleChange}
          placeholder="Write your feedback"
          required
          rows="4"
        />

        <label htmlFor="q5">Suggestions</label>
        <textarea
          id="q5"
          name="q5"
          value={feedback.q5}
          onChange={handleChange}
          placeholder="Enter suggestions (optional)"
          rows="3"
        />

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : editId
              ? "Update Feedback"
              : "Submit Feedback"}
          </button>

          {editId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="error-message" role="alert">
            {errorMessage}
          </p>
        )}
      </form>

      <section className="feedback-list">
        <h2>Submitted Feedback</h2>
        <p>Total submissions: {allFeedbacks.length}</p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Session</th>
                <th>Feedback</th>
                <th>Suggestions</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {allFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No feedback submitted yet.
                  </td>
                </tr>
              ) : (
                allFeedbacks.map(item => (
                  <tr key={item.id}>
                    <td>{item.q1}</td>
                    <td>{item.q2}</td>
                    <td>{item.q3}</td>
                    <td>{item.q4}</td>
                    <td>{item.q5 || "—"}</td>
                    <td className="action-buttons">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
