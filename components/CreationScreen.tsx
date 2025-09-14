import React, { useState } from 'react';
import { WorldCreationPanel } from './WorldCreationPanel';
import { ObjectCreationPanel } from './ObjectCreationPanel';
import type { PlayerState, ObjectState, Relative } from '../types';
import { PERSONALITY_OPTIONS, TALENT_OPTIONS, CULTIVATION_DATA } from '../constants';

interface CreationScreenProps {
    onContinue: (playerState: PlayerState) => void;
    objects: ObjectState[];
    setObjects: React.Dispatch<React.SetStateAction<ObjectState[]>>;
    onLoadGame: () => void;
    saveFileExists: boolean;
}

const RELATIONSHIP_MAP: { [key: string]: string } = {
    // Bậc trên
    'ông nội': 'Tổ phụ', 'tổ phụ': 'Tổ phụ',
    'bà nội': 'Tổ mẫu', 'tổ mẫu': 'Tổ mẫu',
    'ông ngoại': 'Ngoại công', 'ngoại công': 'Ngoại công',
    'bà ngoại': 'Ngoại tổ mẫu', 'ngoại tổ mẫu': 'Ngoại tổ mẫu',
    'cha': 'Phụ thân', 'phụ thân': 'Phụ thân', 'bố': 'Phụ thân', 'gia phụ': 'Phụ thân',
    'mẹ': 'Mẫu thân', 'mẫu thân': 'Mẫu thân', 'má': 'Mẫu thân', 'gia mẫu': 'Mẫu thân',

    // Hệ cha mẹ
    'bác trai': 'Bá phụ', 'bá phụ': 'Bá phụ', 'bá bá': 'Bá phụ',
    'chú': 'Thúc phụ', 'thúc phụ': 'Thúc phụ', 'thúc thúc': 'Thúc phụ',
    'cậu': 'Cữu phụ', 'cữu phụ': 'Cữu phụ', 'cữu cữu': 'Cữu phụ',
    'cô': 'Cô mẫu', 'cô mẫu': 'Cô mẫu', 'cô cô': 'Cô mẫu',
    'dì': 'Di mẫu', 'di mẫu': 'Di mẫu', 'di di': 'Di mẫu',
    'bác gái': 'Bá mẫu', 'bá mẫu': 'Bá mẫu',
    'thím': 'Thúc mẫu', 'thúc mẫu': 'Thúc mẫu',
    'mợ': 'Cữu mẫu', 'cữu mẫu': 'Cữu mẫu',

    // Anh em
    'anh trai': 'Huynh trưởng', 'huynh trưởng': 'Huynh trưởng', 'đại ca': 'Huynh trưởng', 'ca ca': 'Huynh trưởng',
    'em trai': 'Tiểu đệ', 'tiểu đệ': 'Tiểu đệ', 'đệ đệ': 'Tiểu đệ',
    'chị gái': 'Tỷ tỷ', 'tỷ tỷ': 'Tỷ tỷ', 'đại tỷ': 'Tỷ tỷ',
    'em gái': 'Tiểu muội', 'tiểu muội': 'Tiểu muội', 'muội muội': 'Tiểu muội',
    
    // Hôn nhân trong anh em
    'chị dâu': 'Tẩu tử', 'tẩu tử': 'Tẩu tử',
    'em dâu': 'Đệ muội', 'đệ muội': 'Đệ muội',
    'anh rể': 'Tỷ phu', 'tỷ phu': 'Tỷ phu',
    'em rể': 'Muội phu', 'muội phu': 'Muội phu',

    // Vợ, thiếp
    'vợ': 'Thê tử', 'thê tử': 'Thê tử', 'phu nhân': 'Thê tử', 'nương tử': 'Thê tử', 'đạo lữ': 'Thê tử',
    'vợ lẽ': 'Tiểu thiếp', 'tiểu thiếp': 'Tiểu thiếp', 'thiếp': 'Tiểu thiếp',
    
    // Con cái
    'con trai': 'Nhi tử', 'nhi tử': 'Nhi tử',
    'con gái': 'Nữ nhi', 'nữ nhi': 'Nữ nhi',

    // Sư môn
    'sư phụ': 'Sư Phụ', 'thầy': 'Sư Phụ',
    'sư huynh': 'Sư Huynh',
    'sư tỷ': 'Sư Tỷ',
    'sư đệ': 'Sư Đệ',
    'sư muội': 'Sư Muội',
    'đồ đệ': 'Đồ Đệ',
};

