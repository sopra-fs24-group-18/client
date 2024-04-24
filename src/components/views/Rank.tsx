import React, { useState, useEffect, useRef} from 'react';
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/Rank.scss";
import {useNavigate} from "react-router-dom";
import User from "models/User";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

const Rank = () => {
  const roomId = localStorage.getItem('roomId')
  const playerNames = localStorage.getItem('playerNames')


  const userId = localStorage.getItem('userId');



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
        console.error('Error fetching points', error);
      }
    };
    fetchPoints();
  }, []);
  const sortedRankData = rankData.sort((a, b) => b.score - a.score);
  const pointList = sortedRankData.map((item, index) => (
    <div key={index}>
      {item.username}: points: {item.score}
    </div>
  ));

  const displayMessage = (messageText, messageType) => {
    setMessage({ text: messageText, type: messageType });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 5000); // Hide message after 5 seconds
  };

  return (
    <div className="gameRoomContainer">

      <div className="buttonsContainer">
        <Button>Exit</Button>
      </div>

      <div className="score-table">
        <Button>
        {pointList}
        </Button>
      </div>


    </div>
  );
};
export default Rank;