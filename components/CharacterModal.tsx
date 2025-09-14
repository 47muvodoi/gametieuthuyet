import React from 'react';
import type { PlayerState, InventoryItem } from '../types';
import { CULTIVATION_DATA } from '../constants';

interface CharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerState: PlayerState;
    setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
}

const CULTIVATION_ITEMS_EXP_MAP: { [key: string]: number } = {
    'LT Thượng': 40,
    'LT Trung': 20,
    'LT Hạ': 10,
    'Tinh Hồn': 1,
};

const CULTIVATION_ITEMS_ORDER = ['LT Thượng', 'LT Trung', 'LT Hạ', 'Tinh Hồn'];

const applyLevelUps = (expToAdd: number, currentPlayerState: PlayerState): PlayerState => {
    let newState = JSON.parse(JSON.stringify(currentPlayerState));
    if (expToAdd <= 0) return newState;

    let currentExp = newState.exp + expToAdd;
    let currentLevel = newState.level;
    let expForNext = newState.expToNextLevel;

    while (currentLevel < CULTIVATION_DATA.length && currentExp >= expForNext) {
        currentExp -= expForNext;
        currentLevel++;
        const nextLevelData = CULTIVATION_DATA[currentLevel - 1];
        
        newState.level = nextLevelData.lv;
        newState.realm = nextLevelData.realm;
        newState.stage = nextLevelData.stage;
        newState.stats = {
            ...newState.stats, // Preserve all existing stats (crit, dodge, attributes etc)
            maxHp: nextLevelData.hp,
            currentHp: nextLevelData.hp, // Full heal on level up
            maxMana: nextLevelData.mana,
            currentMana: nextLevelData.mana, // Full mana restore
            atk: nextLevelData.atk,
            def: nextLevelData.def,
            spd: nextLevelData.spd,
        };
        expForNext = CULTIVATION_DATA[currentLevel - 1]?.expRequired ?? Infinity;
    }

    newState.exp = currentExp;
    newState.expToNextLevel = expForNext;

    return newState;
};


