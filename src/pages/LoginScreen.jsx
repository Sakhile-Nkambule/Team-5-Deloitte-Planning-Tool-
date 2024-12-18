import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../componets/UserContext";
import loginImage from "../assets/Images/login.jpeg";

export function SignIn() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("API URL:", import.meta.env.VITE_API_URL);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const user = await res.json();
        login(user);

        // Check the role and navigate accordingly
        if (
          [
            "Associate Director",
            "Director",
            "Snr Associate Director",
            "Senior Manager",
            "Assistant Manager",
            "Manager",
          ].includes(user.role)
        ) {
          navigate("/homepage");
        } else {
          navigate("/userhomepage");
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Failed to Login");
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Sign In</h2>
          <p className="text-lg font-normal text-gray-500">
            Enter your email and password to Sign In.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
        >
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-1 flex flex-col gap-6">
            <label className="text-sm text-gray-500 font-medium mb-3">
              Your email
              <input
                type="email"
                placeholder="name@mail.com"
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
            className="mt-6 w-full py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg"
          >
            Sign In
          </button>

          <div className="flex items-center justify-between gap-2 mt-6">
            <a href="#" className="text-sm text-gray-900 font-medium underline">
              Forgot Password
            </a>
          </div>
          <p className="text-center text-gray-500 mt-4">
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">
              Create account
            </Link>
          </p>
          <div className="h-40">{/* gap for aesthetics */}</div>
        </form>
      </div>
      <div className="w-2/5 h-128">
        <img
          src={loginImage}
          className="h-full w-full object-cover rounded-3xl"
          alt="Login"
        />
      </div>
    </section>
  );
}

export default SignIn;
