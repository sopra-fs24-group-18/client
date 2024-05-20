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
  const userId= localStorage.getItem("userId");
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data);
      localStorage.setItem("userId", userId);
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


  useEffect(() => {
    fetchUserData(); // Fetch user data on component mount
  }, [userId]); // Re-fetch data when ID changes

  console.log(localStorage);
  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("creation_date");
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
            <p>Username: {userData.username}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        {successMessage&& (
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
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
              />
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
                  saveUserData(); // save user data
                  setEditing(false); // set editing state as false
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
