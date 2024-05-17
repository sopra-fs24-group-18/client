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
  const [countdown, setCountdown] = useState(parseInt(localStorage.getItem("timeLeft"))-2); // set count down timer to 5s
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const [showAlert, setShowAlert] = useState(false);
  const [isReady_answer, setIsReady_answer] = useState(false);
  const gameMode = localStorage.getItem("gameMode");
  const [message, setMessage] = useState("");


  useEffect(() => {
    const fetchScore = async () => {
      try {
        console.log("userAnswer is: ", userAnswer);
        const questionId = localStorage.getItem("questionId");
        let response = null;
        if (gameMode === "GUESSING") {
          response = await api.post("/answers/guessMode", {
            questionId,
            userId,
            guessedPrice: Number(userAnswer)
          });
        } else {
          if (userAnswer !== "null") {
            response = await api.post("/answers/budgetMode", {
              questionId,
              userId,
              chosenItemList: userAnswer
            });
          } else {response = await api.post("/answers/budgetMode", {
            questionId,
            userId,
            chosenItemList: ""
          });
          setMessage("You didn't select any images ")
          }

        }

        if (response.data) {
          //clearInterval(interval);
          console.log("All players have answered:", response.data);
          setIsReady_answer(true);
          localStorage.setItem("isReady_answer", "true");
          localStorage.setItem("isReady_answer_timer", "true");
          console.log("Success:", response.data);
          localStorage.setItem("myScore", response.data.point.toString());
          localStorage.setItem("realPrice", response.data.realPrice.toString());
          localStorage.setItem("showAlert", "true");
          localStorage.setItem("bonus", response.data.bonus.toString());
          setShowAlert(true);

        } else {
          setTimeout(fetchScore, 2000);
        }
      } catch (error) {
        console.error("Error receiving answers:", error);
      }
    };

    if (localStorage.getItem("isReady_answer") === "false"){;
      fetchScore();
    }

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
          localStorage.setItem("isDefenseDisabled", "false");
          localStorage.setItem("isBonusDisabled", "false");
          localStorage.setItem("isGambleDisabled", "false");
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
      localStorage.removeItem("rank");
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
      localStorage.removeItem("isBobusDisabled");
      localStorage.removeItem("isGambleDisabled");
      localStorage.removeItem("showAlert_shop");
      localStorage.removeItem("showAlert_loading");
      navigate(`/lobby/${userId}`);
    } catch (error) {console.error("Error deleting server data:", error);
    }
  };


  return (
    <div className="background-container">
      <div className="hheader container" style={{ height: "auto", fontSize: "10px" }}>
        <h1 className="hheader title" style={{ color: "#FFFFFF", marginBottom: "30px" }}>The Price<br />Is Right</h1>
      </div>
      <h2 style={{ fontSize: "16px", color: "#123597",textAlign: "center" }}>Waiting for
        all players to submit their answers...</h2>
      {(localStorage.getItem("showAlert")==="true") && (
        <div id="wrap">
          {message !== "" &&(
            <div className="txt">You did not select any images </div>)}

          {parseInt(localStorage.getItem("bonus")) < 0 && (
            <div className="txt" style={{ fontSize: "30px", color: "#FFFFFF" }}> {localStorage.getItem("bonus")} points</div>
          )}
          {parseInt(localStorage.getItem("bonus")) >= 0 &&
            <div className="txt" style={{ fontSize: "30px", color: "#FFFFFF" }}>+ {parseInt(localStorage.getItem("myScore")) + parseInt(localStorage.getItem("bonus"))} points</div>
          }
          {parseInt(localStorage.getItem("bonus")) < 0 && (
            <div className="txt" style={{ fontSize: "16px", color: "#FFFFFF" }}>
              You took a gamble but lose.
            </div>
          )}

          {parseInt(localStorage.getItem("bonus")) >= 0 &&
            <div className="txt" style={{ fontSize: "18px", color: "#FFFFFF" }}>(including bonus: {localStorage.getItem("bonus")} points)</div>
          }

          <div className="ans" style={{ fontSize: "16px", marginTop: "50px", textAlign: "center" }}>
            {gameMode === "GUESSING" ? "The real price is: " : "The total price you selected is: "} {localStorage.getItem("realPrice")}
          </div>
          <div className="tip" style={{ fontSize: "10px" }}>Next round starts after <span id="time">{countdown}</span>s
          </div>
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