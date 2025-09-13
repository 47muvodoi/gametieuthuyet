import React from 'react';
import type { StoryTurn, PlayerState, NpcDetails } from '../types';

interface StoryHistoryProps {
    history: StoryTurn[];
    playerState: PlayerState;
    turnRefs: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
    onNpcClick: (e: React.MouseEvent, npcData: NpcDetails) => void;
    onNpcMouseEnter: (e: React.MouseEvent, npcData: NpcDetails) => void;
    onNpcMouseLeave: () => void;
    onToggleCollapse: (turnId: number) => void;
}

const parseAndRenderStory = (
    turn: StoryTurn, 
    playerState: PlayerState, 
    onNpcClick: (e: React.MouseEvent, npcData: NpcDetails) => void,
    onNpcMouseEnter: (e: React.MouseEvent, npcData: NpcDetails) => void,
    onNpcMouseLeave: () => void
) => {
    const { story, npcs = [], id: turnId } = turn;
    if (!story) return <p><i>Bắt đầu cuộc phiêu lưu...</i></p>;

    const regex = /(\[LORE_NPC:.+?\]|\[THOUGHT\].*?\[\/THOUGHT\]|\[ACTION\].*?\[\/ACTION\]|\[DIALOGUE\].*?\[\/DIALOGUE\])/gs;
    const parts = story.split(regex).filter(Boolean);

    return (
        <div className="story-content">
            {parts.map((part, index) => {
                const key = `${turnId}-${index}`;

                if (part.startsWith('[LORE_NPC:')) {
                    const npcName = part.slice(10, -1);
                    const npcData = npcs.find(npc => npc.name === npcName);
                    return npcData ? (
                        <span 
                            key={key} 
                            className="npc-name" 
                            onClick={(e) => onNpcClick(e, npcData)} 
                            onMouseEnter={(e) => onNpcMouseEnter(e, npcData)}
                            onMouseLeave={onNpcMouseLeave}
                            role="button" 
                            tabIndex={0}
                        >
                            {npcName}
                        </span>
                    ) : <span key={key}>{npcName}</span>;
                }

                if (part.startsWith('[THOUGHT]')) {
                    const isPCThought = playerState.name && part.includes(playerState.name);
                    const thoughtClass = isPCThought ? "story-thought story-thought-pc" : "story-thought";
                    return <em key={key} className={thoughtClass}>{part.slice(9, -10)}</em>;
                }

                if (part.startsWith('[ACTION]')) {
                    return <strong key={key} className="story-action">{part.slice(8, -9)}</strong>;
                }
                
                if (part.startsWith('[DIALOGUE]')) {
                    const dialogueContent = part.slice(10, -11);
                    const isPC = playerState.name && dialogueContent.trim().startsWith(`${playerState.name}:`);
                    const dialogueClass = isPC ? "story-dialogue story-dialogue-pc" : "story-dialogue";
                    
                    if (isPC) {
                        const parts = dialogueContent.split(':');
                        const speaker = parts.shift();
                        const speech = parts.join(':');
                        return (
                            <span key={key} className={dialogueClass}>
                                {speaker}:<strong>{speech}</strong>
                            </span>
                        );
                    }
                    
                    return <span key={key} className={dialogueClass}>{dialogueContent}</span>;
                }

                return <span key={key}>{part}</span>;
            })}
        </div>
    );
};

export const StoryHistory = ({ history, playerState, turnRefs, onNpcClick, onNpcMouseEnter, onNpcMouseLeave, onToggleCollapse }: StoryHistoryProps) => {
    return (
        <>
            {history.map((turn, index) => {
                const isLastTurn = index === history.length - 1;
                return (
                    <div 
                        key={turn.id} 
                        className="story-turn"
                        ref={(el) => {
                            if (el) turnRefs.current.set(turn.id, el);
                            else turnRefs.current.delete(turn.id);
                        }}
                    >
                        <div className="story-panel">
                            {!turn.isCollapsed 
                                ? parseAndRenderStory(turn, playerState, onNpcClick, onNpcMouseEnter, onNpcMouseLeave) 
                                : <p><i>Lượt {turn.id} đã được thu gọn...</i></p>}
                        </div>
                        
                        {turn.selectedChoiceText && (
                            <div className="outcome-panel">
                                <p><strong>Lựa chọn của bạn:</strong> {turn.selectedChoiceText}</p>
                                {turn.customChoiceOutcome && (
                                    <div className="choice-details custom-choice-outcome-details">
                                        <span className="success">✓ {turn.customChoiceOutcome.successChance}%: {turn.customChoiceOutcome.successReward}</span>
                                        <span className="failure">✗ {100 - turn.customChoiceOutcome.successChance}%: {turn.customChoiceOutcome.failurePenalty}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isLastTurn && <button className="btn btn-secondary collapse-btn" onClick={() => onToggleCollapse(turn.id)}>{turn.isCollapsed ? 'Mở rộng' : 'Thu gọn'}</button>}
                    </div>
                );
            })}
        </>
    );
};