import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function StudentEdit() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await api.get(`Profile/school-students/edit/${id}/`);
      console.log(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.patch(`Profile/school-students/edit/${id}/`, data);
      alert("Student updated successfully");
      navigate("/school-students");
    } catch (error) {
      console.error(error);
      alert("Error updating student");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Edit Student</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        <input
          name="fullname"
          value={formData.fullname || ""}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
          placeholder="Full Name"
        />

        <input
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Phone"
        />

        <select
          name="gender"
          value={formData.gender || ""}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          type="date"
          name="DOB"
          value={formData.DOB || ""}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="roll_number"
          value={formData.roll_number || ""}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Roll Number"
        />

        <input
          type="date"
          name="date_of_joining"
          value={formData.date_of_joining || ""}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="blood_group"
          value={formData.blood_group || ""}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Blood Group"
        />

        <input
          name="guardian_name"
          value={formData.guardian_name || ""}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Guardian Name"
        />

        <input
          name="guardian_phone"
          value={formData.guardian_phone || ""}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Guardian Phone"
        />

        <input
          name="student_contact"
          value={formData.student_contact || ""}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Student Contact"
        />

        <textarea
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
          placeholder="Address"
        />

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>

      </form>
    </div>
  );
}

export default StudentEdit;
