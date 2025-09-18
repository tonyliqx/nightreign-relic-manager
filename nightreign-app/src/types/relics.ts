export type Effect = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export type Relic = {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  effects: Effect["id"][];
};

export const sampleEffects: Effect[] = [
  {
    id: "atk_up",
    name: "Attack Up",
    description: "Increases attack power by 10%",
    tags: ["offense"],
  },
  {
    id: "def_up",
    name: "Defense Up",
    description: "Reduces damage taken by 8%",
    tags: ["defense"],
  },
];

export const sampleRelics: Relic[] = [
  {
    id: "warrior_charm",
    name: "Warrior's Charm",
    rarity: "rare",
    effects: ["atk_up"],
  },
  {
    id: "guardian_crest",
    name: "Guardian Crest",
    rarity: "epic",
    effects: ["def_up"],
  },
];


