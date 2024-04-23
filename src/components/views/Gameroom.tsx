import React, { useState, useEffect, useRef} from 'react';
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/GameRoom.scss";
import {useNavigate} from "react-router-dom";
import User from "models/User";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

const GameRoom = () => {
  const [imageUrl, setImageUrl] = useState<string>('../../assets/loading.png');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [labelStyle, setLabelStyle] = useState<React.CSSProperties>({});
  const roundNumber = Number(localStorage.getItem("roundNumber"));
  const [Min, setMin] = useState<number>(0);
  const [Max, setMax] = useState<number>(1000);
  //const [Blur, setBlur] = useState<boolean>(false);
  const userId = localStorage.getItem("userId");
  const roomId = localStorage.getItem("roomId");
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Post to the getReady endpoint if roundNumber is 1
        if (roundNumber === 1) {
          const response = await api.post(`games/${roomId}/${userId}/getReady`);
          if (response.status === 204) {
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
      const newImageUrl = response.data.blur ? '../../assets/mosaic.png' : response.data.itemImage;
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
      const chosenItemList = useState<string>('');
      const questionId = localStorage.getItem("questionId");
      const requestBody = JSON.stringify({
        questionId, userId, guessedPrice: sliderValue, chosenItemList})
      const result = await api.post("/answers/guessMode", requestBody);
      console.log('Success:', result.data);
    } catch (error) {
      console.error('Error posting value', error);
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


    const applyToolEffects = () => {
        // if (tools.length > 0) {
        //     // check if user has BLUR tool
        //     const hasBlurTool = tools.some(tool => tool.toolType === 'BLUR');
        //     // check if user has HINT tool
        //     const hasHintTool = tools.some(tool => tool.toolType === 'HINT');
        //
        //     // apply blur filter into image for BLUR tool
        //     if (hasBlurTool) {
        //         const otherPlayersImages = document.querySelectorAll('.other-player-image');
        //         otherPlayersImages.forEach((image) => {
        //             image.style.filter = 'blur(5px)';
        //         });
        //     }
        //
        //     // change the upper limit of the price slider for HINT tool
        //     if (hasHintTool) {
        //         const priceSlider = document.querySelector('.price-slider');
        //         if (priceSlider) {
        //             const maxPrice = parseInt(priceSlider.max, 10);
        //             priceSlider.max = Math.floor(maxPrice / 2);
        //         }
        //     }
        // }
    };

    useEffect(() => {
        applyToolEffects();
    }, [tools]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    if (timeLeft === 0) {
      clearTimeout(timer);
      navigate("/shop");
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

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
    <div className="gameRoomContainer">
    <BaseContainer>
      <img src={imageUrl} alt="Item display" className="gameRoomImage" />
      <div className="sliderWrapper">
        <div style={labelStyle}>{sliderValue}</div>
        <input
          type="range"
          min={Min}
          max={Max}
          value={sliderValue}
          onChange={handleSliderChange}
          className="rangeInput"
          ref={sliderRef}
        />
      </div>
      <div className="buttonsContainer">
        <Button onClick={handleConfirmClick}>Confirm</Button>
      </div>
      <div className="tool display">
          <label className="tool label">Tools</label>
          <div className="tool container">
              {renderTools()}
          </div>
      </div>
      <div className="gameroom_point form"><br /><br />

        {/* Display remaining time */}
        <div style={{ position: 'absolute', top: 50, left: 100, textAlign: 'center'}}>
          Time: <br />
          {timeLeft}
        </div>

        {/* Display Points */}
        <div style={{ position: 'absolute', top: 50, right: 100, textAlign: 'center'}}>
          Your Point: <br />
        </div>
      </div>

      <div className="score-table">
        <Button >User1:</Button>
        <Button >User2:</Button>
      </div>
    </BaseContainer>
    </div>
  );
};
export default GameRoom;