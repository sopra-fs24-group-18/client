import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Gameroom_point.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";


const Gameroom_point = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    if (timeLeft === 0) {
      clearTimeout(timer);
      navigate("/gameroom_point");
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const doGameroom_point = async (toolType) => {
    try {

  // purchase successfully worked --> navigate to the gameRoom
      navigate("/gameRoom");

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
    <div className="gameRoomContainer">
      <BaseContainer>
          <div className="gameroom_point form"><br /><br />

            {/* Display remaining time */}
            <div style={{ position: 'absolute', top: 50, left: 100, textAlign: 'center'}}>
              Time: <br />
              {timeLeft}
            </div>

            {/* Display Points */}
            <div style={{ position: 'absolute', top: 50, right: 100, textAlign: 'center'}}>
              Your Point: <br />
            </div>
          </div>

          <div className="buttonsContainer">
            <Button >Confirm</Button>
          </div>
          <div className="score-table">
            <Button >User1:</Button>
            <Button >User2:</Button>
          </div>
      </BaseContainer>
    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Gameroom_point;
