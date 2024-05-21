import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/Rank.scss";
import {useNavigate} from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import {Spinner} from "../ui/Spinner";

const Rank = () => {
  const roomId = sessionStorage.getItem("roomId")
  // const playerNames = sessionStorage.getItem('playerNames')
  const userId = sessionStorage.getItem("userId");
  // point display
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: "", type: "" });
  const [player, setPlayer] = useState("");
  // fetch current user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const response_user = await api.get(`/users/${userId}`);
        setPlayer(response_user.data);
        console.log("User data fetched successfully:", response_user.data);
      } catch (error) {
        console.error(`Something went wrong while fetching the user: \n${handleError(error)}`);
      }
    }
    fetchUser();
  }, [userId]);


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
  const sortedRankData = rankData.sort((a, b) => b.score - a.score);
  const pointList = sortedRankData.map((item, index) => (
    <div key={index}>
      username:{item.username} | points: {item.score}
    </div>
  ));

  console.log("pointList:", pointList)
  console.log(sessionStorage);

  let content = <Spinner />;

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
  
  if (pointList) {
    content = (
      <div className="rank">
        <ul className="user-list" >
          {pointList}
        </ul>
        <Button
          style={{ marginTop: "5em", width: "100%" }}
          onClick={() => {
            leaveRoom();
          }}
        >
          Exit
        </Button>
      </div>
    );
  }

  return (
    <BaseContainer className="rank container">
      {/*<h1>Rank</h1>*/}
      <p className="rank paragraph">
        Rank in this Game:
      </p>
      {content}
    </BaseContainer>
  );
};

export default Rank;
