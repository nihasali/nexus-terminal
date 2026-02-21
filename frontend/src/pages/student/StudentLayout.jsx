import React from "react";
import StudentSidebar from "./StudentSidebar";

function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}

export default StudentLayout;