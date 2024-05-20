import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/GameRoomBudget.scss";
import {useNavigate} from "react-router-dom";
import { PlayerTable } from "components/ui/PlayerTable";

const GameRoomBudget = () => {
  const roomId = localStorage.getItem("roomId");
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const userId = localStorage.getItem("userId");
  // const [chosenItemList, setChosenItemList] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const roomCode = localStorage.getItem("roomCode");
  const [message_1, setMessage_1] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [itemImages, setItemImages] = useState([]);
  const [itemIds, setItemIds] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintNum, setHinNum] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);

  // gain item picture ui
  useEffect(() => {
    const initializeGame = async () => {
      await fetchImageUrls(roomId, roundNumber);
    };

    initializeGame();
  }, [roomId, userId, roundNumber]);

  const fetchImageUrls = async (roomId, roundNumber, retryCount = 0) => {
    try {
      const response = await api.get(`games/${roomId}/${roundNumber}/${userId}`);
      localStorage.setItem("questionId", response.data.id);

      const itemImages = response.data.itemImageList.split(",");
      const itemIds = response.data.itemList.split(",");
      const totalPrice = response.data.budget;
      const numHint = response.data.selectedItemNum

      setItemImages(itemImages);
      setItemIds(itemIds);
      setTotalPrice(totalPrice);
      setIsBlurred(response.data.blur);
      if (numHint !== 0)
      { setHinNum(numHint); }

      console.log("check images:", itemImages);
      console.log("check ids:", itemIds);
      console.log("total price:", totalPrice);
    } catch (error) {
      console.error("Error fetching image URLs:", error);
      if (error.response && error.response.status === 404 && retryCount < 2) {
        console.log(`Retry fetching image URL due to 404 error, retry count: ${retryCount + 1}`);
        setTimeout(() => fetchImageUrls(roomId, roundNumber, retryCount + 1), 1000);
      } else if (retryCount >= 2) {
        console.error("Max retry limit reached, not retrying further.");
      }
    }
  };
  const handleImageSelect = (id) => {
    console.log("Clicked image ID:", id);
    setSelectedItemIds((prev) => {
      let updatedSelection;
      if (prev.includes(id)) {
        updatedSelection = prev.filter((item) => item !== id);
      } else {
        updatedSelection = [...prev, id];
      }
      setUserAnswer(updatedSelection.join(","));

      return updatedSelection;
    });
  };

  // sent user choice
  const handleConfirmClick = async () => {
    setIsConfirmed(true);
    if (userAnswer !== "") {
      localStorage.setItem("timeLeft", "7");
      localStorage.setItem("isReady_answer_timer", "false");
      localStorage.setItem("isReady_answer", "false");
      localStorage.setItem("showAlert", "false");
      navigate(`/waiting-answer/${userAnswer}`);
    }
    else {
      localStorage.setItem("timeLeft", "7");
      localStorage.setItem("isReady_answer_timer", "false");
      localStorage.setItem("isReady_answer", "false");
      localStorage.setItem("showAlert", "false");
      navigate("/waiting-answer/null");}
    /*try {
      const questionId = localStorage.getItem("questionId");
      setIsConfirmed(true);
      const result = await api.post("/answers/budgetMode", {
        questionId,
        userId,
        chosenItemList: selectedItemIds.join(",")
      });
      console.log("Success:", result.data);
      setMessage_1("Confirmation successful!");
    } catch (error) {
      console.error("Error posting value", error);
      setMessage_1("Failed to confirm!");
    }*/
  };

  // Tool display
  const [tools, setTools] = useState([]);

  //fetch user"s tool list from backend
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await api.get(`/tools/${userId}`);
        console.log("tools list", response.data); ["",""]
        // Check if response data is not empty
        if (response.data.length > 0) {
          setTools(response.data);
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
      }
    };

    fetchTools();
  }, [userId]);

  // display Tools in the game screen
  const displayTool = (tool) => {
    if (!tool) {
      return (
        <div className="tool item default"></div>
      );
    }

    const toolType  = tool;
    //console.log("display tool:", tool)

    let toolClassName = "tool item default";
    let toolContent = "";

    if (toolType === "HINT") {
      toolClassName = "tool item hint";
      toolContent = "Hint";
    } else if (toolType === "BLUR") {
      toolClassName = "tool item bomb";
      toolContent = "Blur";
    } else if (toolType === "DEFENSE") {
      toolClassName = "tool item defense";
      toolContent = "Defense";
    } else if (toolType === "BONUS") {
      toolClassName = "tool item bonus";
      toolContent = "Bonus";
    } else if (toolType === "GAMBLE") {
      toolClassName = "tool item gamble";
      toolContent = "Gamble";
    }

    return (
      <div className={toolClassName}>
        {toolContent}
      </div>
    );
  };

  // making array to render tools, ensure the length is 3
  const renderTools = () => {
    const displayedTools = tools.slice(0, 5); // display the first three tools from tool list in the slot
    const emptySlotsCount = Math.max(5 - displayedTools.length, 0); // calculate the empty slot

    return [
      ...displayedTools.map((tool) => displayTool(tool)),
      ...Array(emptySlotsCount).fill(null).map((_) => displayTool(null))
    ];
  };


  // point display
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem("timeLeft"))-2);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [player, setPlayer] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get(`/users/${userId}`);
        setPlayer(response.data);
        console.log("User data fetched successfully:", response.data);
      } catch (error) {
        console.error(`Something went wrong while fetching the user: \n${handleError(error)}`);
      }
    }
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if(timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
        localStorage.setItem("timeLeft", timeLeft.toString());
      }
    }, 1000);

    if (timeLeft === 0) {
      clearTimeout(timer);
      if (!isConfirmed) {
        handleConfirmClick()
          .then(() => {
            // after auto-handleConfirmClick
            console.log("Auto-confirmation Successful")

          })
          .catch((error) => {
            console.error("Failed to auto-confirm:", error);
            // handle error
          });
      } else{
        // if already clicked confirm
        console.log("Already confirmed")
      }
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isConfirmed, roundNumber]); // dependency

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
    <PlayerTable key={index}>
      &nbsp;&nbsp;&nbsp;&nbsp;{item.username}: {item.score}
    </PlayerTable>
  ));


  // handling unexpected exit, clear local storage after ten minutes gaming
  useEffect(() => {
    const gameStartTime = new Date().getTime();
    const gameDuration = 10 * 60 * 1000; // duration as 10 minutes

    const timer = setInterval(() => {
      const currentTime = new Date().getTime(); // get current time
      const elapsedTime = currentTime - gameStartTime;

      console.log("the game is continued xx time：", elapsedTime);

      // if the game is longer than ten minutes, which normally not, exept an unexpected exit.
      if (elapsedTime >= gameDuration) {
        // clear local storage
        localStorage.clear();
        clearInterval(timer);
        console.log("the game is over 10 minutes, the localstorage is cleared");
      }
    }, 10*1000);

    return () => clearInterval(timer);
  }, []);


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
      localStorage.removeItem("bonus");

      // for shop
      localStorage.removeItem("isHintDisabled");
      localStorage.removeItem("isBlurDisabled");
      localStorage.removeItem("isDefenseDisabled");
      localStorage.removeItem("isBonusDisabled");
      localStorage.removeItem("isGambleDisabled");
      localStorage.removeItem("showAlert_shop");
      localStorage.removeItem("showAlert_loading");
      navigate(`/lobby/${userId}`);
    } catch (error) {console.error("Error deleting server data:", error);
    }
  };


  return (
    <div className="gameRoom">
      <div className="gameRoomContainer">
        <div className="image">
          <div className="imageGrid">
            {itemImages.map((src, index) => {
              // blur 0 and 5
              const shouldBlur = isBlurred && (index === 0 || index === 5);
              const classNames = [
                selectedItemIds.includes(itemIds[index]) ? "selected" : "",
                shouldBlur ? "blurred" : ""
              ].join(" ");

              return (
                <img
                  key={src}
                  src={src}
                  alt={`Item ${itemIds[index]}`}
                  className={classNames}
                  onClick={() => handleImageSelect(itemIds[index])}
                />
              );
            })}
          </div>
          <div className="text-display">
            <div className="text">Total Price: {totalPrice}CHF</div>

            {hintNum !== 0 && (
              <div className="text">Hint for right total number: <span id="num">{hintNum}</span></div>
            )}

          </div>

          <div className="buttonsContainer">
            <Button width="150%">Room: {roomCode}</Button>
            <Button width="150%" onClick={handleConfirmClick}>Confirm</Button>
            {message_1 && <div>{message_1}</div>}
            <Button width="150%" onClick={() => {leaveRoom();}}>Exit</Button>
          </div>
        </div>

        {/*tool part*/}
        <div className="tool">
          <div className="tool display">
            <label className="tool tool-label">Tools</label>
            <div className="tool container">
              {renderTools()}
            </div>
          </div>
        </div>

        {/*points part*/}
        <div className="score">

          {/* Display remaining time */}
          <div className="label" style={{left: 100}}>
            Time: <br/>
            {timeLeft}
          </div>

          {/* Display Points */}
          <div className="label" style={{right: 100}}>
            Your Point: <br/>
            {player.score}
          </div>

          {/*round display*/}
          <div className="score-label">
            Round:
            {roundNumber}
          </div>


          {/*<div className="gameRoom-point form">*/}
          {/*  <div className="pointsContainer">*/}
          {/*    {pointList}*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="pointsContainer">
            <div className="gameRoom-point">
              {pointList}
            </div>
          </div>

        </div>


      </div>

    </div>
  );
};

export default GameRoomBudget;
