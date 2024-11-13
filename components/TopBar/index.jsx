import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

import "./styles.css";

function TopBar({ title }) {

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Typography variant="h5" color="inherit">
          Arya
        </Typography>
        <Typography variant="h5" color="inherit">
          {title}
        </Typography>
      </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
