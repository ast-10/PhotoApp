import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

function UserDetailRoute( { setUserName }) {
  const {userId} = useParams();
  return <UserDetail userId={userId} setUserName={setUserName} />;
}

function UserPhotosRoute({ setUserName }) {
  const {userId} = useParams();
  return <UserPhotos userId={userId} setUserName={setUserName}/>;
}

function PhotoShare() {

  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("");
  console.log(userName);
  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar title={title}/>
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route path="/users/:userId" 
				element={(
				<UserDetailRoute setUserName={(name) => {
                  setUserName(name);
                  setTitle(name);}}/>
				)} />
                <Route path="/photos/:userId" element={(
				<UserPhotosRoute setUserName={(name) => {
                  setUserName(name);
                  setTitle(`Photos of ${name}`);}}/>
				)} />  
                <Route path="/users" element={<UserList />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}


const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
