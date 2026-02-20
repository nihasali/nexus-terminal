import React from "react";
import ParentSidebar from "./ParentSidebar";

function ParentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}

export default ParentLayout;