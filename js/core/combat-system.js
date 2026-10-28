import { effectiveStat, getStat } from "./member-system.js";
import { equipmentBonus } from "./equipment-system.js";

const TACTICS = {
  assault: { name: "공격", power: 1.2, defense: .8, scouting: .8 },
  defense: { name: "방어", power: .9, defense: 1.3, scouting: .9 },
  scout: { name: "정찰", power: .95, defense: 1, scouting: 1.35 },
};

export function resolveFactionCombat({ members, faction, tactic = "defense", ammo }) {
  const doctrine = TACTICS[tactic] ?? TACTICS.defense;
  let ammoNeeded = 0;
  let power = 0;
  let defense = 0;
  let scouting = 0;

  members.forEach((member) => {
    const gear = equipmentBonus(member);
    ammoNeeded += gear.ammo;
    power += effectiveStat(member, "combat") + gear.combat;
    defense += getStat(member, "mental") * .35 + gear.defense;
    scouting += effectiveStat(member, "scouting");
  });

  const ammoUsed = Math.min(ammo, ammoNeeded);
  if (ammoUsed < ammoNeeded) power *= .75;
  power *= doctrine.power;
  defense *= doctrine.defense;
  scouting *= doctrine.scouting;

  const playerScore = power + defense + scouting * .3 + random(-4, 4);
  const enemyScore = faction.power + random(-6, 6);
  const margin = playerScore - enemyScore;
  const outcome = margin >= 7 ? "victory" : margin >= -5 ? "retreat" : "defeat";
  const casualtyRisk = Math.max(.04, (outcome === "victory" ? .09 : outcome === "retreat" ? .2 : .36) - defense * .006 - scouting * .002);
  const deathRisk = Math.max(0, (outcome === "defeat" ? .08 : outcome === "retreat" ? .025 : .008) - defense * .002);

  return {
    tactic: doctrine.name,
    outcome,
    playerScore: Math.round(playerScore),
    enemyScore: Math.round(enemyScore),
    ammoUsed,
    casualtyRisk,
    deathRisk,
    loot: outcome === "victory" ? { food: random(2, 5), material: random(2, 5), ammo: random(1, 4) } : {},
  };
}

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
