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
  const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem("timeLeft"))-2);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [player, setPlayer] = useState("");
  const userId = localStorage.getItem("userId");
  const roomId = localStorage.getItem("roomId");
  const roomCode = localStorage.getItem("roomCode")
  const gameMode = localStorage.getItem("gameMode")


  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get(`/users/${userId}`);
        setPlayer(response.data);
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
      if(timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
        localStorage.setItem("timeLeft", timeLeft.toString());
      }
    }, 1000);

    if (timeLeft === 0) {
      clearTimeout(timer);
      if (gameMode === "BUDGET"){navigate(`/rooms/${roomCode}/${userId}/budget`);}
      else{
        localStorage.setItem("timeLeft", "22");
        navigate(`/rooms/${roomCode}/${userId}/guessing`);
      }

    }
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const doPurchase = async (toolType) => {
    try {
      const response = await api.get("/tools");
      if (toolType === response.data[0].type){
        const tool = new Tool(response.data[0]);
        const toolId = tool.id;
        const requestBody_2 = JSON.stringify({ toolId, userId });
        const response_2 = await api.post(`/tools/${toolId}/${userId}`, requestBody_2);
        displayMessage(`Buy and use the ${toolType} successfully!`, "success-message");
        localStorage.setItem("isHintDisabled", "true");
        const response_buy = await api.get(`/users/${userId}`);
        setPlayer(response_buy.data);        
      }else if (toolType === response.data[1].type){
        const tool_2 = new Tool(response.data[1]);
        const toolId_2 = tool_2.id;
        const requestBody_3 = JSON.stringify({ toolId_2, userId });
        const response_3 = await api.post(`/tools/${toolId_2}/${userId}`, requestBody_3);
        displayMessage(`Buy and use the ${toolType} successfully!`, "success-message");
        localStorage.setItem("isBlurDisabled", "true");
        const response_buy = await api.get(`/users/${userId}`);
        setPlayer(response_buy.data);        
      }else{
        displayMessage("Cannot find this tool.", "error-message");
      }
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

  const leaveRoom = async () => {
    try {
      const requestBody = {roomId, userId};
      await api.post(`/rooms/${roomId}/${userId}/exit`, requestBody);
      // for game room
      localStorage.removeItem("playerNames");
      localStorage.removeItem("questionId");
      localStorage.removeItem("roomCode");
      localStorage.removeItem("roomId");
      localStorage.removeItem("roundNumber");
      localStorage.removeItem("timeLeft");
      localStorage.removeItem("gameMode");

      // for waiting answer
      localStorage.removeItem("isReady_answer");
      localStorage.removeItem("myScore");
      localStorage.removeItem("realPrice");
      localStorage.removeItem("showAlert");
      localStorage.removeItem("isReady_answer_timer");

      // for shop
      localStorage.removeItem("isHintDisabled");
      localStorage.removeItem("isBlurDisabled");
      localStorage.removeItem("showAlert_shop");
      localStorage.removeItem("showAlert_loading");
      navigate(`/lobby/${userId}`);
    } catch (error) {console.error("Error deleting server data:", error);
    }
  };

  const skipShop = async () => {
    localStorage.setItem("showAlert_shop", "false");
    localStorage.setItem("showAlert_loading", "true");
  };


  return (
    <div className="background-container">
      {(localStorage.getItem("showAlert_shop")==="true") && (<BaseContainer>
        <div className="shop container">
          <div className="shop form"><br /><br />

            {/* Display remaining time */}
            <div style={{ position: "absolute", top: 50, left: 100, textAlign: "center"}}>
                            Time: <br />
              {timeLeft}
            </div>

            {/* Display Points */}
            <div style={{ position: "absolute", top: 50, right: 100, textAlign: "center"}}>
                            Your Point: <br />
              {player.score}
            </div>

            {/* Get Hints */}
            <div style={{ textAlign: "left"}}>
                Hints: 30 Points
            </div>
            <div className="shop button-container" style={{display: "flex",justifyContent: "space-between", margin: 0, padding: 0}} >
              <button className="shop hint"></button>
              <button className="shop buy-button"
                disabled={(localStorage.getItem("isHintDisabled")==="true")}
                onClick={() => doPurchase("HINT")}
              >
                  Buy
              </button>
            </div>
            <div style={{ fontSize: "10px", fontFamily: "\"Microsoft YaHei\", sans-serif" }}>
                You can use this tool to get hints.
            </div><br />

            {/* Disturb Others */}
            <div style={{ textAlign: "left"}}>
                Blur: 30 Points
            </div>
            <div className="register button-container" style={{display: "flex",justifyContent: "space-between", margin: 0, padding: 0}} >
              <button className="shop bomb"></button>
              <button className="shop buy-button"
                disabled={(localStorage.getItem("isBlurDisabled")==="true")}
                onClick={() => doPurchase("BLUR")}
              >
                  Buy
              </button>
            </div>
            <div style={{ fontSize: "10px", fontFamily: "\"Microsoft YaHei\", sans-serif" }}>
                            You can use this tool to disturb other player.
            </div><br />

            <div className="shop button-container">
              <Button
                width="100%"
                onClick={() => {skipShop();}}
              >
                Skip
              </Button>
            </div>
            {/* Display message */}
            {message.text && (
              <div style={{ fontSize: "16px", fontFamily: "\"Microsoft YaHei\", sans-serif" }}>
                {/*<div className={`message-container ${message.type}`}>*/}
                {message.text}
              </div>
            )}
          </div>
        </div>
      </BaseContainer>)}

      {(localStorage.getItem("showAlert_loading")==="true") && (<div className="shop_loading" >
        <br/><br/><br/><br/>Preparing for the next round ......<br/>
      </div>)}

      <div className="exit_button-container"
        width="100%"
        onClick={() => {leaveRoom();}}
      >
        Exit
      </div>

    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Purchase;
