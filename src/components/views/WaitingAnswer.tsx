import React, { useState, useEffect } from "react";
import { api } from "helpers/api";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/WaitingAnswer.scss";
import { Button } from "components/ui/Button";

const WaitingAnswer = () => {
  const { userAnswer } = useParams<{ userAnswer: string }>();
  const [score, setScore] = useState(null);
  const [realPrice, setRealPrice] = useState<number>(0);
  const userId = localStorage.getItem("userId");
  const roomId = localStorage.getItem("roomId");
  const navigate = useNavigate();
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const [showAlert, setShowAlert] = useState(false);
  const [countdown, setCountdown] = useState(5); // set count down timer to 5s
  const [isReady_answer, setIsReady_answer] = useState(false);
  const gameMode = localStorage.getItem("gameMode");


  useEffect(() => {
    const fetchScore = async () => {
      try {
        const questionId = localStorage.getItem("questionId");
        const response = await api.post(`/answers/guessMode`, {
          questionId,
          userId,
          guessedPrice: Number(userAnswer)
        });
        console.log(response.data);
        if (response.data) {
          //clearInterval(interval);
          console.log("All players have answered:", response.data);
          setIsReady_answer(true);

          console.log("Success:", response.data);
          setScore(response.data.point);
          setRealPrice(response.data.realPrice);
          setShowAlert(true);

        } else {
          // continue polling if not ready
        }
      } catch (error) {
        console.error('Error receiving answers:', error);
      }
    };
    fetchScore();

    //const interval = setInterval(() => {
    //  fetchScore();
    //}, 1000);

    //return () => {
    //  if (interval) {
    //    clearInterval(interval);
    //  }
    //};

  }, []);


  useEffect(() => {
    if (isReady_answer === true) {  // when post ready, begin to countdown
      console.log("isReady for answer timer");
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
        setShowAlert(false); // close the pop-up window
        if (roundNumber === 3) {
          navigate("/rank");
        } else {
          roundNumber += 1;
          localStorage.setItem("roundNumber", String(roundNumber));
          localStorage.setItem("timeLeft", "10");
          navigate("/shop");
        }
      }, 5000); // close the pop-up window after 5s

      return () => clearInterval(timer);
    }
  }, [isReady_answer]);

  const leaveRoom = async () => {
    try {
      const requestBody = {roomId, userId};
      await api.post(`/rooms/${roomId}/${userId}/exit`, requestBody);
      localStorage.removeItem("isReady");
      localStorage.removeItem("isReady_1");
      localStorage.removeItem("myScore");
      localStorage.removeItem("playerNames");
      localStorage.removeItem("questionId");
      localStorage.removeItem("rank");
      localStorage.removeItem("roomCode");
      localStorage.removeItem("roomId");
      localStorage.removeItem("roundNumber");
      localStorage.removeItem("timeLeft");
      localStorage.removeItem("gameMode");
      navigate(`/lobby/${userId}`);
    } catch (error) {console.error("Error deleting server data:", error);
    }
  };


  return (
    <div>
      <div className="hheader container" style={{height: "auto", fontSize: "10px"}}>
        <h1 className="hheader title" style={{marginBottom: "30px"}}>The Price<br />Is Right</h1>
      </div>
      <h2 style={{ fontSize: "20px", fontFamily: "\"Microsoft YaHei\", sans-serif", textAlign: "center"  }}>Waiting for all players to submit their answers...</h2>
      {showAlert && (
        <div id="wrap">
          <div className="txt" style={{ fontSize: "30px", color: "#4860A8"}}>+ {score} points</div>
          <div className="ans" style={{ fontSize: "12px", marginTop: "50px", textAlign: "center"}}>The real price is: {realPrice}</div>
          <div className="tip" style={{ fontSize: "12px", fontFamily: "\"Microsoft YaHei\", sans-serif"}}>Next round starts after <span id="time">{countdown}</span>s</div>
        </div>
      )}

      <div className="exit_button-container"
        width="100%"
        onClick={() => {leaveRoom();}}
      >
        Exit
      </div>


    </div>

  );
};

export default WaitingAnswer;