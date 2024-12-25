import React, { useState, useEffect } from "react";
import { Divider, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./styles.css";

function UserList() {
  const [allUserDetails, setAllUserDetails] = useState([]);
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  useEffect(() => {
    axios.get("http://localhost:3000/user/list").then((result) => {
      setAllUserDetails(result.data);
    });
  }, []);

  return (
    <div className="user-list-container">
      <List component="nav">
        {allUserDetails.map((user, index) => (
          <React.Fragment key={index}>
            <ListItem
              className="user-list-item"
              onClick={() => handleUserClick(user._id)}
            >
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            {index < allUserDetails.length - 1 && (
              <Divider className="user-list-divider" />
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
