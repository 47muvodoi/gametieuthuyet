import React from 'react';
import type { NpcDetails } from '../types';

interface NpcLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    npcs: NpcDetails[];
}

export const NpcLogModal = ({ isOpen, onClose, npcs }: NpcLogModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="npc-log-modal-backdrop" onClick={onClose}>
            <div className="npc-log-modal" onClick={e => e.stopPropagation()}>
                <div className="npc-log-modal-header">
                    <h2>Nhật Ký NPC</h2>
                    <button className="npc-log-modal-close-btn" onClick={onClose} aria-label="Đóng">X</button>
                </div>
                <div className="npc-log-modal-content">
                    {npcs.length === 0 ? (
                        <p className="empty-message">Bạn chưa gặp NPC nào.</p>
                    ) : (
                        <div className="npc-log-grid">
                            {npcs.map(npc => (
                                <div key={npc.name} className="npc-card">
                                    <div className="npc-card-name">{npc.name}</div>
                                    <div className="npc-card-detail"><span>Tuổi:</span> {npc.age}</div>
                                    <div className="npc-card-detail"><span>Tính cách:</span> {npc.personality}</div>
                                    <div className="npc-card-detail"><span>Tình cảm:</span> {npc.affection}</div>
                                    <div className="npc-card-detail"><span>Trạng thái:</span> {npc.status}</div>
                                    <div className="npc-card-detail"><span>Tâm lý:</span> {npc.psychology}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};