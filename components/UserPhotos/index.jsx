import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";
import { useLocation } from 'react-router-dom';

function UserPhotos({ userId, setUserName, loggedInUser }) {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [photoDetails, setPhotoDetails] = useState([]);
  const [newComment, setNewComment] = useState({});
  const location = useLocation();

  useEffect(() => {
    axios
      .get(`/user/${userId}`)
      .then((result) => {
        setUserDetails(result.data);
        setUserName(`${result.data.first_name} ${result.data.last_name}`);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });

    axios
      .get(`/photosOfUser/${userId}`)
      .then((result) => {
        console.log("Photo Details:", result.data);
        setPhotoDetails(result.data);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
      });
  }, [userId, setUserName, location.state]);

  const handleCommentChange = (photoId, value) => {
    setNewComment((prev) => ({ ...prev, [photoId]: value }));
  };

  const handleCommentSubmit = (photoId) => {
    const commentText = newComment[photoId];
    if (!commentText || commentText.trim() === "") {
      alert("Comment cannot be empty");
      return;
    }

    axios
      .post(`/commentsOfPhoto/${photoId}`, { comment: commentText })
      .then((response) => {
        // Update the photo comments immediately
        setPhotoDetails((prevPhotos) =>
          prevPhotos.map((photo) =>
            photo._id === photoId
              ? {
                  ...photo,
                  comments: [
                    ...photo.comments,
                    {
                      _id: new Date().getTime().toString(), // Temporary ID
                      comment: commentText,
                      date_time: new Date().toISOString(),
                      user: {
                        _id: loggedInUser._id,
                        first_name: loggedInUser.first_name,
                        last_name: loggedInUser.last_name,
                      },
                    },
                  ],
                }
              : photo
          )
        );
        setNewComment((prev) => ({ ...prev, [photoId]: "" }));
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
        alert("Failed to add comment");
      });
  };

  const handleUserClick = (id) => {
    console.log("Navigating to user ID:", id);
    navigate(`/users/${id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Box className="user-photos-container">
      <Grid container direction="column" spacing={2}>
        {userDetails && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {userDetails.first_name} {userDetails.last_name}
            </Typography>
            <Divider sx={{ margin: "15px 0" }} />
          </Grid>
        )}
        {photoDetails.map((photo, index) => (
          <Grid item xs={12} key={index}>
            <Card className="photo-card">
              <CardContent>
                <Typography variant="body1" className="photo-date">
                  {formatDate(photo.date_time)}
                </Typography>

                <Divider sx={{ margin: "15px 0" }} />

                <img
                  src={`/images/${photo.file_name}`}
                  alt={photo.file_name}
                  className="photo-image"
                />

                <Divider sx={{ margin: "15px 0" }} />

                {Array.isArray(photo.comments) && photo.comments.length > 0 && (
                  <>
                    {photo.comments.map((comment, commentIndex) => (
                      <React.Fragment key={commentIndex}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                          }}
                        >
                          <Typography
                            onClick={() => handleUserClick(comment.user._id)}
                            variant="body1"
                            className="user-link"
                          >
                            {comment.user.first_name} {comment.user.last_name}
                          </Typography>
                          <Typography variant="body2" className="comment-text">
                            {comment.comment}
                          </Typography>
                          <Typography variant="body2" className="comment-date">
                            {formatDate(comment.date_time)}
                          </Typography>
                        </Box>
                        <Divider sx={{ margin: "5px 0" }} />
                      </React.Fragment>
                    ))}
                  </>
                )}

                {/* Input Field and Submit Button for Adding Comments */}
                <Box sx={{ marginTop: 2 }}>
                  <TextField
                    label="Add a comment"
                    variant="outlined"
                    fullWidth
                    value={newComment[photo._id] || ""}
                    onChange={(e) =>
                      handleCommentChange(photo._id, e.target.value)
                    }
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleCommentSubmit(photo._id)}
                    sx={{ marginTop: 1 }}
                  >
                    Submit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default UserPhotos;
