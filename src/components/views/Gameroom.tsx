import React, { useState, useEffect, useRef} from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { PlayerTable } from "components/ui/PlayerTable";
import "styles/views/GameRoom.scss";
import {useNavigate} from "react-router-dom";

const GameRoom = () => {

  const [sliderValue, setSliderValue] = useState<number>(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const roomId = localStorage.getItem("roomId");
  const [imageUrl, setImageUrl] = useState<string>(`${process.env.PUBLIC_URL}/loading.png`);
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const [Min, setMin] = useState<number>(0);
  const [Max, setMax] = useState<number>(1000);
  const [oriMin, setOriMin] = useState<number>(0);
  const [oriMax, setOriMax] = useState<number>(0);
  const userId = localStorage.getItem("userId");
  // const [chosenItemList, setChosenItemList] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const roomCode = localStorage.getItem("roomCode");
  const [message_1, setMessage_1] = useState("");
  const [userAnswer, setUserAnswer] = useState<number>(0);
  const [isBlurred, setIsBlurred] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);


  // gain item picture ui
  useEffect(() => {
    const initializeGame = async () => {
      await fetchImageUrl(roomId, roundNumber);
    };

    initializeGame();
  }, [roomId, userId, roundNumber]);


  const fetchImageUrl = async (roomId, roundNumber, retryCount = 0) => {
    try {
      setLoading(true);
      const response = await api.get(`games/${roomId}/${roundNumber}/${userId}`);
      localStorage.setItem("questionId", response.data.id);
      //const newImageUrl = response.data.blur ? `${process.env.PUBLIC_URL}/mosaic.jpg` : response.data.itemImage;
      setIsBlurred(response.data.blur);
      setImageUrl(response.data.itemImage);
      setCurrentValue(response.data.leftRange)
      setLoading(false);
      if (response.data.leftRange === response.data.originLeftRange
        && response.data.rightRange === response.data.originRightRange)
      { setSliderRange(response.data.leftRange, response.data.rightRange);}
      else { setSliderRange(response.data.leftRange, response.data.rightRange);
        setOriMax(response.data.originRightRange);
        setOriMin(response.data.originLeftRange);}

      console.log("check:", imageUrl, Min, Max, oriMax, oriMin);
    } catch (error) {
      console.error("Error fetching image URL:", error);
      if (error.response && error.response.status === 404 && retryCount < 2) {
        console.log(`Retry fetching image URL due to 404 error, retry count: ${retryCount + 1}`);
        setTimeout(() => fetchImageUrl(roomId, roundNumber, retryCount + 1), 1000); // Retry after 1 second
      } else if (retryCount >= 2) {
        console.error("Max retry limit reached, not retrying further.");
      }
    }
  };

  const setSliderRange = (min: number, max: number) => {
    setMin(min);
    setMax(max);
  };


  // bar
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSliderValue(Number(event.target.value));
    setCurrentValue(Number(event.target.value))
    updateLabelPosition(event.target);
    setUserAnswer(Number(event.target.value));
  };

  // pointed value

  const updateLabelPosition = (slider: HTMLInputElement) => {
    const value = Number(slider.value);
    // Use state values for min and max
    const max = Max;
    const min = Min;
    const percentage = ((value - min) / (max - min)) * 100;
    const newPosition = percentage * (slider.offsetWidth - 16) / 100;//-16 or -8
    /**
         setLabelStyle({
         position: "absolute",
         left: `${newPosition}px`,
         transform: "translateX(-50%)",
         marginTop: "-25px",
         marginLeft:"450px"
         });*/
  };

  useEffect(() => {
    if (userAnswer !== 0) {
      navigate(`/waiting-answer/${userAnswer}`);
    }
  }, [userAnswer]);

  // sent user choice
  const handleConfirmClick = async () => {
    localStorage.setItem("timeLeft", "7");
    localStorage.setItem("isReady_answer_timer", "false");
    localStorage.setItem("isReady_answer", "false");
    if (sliderValue === 0)
    {
      setUserAnswer(currentValue);
      console.log("no answer",{currentValue, userAnswer});
    }
    else{
      navigate(`/waiting-answer/${userAnswer}`);}
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
            console.log("auto-confirmed")

          })
          .catch((error) => {
            console.error("Failed to auto-confirm:", error);
            // handle error
          });
      } else {
        // if already clicked confirm
        console.log("already confirmed")
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

        {/*image part*/}
        <div className="image">
          <img src={imageUrl}
            alt="Item display"
            className={`gameRoomImage ${isBlurred ? "blurred" : ""}`}/>

          <div className="text">
                        Slide to choose the price <br/>
          </div>

          <div className="text">
            {loading ? "Loading..." : currentValue}</div>

          <div className="sliderWrapper">
            {/* check origin 0 */}
            {oriMin === 0 && oriMax === 0 ? (
              <div className="minValue">{Min}CHF</div>
            ) : (
              <div className="minValue">{oriMin}&rArr;{Min}CHF</div>
            )}
            <input
              type="range"
              min={Min}
              max={Max}
              value={sliderValue}
              onChange={handleSliderChange}
              className="rangeInput"
            />
            {oriMin === 0 && oriMax === 0 ? (
              <div className="maxValue">{Max}CHF</div>
            ) : (
              <div className="maxValue">{Max}CHF&lArr;{oriMax}</div>
            )}
          </div>

          <div className="buttonsContainer1">
            {/*<Button width="150%" onClick={handleStart}>START</Button>*/}
            <Button width="150%" >Room: {roomCode} </Button>
            <Button width="150%" onClick={handleConfirmClick}>Confirm</Button>
            {message && <div>{message_1}</div>}
            <Button width="150%" onClick={() => {leaveRoom();}}>Exit</Button>
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

          <div className="gameRoom-point form">
            <div className="pointsContainer">
              {pointList}
            </div>
          </div>

        </div>


      </div>

    </div>
  );
};

export default GameRoom;
