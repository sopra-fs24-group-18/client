import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/Rank.scss";
import {useNavigate} from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import {Spinner} from "../ui/Spinner";

const Rank = () => {
  const roomId = localStorage.getItem("roomId")
  // const playerNames = localStorage.getItem('playerNames')
  const userId = localStorage.getItem("userId");
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

  let content = <Spinner />;

  if (pointList) {
    content = (
      <div className="rank">
        <ul className="user-list" >
          {pointList}
        </ul>
        <Button
          style={{ marginTop: "5em", width: "100%" }}
          onClick={() => navigate(`/users/${userId}`)}
        >
          Exit
        </Button>
        {pointList}
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
  ;
};

export default Rank;