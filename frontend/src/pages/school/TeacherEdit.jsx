import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherDetail, updateTeacher } from '../../api/authService';
import Toast from '../../components/Toast';

function TeacherEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: '',
    phone: '',
    employee_id: '',
    joining_date: '',
    salary: '',
    qualification: '',
    years_of_experience: '',
  });

  const [toast, setToast] = useState(null);

  // ✅ GET teacher and prefill form
  useEffect(() => {
    getTeacherDetail(id)
      .then((res) => {
        const data = res.data;

        setForm({
          fullname: data.fullname || '',
          phone: data.phone || '',
          employee_id: data.employee_id || '',
          joining_date: data.joining_date
            ? data.joining_date.split('T')[0]
            : '',
          salary: data.salary || '',
          qualification: data.qualification || '',
          years_of_experience: data.years_of_experience ?? '',
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      salary: Number(form.salary),
      years_of_experience:
        form.years_of_experience === ''
          ? null
          : Number(form.years_of_experience),
      joining_date: form.joining_date || null,
    };

    try {
      await updateTeacher(id, payload);
      setToast({ message: 'Teacher updated successfully', type: 'success' });

      setTimeout(() => {
        navigate(`/school-teacher-details/${id}`);
      }, 1500);
    } catch (error) {
      console.error(error.response?.data);
      setToast({ message: 'Error updating Teacher', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Edit Teacher</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Full Name"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Phone"
          />

          <input
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Employee ID"
          />

          <input
            type="date"
            name="joining_date"
            value={form.joining_date}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            type="number"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Salary"
          />

          <input
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Qualification"
          />

          <input
            type="number"
            name="years_of_experience"
            value={form.years_of_experience}
            onChange={handleChange}
            className="border p-2 w-full"
            placeholder="Years of Experience"
          />

          <button className="bg-green-600 text-white p-2 w-full">
            Update Teacher
          </button>
        </form>
      </div>
    </div>
  );
}

export default TeacherEdit;
