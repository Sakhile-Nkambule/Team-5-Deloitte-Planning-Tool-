import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { toast } from "react-toastify";
import loginImage from "../assets/Images/login.jpeg";

export function CreateUserAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // Changed to boolean to track success state

  useEffect(() => {
    if (success) {
      alert("Verification Email Sent");
      navigate("/"); // Navigate to login when success is true
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = `${name} ${surname}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      setSuccess(true); // Set success to true on successful email verification
      //notify();

      localStorage.setItem(
        "pendingUser",
        JSON.stringify({ username, email, role, password })
      );

      const checkVerification = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(checkVerification);

          const pendingUser = localStorage.getItem("pendingUser");
          if (pendingUser) {
            const userData = JSON.parse(pendingUser);

            try {
              const response = await fetch(
                `${import.meta.env.VITE_API_URL}/register`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(userData),
                }
              );

              if (response.ok) {
                localStorage.removeItem("pendingUser");
                setSuccess(true); // Set success to true to trigger navigation
              } else {
                setError("Failed to register user in the database");
              }
            } catch (err) {
              setError(
                "Failed to register user in the database: " + err.message
              );
            }
          }
        }
      }, 5000); // Check every 5 seconds

      setName("");
      setSurname("");
      setEmail("");
      setRole("");
      setPassword("");
    } catch (err) {
      setError("Failed to create account: " + err.message);
    }
  };

  return (
    <section className="border-2 border-lime-500 m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Create Account</h2>
          <p className="text-lg font-normal text-gray-500">
            Fill in the details to create your account.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
        >
          {error && <p className="text-red-500">{error}</p>}
          {success && (
            <p className="text-green-500">
              Account created successfully. Redirecting to login...
            </p>
          )}
          <div className="mb-1 flex flex-col gap-6">
            <label className="text-sm text-gray-500 font-medium mb-3">
              Name
              <input
                type="text"
                placeholder="First Name"
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-500 font-medium mb-3">
              Surname
              <input
                type="text"
                placeholder="Last Name"
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-500 font-medium mb-3">
              Email
              <input
                type="email"
                placeholder="name@mail.com"
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-500 font-medium mb-3">
              Role
              <select
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select a Role</option>
                <option value="Director">Director</option>
                <option value="Snr Associate Director">
                  Snr AssociateDirector
                </option>
                <option value="Associate Director">Associate Director</option>
                <option value="Senior Manager">Senior Manager</option>
                <option value="Manager">Manager</option>
                <option value="Snr Consultant">Snr Consultant</option>
                <option value="Consultant">Consultant</option>
                <option value="Jnr Consultant">Jnr Consultant</option>
              </select>
            </label>
            <label className="text-sm text-gray-500 font-medium mb-3">
              Password
              <input
                type="password"
                placeholder="********"
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 w-full py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 hover:shadow-lg 
             transform hover:scale-105 transition-all"
          >
            Create Account
          </button>
        </form>
      </div>
      <div className="w-2/5 h-128"></div>
      <div className="w-4/5 h-125">
        <img
          src={loginImage}
          className="h-full w-full object-cover rounded-2xl"
          alt="Login"
        />
      </div>
    </section>
  );
}

export default CreateUserAccount;
