import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreateUserAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const username = `${name} ${surname}`; // Combine name and surname to form the Username

    try {
      // Assuming you have an endpoint for Azure authentication and user creation
      const res = await fetch('http://localhost:8081/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, role, password }),
      });

      if (res.ok) {
        // Navigate to the login page after successful registration
        navigate('/auth/sign-in');
      } else {
        setError('Failed to create account');
      }
    } catch (err) {
      setError('Failed to create account');
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Create Account</h2>
          <p className="text-lg font-normal text-gray-500">Fill in the details to create your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          {error && <p className="text-red-500">{error}</p>}
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
                <option value="Senior Manager">Senior Manager</option>
                <option value="Assistant Manager">Assistant Manager</option>
                <option value="Associate Director">Associate Director</option>
                <option value="Senior Assistant">Senior Assistant</option>
                <option value="Junior Consultant">Junior Consultant</option>
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
          <button type="submit" className="mt-6 w-full py-2 bg-lime-500 text-white rounded-lg">
            Create Account
          </button>
        </form>
      </div>
      <div className="w-2/5 h-128">
        {/* You can add an image here if needed */}
      </div>
    </section>
  );
}

export default CreateUserAccount;