import React, { useEffect, useState } from "react";
import { 
  Card, CardContent, Divider, Grid, Typography, Box 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
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

  const handlePhotosClick = () => {
    navigate(`/photos/${userId}`);
  };

  if (!userDetails) return <div>Loading user details...</div>;

  return (
    <Grid 
      container 
      justifyContent="center" 
      spacing={2} 
      sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}
    >
      <Grid item sm={8} xs={12}>
        <Card 
          sx={{
            margin: "20px auto",
            padding: "24px",
            borderRadius: 3,
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {userDetails.first_name} {userDetails.last_name}
            </Typography>

            <Divider sx={{ margin: "20px 0" }} />

            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" color="text.secondary">
                <strong>Location:</strong> {userDetails.location}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Occupation:</strong> {userDetails.occupation}
              </Typography>
            </Box>

            <Divider sx={{ margin: "20px 0" }} />

            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
              {userDetails.description}
            </Typography>

            <Divider sx={{ margin: "20px 0" }} />

            <Typography variant="body1" color="text.secondary">
              <strong>User ID:</strong> {userDetails._id}
            </Typography>

            <Divider sx={{ margin: "20px 0" }} />

            <Typography
              variant="body1"
              color="primary"
              onClick={handlePhotosClick}
              sx={{ 
                cursor: "pointer", 
                "&:hover": { textDecoration: "underline" }, 
                fontWeight: 500 
              }}
            >
              View Photos
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default UserDetail;
