import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { PlayerSidebar } from './PlayerSidebar';
import { InventoryModal } from './InventoryModal';
import { RelativesModal } from './RelativesModal';
import { CharacterModal } from './CharacterModal';
import { NpcLogModal } from './NpcLogModal';
import { NpcTooltip } from './NpcTooltip';
import { StoryHistory } from './StoryHistory';
import { ChoicesPanel } from './ChoicesPanel';
import { SAVE_GAME_KEY } from '../constants';
import { coreRules, inventoryRule, familyRule, formattingRules, pregnancyRule, nsfwRules, memoryAndConsistencyRule } from './prompts';
import type { PlayerState, ObjectState, StoryTurn, NpcTooltipState, NpcDetails } from '../types';

const API_KEY_SESSION_STORAGE_KEY = 'gemini-api-key';

interface MobileMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenCharacter: () => void;
    onOpenInventory: () => void;
    onOpenRelatives: () => void;
    onOpenNpcLog: () => void;
}

const MobileMenuModal = ({ isOpen, onClose, onOpenCharacter, onOpenInventory, onOpenRelatives, onOpenNpcLog }: MobileMenuModalProps) => {
    if (!isOpen) return null;

    const handleOpen = (openFunc: () => void) => {
        onClose();
        // A small delay to allow the menu modal to close before the next one opens, preventing visual glitches.
        setTimeout(openFunc, 200);
    };

    return (
        <div className="mobile-menu-modal-backdrop" onClick={onClose}>
            <div className="mobile-menu-modal" onClick={e => e.stopPropagation()}>
                <div className="mobile-menu-modal-header">
                    <h3>Menu</h3>
                    <button className="mobile-menu-modal-close-btn" onClick={onClose} aria-label="Đóng menu">X</button>
                </div>
                <div className="mobile-menu-modal-content">
                    <button className="mobile-menu-action-btn" onClick={() => handleOpen(onOpenCharacter)}>Nhân Vật</button>
                    <button className="mobile-menu-action-btn" onClick={() => handleOpen(onOpenInventory)}>Túi Đồ</button>
                    <button className="mobile-menu-action-btn" onClick={() => handleOpen(onOpenRelatives)}>Người Thân</button>
                    <button className="mobile-menu-action-btn" onClick={() => handleOpen(onOpenNpcLog)}>Nhật Ký NPC</button>
                </div>
            </div>
        </div>
    );
};

interface ChoicesModalProps {
    isOpen: boolean;
    onClose: () => void;
    lastTurn: StoryTurn;
    customChoice: string;
    onCustomChoiceChange: (value: string) => void;
    onCustomChoiceSubmit: (e: React.FormEvent) => void;
    onChoiceClick: (turnId: number, choiceText: string) => void;
}

const ChoicesModal = ({ isOpen, onClose, lastTurn, customChoice, onCustomChoiceChange, onCustomChoiceSubmit, onChoiceClick }: ChoicesModalProps) => {
    if (!isOpen) return null;

    // These wrappers ensure the modal closes after a choice is submitted.
    const handleFormSubmit = (e: React.FormEvent) => {
        onCustomChoiceSubmit(e);
        onClose();
    };

    const handleChoiceButtonClick = (turnId: number, choiceText: string) => {
        onChoiceClick(turnId, choiceText);
        onClose();
    };

    return (
        <div className="choices-modal-backdrop" onClick={onClose}>
            <div className="choices-modal" onClick={e => e.stopPropagation()}>
                <div className="choices-modal-header">
                    <h3>Đưa ra lựa chọn của bạn</h3>
                </div>
                <div className="choices-modal-content">
                    <ChoicesPanel
                        lastTurn={lastTurn}
                        customChoice={customChoice}
                        onCustomChoiceChange={onCustomChoiceChange}
                        onCustomChoiceSubmit={handleFormSubmit}
                        onChoiceClick={handleChoiceButtonClick}
                    />
                </div>
            </div>
        </div>
    );
};


interface AdventureScreenProps {
    initialPlayerState: PlayerState;
    objects: ObjectState[];
    initialHistory: StoryTurn[] | null;
}

