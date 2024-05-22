import React, { useState, useEffect } from "react";
import { api } from "helpers/api";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/WaitingAnswer.scss";
import { Button } from "components/ui/Button";

const WaitingAnswer = () => {
  const { userAnswer } = useParams<{ userAnswer: string }>();
  const userId = sessionStorage.getItem("userId");
  const roomId = sessionStorage.getItem("roomId");
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(parseInt(sessionStorage.getItem("timeLeft"))-2); // set count down timer to 5s
  let roundNumber = Number(sessionStorage.getItem("roundNumber"));
  const [showAlert, setShowAlert] = useState(false);
  const [isReady_answer, setIsReady_answer] = useState(false);
  const gameMode = sessionStorage.getItem("gameMode");
  const [message, setMessage] = useState("");


  useEffect(() => {
    const fetchScore = async () => {
      try {
        console.log("userAnswer is: ", userAnswer);
        const questionId = sessionStorage.getItem("questionId");
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
        sessionStorage.setItem("isReady_answer", "true");
        if (response !== null) {
          //clearInterval(interval);
          console.log("All players have answered:", response.data);
          setIsReady_answer(true);

          sessionStorage.setItem("isReady_answer_timer", "true");
          console.log("Success:", response.data);
          sessionStorage.setItem("myScore", response.data.point.toString());
          sessionStorage.setItem("realPrice", response.data.realPrice.toString());
          sessionStorage.setItem("showAlert", "true");
          sessionStorage.setItem("bonus", response.data.bonus.toString());
          setShowAlert(true);
        }
        else{setTimeout(fetchScore,1000);}
      } catch (error) {
        console.error("Error receiving answers:", error);
      }
    };

    if (sessionStorage.getItem("isReady_answer") === "false"){
      setTimeout(fetchScore,1000);
    }

  }, [userAnswer]);


  useEffect(() => {
    if (sessionStorage.getItem("isReady_answer_timer") === "true") {  // when post ready, begin to countdown
      const timer = setInterval(() => {
        if(countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1);
          sessionStorage.setItem("timeLeft", countdown.toString());
        }
      }, 1000);

      if (countdown === 0) {
        clearInterval(timer);
        setShowAlert(false); // close the pop-up window
        sessionStorage.setItem("showAlert", "false");
        if (roundNumber === 3) {
          navigate("/rank");
        } else {
          roundNumber += 1;
          sessionStorage.setItem("roundNumber", String(roundNumber));
          sessionStorage.setItem("timeLeft", "17");
          sessionStorage.setItem("isHintDisabled", "false");
          sessionStorage.setItem("isBlurDisabled", "false");
          sessionStorage.setItem("isDefenseDisabled", "false");
          sessionStorage.setItem("isBonusDisabled", "false");
          sessionStorage.setItem("isGambleDisabled", "false");
          sessionStorage.setItem("showAlert_shop", "true");
          sessionStorage.setItem("showAlert_loading", "false");
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
      sessionStorage.removeItem("playerNames");
      sessionStorage.removeItem("questionId");
      sessionStorage.removeItem("rank");
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
    <div className="background-container">
      <div className="hheader container" style={{ height: "auto", fontSize: "10px" }}>
        <h1 className="hheader title" style={{ color: "#FFFFFF", marginBottom: "30px" }}>The Price<br />Is Right</h1>
      </div>
      {(sessionStorage.getItem("showAlert")==="false") && (<h2 style={{ fontSize: "16px", color: "#123597",textAlign: "center" }}>Waiting for
        all players to submit their answers...</h2>)}
      {(sessionStorage.getItem("showAlert")==="true") && (
        <div id="wrap">
          {message !== "" && (
            <div className="txt">You did not select any images </div>)}

          {parseInt(sessionStorage.getItem("bonus")) < 0 && (
            <div className="txt"
              style={{ fontSize: "30px", color: "#FFFFFF" }}> {sessionStorage.getItem("bonus")} points</div>
          )}
          {parseInt(sessionStorage.getItem("bonus")) >= 0 &&
            <div className="txt" style={{
              fontSize: "30px",
              color: "#FFFFFF",
            }}>+ {parseInt(sessionStorage.getItem("myScore")) + parseInt(sessionStorage.getItem("bonus"))} points</div>
          }
          {parseInt(sessionStorage.getItem("bonus")) < 0 && (
            <div className="txt"
              style={{ fontSize: "20px", color: "#FFFFFF", fontFamily: "Arial", fontWeight: "bold" }}>
              You took a gamble but lose.
            </div>
          )}

          {parseInt(sessionStorage.getItem("bonus")) >= 0 &&
            <div className="txt"
              style={{ fontSize: "22px", color: "#FFFFFF", fontFamily: "Arial", fontWeight: "bold" }}> Including
              bonus: {sessionStorage.getItem("bonus")} points </div>
          }

          <hr style={{
            marginTop: "50px",
            height: "3px",
            backgroundColor: "#ccc",
            border: "none",
            width: "100%",
          }} />
          <div className="ans" style={{
            fontSize: "22px",
            marginTop: "50px",
            marginBottom: "20px",
            textAlign: "center",
            color: "#97ABFF",
            fontFamily: "Arial",
            fontWeight: "bold",
          }}>
            {gameMode === "GUESSING" ? "The real price is: " : "The total price you selected is: "} {sessionStorage.getItem("realPrice")}
          </div>
          <div className="tip"
            style={{ fontSize: "18px", marginTop: "50px", color: "#97ABFF", fontWeight: "bold" }}>This round ends
            after <span id="time">{countdown}</span>s
          </div>
        </div>
      )}

      <div className="exit_button-container"
        width="100%"
        onClick={() => {
          leaveRoom();
        }}
      >
        Exit
      </div>


    </div>

  );
};

export default WaitingAnswer;
