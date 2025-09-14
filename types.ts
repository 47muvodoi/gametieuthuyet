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
  daoHieu: string;
  age: number;
  lifespan: number;
  attributePoints: number;

  // Cultivation stats
  level: number;
  exp: number;
  expToNextLevel: number;
  realm: string;
  stage: string;
  stats: {
    maxHp: number;
    currentHp: number;
    maxMana: number;
    currentMana: number;
    atk: number;
    def: number;
    spd: number;
    critRate: number;
    critDamage: number;
    dodge: number;
    block: number;
    attributes: {
        theChat: number; // Constitution
        ngoTinh: number; // Comprehension
        triTue: number; // Intelligence
        mayMan: number; // Luck
    };
  };
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
    // Stat changes from AI
    expGained?: number;
    damageTaken?: number;
    hpRestored?: number;
    manaUsed?: number;
    manaRestored?: number;
}

export interface NpcTooltipState {
    visible: boolean;
    data: NpcDetails | null;
    position: { x: number; y: number };
}