export const AdventureScreen = ({ initialPlayerState, objects, initialHistory }: AdventureScreenProps) => {
    const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState);
    const [history, setHistory] = useState<StoryTurn[]>(initialHistory || []);
    const [chat, setChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(!initialHistory);
    const [error, setError] = useState<string | null>(null);
    const [customChoice, setCustomChoice] = useState('');
    const [npcTooltip, setNpcTooltip] = useState<NpcTooltipState>({ visible: false, data: null, position: { x: 0, y: 0 } });
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [isRelativesModalOpen, setIsRelativesModalOpen] = useState(false);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [isNpcLogModalOpen, setIsNpcLogModalOpen] = useState(false);
    const [encounteredNpcs, setEncounteredNpcs] = useState<NpcDetails[]>([]);
    const [isNpcTooltipPinned, setIsNpcTooltipPinned] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);

    // Refs for scrolling logic
    const endOfHistoryRef = useRef<HTMLDivElement>(null);
    const turnRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

    useEffect(() => {
        const lastTurn = history.length > 0 ? history[history.length - 1] : null;

        // After a choice is made and we are waiting for the AI, scroll to the outcome of that choice.
        if (loading && lastTurn?.selectedChoiceText) {
            const completedTurnNode = turnRefs.current.get(lastTurn.id);
            completedTurnNode?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            // Otherwise (e.g., a new turn has loaded), scroll to the very bottom to show the new choices.
            endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, loading]);
    
    // Global click handler to unpin tooltips
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Close NPC tooltip
            if (isNpcTooltipPinned) {
                const tooltipEl = document.querySelector('.tooltip');
                if (tooltipEl && !tooltipEl.contains(target) && !target.closest('.npc-name')) {
                    setIsNpcTooltipPinned(false);
                    setNpcTooltip(prev => ({ ...prev, visible: false }));
                }
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [isNpcTooltipPinned]);


    // Initialize chat
    useEffect(() => {
        const initializeChat = async () => {
             const apiKey = sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY);
            if (!apiKey) {
                setError("API Key không hợp lệ hoặc không được tìm thấy. Vui lòng làm mới trang và nhập lại API key.");
                setLoading(false);
                return;
            }
            
             const systemInstruction = playerState.nsfw === 'Có' 
                ? `
${memoryAndConsistencyRule}
${coreRules}
${inventoryRule}
${familyRule}
Bạn là AI mô phỏng game nhập vai tu tiên có chứa nội dung 18+. Nhiệm vụ của bạn là viết một câu chuyện tu tiên/tiên hiệp hấp dẫn, kịch tính, đồng thời tuân thủ nghiêm ngặt các quy tắc về nội dung 18+ dưới đây.
${formattingRules.replace('Nhân vật chính', `'${playerState.name || 'Người Vô Danh'}'`)}
${pregnancyRule}
${nsfwRules}
`
                : `
${memoryAndConsistencyRule}
${coreRules}
${inventoryRule}
${familyRule}
Bạn là AI mô phỏng game nhập vai tu tiên. Nhiệm vụ của bạn là viết tiếp câu chuyện theo phong cách "Show, don’t tell", tập trung vào phiêu lưu, kịch tính và tương tác nhân vật. Sử dụng ngôn ngữ sống động, giàu hình ảnh.
${formattingRules.replace('Nhân vật chính', `'${playerState.name || 'Người Vô Danh'}'`)}
`;
            
            const responseSchema = {
                type: Type.OBJECT, properties: {
                    story: { type: Type.STRING, description: "Phần tiếp theo của câu chuyện tu tiên, bằng tiếng Việt. Tối thiểu 200 từ. Gắn thẻ tên NPC bằng [LORE_NPC:Tên] và sử dụng các thẻ định dạng: [THOUGHT], [ACTION], [DIALOGUE]." },
                    npcs: { 
                        type: Type.ARRAY, 
                        description: "Danh sách tất cả các NPC được đề cập trong câu chuyện.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                age: { type: Type.INTEGER },
                                personality: { type: Type.STRING },
                                affection: { type: Type.STRING, description: "Mức độ yêu thích của NPC đối với người chơi, ví dụ: Thân thiện, Trung lập, Thù địch." },
                                status: { type: Type.STRING, description: "Tình trạng thể chất, ví dụ: Khỏe mạnh, Bị thương." },
                                psychology: { type: Type.STRING, description: "Trạng thái tinh thần, ví dụ: Bình tĩnh, Kích động." }
                            }
                        }
                    },
                    choices: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, successChance: { type: Type.INTEGER }, successReward: { type: Type.STRING }, failurePenalty: { type: Type.STRING } } } },
                    customChoiceEvaluation: {
                        type: Type.OBJECT,
                        description: "CHỈ dành cho lựa chọn tùy chỉnh của người chơi. Đánh giá tỷ lệ thành công và kết quả.",
                        properties: {
                            text: { type: Type.STRING },
                            successChance: { type: Type.INTEGER },
                            successReward: { type: Type.STRING },
                            failurePenalty: { type: Type.STRING }
                        }
                    },
                    inventoryChanges: {
                        type: Type.OBJECT,
                        description: "Mô tả các thay đổi trong túi đồ của người chơi. Chỉ bao gồm nếu có sự thay đổi.",
                        properties: {
                            added: {
                                type: Type.ARRAY,
                                description: "Danh sách các vật phẩm được thêm vào túi đồ, mỗi vật phẩm là một đối tượng có tên và số lượng.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: "Tên của vật phẩm." },
                                        quantity: { type: Type.INTEGER, description: "Số lượng của vật phẩm." }
                                    }
                                }
                            },
                            removed: {
                                type: Type.ARRAY,
                                description: "Danh sách các vật phẩm bị xóa khỏi túi đồ, mỗi vật phẩm là một đối tượng có tên và số lượng.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: "Tên của vật phẩm." },
                                        quantity: { type: Type.INTEGER, description: "Số lượng của vật phẩm." }
                                    }
                                }
                            }
                        }
                    },
                    relativeChanges: {
                        type: Type.OBJECT,
                        description: "Mô tả các thay đổi trong danh sách người thân của người chơi. Chỉ bao gồm nếu có thay đổi.",
                        properties: {
                            added: {
                                type: Type.ARRAY,
                                description: "Danh sách người thân được thêm vào.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        relationship: { type: Type.STRING, description: "Mối quan hệ, ví dụ: Phụ Thân, Mẫu Thân, Thê Tử, Đệ Đệ." },
                                        status: { type: Type.STRING, description: "Tình trạng, ví dụ: Còn sống, Đã mất." }
                                    }
                                }
                            },
                            removed: {
                                type: Type.ARRAY,
                                description: "Danh sách người thân bị xóa (ví dụ: qua đời).",
                                items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } }
                            },
                            updated: {
                                type: Type.ARRAY,
                                description: "Danh sách người thân có trạng thái được cập nhật (ví dụ: mang thai).",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        relationship: { type: Type.STRING },
                                        status: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            try {
                 const ai = new GoogleGenAI({ apiKey: apiKey });
                 const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema
                    },
                });
                setChat(chatSession);
            } catch(e) {
                console.error(e);
                setError("Không thể khởi tạo phiên trò chuyện AI. API Key có thể không hợp lệ.");
            }
        }
        initializeChat();
    }, []); // Runs once on mount
    
    // Derive encountered NPCs from history
    useEffect(() => {
        const allNpcs = new Map<string, NpcDetails>();
        history.forEach(turn => {
            if (turn.npcs) {
                turn.npcs.forEach(npc => {
                    allNpcs.set(npc.name, npc); // Always keep the latest version
                });
            }
        });
        setEncounteredNpcs(Array.from(allNpcs.values()));
    }, [history]);

    // Start a new adventure if there's no initial history
    useEffect(() => {
        const startAdventure = async () => {
            if (chat && !initialHistory) {
                setLoading(true);
                setError(null);
                try {
                     const getDifficultyContext = () => {
                        switch (playerState.difficulty) {
                            case 'Dễ': return 'Bạn bắt đầu cuộc hành trình với 100 tinh hồn trong túi và một tương lai tươi sáng, không kẻ thù nào săn đuổi.';
                            case 'Thường': return 'Bạn bắt đầu trong một ngôi nhà bình dân, với 100 tinh hồn làm vốn liếng.';
                            case 'Khó': return 'Bạn sinh ra trong một gia đình nghèo nàn, trong túi chỉ có vỏn vẹn 10 tinh hồn.';
                            case 'Ác Mộng': return 'Bạn sinh ra trong một gia đình nghèo đói. Vừa có được 3 tinh hồn thì một đám bảo kê đã tìm đến cửa đòi nợ.';
                            case 'Địa Ngục': return 'Bạn là một kẻ ăn mày không hơn không kém, bị đám côn đồ truy đuổi. Cơ thể bạn đang mang hiệu ứng xấu "Thể Xác Kiệt Sức", cần phải bồi bổ ngay lập tức.';
                            default: return '';
                        }
                    };
                    const objectsInfo = objects.length > 0
                        ? `Thông tin các Vật Thể Được Tạo (NPCs quan trọng khác): \n${objects.map(obj => `- Tên: ${obj.name || 'Chưa đặt tên'}, Mối quan hệ: ${obj.relationship || 'Không rõ'}, Giới tính: ${obj.gender || 'Không xác định'}, Tính cách: ${obj.personality}, Thiên phú: ${obj.talent}, Mô tả: ${obj.description}`).join('\n')}`
                        : 'Không có vật thể nào khác được tạo.';

                    const initialPrompt = `
                    Bối cảnh khởi đầu: ${getDifficultyContext()}
                    Thông tin nhân vật chính:
                    - Tên: ${playerState.name || 'Người Vô Danh'}
                    - Giới tính: ${playerState.gender || 'Không xác định'}
                    - Tính cách: ${playerState.personality}
                    - Thiên phú: ${playerState.talent}
                    - Bảo bối: ${playerState.treasures.join(', ') || 'Không có'}

                    ${objectsInfo}

                    Dựa vào TOÀN BỘ thông tin trên, hãy tạo ra một đoạn truyện mở đầu hấp dẫn bằng tiếng Việt (tối thiểu 200 từ). Bất kỳ nhân vật nào được giới thiệu (NPC) phải được cung cấp thông tin chi tiết và tên của họ phải được gắn thẻ trong văn bản truyện, ví dụ: "Bạn gặp [LORE_NPC:Lý Tiểu Long]". Hãy nhớ sử dụng các thẻ định dạng [THOUGHT], [ACTION], và [DIALOGUE] để làm câu chuyện sinh động. Cuối cùng, hãy tạo 4 lựa chọn tiếp theo cho người chơi.
                    `;
                    
                    const response = await chat.sendMessage({ message: initialPrompt });
                    const jsonText = response.text.trim();
                    const parsedData = JSON.parse(jsonText);
                    setHistory([{ id: 1, ...parsedData, isCollapsed: false }]);

                } catch (e) {
                    console.error(e);
                    setError('Không thể tạo cốt truyện. Vui lòng thử lại.');
                } finally {
                    setLoading(false);
                }
            }
        };

        startAdventure();
    }, [chat, initialHistory, playerState, objects]);

    const handleChoice = async (turnId: number, choiceText: string, isCustom: boolean = false) => {
        if (!chat) return;

        setLoading(true);
        setError(null);

        // Update the current turn to show the selected choice and collapse previous turns
        setHistory(prev => prev.map(turn => ({
            ...turn,
            selectedChoiceText: turn.id === turnId ? choiceText : turn.selectedChoiceText,
            isCollapsed: turn.id < turnId, // Collapse all turns before the current one
        })));

        try {
            const prompt = isCustom
                ? `ƯU TIÊN HÀNG ĐẦU: Hành động TÙY CHỈNH của người chơi là "${choiceText}". Đầu tiên, hãy đánh giá hành động này và điền vào đối tượng 'customChoiceEvaluation'. Sau đó, TOÀN BỘ câu chuyện tiếp theo phải xoay quanh kết quả trực tiếp của hành động này. Mô tả chi tiết điều gì đã xảy ra. Hãy nhớ sử dụng các thẻ định dạng để viết tiếp câu chuyện. Cuối cùng, viết tiếp bối cảnh mới và đưa ra 4 lựa chọn.`
                : `ƯU TIÊN HÀNG ĐẦU: Hành động của người chơi là "${choiceText}". TOÀN BỘ câu chuyện tiếp theo phải xoay quanh kết quả trực tiếp của hành động này. Hãy mô tả chi tiết và một cách hợp lý điều gì đã xảy ra ngay sau đó. Hãy nhớ sử dụng các thẻ định dạng để viết tiếp câu chuyện. Sau khi mô tả xong kết quả, hãy viết tiếp bối cảnh mới và đưa ra 4 lựa chọn phù hợp.`;
            
            const response = await chat.sendMessage({ message: prompt });
            const jsonText = response.text.trim();
            let parsedData;
            try {
                parsedData = JSON.parse(jsonText);
            } catch (parseError) {
                console.error("Lỗi phân tích JSON:", parseError);
                console.error("Chuỗi JSON không hợp lệ từ AI:", jsonText);
                throw new Error("Không thể phân tích phản hồi từ AI.");
            }


            if (isCustom && parsedData.customChoiceEvaluation) {
                setHistory(prev => prev.map(turn => turn.id === turnId ? { ...turn, customChoiceOutcome: parsedData.customChoiceEvaluation } : turn));
            }
            
            setPlayerState(prevPlayerState => {
                let updatedInventory = [...prevPlayerState.inventory];
                let updatedRelatives = [...prevPlayerState.relatives];

                // Handle inventory changes
                if (parsedData.inventoryChanges) {
                    const inventoryMap = new Map(updatedInventory.map(item => [item.name, { ...item }]));

                    if (parsedData.inventoryChanges.added) {
                        for (const itemToAdd of parsedData.inventoryChanges.added) {
                            if (inventoryMap.has(itemToAdd.name)) {
                                inventoryMap.get(itemToAdd.name)!.quantity += itemToAdd.quantity;
                            } else {
                                inventoryMap.set(itemToAdd.name, { ...itemToAdd });
                            }
                        }
                    }
            
                    if (parsedData.inventoryChanges.removed) {
                        for (const itemToRemove of parsedData.inventoryChanges.removed) {
                            if (inventoryMap.has(itemToRemove.name)) {
                                const existingItem = inventoryMap.get(itemToRemove.name)!;
                                const quantityToRemove = Math.min(itemToRemove.quantity, existingItem.quantity);
                                existingItem.quantity -= quantityToRemove;

                                if (existingItem.quantity <= 0) {
                                    inventoryMap.delete(itemToRemove.name);
                                }
                            } else {
                                console.warn(`AI đã cố gắng xóa vật phẩm không tồn tại: ${itemToRemove.name}`);
                            }
                        }
                    }
                    updatedInventory = Array.from(inventoryMap.values());
                }

                // Handle relative changes
                if (parsedData.relativeChanges) {
                    // Process removals first
                    if (parsedData.relativeChanges.removed) {
                        const namesToRemove = new Set(parsedData.relativeChanges.removed.map(r => r.name));
                        updatedRelatives = updatedRelatives.filter(rel => !namesToRemove.has(rel.name));
                    }

                    // Process updates
                    if (parsedData.relativeChanges.updated) {
                        parsedData.relativeChanges.updated.forEach(update => {
                            const index = updatedRelatives.findIndex(rel => rel.name === update.name);
                            if (index !== -1) {
                                updatedRelatives[index] = { ...updatedRelatives[index], ...update };
                            }
                        });
                    }
                    
                    // Process additions
                    if (parsedData.relativeChanges.added) {
                        const existingNames = new Set(updatedRelatives.map(r => r.name));
                        parsedData.relativeChanges.added.forEach(add => {
                            if (!existingNames.has(add.name)) {
                                updatedRelatives.push(add);
                            }
                        });
                    }
                }
        
                return { ...prevPlayerState, inventory: updatedInventory, relatives: updatedRelatives };
            });

            // Add the new turn to the history
            setHistory(prev => [...prev, {
                id: prev.length + 1,
                ...parsedData,
                isCollapsed: false,
            }]);

        } catch (e) {
            console.error(e);
            setError('Đã có lỗi xảy ra khi tiếp tục câu chuyện.');
        } finally {
            setLoading(false);
            setCustomChoice('');
        }
    };
    
    const handleCustomChoiceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customChoice.trim() && history.length > 0) {
            const currentTurnId = history[history.length - 1].id;
            handleChoice(currentTurnId, customChoice.trim(), true);
        }
    };
    
    const toggleCollapse = (turnId: number) => {
        setHistory(prev => prev.map(turn => 
            turn.id === turnId ? { ...turn, isCollapsed: !turn.isCollapsed } : turn
        ));
    };

    const handleNpcClick = (e: React.MouseEvent, npcData: NpcDetails) => {
        e.stopPropagation();
        if (isNpcTooltipPinned && npcTooltip.data?.name === npcData.name) {
            setIsNpcTooltipPinned(false);
            setNpcTooltip(prev => ({ ...prev, visible: false }));
        } else {
            setIsNpcTooltipPinned(true);
            setNpcTooltip({
                visible: true,
                data: npcData,
                position: { x: e.clientX, y: e.clientY }
            });
        }
    };

    const handleNpcMouseEnter = (e: React.MouseEvent, npcData: NpcDetails) => {
        if (!isNpcTooltipPinned) {
            setNpcTooltip({
                visible: true,
                data: npcData,
                position: { x: e.clientX, y: e.clientY }
            });
        }
    };

    const handleNpcMouseLeave = () => {
        if (!isNpcTooltipPinned) {
            setNpcTooltip(prev => ({ ...prev, visible: false }));
        }
    };
    
    const handleSaveGame = () => {
        try {
            const gameState = {
                playerState,
                objects,
                history,
            };
            localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
            setSaveMessage('Trò chơi đã được lưu!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error("Lỗi nghiêm trọng khi lưu trò chơi:", error);
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                setSaveMessage('Lỗi: Bộ nhớ lưu trữ đã đầy.');
            } else {
                setSaveMessage('Lỗi: Không thể lưu trò chơi.');
            }
             setTimeout(() => setSaveMessage(''), 4000);
        }
    };

    const lastTurn = history.length > 0 ? history[history.length - 1] : null;

    if (loading && history.length === 0) {
        return <div className="loading-spinner"></div>;
    }

    if (error && history.length === 0) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <main className="adventure-layout">
            <PlayerSidebar 
                playerState={playerState}
                onOpenCharacter={() => setIsCharacterModalOpen(true)}
                onOpenInventory={() => setIsInventoryModalOpen(true)}
                onOpenRelatives={() => setIsRelativesModalOpen(true)}
                onOpenNpcLog={() => setIsNpcLogModalOpen(true)}
            />
             {lastTurn && <ChoicesModal 
                isOpen={isChoiceModalOpen}
                onClose={() => setIsChoiceModalOpen(false)}
                lastTurn={lastTurn}
                customChoice={customChoice}
                onCustomChoiceChange={setCustomChoice}
                onCustomChoiceSubmit={handleCustomChoiceSubmit}
                onChoiceClick={handleChoice}
            />}
            <div className="adventure-screen">
                {npcTooltip.visible && npcTooltip.data && <NpcTooltip data={npcTooltip.data} position={npcTooltip.position} />}
                <CharacterModal isOpen={isCharacterModalOpen} onClose={() => setIsCharacterModalOpen(false)} playerState={playerState} />
                <InventoryModal isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)} inventory={playerState.inventory} />
                <RelativesModal isOpen={isRelativesModalOpen} onClose={() => setIsRelativesModalOpen(false)} relatives={playerState.relatives} />
                <NpcLogModal isOpen={isNpcLogModalOpen} onClose={() => setIsNpcLogModalOpen(false)} npcs={encounteredNpcs} />
                <MobileMenuModal 
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    onOpenCharacter={() => setIsCharacterModalOpen(true)}
                    onOpenInventory={() => setIsInventoryModalOpen(true)}
                    onOpenRelatives={() => setIsRelativesModalOpen(true)}
                    onOpenNpcLog={() => setIsNpcLogModalOpen(true)}
                />

                <div className="adventure-header">
                     <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} aria-label="Mở menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <h2>CUỘC PHIÊU LƯU</h2>
                    <div className="adventure-controls">
                        {saveMessage && <span className="save-message">{saveMessage}</span>}
                        <button className="btn btn-secondary" onClick={handleSaveGame}>Lưu Trò Chơi</button>
                    </div>
                </div>
                <div className="story-history-container">
                    <StoryHistory
                        history={history}
                        playerState={playerState}
                        turnRefs={turnRefs}
                        onNpcClick={handleNpcClick}
                        onNpcMouseEnter={handleNpcMouseEnter}
                        onNpcMouseLeave={handleNpcMouseLeave}
                        onToggleCollapse={toggleCollapse}
                    />
                    {loading && <div className="loading-spinner small"></div>}
                    {error && <div className="error-message">{error}</div>}
                    <div ref={endOfHistoryRef} />
                </div>

                {!loading && lastTurn && !lastTurn.selectedChoiceText ? (
                     <>
                        {/* Desktop: Inline Panel */}
                        <div className="choices-container desktop-choices-container">
                             <ChoicesPanel
                                lastTurn={lastTurn}
                                customChoice={customChoice}
                                onCustomChoiceChange={setCustomChoice}
                                onCustomChoiceSubmit={handleCustomChoiceSubmit}
                                onChoiceClick={handleChoice}
                            />
                        </div>

                        {/* Mobile: Trigger Button */}
                        <div className="mobile-choice-trigger-container">
                             <button 
                                className="btn btn-primary mobile-choice-trigger-btn"
                                onClick={() => setIsChoiceModalOpen(true)}
                            >
                                Đưa ra lựa chọn
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </main>
    );
};
