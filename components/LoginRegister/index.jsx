import React, { useState } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css"; // Import the CSS file

function LoginRegister() {
  const { login } = useAuth();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/admin/login", {
        login_name: loginName,
        password,
      });
      login(response.data);
      console.log(response.data);
      navigate(`/users/${response.data._id}`);
    } catch (err) {
      setError("Login failed. Please try again with correct login name and password.");
    }
  };

  return (
    <div className="login-register-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          placeholder="Login Name"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <button
          className="redirect-button"
          onClick={() => navigate("/register")}
        >
          Register Me
      </button>
    </div>
  );
}

export default LoginRegister;
