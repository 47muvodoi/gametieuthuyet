import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { CreationScreen } from './components/CreationScreen';
import { AdventureScreen } from './components/AdventureScreen';
import { ApiKeyScreen } from './components/ApiKeyScreen';
import { SAVE_GAME_KEY } from './constants';
import type { PlayerState, ObjectState, StoryTurn, InventoryItem } from './types';

const API_KEY_SESSION_STORAGE_KEY = 'gemini-api-key';

// Main App Component
const App = () => {
    const [isApiSet, setIsApiSet] = useState(false);
    const [screen, setScreen] = useState<'creation' | 'adventure'>('creation');
    const [playerStateForAdventure, setPlayerStateForAdventure] = useState<PlayerState | null>(null);
    const [objects, setObjects] = useState<ObjectState[]>([]);
    const [initialHistory, setInitialHistory] = useState<StoryTurn[] | null>(null);
    const [saveFileExists, setSaveFileExists] = useState(false);
    const [transitionStage, setTransitionStage] = useState('screen-fade-in');

    useEffect(() => {
        if (sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY)) {
            setIsApiSet(true);
        }
        if (localStorage.getItem(SAVE_GAME_KEY)) {
            setSaveFileExists(true);
        }
    }, []);

    const handleApiKeySubmit = (key: string) => {
        sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, key);
        setIsApiSet(true);
    };

    const switchScreen = (targetScreen: 'adventure', data: any) => {
        setTransitionStage('screen-fade-out');
        setTimeout(() => {
            if (targetScreen === 'adventure') {
                if (data.type === 'new') {
                    const { finalPlayerState } = data;
                    const initialInventory: InventoryItem[] = [];
                    switch (finalPlayerState.difficulty) {
                        case 'Dễ': initialInventory.push({ name: 'Tinh Hồn', quantity: 100 }); break;
                        case 'Thường': initialInventory.push({ name: 'Tinh Hồn', quantity: 100 }); break;
                        case 'Khó': initialInventory.push({ name: 'Tinh Hồn', quantity: 10 }); break;
                        case 'Ác Mộng': initialInventory.push({ name: 'Tinh Hồn', quantity: 3 }); break;
                    }
                    const finalStateWithInventory = { ...finalPlayerState, inventory: initialInventory };
                    setPlayerStateForAdventure(finalStateWithInventory);
                    setInitialHistory(null);
                } else if (data.type === 'load') {
                    const { savedGame } = data;
                    setPlayerStateForAdventure(savedGame.playerState);
                    setObjects(savedGame.objects);
                    setInitialHistory(savedGame.history);
                }
                setScreen('adventure');
                setTransitionStage('screen-fade-in');
            }
        }, 500); // Corresponds to animation time
    };

    const handleContinue = (finalPlayerState: PlayerState) => {
        switchScreen('adventure', { type: 'new', finalPlayerState });
    };
    
    const handleLoadGame = () => {
        const savedGameJSON = localStorage.getItem(SAVE_GAME_KEY);
        if (savedGameJSON) {
            try {
                const savedGame = JSON.parse(savedGameJSON);
                switchScreen('adventure', { type: 'load', savedGame });
            } catch (e) {
                console.error("Failed to load game:", e);
                alert("Tệp lưu bị lỗi. Đã xóa tệp lưu cũ.");
                localStorage.removeItem(SAVE_GAME_KEY);
                setSaveFileExists(false);
            }
        }
    };
    
    if (!isApiSet) {
        return <ApiKeyScreen onApiKeySubmit={handleApiKeySubmit} />;
    }

    if (screen === 'adventure' && playerStateForAdventure) {
        return (
            <div className={transitionStage}>
                <AdventureScreen 
                    initialPlayerState={playerStateForAdventure} 
                    objects={objects} 
                    initialHistory={initialHistory} 
                />
            </div>
        );
    }

    return (
        <div className={transitionStage}>
            <main className="app-container">
                 <CreationScreen 
                    onContinue={handleContinue} 
                    objects={objects} 
                    setObjects={setObjects} 
                    onLoadGame={handleLoadGame}
                    saveFileExists={saveFileExists}
                />
            </main>
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
