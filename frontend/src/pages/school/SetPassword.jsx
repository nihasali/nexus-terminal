import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { setPassword } from "../../api/authService";

function SetPassword() {

  const {token} = useParams();

  const [password, setPasswordValue] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("TOKEN:", token);


    try {
      const res = await setPassword({
        token,
        password
      });

      setMessage(res.data.message);

    } catch (error) {
      setMessage(
        error.response?.data?.error || "Invalid link"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-6 rounded shadow w-96">

        <h2 className="text-xl font-bold mb-4">
          Set Your Password
        </h2>

        {message && (
          <div className="mb-3 text-green-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="Enter new password"
            onChange={(e) => setPasswordValue(e.target.value)}
            className="border p-2 w-full mb-3"
          />

          <button className="bg-green-600 text-white p-2 w-full">
            Set Password
          </button>

        </form>

      </div>
    </div>
  );
}

export default SetPassword;
