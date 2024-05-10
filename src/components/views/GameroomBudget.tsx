import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/GameRoomBudget.scss";
import {useNavigate} from "react-router-dom";

const GameRoomBudget = () => {
  const roomId = localStorage.getItem("roomId");
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const userId = localStorage.getItem("userId");
  // const [chosenItemList, setChosenItemList] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isReady_1 = localStorage.getItem(("isReady_1"))
  const roomCode = localStorage.getItem("roomCode");
  const [message_1, setMessage_1] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [itemImages, setItemImages] = useState([]);
  const [itemIds, setItemIds] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintNum, setHinNum] = useState(0);
  // gain item picture ui
  useEffect(() => {
    const initializeGame = async () => {
      if (roundNumber === 1) {
        try {
          const response = await api.post(`games/${roomId}/${userId}/getReady`);
          console.log("Response for round 1:", response.data);

          if (response.data === "wait") {
            // continue polling if not ready
          } else if (response.data === "ready") {
            setIsReady(true);
            clearInterval(interval);
            console.log("Game is ready:", response.data);
            await fetchImageUrls(roomId, roundNumber);
          } else {
            alert("Failed to get ready, status: " + response.status);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error during getReady call:", error);
          clearInterval(interval);
        }
      } else {
        // directly fetch image
        setIsReady(true);
        await fetchImageUrls(roomId, roundNumber);
      }
    };

    const interval = roundNumber === 1 ? setInterval(() => {
      initializeGame();
    }, 1000) : null;

    if (roundNumber !== 1) {
      // if it's not the first round, initialize game immediately without waiting
      initializeGame();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
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
    if (userAnswer !== "") {
      navigate(`/waiting-answer/${userAnswer}`);
    }
    else { navigate("/waiting-answer/null");}
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
    }

    return (
      <div className={toolClassName}>
        {toolContent}
      </div>
    );
  };

  // making array to render tools, ensure the length is 3
  const renderTools = () => {
    const displayedTools = tools.slice(0, 3); // display the first three tools from tool list in the slot
    const emptySlotsCount = Math.max(3 - displayedTools.length, 0); // calculate the empty slot

    return [
      ...displayedTools.map((tool) => displayTool(tool)),
      ...Array(emptySlotsCount).fill(null).map((_) => displayTool(null))
    ];
  };


  // point display
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(20);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [player, setPlayer] = useState("");

  // fetch current user data
  //useEffect(() => {
  //  const timer = setInterval(async () => {
  //    try {
  //      const response = await api.get(`/users/${userId}`);
  //      setPlayer(response.data);
  //      console.log("User data fetched successfully:", response.data);
  //    } catch (error) {
  //      console.error(`Something went wrong while fetching the user: \n${handleError(error)}`);
  //    }
  //  }, 100);
  //
  //  return () => clearInterval(timer);
  //}, [userId]);

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
  }, [isReady, userId]);

  useEffect(() => {
    if (isReady || isReady_1 === "True") {  // when post ready, begin to countdown
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
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
        }
      }

      return () => clearTimeout(timer);
    }
  }, [timeLeft, isConfirmed, roundNumber, isReady, isReady_1]); // dependency

  //rank
  //const [rankData, setRankData] = useState([]);
  //useEffect(() => {
  //  const timer_rank = setInterval(async () => {
  //    try {
  //      const response_rank = await api.get(`/rooms/${roomId}/rank`);
  //      setRankData(response_rank.data);
  //    } catch (error) {
  //      console.error("Error fetching points", error);
  //    }
  //  }, 100);
  //
  //  return () => clearInterval(timer_rank);
  //}, []);
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
  }, [isReady]);
  const sortedRankData = rankData.sort((a, b) => b.score - a.score);
  const pointList = sortedRankData.map((item, index) => (
    <div key={index}>
      {item.username}: points: {item.score}
    </div>
  ));

  return (
    <div className="gameRoom">
      <div className="gameRoomContainer">
        <div className="image">
          <div className="imageGrid">
            {itemImages.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Item ${itemIds[index]}`}
                className={selectedItemIds.includes(itemIds[index]) ? "selected" : ""}
                onClick={() => handleImageSelect(itemIds[index])}
              />
            ))}
          </div>
          <div className="text">Total Price: {totalPrice}CHF</div>
          {hintNum !== 0 && (
            <div className="text">Hint for right total number: <span id="num">{hintNum}</span></div>
          )}
          <div className="buttonsContainer">
            <Button width="150%">Room: {roomCode}</Button>
            <Button width="150%" onClick={handleConfirmClick}>Confirm</Button>
            {message_1 && <div>{message_1}</div>}
          </div>
        </div>

        {/*tool part*/}
        <div className="tool">
          <div className="tool display">
            <label className="tool label">Tools</label>
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
          <div className="label" style={{center: 0, color: "white"}}>
            Round:
            {roundNumber}
          </div>

          <div className="gameRoom-point form"><br/><br/>
            <div className="score-table">
              <Button width="180%">{pointList}</Button>
            </div>
          </div>

        </div>


      </div>

    </div>
  );
};

export default GameRoomBudget;
