import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
//import User from "models/User";
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
//import PropTypes from "prop-types";
import "styles/views/Profile.scss";
import {Button} from "components/ui/Button";
//import axios from 'axios';

const Profile = () => {
  const userId= sessionStorage.getItem("userId");
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data);
      sessionStorage.setItem("userId", userId);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };


  const saveUserData = async () => {
    try {
      const requestBody: { token: string; username?: string; password?: string } = {
        token: token,
      };

      if (newUsername) {
        requestBody.username = newUsername;
      }

      if (newPassword) {
        requestBody.password = newPassword;
      }

      console.log("request body", requestBody)
      await api.put(`/users/${userId}`, requestBody);
      setNewUsername("")
      setNewPassword("")
      setSuccessMessage("User updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchUserData(); // Refresh user data after saving
      setEditing(false); // Exit edit mode

    } catch (error) {
      setEditing(true);
      if (error.response) {
        setErrorMessage(`Error: ${error.response.data.message}`);
      } else {
        setErrorMessage("Error: Something went wrong!");
      }
    } finally {
      setShowMessageBox(true);
    }
  };

  const displayMessage = (messageText, messageType) => {
    setMessage({ text: messageText, type: messageType });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000); // Hide message after 5 seconds
  };

  const handleClick = () => {
    if ((newUsername && /\s/.test(newUsername)) || (newPassword && /\s/.test(newPassword))) {
      displayMessage("Username and password can't contain whitespace.", "error-message");
    } else if (newUsername && (newUsername.length < 3 || newUsername.length > 8)) {
      displayMessage("Username length must be between 3 and 8 characters.", "error-message");
    } else if (newPassword && (newPassword.length < 3 || newPassword.length > 8)) {
      displayMessage("Password length must be between 3 and 8 characters.", "error-message");
    } else {
      saveUserData();
      setEditing(false);
    }
  };


  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, [userId]); // Re-fetch data when ID changes

  console.log(sessionStorage);
  const handleLogout = () => {
    sessionStorage.clear();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("creation_date");
    navigate("/login");
  };

  const exit = () => {
    setEditing(false)
    setNewUsername("");
    setNewPassword("");
    setErrorMessage("")
    navigate(`/users/${userId}`);
  };

  const back = () => {
    navigate(`/lobby/${userId}`);
  };

  return (
    <BaseContainer className="profile-container">
      <div className="left-section">
        {userData ? (
          <div className="profile-info">
            <p>ID: {userData.id}</p>
            <p>Online Status: {userData.status}</p>
            <p>Username: <span className="arialed">{userData.username}</span></p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        {!editing && successMessage && (
          <div style={{ fontSize: "16px", fontFamily: "\"Microsoft YaHei\", sans-serif" }}>
            {successMessage}
          </div>
        )}

        {editing && (
          <div>
            <div className="form-group">
              <label>Set Username:</label>
              <input
                type="text"
                value={newUsername}
                placeholder= "3-8 characters without space"
                onChange={(e) => {
                  setNewUsername(e.target.value);
                }}
              />
            </div>
            <div className="form-group">
              <label>Set Password:</label>
              <input
                type="password"
                value={newPassword}
                placeholder= "3-8 characters without space"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
              />
            </div>
            <div className="error-message">
              Change your username or password here.
            </div>
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {userData && (
          <div className="left-button-container">
            <div>
              {editing && <Button
                disabled={!newUsername && !newPassword}
                width="100%"
                onClick={() => {
                  handleClick(); // save user data
                  // set editing state as false
                }}>
            Save
              </Button>}
            </div>
            <div>
              {/* enable editing button or not */}
              {!editing && (
                <Button width="100%" onClick={() => setEditing(true)}>
                    Edit
                </Button>
              )}
            </div>
            <div>
              {editing && <Button width="100%" onClick={exit}>Exit</Button>}
              {/* Display message */}
              {editing && message.text && (
                <div className="error-message">
                  {message.text}
                </div>
              )}
              {!editing &&  <Button width="100%" onClick={back}>Back</Button>}
              {!editing && <Button width="100%" onClick={handleLogout}>Logout</Button>}
            </div>
          </div>
        )}
      </div>
    </BaseContainer>
  );
};

export default Profile;
