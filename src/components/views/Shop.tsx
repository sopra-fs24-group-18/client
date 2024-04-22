import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import Tool from "models/Tool";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Shop.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";


const Purchase = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [user, setUser] = useState<User[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);

  const userId = localStorage.getItem("current_user_id");
  // localStorage.setItem("score", 100);
  // fetch current user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
        console.log("User data fetched successfully:", response.data);
      } catch (error) {
        console.error(`Something went wrong while fetching the user: \n${handleError(error)}`);
      }
    }

    fetchUser();
  }, [userId]);

  // timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    if (timeLeft === 0) {
      clearTimeout(timer);
      navigate("/users/:userId/shop");
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const doPurchase = async (toolType) => {
    try {

  // purchase successfully worked --> navigate to the gameRoom
  //    navigate("/gameRoom");

      // Show success message
      // displayMessage(`Buy and use the ${toolType} successfully!`, "success-message");

    } catch (error) {
      if (error.response && error.response.status === 403) {
        displayMessage("You don't have enough points.", "error-message");
      }
      else{
        displayMessage(`Something went wrong during the purchase: ${handleError(error)}`, "error-message");
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
              myScore
            </div>

            {/* Get Hints */}
            <div style={{ textAlign: 'left'}}>
              Hints: 20 Points
            </div>
            <div className="register button-container" style={{display: "flex",justifyContent: 'space-between', margin: 0, padding: 0}} >
              <button className="shop hint"></button>
              <button className="shop buy-button"
                onClick={() => doPurchase("HINT")}
              >
                Buy
              </button>
            </div>
            <div style={{ fontSize: "10px", fontFamily: '"Microsoft YaHei", sans-serif' }}>
              You can use this tool to get hints.
            </div><br />

            {/* Disturb Others */}
            <div style={{ textAlign: 'left'}}>
              Blur: 20 Points
            </div>
            <div className="register button-container" style={{display: "flex",justifyContent: 'space-between', margin: 0, padding: 0}} >
              <button className="shop bomb"></button>
              <button className="shop buy-button"
                onClick={() => doPurchase("BLUR")}
              >
                Buy
              </button>
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
