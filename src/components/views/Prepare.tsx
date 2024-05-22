import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/Prepare.scss";
import {useNavigate} from "react-router-dom";
import { PlayerTable } from "components/ui/PlayerTable";

const Prepare = () => {
  const navigate = useNavigate();
  const roomId = sessionStorage.getItem("roomId");
  const userId = sessionStorage.getItem("userId");
  const [isReady, setIsReady] = useState(false);
  const roomCode = sessionStorage.getItem("roomCode");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const initializeGame = async () => {
      try {
        console.log(sessionStorage);
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

  const [timeLeft, setTimeLeft] = useState(parseInt(sessionStorage.getItem("timeLeft"))-2);

  useEffect(() => {
    const gameMode = sessionStorage.getItem("gameMode")
    if (isReady === true) {  // when post ready, begin to countdown
      const timer = setTimeout(() => {
        if(timeLeft > 0) {
          setTimeLeft(timeLeft - 1);
          sessionStorage.setItem("timeLeft", timeLeft.toString());
        }
      }, 1000);

      if (timeLeft === 0) {
        clearTimeout(timer);
        sessionStorage.setItem("timeLeft", "32");
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
    // if not ready
    if (isReady === "false") {
      setTimeout(fetchPoints,1000)
    }
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
      sessionStorage.removeItem("playerNames");
      sessionStorage.removeItem("questionId");
      sessionStorage.removeItem("roomCode");
      sessionStorage.removeItem("roomId");
      sessionStorage.removeItem("roundNumber");
      sessionStorage.removeItem("timeLeft");
      sessionStorage.removeItem("gameMode");

      // for waiting answer
      sessionStorage.removeItem("isReady_answer");
      sessionStorage.removeItem("myScore");
      sessionStorage.removeItem("realPrice");
      sessionStorage.removeItem("showAlert");
      sessionStorage.removeItem("isReady_answer_timer");
      sessionStorage.removeItem("bonus");

      // for shop
      sessionStorage.removeItem("isHintDisabled");
      sessionStorage.removeItem("isBlurDisabled");
      sessionStorage.removeItem("isDefenseDisabled");
      sessionStorage.removeItem("isBonusDisabled");
      sessionStorage.removeItem("isGambleDisabled");
      sessionStorage.removeItem("showAlert_shop");
      sessionStorage.removeItem("showAlert_loading");
      navigate(`/lobby/${userId}`);
    } catch (error) {console.error("Error deleting server data:", error);
    }
  };

  return (
    <div className="main-page">

      <div className="loading" >
        <br/><br/><br/><br/>Preparing for the game ......<br/>
      </div>

      <div className="buttonsContainer">
        <Button width="150%" >Room: {roomCode} </Button>
        <Button width="150%" onClick={() => {leaveRoom();}}>Exit</Button>
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
