import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate, useNavigate } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import LoginRegister from "./components/LoginRegister";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationForm from "./components/Register";

function UserDetailRoute( { setUserName }) {
  const {userId} = useParams();
  return <UserDetail userId={userId} setUserName={setUserName} />;
}

function UserPhotosRoute({ setUserName }) {
  const {userId} = useParams();
  return <UserPhotos userId={userId} setUserName={setUserName}/>;
}

function LoginWithRegisterButton() {
  const navigate = useNavigate();
  return (
    <div>
      <LoginRegister />
      <button onClick={() => navigate("/register")}>Register Me</button>
    </div>
  );
}

function PhotoShare() {
  const { user } = useAuth();
  const [_, setUserName] = useState("");
  const [title, setTitle] = useState("");

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar title={title} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {user && <UserList />}
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route path="/login" element={<LoginWithRegisterButton />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route
                  path="/users/:userId"
                  element={
                    <ProtectedRoute>
                      <UserDetailRoute
                        setUserName={(name) => {
                          setUserName(name);
                          setTitle(name);
                        }}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/photos/:userId"
                  element={
                    <ProtectedRoute>
                      <UserPhotosRoute
                        setUserName={(name) => {
                          setUserName(name);
                          setTitle(`Photos of ${name}`);
                        }}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UserList />
                    </ProtectedRoute>
                  }
                />
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
</AuthProvider>
);
