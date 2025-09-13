import React from 'react';
import type { PlayerState } from '../types';

interface PlayerSidebarProps {
    playerState: PlayerState;
    onOpenCharacter: () => void;
    onOpenInventory: () => void;
    onOpenRelatives: () => void;
    onOpenNpcLog: () => void;
}

export const PlayerSidebar = ({ playerState, onOpenCharacter, onOpenInventory, onOpenRelatives, onOpenNpcLog }: PlayerSidebarProps) => {
    return (
        <aside className="player-sidebar">
            <h3 className="player-sidebar-title">{playerState.name || 'Nhân Vật'}</h3>
            <div className="player-sidebar-content">
                <div className="player-sidebar-actions">
                    <h4 className="sidebar-action-header" onClick={onOpenCharacter} role="button" tabIndex={0}>Nhân Vật</h4>
                    <h4 className="sidebar-action-header" onClick={onOpenInventory} role="button" tabIndex={0}>Túi Đồ</h4>
                    <h4 className="sidebar-action-header" onClick={onOpenRelatives} role="button" tabIndex={0}>Người Thân</h4>
                    <h4 className="sidebar-action-header" onClick={onOpenNpcLog} role="button" tabIndex={0}>Nhật Ký NPC</h4>
                </div>
            </div>
        </aside>
    );
};