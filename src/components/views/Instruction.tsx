import React from "react";
import "styles/views/Instruction.scss";
import { useNavigate} from "react-router-dom";
import {Button} from "components/ui/Button";

const Instruction= () => {
  const navigate = useNavigate();
  const navigateToMainPage = () => {
    navigate("/register");
  };

  return (
  <div className="instruction">
    <h1 className="instruction_text">
      <br /><br />Instruction:<br /><br />
      After logging into Lobby, you can either set a game room or join a room using room code.<br /><br />
      We have two game modes:<br /><br />
      1. Guessing: You will see an image and need to use the slider bar to choose a price and then press on confirm within 20 seconds.<br /><br />
      2. Budget: You will be given a budget and need to choose a group of images from 6 within 20 seconds.<br /><br />
      After each round, you will have chances to buy tools with points for the next round. Every player has 100 original points.<br /><br />
      The winner for each round gets 100 points while others get 70.<br /><br />
      Remember to choose the closest price and enjoy!
    </h1>

    <Button
      style={{
        width: "20%",
        position: "fixed",
        bottom: "10%",
        left: "40%",
      }}
      onClick={navigateToMainPage}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
      }}
    >
      Got it!
    </Button>
  </div>

  );
};

export default Instruction;

