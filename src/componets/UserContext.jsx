import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Check for existing user data in localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo)); // Save to localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove from localStorage
  };

  // Check if user is in localStorage on mount and set user if so
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
  