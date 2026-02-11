import React, { useEffect } from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";

/**
 * Toast Notification Component
 * Shows success or error messages with auto-dismiss
 */
function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md`}
      >
        <Icon size={24} className="flex-shrink-0" />
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Toast;