import React, { useState, useEffect, useRef} from 'react';
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import "styles/views/GameRoom.scss";

const gameRoom: React.FC = () => {
  //const [imageUrl, setImageUrl] = useState<string>('');
  //mock
  const [imageUrl, setImageUrl] = useState<string>('https://www.thespruce.com/thmb/LCyupmFhZf0tXxj6TpBwWS6ZSfo=/3867x2578/filters:fill(auto,1)/GettyImages-153342142-56a75f045f9b58b7d0e9bee6.jpg');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [labelStyle, setLabelStyle] = useState<React.CSSProperties>({});
  const [roundNumber, setRoundNumber] = useState<string>('');

  // gain item picture ui
  /**
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await api.get("/${roomId}/${roundNumber}");
        setImageUrl(response.data.url);
      } catch (error) {
        console.error('Error fetching image URL', error);
      }
    };

    fetchImageUrl();
  }, []);
    */

  // bar
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSliderValue(Number(event.target.value));
    updateLabelPosition(event.target);
  };

  // pointed value
  const updateLabelPosition = (slider: HTMLInputElement) => {
    const value = Number(slider.value);
    const max = slider.max ? Number(slider.max) : 1000;
    const min = slider.min ? Number(slider.min) : 0;
    const percentage = ((value - min) / (max - min)) * 100;
    const newPosition = percentage * (slider.offsetWidth - 16) / 100;  // -16 or -8
/**
    setLabelStyle({
      position: 'absolute',
      left: `${newPosition}px`,
      transform: 'translateX(-50%)',
      marginTop: '-25px',
      marginLeft:'450px'
    });*/
  };
  const handleStart = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const roomId: string = localStorage.getItem('roomCode')
      const result = await api.post('/${roomId}/guessMode/start');
      setRoundNumber(result.data.roundNumber)
      console.log('Success:', result.data);
    } catch (error) {
      console.error('Error posting value', error);
    }
  };
  // sent user choice
  const handleConfirmClick = async () => {
    try {
      const result = await api.post('/value-endpoint', { value: sliderValue });
      console.log('Success:', result.data);
    } catch (error) {
      console.error('Error posting value', error);
    }
  };
  return (
    <div className="gameRoomContainer">
      <img src={imageUrl} alt="Item display" className="gameRoomImage" />
      <div className="sliderWrapper">
        <div style={labelStyle}>{sliderValue}</div>
        <input
          type="range"
          min="0"
          max="1000"
          value={sliderValue}
          onChange={handleSliderChange}
          className="rangeInput"
          ref={sliderRef}
        />
      </div>
      <div className="buttonsContainer">
        <Button onClick={handleStart}>S T A R T</Button>
        <Button onClick={handleConfirmClick}>Confirm</Button>
      </div>
    </div>
  );
};
export default gameRoom;
