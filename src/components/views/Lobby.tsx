import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
//import User from "models/User";
import { Route, useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Lobby.scss";
import {Button} from "components/ui/Button";
import PropTypes from "prop-types";
import GameRoom from "./Gameroom";
import GameRoomBudget from "./GameroomBudget";

const FormField = (props) => {
  return (
    <div className="lobby field">
      <input
        className="lobby input"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        type={props.type} // Set the input type dynamically
        style={props.style}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string, // Add a prop for input type
  style: PropTypes.style
};

const Lobby = () => {
  const { userId } = useParams(); //hook id from URL
  const [roomCode, setRoomCode] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false)
  // const currentIdString = localStorage.getItem("userId");
  // const currentId = parseInt(currentIdString);
  const [modalHidden, setModalHidden] = useState(true);
  const [overlayHidden, setOverlayHidden] = useState(true);
  const [gameMode, setGameMode] = useState("");


  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSingleRoom = () => {
    // Placeholder for handling single room button click
    //navigate( "/singleGame")
    console.log("Joining single room...");
  };

  const handleCreateRoom = () => {
    // Placeholder for handling create room button click
    navigate("/roomcreation")
    console.log("Creating a new room...");
  };

  const handleJoinRoom = async () => {
    // Placeholder for handling join room button click with specific roomId
    console.log(`Joining room with roomCode: ${roomCode}`);
    console.log(`Joining room with userID: ${userId}`);
    // check if the roomID exist in the backend or not
    try {
      const response = await api.post(`/rooms/${roomCode}/${userId}/enter`);
      const roomData = response.data;
      setGameMode(response.data.gameMode);
      console.log("gameMode: ", gameMode);
      localStorage.setItem("roomId", roomData.id);
      localStorage.setItem("roomCode", roomData.roomCode);
      localStorage.setItem("playerNames", roomData.playerNames);
      localStorage.setItem("roundNumber", "1");
      localStorage.setItem("gameMode",response.data.gameMode);
      // check if the room id exist in the backend
      if (response.data) {
        localStorage.setItem("timeLeft", "4");
        navigate("/prepare");
      }
    } catch (error) {
      setErrorMessage("This room does not exist. Please check the room ID.");
      console.error("Error joining room:", error);

    }
  };

  const profileManagement = () => {
    navigate(`/users/${userId}`)
  };


  const closeModal = function () {
    setModalHidden(true);
    setOverlayHidden(true);
    setRoomCode("");
    setErrorMessage("");
  };

  const openModal = function () {
    setModalHidden(false);
    setOverlayHidden(false);
  };

  const handleLogout = () => {
    // for logging into lobby
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <BaseContainer className="lobby-container">
      <div className="header container" style={{height: "auto"}}>
        <h1 className="header title">The Price<br />Is Right</h1>
      </div>

      <div className="right-section">
        <div className="right-button-container">
          <Button width="100%" onClick={profileManagement}>Profile</Button>
          <Button width="100%" onClick={handleCreateRoom}>Create Room</Button>

          <section className={`modal ${modalHidden ? "hidden" : ""}`}>
            <div className="flex">
              <p>Room Code:</p>
              <button className="btn-close" onClick={closeModal}>⨉</button>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div>
                <FormField
                  value={roomCode}
                  onChange={(un: string) => setRoomCode(un)}
                  type="text"
                  style={{ background: "white", color: "black", width: "300px", height: "35px", borderWidth: "3px" }}
                />
              </div>

              <button
                style={{ background: "#4860A8", color: "white", width: "100px", height: "35px", padding: "3px", marginLeft: "5px"}}
                onClick={handleJoinRoom}>
                Join
              </button>
            </div>
            {errorMessage && (
              <p style={{ fontSize: "16px", fontFamily: "\"Microsoft YaHei\", sans-serif" }}>
                {errorMessage}
              </p>
            )}
          </section>

          <div className={`overlay ${overlayHidden ? "hidden" : ""}`}></div>
          <Button width="100%" onClick={openModal}>Join Room</Button>
          <Button width="100%" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <button className="instruction-button" onClick={() => navigate(`/instruction`)}></button>

    </BaseContainer>

  );
};

export default Lobby;
