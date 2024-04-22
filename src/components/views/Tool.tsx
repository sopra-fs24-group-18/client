import React, { useState, useEffect } from 'react';
import { api } from 'helpers/api';
import "styles/views/Tool.scss";

const ToolDisplay = () => {
    const userId = localStorage.getItem('id');
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

export default ToolDisplay;