export const CreationScreen = ({ onContinue, objects, setObjects, onLoadGame, saveFileExists }: CreationScreenProps) => {
    const level1Data = CULTIVATION_DATA[0];
    const [playerState, setPlayerState] = useState<PlayerState>({
        name: '',
        personality: PERSONALITY_OPTIONS[0],
        talent: TALENT_OPTIONS[0],
        gender: '',
        treasures: [],
        inventory: [],
        relatives: [],
        difficulty: 'Thường',
        nsfw: 'Không',
        daoHieu: 'Phàm Nhân',
        age: 16,
        lifespan: 80,
        attributePoints: 0,
        // --- CULTIVATION STATS ---
        level: level1Data.lv,
        exp: 0,
        expToNextLevel: level1Data.expRequired,
        realm: level1Data.realm,
        stage: level1Data.stage,
        stats: {
            maxHp: level1Data.hp,
            currentHp: level1Data.hp,
            maxMana: level1Data.mana,
            currentMana: level1Data.mana,
            atk: level1Data.atk,
            def: level1Data.def,
            spd: level1Data.spd,
            critRate: 5,
            critDamage: 150,
            dodge: 5,
            block: 5,
            attributes: {
                theChat: 8,
                ngoTinh: 5,
                triTue: 7,
                mayMan: 6,
            }
        }
    });

    const handleContinueClick = () => {
        const finalPlayerState = { ...playerState };
        const newRelatives: Relative[] = [];

        // Get all possible keys from the map for matching
        const relationshipKeys = Object.keys(RELATIONSHIP_MAP);

        objects.forEach(obj => {
            if (!obj.name || !obj.relationship) {
                return; // Skip if name or relationship is missing
            }
            
            const lowerCaseRelationship = obj.relationship.toLowerCase().trim();

            // Find if the user-entered relationship matches any key in our map
            const matchedKey = relationshipKeys.find(key => lowerCaseRelationship === key);
            
            if (matchedKey) {
                const formalRelationship = RELATIONSHIP_MAP[matchedKey];
                 newRelatives.push({
                    name: obj.name.trim(),
                    relationship: formalRelationship,
                    status: 'Còn sống'
                });
            }
            // If it doesn't match a family term (e.g., "kẻ thù"), it's not added to `relatives`.
            // It remains an "object" and will be passed to the AI in the initial prompt.
        });

        if (newRelatives.length > 0) {
            const existingRelativeNames = new Set(finalPlayerState.relatives.map(r => r.name));
            const uniqueNewRelatives = newRelatives.filter(nr => !existingRelativeNames.has(nr.name));
            finalPlayerState.relatives = [...finalPlayerState.relatives, ...uniqueNewRelatives];
        }

        onContinue(finalPlayerState);
    };

    return (
        <>
            <h1>TẠO LẬP CUỘC PHIÊU LƯU CỦA BẠN</h1>
            <div className="panels-container">
                <WorldCreationPanel playerState={playerState} setPlayerState={setPlayerState} />
                <ObjectCreationPanel objects={objects} setObjects={setObjects} />
            </div>
            <div className="actions-container">
                <button className="btn btn-primary" onClick={handleContinueClick}>TIẾP TỤC</button>
                <button className="btn btn-secondary" onClick={onLoadGame} disabled={!saveFileExists}>TẢI LẠI TRÒ CHƠI</button>
                <button className="btn btn-secondary">QUAY LẠI</button>
            </div>
        </>
    );
};