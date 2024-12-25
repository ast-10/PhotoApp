import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate, useNavigate } from "react-router-dom";
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import fetchModel from "./lib/fetchModelData";

import { AuthProvider, useAuth } from "./components/AuthProvider";
import LoginRegister from "./components/LoginRegister";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationForm from "./components/Register";
import AddPhoto from './components/AddPhoto/AddPhoto';

function UserDetailRoute({ setUserName }) {
  const { userId } = useParams();
  return <UserDetail userId={userId} setUserName={setUserName} />;
}

function UserPhotosRoute({ setUserName }) {
  const { userId } = useParams();
  return <UserPhotos userId={userId} setUserName={setUserName} />;
}

function PhotoShare() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");

  useEffect(() => {
    fetchModel("/test/info").then((result) => {
      setVersion(result.data.__v); 
    });
  }, []);

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar title={title} version={version} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item" sx={{ height: "100vh" }}>
            {user && <UserList />}
            </Paper>
          </Grid>
          <Grid item sm={9} sx={{ maxWidth: "100%", overflow: "hidden" }}>
            <Paper
              className="main-grid-item"
              sx={{ maxWidth: "100%", height: "100vh", overflowY: "auto", overflowX: "hidden" }}
            >
              <Routes>
                <Route path="/login" element={<LoginRegister />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route
                  path="/users/:userId"
                  element={<ProtectedRoute><UserDetailRoute setUserName={(name) => setTitle(name)} /></ProtectedRoute>}
                />
                <Route
                  path="/photos/:userId"
                  element={<ProtectedRoute><UserPhotosRoute setUserName={(name) => setTitle(`Photos of ${name}`)} /></ProtectedRoute>}
                />
                <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
                <Route path="/addphoto" element={<AddPhoto />} />
                <Route
                  path="/"
                  element={user ? <Navigate to={`/users/${user._id}`} replace /> : <Navigate to="/login" replace />}
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
<AuthProvider>
  <PhotoShare />
</AuthProvider>);
