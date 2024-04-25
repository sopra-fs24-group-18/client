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
    //const [timeLeft, setTimeLeft] = useState(10);
    const [timeLeft, setTimeLeft] = useState(() => {
      const storedTimeLeft = localStorage.getItem('timeLeft');
      return storedTimeLeft ? parseInt(storedTimeLeft, 10) : 10;
    });
    const [message, setMessage] = useState({ text: "", type: "" });
    const [player, setPlayer] = useState("");
    const userId = localStorage.getItem("userId");
    const roomCode = localStorage.getItem("roomCode")
    const [isHintDisabled, setIsHintDisabled] = useState(false);
    const [isBlurDisabled, setIsBlurDisabled] = useState(false);

    useEffect(() => {
      const timer = setInterval(async () => {
        try {
          const response = await api.get(`/users/${userId}`);
          setPlayer(response.data);
          console.log("User data fetched successfully:", response.data);
        } catch (error) {
          console.error(`Something went wrong while fetching the user: \n${handleError(error)}`);
        }
      }, 100);
      return () => clearInterval(timer);
    }, [userId]);


    // timer
    //useEffect(() => {
    //    const timer = setTimeout(() => {
    //        setTimeLeft(timeLeft - 1);
    //    }, 1000);
    //    if (timeLeft === 0) {
    //        clearTimeout(timer);
    //        navigate(`/rooms/${roomCode}/${userId}/enter`);
    //    }
    //    return () => clearTimeout(timer);
    //}, [timeLeft]);

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          const newTimeLeft = prevTimeLeft - 1;
          if (newTimeLeft === 0) {
            clearInterval(timer);
            navigate(`/rooms/${roomCode}/${userId}/enter`);
          }
          localStorage.setItem('timeLeft', newTimeLeft.toString());
          return newTimeLeft;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const doPurchase = async (toolType) => {
        try {
            const response = await api.get(`/tools`);
            if (toolType === response.data[0].type){
                const tool = new Tool(response.data[0]);
                const toolId = tool.id;
                const requestBody_2 = JSON.stringify({ toolId, userId });
                const response_2 = await api.post(`/tools/${toolId}/${userId}`, requestBody_2);
                displayMessage(`Buy and use the ${toolType} successfully!`, "success-message");
                setIsHintDisabled(true);
            }else if (toolType === response.data[1].type){
                const tool_2 = new Tool(response.data[1]);
                const toolId_2 = tool_2.id;
                const requestBody_3 = JSON.stringify({ toolId_2, userId });
                const response_3 = await api.post(`/tools/${toolId_2}/${userId}`, requestBody_3);
                displayMessage(`Buy and use the ${toolType} successfully!`, "success-message");
                setIsBlurDisabled(true);
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
                            {player.score}
                        </div>

                        {/* Get Hints */}
                        <div style={{ textAlign: 'left'}}>
                            Hints: 30 Points
                        </div>
                        <div className="register button-container" style={{display: "flex",justifyContent: 'space-between', margin: 0, padding: 0}} >
                            <button className="shop hint"></button>
                            <button className="shop buy-button"
                                disabled={isHintDisabled}
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
                            Blur: 30 Points
                        </div>
                        <div className="register button-container" style={{display: "flex",justifyContent: 'space-between', margin: 0, padding: 0}} >
                            <button className="shop bomb"></button>
                            <button className="shop buy-button"
                                disabled={isBlurDisabled}
                                onClick={() => doPurchase("BLUR")}
                            >
                                Buy
                            </button>
                        </div>
                        <div style={{ fontSize: "10px", fontFamily: '"Microsoft YaHei", sans-serif' }}>
                            You can use this tool to disturb other player.
                        </div><br />

                        {/*<div className="shop button-container">
              <Button
                width="100%"
                onClick={() => navigate("/gameRoom")}
              >
                Skip
              </Button>
            </div>*/}
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