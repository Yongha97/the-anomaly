import { ITEMS, STARTING_INVENTORY } from "../data/items.js";

export function createInventory() {
  return { ...STARTING_INVENTORY };
}

export function ensureEquipment(member) {
  member.equipment ??= { weapon: null, armor: null };
}

export function equipItem(member, itemId, inventory) {
  ensureEquipment(member);
  if (itemId === "none") return unequipSlot(member, null, inventory);
  const item = ITEMS[itemId];
  if (!item || (inventory[itemId] ?? 0) < 1) return { ok: false, message: "보유하지 않은 장비입니다." };
  const previous = member.equipment[item.slot];
  if (previous) inventory[previous] = (inventory[previous] ?? 0) + 1;
  inventory[itemId] -= 1;
  member.equipment[item.slot] = itemId;
  return { ok: true, message: `${member.name}에게 ${item.name}을(를) 장착했습니다.` };
}

export function unequipSlot(member, slot, inventory) {
  ensureEquipment(member);
  const slots = slot ? [slot] : ["weapon", "armor"];
  slots.forEach((key) => {
    const itemId = member.equipment[key];
    if (itemId) inventory[itemId] = (inventory[itemId] ?? 0) + 1;
    member.equipment[key] = null;
  });
  return { ok: true, message: `${member.name}의 장비를 해제했습니다.` };
}

export function equipmentBonus(member) {
  ensureEquipment(member);
  const weapon = ITEMS[member.equipment.weapon];
  const armor = ITEMS[member.equipment.armor];
  return {
    combat: (weapon?.combat ?? 0) + (armor?.combat ?? 0),
    defense: (weapon?.defense ?? 0) + (armor?.defense ?? 0),
    ammo: weapon?.ammo ?? 0,
  };
}

export function itemName(itemId) {
  return ITEMS[itemId]?.name ?? "없음";
}

export function distributeGear(members, inventory) {
  const pool = { ...inventory };
  members.forEach((member) => {
    ensureEquipment(member);
    ["weapon", "armor"].forEach((slot) => {
      const itemId = member.equipment[slot];
      if (itemId) pool[itemId] = (pool[itemId] ?? 0) + 1;
      member.equipment[slot] = null;
    });
  });
  Object.keys(inventory).forEach((key) => { inventory[key] = 0; });
  Object.assign(inventory, pool);

  const weapons = Object.values(ITEMS).filter((item) => item.slot === "weapon").sort((a, b) => b.combat - a.combat || b.ammo - a.ammo);
  const armors = Object.values(ITEMS).filter((item) => item.slot === "armor").sort((a, b) => b.defense - a.defense);
  let equipped = 0;
  members.forEach((member) => {
    const weapon = weapons.find((item) => (inventory[item.id] ?? 0) > 0);
    if (weapon && equipItem(member, weapon.id, inventory).ok) equipped += 1;
    const armor = armors.find((item) => (inventory[item.id] ?? 0) > 0);
    if (armor && equipItem(member, armor.id, inventory).ok) equipped += 1;
  });
  return equipped;
}
