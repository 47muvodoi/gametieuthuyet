import React from 'react';
import type { PlayerState } from '../types';

interface CharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerState: PlayerState;
}

export const CharacterModal = ({ isOpen, onClose, playerState }: CharacterModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="character-modal-backdrop" onClick={onClose}>
            <div className="character-modal" onClick={e => e.stopPropagation()}>
                <div className="character-modal-header">
                    <h2>Thông Tin Nhân Vật</h2>
                    <button className="character-modal-close-btn" onClick={onClose} aria-label="Đóng">X</button>
                </div>
                <div className="character-modal-content">
                    <div className="character-info-grid">
                        <div className="character-info-item">
                            <h4>Tên</h4>
                            <p>{playerState.name || 'Người Vô Danh'}</p>
                        </div>
                        <div className="character-info-item">
                            <h4>Giới Tính</h4>
                            <p>{playerState.gender || 'Chưa xác định'}</p>
                        </div>
                        <div className="character-info-item">
                            <h4>Tính Cách</h4>
                            <p>{playerState.personality}</p>
                        </div>
                        <div className="character-info-item">
                            <h4>Thiên Phú</h4>
                            <p>{playerState.talent}</p>
                        </div>
                        <div className="character-info-item wide">
                            <h4>Bảo Bối</h4>
                            <p>{playerState.treasures.join(', ') || 'Không có'}</p>
                        </div>
                        <div className="character-info-item">
                            <h4>Độ Khó</h4>
                            <p>{playerState.difficulty}</p>
                        </div>
                         <div className="character-info-item">
                            <h4>Nội dung 18+</h4>
                            <p>{playerState.nsfw}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};