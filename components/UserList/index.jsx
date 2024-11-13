import React, { useState, useEffect } from "react";
import { Divider,List,ListItem,ListItemText} from "@mui/material";
import { useNavigate } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
import "./styles.css";
import axios from 'axios';
function UserList() {
  const [allUserDetails, setAllUserDetails] = useState([]);
  const navigate = useNavigate(); 

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  useEffect(() => {
    axios.get("http://localhost:3000/user/list")
    .then((result) => {
      setAllUserDetails(result.data);
    });
  },[]);

  return (
    <div>
      <List component="nav">
        {allUserDetails.map((user, index) => (
          <React.Fragment key={index}>
          <ListItem onClick= {() => handleUserClick(user._id)}>
          <ListItemText primary={`${user.first_name} ${user.last_name}`} />
          </ListItem>
          <Divider />
          </React.Fragment >
        ))} 
      </List>
    </div>
  );
}

export default UserList;
