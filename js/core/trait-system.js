export const TRAITS = ["냉정", "다혈질", "낙천", "생존본능", "자비", "야심", "충직", "외톨이", "겁쟁이", "만학", "사이코패스", "유순함", "무던함"];

export const TRAIT_EFFECTS = {
  냉정: ["위기에서 무드가 덜 떨어집니다.", "좋은 대화에도 기분이 오르지 않습니다."],
  다혈질: ["전투에 3 더 강합니다.", "다툼이 커지기 쉽고, 퇴각과 패배에 더 흔들립니다."],
  낙천: ["거점에서 침울한 동료의 무드를 조금 올립니다.", "원정 리더일 때 안전 우선을 고르지 않고 위험을 감수합니다."],
  생존본능: ["받는 피해가 줄고 부상을 잘 버팁니다.", "식량이 없으면 무드가 크게 떨어집니다."],
  자비: ["치료가 더 잘 되고 재활이 하루 짧아집니다.", "전투는 약하고, 사람을 내치거나 거절하면 마음이 상합니다."],
  야심: ["경험이 더 빨리 쌓입니다.", "쉬거나 능력 이하의 일을 하면 불만이고, 설득에 잘 넘어갑니다."],
  충직: ["설득에 넘어가지 않습니다.", "새로 온 사람과 거리를 두고, 리더가 바뀌면 누구를 따르는지 가립니다."],
  외톨이: ["혼자 원정을 갈 수 있고, 적은 인원에 강합니다.", "사람이 많으면 위축되고 대화도 드뭅니다."],
  겁쟁이: ["위험 감수를 고르지 않고 부상을 피합니다.", "전투와 위험한 원정에서 위축됩니다."],
  만학: ["마흔 이후 경험이 빨리 쌓이고, 늙어도 능력 상한이 줄지 않습니다.", "서른 전에는 성장이 느립니다."],
  사이코패스: ["남의 죽음, 이탈, 다툼에 흔들리지 않습니다.", "대화나 함께하는 일로 관계가 좋아지지 않습니다."],
  유순함: ["설득에 잘 넘어가고, 다툼에서는 먼저 물러납니다.", "리더가 되는 것을 부담스러워합니다."],
  무던함: ["특별한 성격 효과는 없습니다.", "전투, 설득, 다툼에서 따로 가감되지 않습니다."],
};

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
  if (member?.trait === "다혈질") bonus += 3;
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
  if (member?.trait === "유순함") return 2;
  if (member?.trait === "야심") return 1.8;
  return 1;
}

export function loyalNewcomerOffset(member, other) {
  if (member?.trait === "충직" && other?.origin === "recruit") return -8;
  if (member?.origin === "recruit" && member?.trait === "충직" && other?.origin !== "recruit") return -8;
  return 0;
}
