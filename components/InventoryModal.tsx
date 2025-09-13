import React from 'react';
import type { InventoryItem } from '../types';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
}

export const InventoryModal = ({ isOpen, onClose, inventory }: InventoryModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="inventory-modal-backdrop" onClick={onClose}>
            <div className="inventory-modal" onClick={e => e.stopPropagation()}>
                <div className="inventory-modal-header">
                    <h2>Túi Đồ</h2>
                    <button className="inventory-modal-close-btn" onClick={onClose} aria-label="Đóng túi đồ">X</button>
                </div>
                <div className="inventory-modal-content">
                    {inventory.length === 0 ? (
                        <p className="empty-message">Túi đồ trống</p>
                    ) : (
                        <div className="inventory-grid">
                            {inventory.map(item => (
                                <div key={item.name} className="inventory-card">
                                    <div className="inventory-card-name">{item.name}</div>
                                    <div className="inventory-card-quantity">x{item.quantity}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};