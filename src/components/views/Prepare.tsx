import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/Prepare.scss";
import {useNavigate} from "react-router-dom";
import { PlayerTable } from "components/ui/PlayerTable";

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

  const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem("timeLeft"))-2);

  useEffect(() => {
    const gameMode = localStorage.getItem("gameMode")
    if (isReady === true) {  // when post ready, begin to countdown
      const timer = setTimeout(() => {
        if(timeLeft > 0) {
          setTimeLeft(timeLeft - 1);
          localStorage.setItem("timeLeft", timeLeft.toString());
        }
      }, 1000);

      if (timeLeft === 0) {
        clearTimeout(timer);
        localStorage.setItem("timeLeft", "22");
        if (gameMode === "GUESSING"){
          navigate(`/rooms/${roomCode}/${userId}/guessing`);}
        else{
          navigate(`/rooms/${roomCode}/${userId}/budget`);}
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
  }, [isReady]);

  const sortedRankData = rankData.sort((a, b) => b.score - a.score);
  const pointList = sortedRankData.map((item, index) => (
    <PlayerTable key={index}>
      {item.username}
    </PlayerTable>
  ));


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
      localStorage.removeItem("bonus");

      // for shop
      localStorage.removeItem("isHintDisabled");
      localStorage.removeItem("isBlurDisabled");
      localStorage.removeItem("isDefenseDisabled");
      localStorage.removeItem("isBonusDisabled");
      localStorage.removeItem("isGambleDisabled");
      localStorage.removeItem("showAlert_shop");
      localStorage.removeItem("showAlert_loading");
      navigate(`/lobby/${userId}`);
    } catch (error) {console.error("Error deleting server data:", error);
    }
  };

  return (
    <div className="main-page">

      <div className="prepare-loading" >
        <br/><br/><br/><br/>Preparing for the game ......<br/>
      </div>

      <div className="prepare-buttonsContainer">
        <Button width="150%" >Room: {roomCode} </Button>
      </div>

      <div className="exit_button-container"
        width="100%"
        onClick={() => {leaveRoom();}}
      >
        Exit
      </div>


      <div className="score">
        <div className="gameRoom-point form">
          <div className="pointsContainer">
            {pointList}
          </div>
        </div>
      </div>

    </div>

  );
};

export default Prepare;
