import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useAuth } from "../AuthProvider";

import "./styles.css";

import { useNavigate } from "react-router-dom";
import axios from "axios";

function TopBar({ title, version }) {
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
          <button onClick={() => navigate('/addphoto')}>Add Photo</button>
        </>) : (
          <Typography variant="h5" color="inherit">Please Login</Typography>
        )}
        <Typography>
          Version: {version}
        </Typography>
        <Typography variant="h5" color="inherit">
          {user ? title: ''}
        </Typography>
      </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
