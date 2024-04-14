import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Shop.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";


const Purchase = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>(null); // name --> password(string)
  const [username, setUsername] = useState<string>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    if (timeLeft === 0) {
      clearTimeout(timer);
      navigate("/shop");
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const doPurchase = async () => {
    try {
      const requestBody = JSON.stringify({ username, password }); // name --> password
      const response = await api.post("/login", requestBody);

      // Get the returned user and update a new object.
      const user = new User(response.data);

      // Store the token and userid into the local storage.
      localStorage.setItem("token", user.token);
      localStorage.setItem("current_user_id", user.id)

      // Login successfully worked --> navigate to the route /game in the GameRouter
      navigate("/");

      // Show success message
      //displayMessage("Login successful!", "success-message");

    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Unauthorized: Incorrect username or password
        displayMessage("Login failed because username does not exist or password is wrong.", "error-message");
      }
      else{
        displayMessage(`Something went wrong during the login: ${handleError(error)}`, "error-message");
      }
    }
  };

  const displayMessage = (messageText, messageType) => {
    setMessage({ text: messageText, type: messageType });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 5000); // Hide message after 5 seconds
  };

  return (
    <div className="background-container">
      <BaseContainer>
        <div className="shop container">
          <div className="shop form"><br /><br />

            {/* Display remaining time */}
            <div style={{ position: 'absolute', top: 50, left: 100, textAlign: 'center'}}>
              Time: <br />
              {timeLeft}
            </div>

            {/* Display Points */}
            <div style={{ position: 'absolute', top: 50, right: 100, textAlign: 'center'}}>
              Your Point: <br />
            </div>

            {/* Get Hints */}
            <div style={{ textAlign: 'left'}}>
              Hints: 20 Points
            </div>
            <div className="register button-container" style={{display: "flex",justifyContent: 'space-between', margin: 0, padding: 0}} >
              <button className="shop hint"></button>
              <button className="shop buy-button"
                onClick={() => navigate("/gameRoom")}
              >
                Buy
              </button>
            </div>
            <div style={{ fontSize: "10px", fontFamily: '"Microsoft YaHei", sans-serif' }}>
              You can use this tool to get hints.
            </div><br />

            {/* Disturb Others */}
            <div style={{ textAlign: 'left'}}>
              Bomb: 20 Points
            </div>
            <div className="register button-container" style={{display: "flex",justifyContent: 'space-between', margin: 0, padding: 0}} >
              <button className="shop bomb"></button>
              <button className="shop buy-button"> Buy </button>
            </div>
            <div style={{ fontSize: "10px", fontFamily: '"Microsoft YaHei", sans-serif' }}>
              You can use this tool to disturb other player.
            </div><br />

            <div className="shop button-container">
              <Button
                width="100%"
                onClick={() => navigate("/gameRoom")}
              >
                Skip
              </Button>
            </div>
            {/* Display message */}
            {message.text && (
                <div style={{ fontSize: "16px", fontFamily: '"Microsoft YaHei", sans-serif' }}>
                {/*<div className={`message-container ${message.type}`}>*/}
                  {message.text}
                </div>
            )}
          </div>
        </div>
      </BaseContainer>
    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Purchase;
