import React, { useState, useEffect, useRef} from 'react';
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/GameRoom.scss";
import {useNavigate} from "react-router-dom";
import User from "models/User";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

const GameRoom = () => {

  const [sliderValue, setSliderValue] = useState<number>(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [labelStyle, setLabelStyle] = useState<React.CSSProperties>({});
  const roomId = localStorage.getItem('roomId');
  const playerNames = localStorage.getItem('playerNames');

  const [imageUrl, setImageUrl] = useState<string>('/loading.png');
  let roundNumber = Number(localStorage.getItem("roundNumber"));
  const [Min, setMin] = useState<number>(0);
  const [Max, setMax] = useState<number>(1000);
  const userId = localStorage.getItem("userId");
  const [chosenItemList, setChosenItemList] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  //const isReady = localStorage.getItem("isReady");
  const [isReady, setIsReady] = useState(false);
  const isReady_1 = localStorage.getItem(("isReady_1"))

  // gain item picture ui
    useEffect(() => {
        const initializeGame = async () => {
            try {
                // Post to the getReady endpoint if roundNumber is 1
                if (roundNumber === 1) {
                    const response = await api.post(`games/${roomId}/${userId}/getReady`);
                    if (response.status === 204) {
                        setIsReady(true);
                        localStorage.setItem("isReady", isReady);
                        console.log('Ready response:', response.data);
                        await fetchImageUrl(roomId, roundNumber); // Fetch the image URL after a successful post
                    } else {
                        alert('Failed to get ready, status: ' + response.status);
                    }
                }
                else {
                    await fetchImageUrl(roomId, roundNumber); // Direct call if not the first round
                }
            } catch (error) {
                console.error('Error initializing game:', error);
            }
        };

        initializeGame();
    }, []);

    const fetchImageUrl = async (roomId, roundNumber) => {
        try {
            const response = await api.get(`games/${roomId}/${roundNumber}/${userId}`);
            localStorage.setItem('questionId',response.data.id);
            //blur items
            const newImageUrl = response.data.blur ? '/mosaic.jpg' : response.data.itemImage;
            setImageUrl(newImageUrl);
            setSliderRange(response.data.leftRange, response.data.rightRange);
            console.log('check:', newImageUrl, imageUrl, Min, Max)
        } catch (error) {
            console.error('Error fetching image URL:', error);
        }
    };
    const setSliderRange = (min: number, max: number) => {
        setMin(min);
        setMax(max);
    };

    // bar
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSliderValue(Number(event.target.value));
        updateLabelPosition(event.target);
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
         position: 'absolute',
         left: `${newPosition}px`,
         transform: 'translateX(-50%)',
         marginTop: '-25px',
         marginLeft:'450px'
         });*/
    };

    // sent user choice
    const handleConfirmClick = async () => {
        try {
            const questionId = localStorage.getItem("questionId");
            const result = await api.post("/answers/guessMode", {
                questionId,
                userId,
                guessedPrice: sliderValue,
                chosenItemList,
            });
            console.log("Success:", result.data);
            setImageUrl('/loading.png');
            setIsConfirmed(true);
        } catch (error) {
            console.error("Error posting value", error);
        }

    };

  // Tool display
    const [tools, setTools] = useState([]);

    console.log("userID:", userId)
    // fetch user's tool list from backend
    // useEffect(() => {
    //     const fetchTools = async () => {
    //         try {
    //             const response = await api.get(`/tools/{userId}`);
    //             setTools(response.data);
    //         } catch (error) {
    //             console.error('Error fetching tools:', error);
    //         }
    //     };
    //
    //     fetchTools();
    // }, [userId]);

    // simulate fetch user's tool list from backend
    useEffect(() => {
        const fetchUserTools = async () => {
            try {
                const userToolsFromBackend = [
                    { id: 1, toolType: 'BLUR' },
                    { id: 2, toolType: 'HINT' }
                ];
                setTools(userToolsFromBackend);
            } catch (error) {
                console.error('Error fetching user tools:', error);
            }
        };

        fetchUserTools();
    }, []);


    // display Tools in the game screen
    const displayTool = (tool, index) => {
        if (!tool) {
            return (
                <div key={`default-${index}`} className="tool item default"></div>
            );
        }

        const { id, toolType } = tool;

        let toolClassName = 'tool item default';
        let toolContent = '';

        if (toolType === 'HINT') {
            toolClassName = 'tool item hint';
            toolContent = 'Hint';
        } else if (toolType === 'BLUR') {
            toolClassName = 'tool item bomb';
            toolContent = 'Blur';
        }
        return (
            <div key={id} className={toolClassName}>
                    {toolContent}
            </div>
        );
    };

    // making array to render tools, ensure the length is 3
    const renderTools = () => {
        const displayedTools = tools.slice(0, 3); // display the first three tools from tool list in the slot
        const emptySlotsCount = Math.max(3 - displayedTools.length, 0); // calculate the empty slot

        return [
            ...displayedTools.map((tool, index) => displayTool(tool, index)),
            ...Array(emptySlotsCount).fill(null).map((_, index) => displayTool(null, displayedTools.length + index))
        ];
    };

  // point display
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState({ text: "", type: "" });

    const [player, setPlayer] = useState("");
    // fetch current user data
    useEffect(() => {
      const timer = setInterval(async () => {
        try {
          const response = await api.get(`/users/${userId}`);
          setPlayer(response.data);
          console.log("User data fetched successfully:", response.data);
        } catch (error) {
          console.error(`Something went wrong while fetching the user: \n${handleError(error)}`);
        }
      }, 100);
      return () => clearInterval(timer);
    }, [userId]);


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
                            if (roundNumber === 3) {
                                navigate('/rank');
                            } else {
                                roundNumber += 1;
                                localStorage.setItem("isReady_1","True")
                                localStorage.setItem("roundNumber", String(roundNumber));
                                navigate('/shop');
                            }
                        })
                        .catch((error) => {
                            console.error("Failed to auto-confirm:", error);
                            // handle error
                        });
                } else {
                    // if already clicked confirm
                    if (roundNumber === 3) {
                        navigate('/rank');
                    } else {
                        roundNumber += 1;
                        localStorage.setItem("isReady_1","True")
                        localStorage.setItem("roundNumber", String(roundNumber));
                        navigate('/shop');
                    }
                }
            }

            return () => clearTimeout(timer);
        }
    }, [timeLeft, isConfirmed, roundNumber, isReady, isReady_1]); // dependency


  //rank
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

  const doGameroom_point = async (toolType) => {
    try {

  // purchase successfully worked --> navigate to the gameRoom
      navigate("/gameRoom");

      // Show success message
      // displayMessage(`Buy and use the ${toolType} successfully!`, "success-message");

    } catch (error) {
      if (error.response && error.response.status === 403) {
        displayMessage("You don't have enough points.", "error-message");
      }
      else{
        displayMessage(`Something went wrong during the purchase: ${handleError(error)}`, "error-message");
      }
    }
  };

  const displayMessage = (messageText, messageType) => {
    setMessage({ text: messageText, type: messageType });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 5000); // Hide message after 5 seconds
  };

  return (
    <div className="gameRoom">
        <div className="gameRoomContainer">

            {/*image part*/}
            <div className="image">
                <img src={imageUrl} alt="Item display" className="gameRoomImage"/>

                <div className="text">
                    Slide to choose the price <br/>
                </div>

                <div className="text">{sliderValue}</div>

                <div className="sliderWrapper">
                    <div className="minValue">{Min}</div>
                    <input
                        type="range"
                        min={Min}
                        max={Max}
                        value={sliderValue}
                        onChange={handleSliderChange}
                        className="rangeInput"
                        ref={sliderRef}
                    />
                    <div className="maxValue">{Max}</div>
                </div>

                <div className="buttonsContainer">
                    {/*<Button width="150%" onClick={handleStart}>START</Button>*/}
                    <Button width="150%" onClick={handleConfirmClick}>Confirm</Button>
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
                    Round: <br/>
                </div>

                <div className="gameRoom-point form"><br/><br/>
                    <div className="score-table">
                        <Button width="180%">{pointList}</Button>
                        {/*<Button width="180%">User2:</Button>*/}
                    </div>
                </div>

                {/*<div className="score-table">*/}
                {/*    <Button>*/}
                {/*        {pointList}*/}
                {/*    </Button>*/}
                {/*</div>*/}
            </div>


        </div>

    </div>
  );
};
export default GameRoom;