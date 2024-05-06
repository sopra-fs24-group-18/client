import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/Prepare.scss";
import {useNavigate} from "react-router-dom";

const Prepare = () => {
  const navigate = useNavigate();
  const roomId = localStorage.getItem("roomId");
  const userId = localStorage.getItem("userId");
  const [isReady, setIsReady] = useState(false);
  const roomCode = localStorage.getItem("roomCode");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const initializeGame = async () => {
      try {
        console.log(localStorage);
        const response = await api.post(`games/${roomId}/${userId}/getReady`);
        console.log("Response for round 1:", response.data);

        if (response.data === "wait") {
          // continue polling if not ready
        } else if (response.data === "ready") {
          setIsReady(true);
          clearInterval(interval);
          console.log("Game is ready:", response.data);
        } else {
          alert("Failed to get ready, status: " + response.status);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error during getReady call:", error);
        clearInterval(interval);
      }
    };

    initializeGame();
    const interval = setInterval(() => {
      initializeGame();
    }, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [roomId, userId]);

  const [timeLeft, setTimeLeft] = useState(2);

  useEffect(() => {
    console.log("isReady for timer");
    if (isReady === true) {  // when post ready, begin to countdown
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      if (timeLeft === 0) {
        clearTimeout(timer);
        navigate("/rooms/:roomCode/:userId/enter");
      }

      return () => clearTimeout(timer);
    }
  }, [isReady, timeLeft]);

  const [rankData, setRankData] = useState([]);
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response_rank = await api.get(`/rooms/${roomId}/rank`);
        setRankData(response_rank.data);
      } catch (error) {
        console.error("Error fetching points", error);
      }
    };
    fetchPoints();
  }, []);

  return (
    <div className="main-page">

      <div className="loading" >
        <br/><br/><br/><br/>Preparing for the game ......<br/>
      </div>

      <div className="buttonsContainer">
        <Button width="150%" >Room: {roomCode} </Button>
      </div>
    </div>

  );
};

export default Prepare;
