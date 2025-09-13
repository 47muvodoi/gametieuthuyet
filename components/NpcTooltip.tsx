import React from 'react';
import type { NpcDetails } from '../types';

interface NpcTooltipProps {
    data: NpcDetails;
    position: { x: number; y: number };
}

export const NpcTooltip = ({ data, position }: NpcTooltipProps) => {
    if (!data) return null;
    return (
        <div className="tooltip" style={{ left: `${position.x + 15}px`, top: `${position.y + 15}px` }}>
            <h3>{data.name}</h3>
            <p><strong>Tuổi:</strong> {data.age}</p>
            <p><strong>Tính cách:</strong> {data.personality}</p>
            <p><strong>Tình cảm:</strong> {data.affection}</p>
            <p><strong>Trạng thái:</strong> {data.status}</p>
            <p><strong>Tâm lý:</strong> {data.psychology}</p>
        </div>
    );
};
