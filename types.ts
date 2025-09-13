// FIX: Removed a self-referential import of PlayerState that was causing a conflict with its local declaration.
export interface InventoryItem {
  name: string;
  quantity: number;
}

export interface Relative {
  name: string;
  relationship: string; // e.g., 'Phụ Thân', 'Mẫu Thân', 'Thê Tử'
  status?: string; // e.g., 'Còn sống', 'Đã mất', 'Mang thai'
}

export interface PlayerState {
  name: string;
  personality: string;
  talent: string;
  gender: 'Nam' | 'Nữ' | '';
  treasures: string[];
  inventory: InventoryItem[];
  relatives: Relative[];
  difficulty: 'Dễ' | 'Thường' | 'Khó' | 'Ác Mộng' | 'Địa Ngục';
  nsfw: 'Có' | 'Không';
}

export interface ObjectState {
  id: number;
  name: string;
  relationship: string;
  personality: string;
  talent: string;
  gender: 'Nam' | 'Nữ' | '';
  description: string;
}

export interface Choice {
    text: string;
    successChance: number;
    successReward: string;
    failurePenalty: string;
}

export interface NpcDetails {
    name: string;
    age: number;
    personality: string;
    affection: string;
    status: string;
    psychology: string;
}

export interface StoryTurn {
    id: number;
    story: string;
    choices: Choice[];
    npcs?: NpcDetails[];
    isCollapsed: boolean;
    selectedChoiceText?: string;
    outcome?: string;
    customChoiceOutcome?: Choice;
    inventoryChanges?: {
        added?: InventoryItem[];
        removed?: InventoryItem[];
    };
    relativeChanges?: {
        added?: Relative[];
        removed?: { name: string }[];
        updated?: Relative[];
    };
}

export interface NpcTooltipState {
    visible: boolean;
    data: NpcDetails | null;
    position: { x: number; y: number };
}