export const CharacterModal = ({ isOpen, onClose, playerState, setPlayerState }: CharacterModalProps) => {
    if (!isOpen) return null;

    const { stats, name, daoHieu, age, lifespan, talent, realm, stage, level, exp, expToNextLevel, attributePoints, inventory } = playerState;

    const calculateCombatPower = (s: PlayerState['stats']) => {
        return Math.floor(
            (s.atk * 5) +
            (s.def * 3) +
            (s.maxHp / 2) +
            (s.spd * 10) +
            (s.critRate * 2) +
            (s.critDamage / 10) +
            (s.dodge * 2) +
            (s.block * 2)
        );
    };

    const renderExpBar = (current: number, max: number, length: number = 20) => {
        const percentage = max > 0 ? current / max : 0;
        const filledCount = Math.floor(percentage * length);
        const emptyCount = length - filledCount;
        return `[${'█'.repeat(filledCount)}${'-'.repeat(emptyCount)}]`;
    };

    const handlePointAdd = (statKey: keyof PlayerState['stats']) => {
        if (attributePoints <= 0) return;

        setPlayerState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            newState.attributePoints -= 1;

            switch(statKey) {
                case 'maxHp': newState.stats.maxHp += 10; break;
                case 'maxMana': newState.stats.maxMana += 10; break;
                case 'atk': newState.stats.atk += 1; break;
                case 'def': newState.stats.def += 1; break;
                case 'spd': newState.stats.spd += 1; break;
                case 'critRate': newState.stats.critRate += 0.5; break;
                case 'critDamage': newState.stats.critDamage += 2; break;
                case 'dodge': newState.stats.dodge += 0.5; break;
                case 'block': newState.stats.block += 0.5; break;
            }
            return newState;
        });
    }

    const handleCultivate = () => {
        let itemToConsume: InventoryItem | undefined;
        let itemTier = '';

        for (const tier of CULTIVATION_ITEMS_ORDER) {
            itemToConsume = inventory.find(item => item.name === tier && item.quantity > 0);
            if (itemToConsume) {
                itemTier = tier;
                break;
            }
        }
        
        if (!itemToConsume) return;

        const expGained = CULTIVATION_ITEMS_EXP_MAP[itemTier];

        const newInventory = inventory.map(item =>
            item.name === itemTier ? { ...item, quantity: item.quantity - 1 } : item
        ).filter(item => item.quantity > 0);
        
        const stateWithNewInventory = {...playerState, inventory: newInventory };
        const finalState = applyLevelUps(expGained, stateWithNewInventory);
        setPlayerState(finalState);
    }
    
    const getCultivationItemCount = (itemName: string) => inventory.find(i => i.name === itemName)?.quantity || 0;

    const nameStr = `Tên: ${name || 'N/A'}`.padEnd(25);
    const attributesHeader = `Attributes Cơ Bản (Tứ Giác Phình/Thu, Max=20)`;

    return (
        <div className="character-modal-backdrop" onClick={onClose}>
            <div className="character-modal" onClick={e => e.stopPropagation()}>
                <div className="character-modal-header">
                    <h2>Thông Tin Nhân Vật</h2>
                    <button className="character-modal-close-btn" onClick={onClose} aria-label="Đóng">X</button>
                </div>
                <div className="character-modal-content">
                    <pre className="character-sheet">
                        {'╔════════════════════════════════════════════════════════════════════════════╗\n'}
                        {`║ ${nameStr} ${attributesHeader.padStart(55)} ║\n`}
                        {`║ Đạo hiệu: ${daoHieu.padEnd(16)}                               /                 \\         ║\n`}
                        {`║                                       Thể Chất [${stats.attributes.theChat}]         ║\n`}
                        {`║ Tuổi: ${`${age} / ${lifespan}`.padEnd(15)}                 /                 \\        ║\n`}
                        {`║ Thiên Phú: ${talent.padEnd(17)}       Ngộ Tính [${stats.attributes.ngoTinh}]           Trí Tuệ [${stats.attributes.triTue}]      ║\n`}
                        {`║ Cảnh Giới: ${`${realm} ${stage} (Lv ${level})`.padEnd(20)} \\                 /         ║\n`}
                        {`║                                           May Mắn [${stats.attributes.mayMan}]        ║\n`}
                        {'╠════════════════════════════════════════════════════════════════════════════╣\n'}
                        {'║ '}HP (Sinh Lực): {`${stats.currentHp} / ${stats.maxHp}`.padEnd(15)} <button onClick={() => handlePointAdd('maxHp')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(36)}║{'\n'}
                        {'║ '}MP (Nội Lực): {`${stats.currentMana} / ${stats.maxMana}`.padEnd(15)} <button onClick={() => handlePointAdd('maxMana')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(36)}║{'\n'}
                        {'║ '}ATK (Sát Thương): {`${stats.atk}`.padEnd(12)} <button onClick={() => handlePointAdd('atk')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(41)}║{'\n'}
                        {'║ '}DEF (Phòng Thủ): {`${stats.def}`.padEnd(13)} <button onClick={() => handlePointAdd('def')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(40)}║{'\n'}
                        {'║ '}SPD (Tốc Độ): {`${stats.spd}`.padEnd(14)} <button onClick={() => handlePointAdd('spd')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(39)}║{'\n'}
                        {'║ '}CrR (Tỉ lệ chí mạng): {`${stats.critRate}%`.padEnd(9)} <button onClick={() => handlePointAdd('critRate')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(38)}║{'\n'}
                        {'║ '}CrD (Sát thương chí mạng): {`${stats.critDamage}%`.padEnd(5)} <button onClick={() => handlePointAdd('critDamage')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(36)}║{'\n'}
                        {'║ '}Dodge (Né tránh): {`${stats.dodge}%`.padEnd(11)} <button onClick={() => handlePointAdd('dodge')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(39)}║{'\n'}
                        {'║ '}Block (Chặn đòn): {`${stats.block}%`.padEnd(11)} <button onClick={() => handlePointAdd('block')} disabled={attributePoints <= 0}>[ ➕ ]</button> {''.padEnd(39)}║{'\n'}
                        {'║ '}Lực Chiến (Combat Power): {`${calculateCombatPower(stats)}`.padEnd(35)}║{'\n'}
                        {'║ '}Điểm Còn Thừa: {`${attributePoints}`.padEnd(12)} [ Cộng Điểm] {''.padEnd(39)}║{'\n'}
                        {'╠════════════════════════════════════════════════════════════════════════════╣\n'}
                        {'║                                  Tu Luyện                                  ║\n'}
                        {'║ ┌──────────┬──────────┬─────────┐                                          ║\n'}
                        {'║ │ Loại     │ Số Lượng │ EXP     │                                          ║\n'}
                        {'║ ├──────────┼──────────┼─────────┤                                          ║\n'}
                        {`║ │ Tinh Hồn │ ${`${getCultivationItemCount('Tinh Hồn')}`.padEnd(8)} │ 1 EXP   │                                          ║\n`}
                        {`║ │ LT Hạ    │ ${`${getCultivationItemCount('LT Hạ')}`.padEnd(8)} │ 10 EXP  │                                          ║\n`}
                        {`║ │ LT Trung │ ${`${getCultivationItemCount('LT Trung')}`.padEnd(8)} │ 20 EXP  │                                          ║\n`}
                        {`║ │ LT Thượng│ ${`${getCultivationItemCount('LT Thượng')}`.padEnd(8)} │ 40 EXP  │                                          ║\n`}
                        {'║ └──────────┴──────────┴─────────┘                                          ║\n'}
                        {'║                                                                            ║\n'}
                        {'║ '}          <button onClick={handleCultivate}>[ Bắt Đầu Tu Luyện ]</button> {''.padEnd(49)}║{'\n'}
                        {'║                                                                            ║\n'}
                        {'╠════════════════════════════════════════════════════════════════════════════╣\n'}
                        {`║ ⭐ EXP: ${renderExpBar(exp, expToNextLevel)} ${`${exp} / ${expToNextLevel}`.padEnd(20)}          ║\n`}
                        {'╠════════════════════════════════════════════════════════════════════════════╣\n'}
                        {'║ '}                               <button onClick={onClose}>[ QUAY LẠI ]</button>{' '.padEnd(32)}║{'\n'}
                        {'╚════════════════════════════════════════════════════════════════════════════╝\n'}
                    </pre>
                </div>
            </div>
        </div>
    );
};