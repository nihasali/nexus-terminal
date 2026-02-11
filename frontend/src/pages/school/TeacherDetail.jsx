import React, { useEffect,useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTeacherDetail } from '../../api/authService';
import { Link } from "react-router-dom";

function TeacherDetail() {

    const {id}=useParams();
    const [teacher,setTeacher]=useState(null)

    useEffect(() => {
    getTeacherDetail(id)
      .then(res => setTeacher(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!teacher) return <h3>Loading...</h3>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">

        <h2 className="text-2xl font-bold mb-4">
          Teacher Details
        </h2>

        <p><b>Name:</b> {teacher.fullname}</p>
        <p><b>Email:</b> {teacher.email}</p>
        <p><b>Phone:</b> {teacher.phone}</p>
        <p><b>Employee ID:</b> {teacher.employee_id}</p>
        <p><b>Joining Date:</b> {teacher.joining_date}</p>
        <p><b>Salary:</b> {teacher.salary}</p>
        <p><b>Qualification:</b> {teacher.qualification}</p>
        <p><b>Experience:</b> {teacher.years_of_experience} years</p>

        <div className="mt-4">

          <Link
            to={`/school-teacher/edit/${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Teacher
          </Link>

        </div>

      </div>
    </div>
  );
}

export default TeacherDetail