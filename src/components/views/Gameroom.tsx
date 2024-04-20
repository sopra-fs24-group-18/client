import React, { useState, useEffect, useRef} from 'react';
import { api, handleError } from "helpers/api";

const gameRoom: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [labelStyle, setLabelStyle] = useState<React.CSSProperties>({});
  const [roundNumber, setRoundNumber] = useState<string>('');


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

  // gain item picture ui
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

    setLabelStyle({
      position: 'absolute',
      left: `${newPosition}px`,
      transform: 'translateX(-50%)',
      marginTop: '-25px',
      marginLeft:'450px'
    });
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
    <div style={{ background: 'default', textAlign: 'center', padding: '20px', position: 'relative' }}>
      <img src={imageUrl} alt="Item display" style={{ maxWidth: '100%', height: 'auto' }} />
      <div style={{ margin: '20px 0' }}>
        <div style={labelStyle}>{sliderValue}</div>
        <input
          type="range"
          min="0"
          max="1000"
          value={sliderValue}
          onChange={handleSliderChange}
          style={{ width: '80%', maxWidth: '600px' }}
          ref={sliderRef}
        />
      </div>
      <button onClick = {handleStart}>Start</button>
      <button onClick={handleConfirmClick}>Confirm</button>
    </div>
  );
};
export default gameRoom;
