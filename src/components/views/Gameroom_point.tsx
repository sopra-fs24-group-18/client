import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Gameroom_point.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";


const Gameroom_point = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    if (timeLeft === 0) {
      clearTimeout(timer);
      navigate("/gameroom_point");
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

          <div className="buttonsContainer">
            <Button >Confirm</Button>
          </div>
          <div className="score-table">
            <Button >User1:</Button>
            <Button >User2:</Button>
          </div>
      </BaseContainer>
    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Gameroom_point;




export const ToolDisplay = () => {
    const userId = localStorage.getItem('userId');
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

    return (
        <div className="tool display">
            <label className="tool label">Tools</label>
            <div className="tool container">
                {renderTools()}
            </div>
        </div>
    );
};


// point display
export const PointDisplay = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    if (timeLeft === 0) {
      clearTimeout(timer);
      navigate("/gameroom");
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