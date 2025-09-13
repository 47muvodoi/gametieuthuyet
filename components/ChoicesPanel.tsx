import React from 'react';
import type { StoryTurn } from '../types';

interface ChoicesPanelProps {
    lastTurn: StoryTurn;
    customChoice: string;
    onCustomChoiceChange: (value: string) => void;
    onCustomChoiceSubmit: (e: React.FormEvent) => void;
    onChoiceClick: (turnId: number, choiceText: string) => void;
}

export const ChoicesPanel = ({ 
    lastTurn, 
    customChoice, 
    onCustomChoiceChange, 
    onCustomChoiceSubmit, 
    onChoiceClick
}: ChoicesPanelProps) => {
    
    return (
        <div className="choices-panel-container">
            <div className="choices-panel">
                {(lastTurn.choices || []).map((choice, choiceIndex) => (
                    <button key={choiceIndex} className="choice-btn" onClick={() => onChoiceClick(lastTurn.id, choice.text)}>
                        <span className="choice-text">{choice.text}</span>
                        <div className="choice-details">
                            <span className="success">✓ {choice.successChance}%: {choice.successReward}</span>
                            <span className="failure">✗ {100 - choice.successChance}%: {choice.failurePenalty}</span>
                        </div>
                    </button>
                ))}
            </div>
            <div className="custom-choice-container">
                <form onSubmit={onCustomChoiceSubmit}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Lựa chọn của riêng bạn..."
                        value={customChoice}
                        onChange={(e) => onCustomChoiceChange(e.target.value)}
                        aria-label="Nhập lựa chọn tùy chỉnh"
                    />
                    <button type="submit" className="btn btn-primary">Gửi</button>
                </form>
            </div>
        </div>
    );
};