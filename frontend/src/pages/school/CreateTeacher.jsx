import React, { useState } from "react";
import { createTeacher } from "../../api/authService";

function CreateTeacher() {

  const [form, setForm] = useState({
     fullname: "",
     email: "",
     phone: "",
     employee_id: "",
     joining_date: "",
     salary: "",
     qualification: "",
     years_of_experience: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await createTeacher(form);
      setMessage(res.data.message);
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Something went wrong"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">

        <h2 className="text-2xl font-bold mb-4">
          Create Teacher
        </h2>

        {message && (
          <div className="mb-4 text-green-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="fullname"
            placeholder="Full Name"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="employee_id"
            placeholder="Employee ID"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            type="date"
            name="joining_date"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="salary"
            placeholder="Salary"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="qualification"
            placeholder="Qualification"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="years_of_experience"
            placeholder="Years of Experience"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <button
            className="bg-blue-600 text-white p-2 w-full"
          >
            Create Teacher
          </button>

        </form>

      </div>
    </div>
  );
}

export default CreateTeacher;
