export const STAT_DEFINITIONS = [
  { key: "mental", label: "정신" },
  { key: "combat", label: "전투" },
  { key: "cooking", label: "요리" },
  { key: "farming", label: "농사" },
  { key: "building", label: "건축" },
  { key: "crafting", label: "제작" },
  { key: "medical", label: "의학" },
  { key: "scouting", label: "정찰" },
  { key: "leadership", label: "리더십" },
];

export const TASK_STAT = {
  농사: "farming",
  요리: "cooking",
  건축: "building",
  제작: "crafting",
  의학: "medical",
  경계: "combat",
};

export function createStats(values = {}) {
  if (Array.isArray(values)) {
    return Object.fromEntries(STAT_DEFINITIONS.map(({ key }, index) => [key, values[index] ?? random(2, 7)]));
  }
  return Object.fromEntries(STAT_DEFINITIONS.map(({ key }) => [key, values[key] ?? random(2, 7)]));
}

export function ageStatCap(age, trait) {
  const years = Math.max(0, Math.min(age, 45) - 16);
  const peak = Math.min(10, Math.max(4, 4 + Math.round(years / 29 * 6)));
  if (trait === "만학" || age <= 45) return peak;
  return Math.max(4, peak - Math.floor((age - 45) / 5));
}

export function getStat(member, key) {
  return member.stats[key] ?? 0;
}

export function workEfficiency(member) {
  let efficiency = member.fatigue >= 90 ? .4 : member.fatigue >= 75 ? .65 : member.fatigue >= 50 ? .85 : 1;
  if (member.burnoutDays > 0) efficiency *= .5;
  if (member.injuries?.some((injury) => injury.severity === "major")) efficiency *= .65;
  else if (member.injuries?.length) efficiency *= .85;
  if (member.rehabDays > 0) efficiency *= .75;
  return Math.max(.2, efficiency);
}

export function effectiveStat(member, key) {
  return getStat(member, key) * workEfficiency(member);
}

export function applyMood(member, amount, reason, day) {
  const mental = getStat(member, "mental");
  const adjusted = amount < 0
    ? Math.ceil(amount * Math.max(.45, 1 - mental * .05))
    : amount;
  member.mood = clamp(member.mood + adjusted, 0, 100);
  member.moodNotes ??= [];
  member.moodNotes.unshift({ day, amount: adjusted, reason });
  member.moodNotes = member.moodNotes.slice(0, 5);
  return adjusted;
}

export function processBurnout(member, day) {
  const notes = [];
  if (member.burnoutDays > 0) {
    member.burnoutDays -= 1;
    if (member.burnoutDays === 0) {
      member.history.push(`${day}일 차, 번아웃에서 회복했다.`);
      notes.push(`${member.name}이(가) 번아웃에서 회복했다.`);
    }
  }

  member.lowMoodDays = member.mood <= 19 ? member.lowMoodDays + 1 : 0;
  if (member.lowMoodDays >= 3 && member.burnoutDays === 0) {
    member.burnoutDays = Math.max(2, 5 - Math.floor(getStat(member, "mental") / 3));
    member.lowMoodDays = 0;
    member.task = "휴식";
    member.history.push(`${day}일 차, 낮은 무드가 지속되어 번아웃에 빠졌다.`);
    notes.push(`${member.name}이(가) 번아웃에 빠져 강제로 휴식한다.`);
  }
  return notes;
}

export function addTaskExperience(member, task, amount, day) {
  const statKey = task === "훈련"
    ? STAT_DEFINITIONS.reduce((lowest, stat) => member.stats[stat.key] < member.stats[lowest] ? stat.key : lowest, "mental")
    : TASK_STAT[task];
  if (!statKey) return null;

  member.xp[statKey] = (member.xp[statKey] ?? 0) + amount;
  if (member.xp[statKey] < 10 || member.stats[statKey] >= 10) return null;
  member.xp[statKey] -= 10;
  member.stats[statKey] += 1;
  const label = STAT_DEFINITIONS.find((stat) => stat.key === statKey)?.label ?? statKey;
  const text = `${member.name}의 ${label} 능력이 ${member.stats[statKey]}(으)로 성장했다.`;
  member.history.push(`${day}일 차, ${text}`);
  return text;
}

export function expeditionBlockReason(member) {
  if (member.burnoutDays > 0) return `번아웃 ${member.burnoutDays}일`;
  if (member.injuries?.some((injury) => injury.severity === "major")) return "중상 치료 필요";
  if (member.rehabDays > 0) return `재활 ${member.rehabDays}일`;
  if (member.fatigue >= 90) return "탈진";
  return "";
}

export function moodLabel(mood) {
  if (mood >= 70) return "안정";
  if (mood >= 40) return "흔들림";
  if (mood >= 20) return "침체";
  return "붕괴 위험";
}

export function fatigueLabel(fatigue) {
  if (fatigue < 25) return "여유";
  if (fatigue < 50) return "보통";
  if (fatigue < 75) return "피곤";
  if (fatigue < 90) return "탈진 직전";
  return "탈진";
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
