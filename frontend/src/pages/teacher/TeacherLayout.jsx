import React from "react";
import TeacherSidebar from "./TeacherSidebar";

function TeacherLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}

export default TeacherLayout;