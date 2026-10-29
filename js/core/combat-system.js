import { effectiveStat, getStat } from "./member-system.js";
import { equipmentBonus } from "./equipment-system.js";
import { combatBonus, scoutingBonus } from "./trait-system.js";

const TACTICS = {
  assault: { name: "공격", power: 1.2, defense: .8, scouting: .8, ammo: 1.25 },
  defense: { name: "방어", power: .9, defense: 1.3, scouting: .9, ammo: .85 },
  scout: { name: "정찰", power: .95, defense: 1, scouting: 1.35, ammo: .7 },
};

const PROFILES = {
  zombies: { label: "좀비", unit: "마리", ammoRate: .28, powerEach: .95, damage: [6, 13], pressure: .85, death: .65 },
  bandits: { label: "무소속 강도", unit: "명", ammoRate: .75, powerEach: 2.4, damage: [10, 20], pressure: 1.05, death: 1.15 },
  faction: { label: "적대 세력", unit: "명", ammoRate: 1.05, powerEach: 3.2, damage: [12, 24], pressure: 1.2, death: 1.3 },
};

export function rollContact({ situation = "zombies", day = 1, danger = 2, scale = "normal", faction = null }) {
  const profile = PROFILES[situation] ?? PROFILES.zombies;
  const hate = situation === "faction" ? Math.min(1, Math.max(0, -(faction?.relation ?? 0)) / 100) : 0;
  const quality = situation === "faction" ? (faction?.power ?? 18) / 20 : 1;
  const rage = 1 + hate * .55;
  let count;
  if (situation === "zombies") count = scaleCount(random(3 + danger, 7 + danger * 2) + Math.floor(day / 6), scale, 3, 24);
  else if (situation === "bandits") count = scaleCount(random(2, 3 + Math.max(1, danger)), scale, 2, 8);
  else count = scaleCount(Math.max(3, Math.round((faction?.power ?? 18) / 5)) + random(-1, 1) + Math.round(hate * 3), scale, 2, 12);
  return {
    kind: situation,
    label: situation === "faction" ? (faction?.name ?? profile.label) : profile.label,
    unit: profile.unit,
    count,
    power: Math.max(1, Math.round(count * profile.powerEach * quality * rage)),
    damage: profile.damage,
    pressure: profile.pressure,
    death: profile.death,
    ammoRate: profile.ammoRate,
    factionId: faction?.id ?? null,
  };
}

export function raidOutlook(faction) {
  if ((faction?.retaliationDays ?? 0) > 0) return "보복 중 · 습격이 잦음";
  const hate = Math.max(0, -(faction?.relation ?? 0));
  if (hate >= 60) return "습격이 매우 잦음";
  if (hate >= 30) return "습격이 잦음";
  if (hate >= 10) return "가끔 습격해 옴";
  return "습격하지 않음";
}

export function rollNightContact(day, factions = {}) {
  const danger = 1 + Math.floor(day / 6);
  const weighted = hostileWeights(factions);
  const pressure = weighted.reduce((sum, item) => sum + item.weight, 0);
  const revenge = weighted.some((item) => item.faction.retaliationDays > 0);
  const factionChance = Math.min(.58, .04 + pressure * .4 + (revenge ? .1 : 0));
  if (weighted.length && Math.random() < factionChance) {
    const raider = weightedPick(weighted);
    const hate = Math.max(0, -(raider.relation ?? 0)) / 100;
    return rollContact({
      situation: "faction",
      day,
      danger,
      scale: hate >= .55 || raider.retaliationDays > 0 ? "large" : "normal",
      faction: raider,
    });
  }
  if (Math.random() < .2) return rollContact({ situation: "bandits", day, danger: Math.max(2, danger) });
  return rollContact({ situation: "zombies", day, danger });
}

export function rollExpeditionContact({ danger, risky, day, factions }) {
  const weighted = hostileWeights(factions);
  const pressure = weighted.reduce((sum, item) => sum + item.weight, 0);
  const revenge = weighted.some((item) => item.faction.retaliationDays > 0);
  const factionChance = Math.min(.46, (risky ? .08 : .02) + pressure * (risky ? .3 : .16) + (revenge ? .08 : 0));
  if (weighted.length && Math.random() < factionChance) {
    const raider = weightedPick(weighted);
    const hate = Math.max(0, -(raider.relation ?? 0)) / 100;
    return rollContact({ situation: "faction", day, danger, scale: hate >= .55 ? "large" : "normal", faction: raider });
  }
  const roll = Math.random();
  if (!risky && roll < .3) return null;
  if (!risky) {
    return roll < .72
      ? rollContact({ situation: "zombies", day, danger, scale: "small" })
      : rollContact({ situation: "bandits", day, danger, scale: "small" });
  }
  if (roll < .55) return rollContact({ situation: "zombies", day, danger });
  return rollContact({ situation: "bandits", day, danger, scale: roll > .85 ? "large" : "normal" });
}

