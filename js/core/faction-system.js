import { FACTION_DEFINITIONS } from "../data/factions.js";
import { ITEMS } from "../data/items.js";

const RESOURCE_VALUES = { food: 1, material: 1, medicine: 3, ammo: 2 };

export function createFactions() {
  return Object.fromEntries(Object.values(FACTION_DEFINITIONS).map((definition) => [
    definition.id,
    {
      ...definition,
      stock: { ...definition.stock },
      retaliationDays: 0,
      lastBattleDay: 0,
    },
  ]));
}

export function factionRelationLabel(value) {
  if (value <= -30) return "적대";
  if (value <= -10) return "경계";
  if (value < 20) return "중립";
  if (value < 60) return "우호";
  return "동맹";
}

export function canTrade(faction) {
  return faction.relation > -30;
}

export function canHire(faction) {
  return faction.relation >= -9;
}

export function tradePrice(faction, itemId, direction = "buy") {
  const base = ITEMS[itemId]?.value ?? RESOURCE_VALUES[itemId] ?? 1;
  const relationModifier = faction.relation >= 60 ? .7 : faction.relation >= 20 ? .85 : faction.relation <= -10 ? 1.3 : 1;
  return Math.max(1, Math.ceil(base * relationModifier * (direction === "sell" ? .55 : 1)));
}

export function tradeItem({ faction, inventory, resources, itemId, direction }) {
  if (!canTrade(faction)) return { ok: false, message: "적대 세력과는 거래할 수 없습니다." };
  const isResource = itemId in RESOURCE_VALUES;
  const playerStore = isResource ? resources : inventory;
  const price = tradePrice(faction, itemId, direction);

  if (direction === "buy") {
    if ((faction.stock[itemId] ?? 0) < 1) return { ok: false, message: "세력 재고가 없습니다." };
    if (resources.silver < price) return { ok: false, message: `은이 ${price - resources.silver} 부족합니다.` };
    resources.silver -= price;
    playerStore[itemId] = (playerStore[itemId] ?? 0) + 1;
    faction.stock[itemId] -= 1;
    return { ok: true, message: `${displayName(itemId)} 1개를 은 ${price}에 구매했습니다.` };
  }

  if ((playerStore[itemId] ?? 0) < 1) return { ok: false, message: "판매할 물품이 없습니다." };
  playerStore[itemId] -= 1;
  resources.silver += price;
  faction.stock[itemId] = (faction.stock[itemId] ?? 0) + 1;
  return { ok: true, message: `${displayName(itemId)} 1개를 판매해 은 ${price}을 얻었습니다.` };
}

export function tickFactions(factions) {
  Object.values(factions).forEach((faction) => {
    faction.retaliationDays = Math.max(0, faction.retaliationDays - 1);
  });
}

function displayName(itemId) {
  return ITEMS[itemId]?.name ?? { food: "식량", material: "자재", medicine: "의약품", ammo: "탄약" }[itemId] ?? itemId;
}
