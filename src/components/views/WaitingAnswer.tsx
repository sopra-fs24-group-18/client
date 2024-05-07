import React, { useState, useEffect } from "react";
import { api } from "helpers/api";
import { useNavigate, useParams } from "react-router-dom";
import "styles/views/WaitingAnswer.scss";

const WaitingAnswer = () => {
  const { userAnswer } = useParams<{ userAnswer: string }>();
  const [score, setScore] = useState(null);
  const [realPrice, setRealPrice] = useState<number>(0);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const [showAlert, setShowAlert] = useState(false);
  const [countdown, setCountdown] = useState(10); // set count down timer to 5s
  const gameMode = localStorage.getItem("gameMode");


  useEffect(() => {
    const fetchScore = async () => {
      try {
        const questionId = localStorage.getItem("questionId");
        let response = null;
        if (gameMode === "GUESSING") {
          response = await api.post(`/answers/guessMode`, {
            questionId,
            userId,
            guessedPrice: Number(userAnswer)
          });
        }
        else{
          response = await api.post("/answers/budgetMode", {
            questionId,
            userId,
            chosenItemList: userAnswer
          });
        }
        console.log("Success:", response.data);
        setScore(response.data.point);
        setRealPrice(response.data.realPrice);
        setShowAlert(true);
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
            navigate("/shop");
          }
        }, 10000); // close the pop-up window after 5s

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Error receiving answers:', error);
      }
    };
    fetchScore();
  }, []);

  return (
    <div>
      <div className="hheader container" style={{height: "auto", fontSize: "10px"}}>
        <h1 className="hheader title" style={{marginBottom: "30px"}}>The Price<br />Is Right</h1>
      </div>
      <h2 style={{ fontSize: "20px", fontFamily: "\"Microsoft YaHei\", sans-serif", textAlign: "center"  }}>Waiting for all players to submit their answers...</h2>
      {showAlert && (
        <div id="wrap">
          <div className="txt" style={{ fontSize: "30px", color: "#4860A8"}}>+ {score} points</div>
          <div className="ans" style={{ fontSize: "12px", marginTop: "50px", textAlign: "center"}}>
            {gameMode === "GUESSING" ? "The real price is: " : "The total price you selected is: "} {realPrice}
          </div>
          <div className="tip" style={{ fontSize: "12px", fontFamily: "\"Microsoft YaHei\", sans-serif"}}>Next round starts after <span id="time">{countdown}</span>s</div>
        </div>
      )}
    </div>
  );
};

export default WaitingAnswer;