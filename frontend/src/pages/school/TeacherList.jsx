import React, { useEffect, useState } from 'react'
import { listTeachers } from '../../api/authService'
import { Link } from "react-router-dom";

function TeacherList() {
    const [teachers,setteachers]=useState([])

    useEffect(()=>{
        listTeachers()
        .then(res=>setteachers(res.data))
        .catch(err=>console.log(err))
    },[])
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">

        <h2 className="text-2xl font-bold mb-4">Teachers</h2>

        <table className="w-full border">

          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Employee ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map(t => (
              <tr key={t.id} className="border-b">

                <td className="p-2">{t.fullname}</td>
                <td>{t.email}</td>
                <td>{t.employee_id}</td>

                <td>
                  {t.is_setup_complete ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Pending</span>
                  )}
                </td>

                <td className="space-x-2">

                  <Link
                    to={`/school-teacher-details/${t.id}`}
                    className="text-blue-600"
                  >
                    View
                  </Link>

                  <Link
                    to={`/school-teacher/edit/${t.id}`}
                    className="text-green-600"
                  >
                    Edit
                  </Link>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}

export default TeacherList