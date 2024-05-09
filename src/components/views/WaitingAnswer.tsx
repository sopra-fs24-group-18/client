import React, { useState, useEffect } from "react";
import { api } from "helpers/api";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/WaitingAnswer.scss";
import { Button } from "components/ui/Button";

const WaitingAnswer = () => {
  const { userAnswer } = useParams<{ userAnswer: string }>();
  const userId = localStorage.getItem("userId");
  const roomId = localStorage.getItem("roomId");
  const navigate = useNavigate();
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const [showAlert, setShowAlert] = useState(false);
  const [countdown, setCountdown] = useState(parseInt(localStorage.getItem("timeLeft"))-2); // set count down timer to 5s
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
        localStorage.setItem("isReady_answer", "true");
        console.log(response.data);
        if (response.data) {
          //clearInterval(interval);
          console.log("All players have answered:", response.data);
          setIsReady_answer(true);
          localStorage.setItem("isReady_answer_timer", "true");
          console.log("Success:", response.data);
          localStorage.setItem("myScore", response.data.point.toString());
          localStorage.setItem("realPrice", response.data.realPrice.toString());
          localStorage.setItem("showAlert", "true");
          setShowAlert(true);

        } else {
          // continue polling if not ready
        }
      } catch (error) {
        console.error('Error receiving answers:', error);
      }
    };
    if (localStorage.getItem("isReady_answer") === "false"){;
      fetchScore();
    }

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
    if (localStorage.getItem("isReady_answer_timer") === "true") {  // when post ready, begin to countdown
      const timer = setInterval(() => {
        if(countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1);
          localStorage.setItem("timeLeft", countdown.toString());
        }
      }, 1000);

      if (countdown === 0) {
        clearInterval(timer);
        setShowAlert(false); // close the pop-up window
        localStorage.setItem("showAlert", "false");
        if (roundNumber === 3) {
          navigate("/rank");
        } else {
          roundNumber += 1;
          localStorage.setItem("roundNumber", String(roundNumber));
          localStorage.setItem("timeLeft", "12");
          localStorage.setItem("isHintDisabled", "false");
          localStorage.setItem("isBlurDisabled", "false");
          localStorage.setItem("showAlert_shop", "true");
          localStorage.setItem("showAlert_loading", "false");
          navigate("/shop");
        }
      }

      return () => clearInterval(timer);
    }
  }, [isReady_answer, countdown]);

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


  return (
    <div>
      <div className="hheader container" style={{height: "auto", fontSize: "10px"}}>
        <h1 className="hheader title" style={{marginBottom: "30px"}}>The Price<br />Is Right</h1>
      </div>
      <h2 style={{ fontSize: "20px", fontFamily: "\"Microsoft YaHei\", sans-serif", textAlign: "center"  }}>Waiting for all players to submit their answers...</h2>
      {(localStorage.getItem("showAlert")==="true") && (
        <div id="wrap">
          <div className="txt" style={{ fontSize: "30px", color: "#4860A8"}}>+ {localStorage.getItem("myScore")} points</div>
          <div className="ans" style={{ fontSize: "12px", marginTop: "50px", textAlign: "center"}}>The real price is: {localStorage.getItem("realPrice")}</div>
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