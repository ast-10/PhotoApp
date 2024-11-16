import React from "react";
import { useAuth } from "../AuthProvider";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./styles.css";

function TopBar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async(e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/admin/logout");
      logout();
      navigate(`/login`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      {user ? 
        (<>
          <Typography variant="h5" color="inherit">
          Hi {user.first_name}
          </Typography>
          <button onClick={handleLogout}>Logout</button>
        </>) : (
          <Typography variant="h5" color="inherit">Please Login</Typography>
        )}
        <Typography variant="h5" color="inherit">
        {user ? title: ''}
        </Typography>
      </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
