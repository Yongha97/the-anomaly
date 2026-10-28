export const FACTION_DEFINITIONS = {
  iron: {
    id: "iron", name: "철문단", description: "무장과 규율을 중시하는 생존 집단", relation: 0, power: 28,
    stock: { food: 8, material: 12, medicine: 2, ammo: 16, pistol: 2, vest: 1 },
    wants: "food",
    mercenary: { name: "철문 경비병", days: 4, foodCost: 8, combat: 7, scouting: 4 },
  },
  church: {
    id: "church", name: "성당 피난소", description: "치료와 보호를 우선하는 공동체", relation: 15, power: 20,
    stock: { food: 12, material: 5, medicine: 12, ammo: 3, leather: 2 },
    wants: "material",
    mercenary: { name: "성당 구조대원", days: 5, foodCost: 7, combat: 4, scouting: 5 },
  },
  market: {
    id: "market", name: "시장 조합", description: "물물교환과 제작을 중심으로 생존하는 상인 연합", relation: 5, power: 18,
    stock: { food: 15, material: 15, medicine: 6, ammo: 8, pipe: 3, pistol: 1, leather: 3 },
    wants: "ammo",
    mercenary: { name: "조합 호위꾼", days: 3, foodCost: 6, combat: 5, scouting: 7 },
  },
  dogs: {
    id: "dogs", name: "들개패", description: "약한 거점을 노리는 공격적인 약탈자 무리", relation: -35, power: 25,
    stock: { food: 10, material: 9, medicine: 2, ammo: 12, pipe: 2, rifle: 1 },
    wants: "medicine",
    mercenary: { name: "들개 싸움꾼", days: 3, foodCost: 9, combat: 8, scouting: 3 },
  },
};
