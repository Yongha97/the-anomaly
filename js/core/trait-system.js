export const TRAITS = ["냉정", "다혈질", "낙천", "생존본능", "자비", "야심", "충직", "외톨이", "겁쟁이", "만학", "사이코패스"];

export function traitXp(member, base) {
  let amount = base;
  if (member?.trait === "야심") amount += 1;
  if (member?.trait === "만학") {
    if ((member.age ?? 0) >= 40) amount += 2;
    else if ((member.age ?? 0) < 30) amount = Math.max(1, Math.floor(base / 2));
  }
  return amount;
}

export function combatBonus(member, { teamSize = 3, risky = false, battle = false, expedition = false } = {}) {
  let bonus = 0;
  if (member?.trait === "다혈질") bonus += 1;
  if (member?.trait === "자비") bonus -= 1;
  if (member?.trait === "겁쟁이" && (risky || battle)) bonus -= 1;
  if (member?.trait === "외톨이" && expedition) bonus += teamSize <= 2 ? 2 : -1;
  return bonus;
}

export function scoutingBonus(member, teamSize, expedition = false) {
  if (member?.trait !== "외톨이" || !expedition) return 0;
  return teamSize <= 2 ? 2 : -1;
}

export function taskGroupFactor(member, groupSize) {
  if (member?.trait !== "외톨이") return 1;
  return groupSize <= 1 ? 1.1 : 0.85;
}

export function harmDamage(member, damage) {
  if (member?.trait === "생존본능") return Math.max(1, Math.round(damage * 0.75));
  return damage;
}

export function injuryChanceFactor(member) {
  if (member?.trait === "겁쟁이") return 0.6;
  if (member?.trait === "생존본능") return 0.75;
  return 1;
}

export function adjustCrisisMood(member, amount) {
  if (amount >= 0 || member?.trait !== "냉정") return amount;
  return Math.min(-1, Math.ceil(amount * 0.7));
}

export function adjustInjuryMood(member, amount) {
  const halved = member?.trait === "생존본능" ? Math.ceil(amount * 0.5) : amount;
  return adjustCrisisMood(member, halved);
}

export function shieldsSocialGrief(member) {
  return member?.trait === "사이코패스";
}

export function foodShortageMood(member) {
  const amount = member?.trait === "생존본능" ? -20 : -10;
  return adjustCrisisMood(member, amount);
}

export function leaderRouteBias(leader) {
  if (leader?.trait === "겁쟁이") return "safe";
  if (leader?.trait === "낙천") return "risky";
  return null;
}

export function soloExpeditionOk(members) {
  return members.length === 1 && members[0]?.trait === "외톨이";
}

export function joinsConversation(member) {
  return member?.trait !== "외톨이" || Math.random() < 0.35;
}

export function keepsPositiveBond(member) {
  return member?.trait !== "사이코패스";
}

export function acceptsSocialLift(member) {
  return !["냉정", "외톨이", "사이코패스"].includes(member?.trait);
}

export function swayFactor(member) {
  if (member?.trait === "충직") return 0;
  if (member?.trait === "야심") return 1.8;
  return 1;
}

export function loyalNewcomerOffset(member, other) {
  if (member?.trait === "충직" && other?.origin === "recruit") return -8;
  if (member?.origin === "recruit" && member?.trait === "충직" && other?.origin !== "recruit") return -8;
  return 0;
}
