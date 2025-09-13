import React, { useMemo } from 'react';
import type { Relative } from '../types';

interface RelativesModalProps {
    isOpen: boolean;
    onClose: () => void;
    relatives: Relative[];
}

const CATEGORY_MAP: { [key: string]: string[] } = {
    'Trưởng Bối': [
        'Tổ phụ', 'Tổ mẫu', 'Ngoại công', 'Ngoại tổ mẫu', 
        'Phụ thân', 'Gia phụ', 'Mẫu thân', 'Gia mẫu', 
        'Bá phụ', 'Thúc phụ', 'Cữu phụ', 'Cô mẫu', 'Di mẫu', 
        'Bá mẫu', 'Thúc mẫu', 'Cữu mẫu', 'Sư Phụ'
    ],
    'Bằng Hữu & Đồng Bối': [
        'Đại ca', 'Nhị ca', 'Tam ca', 'Huynh trưởng', 
        'Tiểu đệ', 'Tam đệ', 'Tứ đệ', 'Đệ Đệ',
        'Đại tỷ', 'Nhị tỷ', 'Tam tỷ', 'Tỷ tỷ', 
        'Tiểu muội', 'Tam muội', 'Tứ muội', 'Muội Muội',
        'Tẩu tử', 'Đại tẩu', 'Nhị tẩu', 'Đệ muội', 
        'Tỷ phu', 'Muội phu',
        'Đường Huynh', 'Đường Tỷ', 'Đường Đệ', 'Đường Muội',
        'Sư Huynh', 'Sư Tỷ', 'Sư Đệ', 'Sư Muội'
    ],
    'Thê Thiếp': [
        'Thê tử', 'Nội tử', 'Chính thất', 'Phu nhân', 
        'Tiểu thiếp', 'Trắc thất', 'Thiếp thất',
        'Đạo Lữ', 'Nương Tử'
    ],
    'Hậu Duệ': [
        'Nhi tử', 'Đích tử', 'Thứ tử', 
        'Nữ nhi', 'Tiểu nữ',
        'Đồ Đệ'
    ],
};


const CATEGORY_ORDER = ['Trưởng Bối', 'Bằng Hữu & Đồng Bối', 'Thê Thiếp', 'Hậu Duệ'];

export const RelativesModal = ({ isOpen, onClose, relatives }: RelativesModalProps) => {
    if (!isOpen) return null;

    const categorizedRelatives = useMemo(() => {
        const categories: { [key: string]: Relative[] } = {};
        
        relatives.forEach(relative => {
            let assigned = false;
            for (const categoryName in CATEGORY_MAP) {
                if (CATEGORY_MAP[categoryName].includes(relative.relationship)) {
                    if (!categories[categoryName]) {
                        categories[categoryName] = [];
                    }
                    categories[categoryName].push(relative);
                    assigned = true;
                    break;
                }
            }
             if (!assigned) {
                const otherKey = 'Khác';
                if (!categories[otherKey]) categories[otherKey] = [];
                categories[otherKey].push(relative);
            }
        });

        return categories;
    }, [relatives]);

    const orderedCategories = CATEGORY_ORDER.filter(cat => categorizedRelatives[cat]?.length > 0);
    if(categorizedRelatives['Khác']?.length > 0) {
        orderedCategories.push('Khác');
    }

    return (
        <div className="relatives-modal-backdrop" onClick={onClose}>
            <div className="relatives-modal" onClick={e => e.stopPropagation()}>
                <div className="relatives-modal-header">
                    <h2>Người Thân</h2>
                    <button className="relatives-modal-close-btn" onClick={onClose} aria-label="Đóng">X</button>
                </div>
                <div className="relatives-modal-content">
                    {relatives.length === 0 ? (
                        <p className="empty-message">Bạn không có người thân nào.</p>
                    ) : (
                        orderedCategories.map(categoryName => (
                            <div key={categoryName} className="relatives-category">
                                <h3 className="relatives-category-title">{categoryName}</h3>
                                <div className="relatives-grid">
                                    {categorizedRelatives[categoryName].map(relative => (
                                        <div key={relative.name} className="relative-card">
                                            <div className="relative-card-name">{relative.name}</div>
                                            <div className="relative-card-relationship">
                                                <span>Quan hệ:</span> {relative.relationship}
                                            </div>
                                            {relative.status && (
                                                <div className="relative-card-status">
                                                   <span>Trạng thái:</span> {relative.status}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};