export function planAmmo(contact, members, tactic = "defense") {
  const guns = members.filter((member) => equipmentBonus(member).ammo > 0).length;
  if (!contact || !guns) return { expected: 0, guns };
  const doctrine = TACTICS[tactic] ?? TACTICS.defense;
  const extraGuns = 1 + Math.max(0, guns - 1) * .12;
  return {
    expected: Math.max(1, Math.round(contact.count * contact.ammoRate * doctrine.ammo * extraGuns)),
    guns,
  };
}

export function stockpileAmmo(contact) {
  if (!contact) return 3;
  return Math.max(2, Math.min(8, Math.round(contact.count * contact.ammoRate)));
}

export function damageRange(contact, { shortfall = 0, guns = 1 } = {}) {
  const [min, max] = contact?.damage ?? [7, 16];
  const crowd = 1 + Math.max(0, (contact?.count ?? 4) - 4) * (contact?.kind === "zombies" ? .025 : .04);
  const ammoPain = 1 + Math.max(0, shortfall) * (contact?.kind === "zombies" ? .45 : .7);
  const melee = guns > 0 ? 1 : (contact?.kind === "zombies" ? 1.12 : 1.28);
  const scale = crowd * ammoPain * melee;
  const low = Math.max(1, Math.round(min * scale));
  return [low, Math.max(low + 1, Math.round(max * scale))];
}

export function contactLine(contact) {
  if (!contact) return "교전 없음";
  return `${contact.label} ${contact.count}${contact.unit}`;
}

export function describeAmmo(expected, used) {
  if (!expected) return "화기가 없어 탄약 소모는 없었다";
  return `예상 탄약 ${expected}, 사용 ${used}${used < expected ? ". 탄약이 부족해 피해가 커졌다" : ""}`;
}

export function resolveFactionCombat({ members, faction, tactic = "defense", ammo = 0, contact = null, day = 1 }) {
  const doctrine = TACTICS[tactic] ?? TACTICS.defense;
  const encounter = contact ?? rollContact({ situation: "faction", faction, day });
  const plan = planAmmo(encounter, members, tactic);
  const ammoUsed = Math.min(Math.max(0, ammo), plan.expected);
  const shortfall = plan.expected > 0 ? 1 - ammoUsed / plan.expected : 0;
  let power = 0;
  let defense = 0;
  let scouting = 0;

  members.forEach((member) => {
    const gear = equipmentBonus(member);
    power += effectiveStat(member, "combat") + gear.combat + combatBonus(member, { teamSize: members.length, battle: true });
    defense += getStat(member, "mental") * .35 + gear.defense;
    scouting += effectiveStat(member, "scouting") + scoutingBonus(member, members.length);
  });

  if (plan.expected > 0 && ammoUsed < plan.expected) power *= .7 + .3 * (ammoUsed / plan.expected);
  else if (!plan.guns && encounter.kind !== "zombies") power *= .82;
  power *= doctrine.power;
  defense *= doctrine.defense;
  scouting *= doctrine.scouting;

  const playerScore = power + defense * .4 + scouting * .15 + random(-7, 7);
  const enemyScore = encounter.power + random(-7, 7);
  const margin = playerScore - enemyScore;
  const outcome = margin >= 10 ? "victory" : margin >= -3 ? "retreat" : "defeat";
  const crowd = 1 + Math.max(0, encounter.count - members.length * 2) * .05;
  const casualtyRisk = Math.min(.8, Math.max(.04, (outcome === "victory" ? .09 : outcome === "retreat" ? .2 : .36) - defense * .006 - scouting * .002) * encounter.pressure * crowd * (1 + shortfall * .35));
  const deathRisk = Math.max(0, (outcome === "defeat" ? .08 : outcome === "retreat" ? .025 : .008) - defense * .002) * encounter.death * (1 + shortfall * .25);
  const [damageMin, damageMax] = damageRange(encounter, { shortfall, guns: plan.guns });

  return {
    tactic: doctrine.name,
    outcome,
    playerScore: Math.round(playerScore),
    enemyScore: Math.round(enemyScore),
    ammoUsed,
    expectedAmmo: plan.expected,
    shortfall,
    encounter,
    damageMin,
    damageMax,
    casualtyRisk,
    deathRisk,
    loot: outcome === "victory" ? { food: random(2, 5), material: random(2, 5), ammo: random(1, 4), silver: random(3, 8) } : {},
  };
}

function hostileWeights(factions) {
  return Object.values(factions).map((faction) => {
    const hate = Math.max(0, -(faction.relation ?? 0)) / 100;
    const revenge = faction.retaliationDays > 0 ? .4 : 0;
    return { faction, weight: hate + revenge };
  }).filter((item) => item.weight > .05);
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.faction;
  }
  return items[items.length - 1].faction;
}

function scaleCount(base, scale, min, max) {
  const mod = scale === "small" ? .7 : scale === "large" ? 1.35 : 1;
  return Math.max(min, Math.min(max, Math.round(base * mod)));
}

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
