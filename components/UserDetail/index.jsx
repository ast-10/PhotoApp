import React, { useEffect, useState } from "react";
import { Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';


import "./styles.css";

function UserDetail({ userId, setUserName }) {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/user/${userId}`).then((result) => {
      setUserDetails(result.data);
      setUserName(`${result.data.first_name} ${result.data.last_name}`);
    });
  }, [userId, setUserName]);

  const handlePhotosClick = (id) => {
    navigate(`/photos/${id}`);
  };

  if (!userDetails) return <div>Loading user details...</div>;

  return (
    <Grid container justifyContent="center" spacing={2} className="user-detail-container">
      <Grid item sm={6} xs={12}>
        <Card className="user-detail-card">
          <CardContent>
            <Typography variant="h5" className="user-detail-title" gutterBottom>
              {userDetails.first_name} {userDetails.last_name}
            </Typography>

            <Divider sx={{ margin: "15px 0" }} />

            <Typography variant="body1" className="user-detail-text">
              <strong>Location:</strong> {userDetails.location}
            </Typography>

            <Typography variant="body1" className="user-detail-text">
              <strong>Occupation:</strong> {userDetails.occupation}
            </Typography>

            <Divider sx={{ margin: "15px 0" }} />

            <Typography variant="body1" className="user-detail-text">
              {userDetails.description}
            </Typography>

            <Divider sx={{ margin: "15px 0" }} />

            <Typography
              variant="body1"
              className="user-detail-link"
              onClick={() => handlePhotosClick(userDetails._id)}
            >
              <strong>Photos</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default UserDetail;
