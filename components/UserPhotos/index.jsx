import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, Divider, Grid, Typography, Box 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
import "./styles.css";
import axios from 'axios';
function UserPhotos({ userId, setUserName }) {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [photoDetails, setPhotoDetails] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/user/${userId}`).then((result) => {
      setUserDetails(result.data);
      setUserName(`${result.data.first_name} ${result.data.last_name}`);
    });

    axios.get(`http://localhost:3000/photosOfUser/${userId}`).then((result) => {
      setPhotoDetails(result.data);
    });
  }, [userId, setUserName]);

  const handleUserClick = () => {
    navigate(`/users/${userId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 4,
      }}
    >
      <Grid
        container
        direction="column"
        spacing={3}
        sx={{ maxWidth: 800, width: "100%" }}
      >
        {userDetails && (
          <Grid item xs={12}>
            <Typography variant="h4" align="center" gutterBottom>
              {userDetails.first_name} {userDetails.last_name}
            </Typography>
            <Divider sx={{ margin: "10px 0" }} />
          </Grid>
        )}

        {photoDetails.map((photo, index) => (
          <Grid item xs={12} key={index}>
            <Card 
              sx={{
                padding: 3,
                borderRadius: 2,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent
                sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 2 
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  <strong>Date:</strong> {photo.date_time}
                </Typography>

                <Divider />

                <img
                  src={`/images/${photo.file_name}`}
                  alt={photo.file_name}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />

                <Divider />

                {Array.isArray(photo.comments) && (
                  <Box>
                    {photo.comments.map((comment, commentIndex) => (
                      <React.Fragment key={commentIndex}>
                        <Box sx={{ marginBottom: 2 }}>
                          <Typography
                            onClick={() => handleUserClick(comment.user._id)}
                            variant="body1"
                            color="primary"
                            sx={{ 
                              cursor: "pointer", 
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            <strong>
                              {comment.user.first_name} {comment.user.last_name}
                            </strong>
                          </Typography>

                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ marginLeft: 2 }}
                          >
                            {comment.comment}
                          </Typography>

                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ alignSelf: "flex-end", display: "block", marginTop: 1 }}
                          >
                            <strong>{comment.date_time}</strong>
                          </Typography>
                        </Box>
                        <Divider sx={{ margin: "5px 0" }} />
                      </React.Fragment>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default UserPhotos;
