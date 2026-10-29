import {
  STAT_DEFINITIONS,
  TASK_STAT,
  addTaskExperience,
  applyMood,
  ageStatCap,
  createStats,
  effectiveStat,
  expeditionBlockReason,
  getStat,
  processBurnout,
} from "./member-system.js";
import { addInjury, createInjury, processMedicalDay } from "./medical-system.js";
import {
  applyTaskRelationshipMood,
  ensureRelationshipsFor,
  initializeRelationships,
  processDailyConversation,
  traitsClash,
} from "./relationship-system.js";
import { createInventory, equipItem, equipmentBonus, unequipSlot } from "./equipment-system.js";
import { canHire, createFactions, tickFactions, tradeItem } from "./faction-system.js";
import {
  contactLine,
  damageRange,
  describeAmmo,
  planAmmo,
  resolveFactionCombat,
  stockpileAmmo,
  rollContact,
  rollExpeditionContact,
  rollNightContact,
} from "./combat-system.js";
import { eventDefinition, rollBaseEvent, rollExpeditionEvent, setEventCooldown } from "./event-system.js";
import {
  TRAITS,
  acceptsSocialLift,
  adjustCrisisMood,
  combatBonus,
  foodShortageMood,
  injuryChanceFactor,
  leaderRouteBias,
  scoutingBonus,
  shieldsSocialGrief,
  soloExpeditionOk,
  swayFactor,
  taskGroupFactor,
  traitXp,
} from "./trait-system.js";

export const TASKS = ["휴식", "농사", "요리", "건축", "제작", "의학", "경계", "훈련"];
export const STAT_KEYS = STAT_DEFINITIONS;

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍", "전", "고", "문", "양", "손", "배", "백", "허", "유", "남", "심", "노", "하", "곽", "성", "차", "주", "우", "구", "나", "엄", "원", "천", "방", "공", "현", "함", "변", "염", "추", "도", "석", "설", "마", "길", "표", "명", "기", "반", "금", "옥", "맹", "탁", "편", "용"];
const COMPOUND_SURNAMES = ["남궁", "선우", "제갈", "사공", "독고", "황보", "서문", "동방"];
const GIVEN_FIRST = ["도", "서", "하", "민", "지", "유", "태", "시", "가", "현", "로", "은", "재", "수", "해", "준", "아", "예", "채", "윤", "다", "소", "리", "보", "경", "세", "주", "연", "우", "이", "라", "온", "결", "담", "별", "늘", "찬", "호", "건", "율", "빈", "설", "나", "루", "미", "선", "정", "혜", "원", "진"];
const MALE_GIVEN_LAST = ["윤", "진", "우", "준", "원", "호", "혁", "민", "석", "현", "재", "성", "율", "건", "찬", "결", "후", "겸", "빈", "오", "한", "서", "람", "훈", "수", "기", "태", "명", "철", "식"];
const FEMALE_GIVEN_LAST = ["아", "연", "린", "율", "은", "빈", "서", "희", "윤", "정", "원", "솔", "별", "담", "름", "채", "경", "주", "미", "나", "리", "온", "혜", "영", "진", "유", "란", "설", "비", "화"];
export const BEARD_NAMES = ["없음", "콧수염", "턱수염", "짧은 수염", "풀수염", "수염 자국"];
const RECRUIT_TRAITS = TRAITS;
const JOBS = [
  ["고등학생", 16, 19], ["대학생", 18, 27], ["대학원생", 23, 32], ["아르바이트", 16, 26],
  ["교사", 24, 62], ["교수", 34, 68], ["학원강사", 22, 60], ["사서", 23, 65],
  ["간호사", 22, 60], ["의사", 27, 68], ["응급구조사", 22, 55], ["약사", 25, 65], ["간병인", 22, 65], ["물리치료사", 23, 60], ["수의사", 26, 64],
  ["소방관", 22, 55], ["경찰", 22, 56], ["군인", 20, 50], ["경비원", 22, 65],
  ["농부", 20, 68], ["어부", 20, 66], ["목수", 20, 65], ["배관공", 20, 64], ["용접공", 20, 60], ["전기기사", 22, 62], ["정비공", 20, 62], ["건축기사", 25, 64],
  ["요리사", 20, 64], ["제빵사", 20, 62], ["바리스타", 19, 40], ["영양사", 23, 60],
  ["프로그래머", 22, 55], ["회사원", 23, 60], ["공무원", 24, 62], ["회계사", 25, 64], ["변호사", 28, 68], ["기자", 23, 60], ["작가", 22, 68],
  ["택시기사", 24, 66], ["버스기사", 24, 64], ["택배기사", 20, 60], ["배달원", 18, 45],
  ["미용사", 20, 60], ["디자이너", 21, 50], ["사진가", 20, 64], ["음악가", 18, 64], ["화가", 20, 68],
  ["운동선수", 18, 38], ["코치", 28, 65], ["무술사범", 24, 64],
  ["상인", 22, 68], ["편의점주", 24, 66], ["사회복지사", 24, 64], ["상담사", 26, 66], ["성직자", 28, 68],
  ["환경기사", 24, 62], ["연구원", 26, 64], ["기계공학자", 25, 62],
  ["주부", 22, 68], ["일용직", 18, 66], ["무직", 18, 68],
];

export const DESTINATIONS = [
  { id: "homes", name: "주택가", days: 1, danger: 2, reward: "식량 · 생존자" },
  { id: "school", name: "폐교", days: 2, danger: 2, reward: "자재 · 의약품" },
  { id: "farm", name: "근교 농장", days: 3, danger: 2, reward: "대량 식량" },
  { id: "mart", name: "대형마트", days: 4, danger: 3, reward: "식량 · 자재" },
  { id: "site", name: "공사장", days: 5, danger: 3, reward: "대량 자재" },
  { id: "hospital", name: "시립병원", days: 6, danger: 4, reward: "대량 의약품" },
  { id: "factory", name: "폐공장", days: 6, danger: 4, reward: "장비 · 자재" },
  { id: "checkpoint", name: "군 초소", days: 7, danger: 5, reward: "무기 · 탄약" },
];

const createMember = (id, name, age, trait, background, stats, leader = false, gender = rollGender()) => ({
  id, name, age, trait, background, stats, leader, gender,
  appearance: createAppearance(gender),
  hp: 100, fatigue: 8 + id * 4, mood: 72, loyalty: 75,
  task: leader ? "경계" : "휴식",
  xp: Object.fromEntries(STAT_DEFINITIONS.map(({ key }) => [key, 0])),
  lowMoodDays: 0,
  burnoutDays: 0,
  injuries: [],
  rehabDays: 0,
  relationships: {},
  recentConversations: [],
  moodNotes: [],
  equipment: { weapon: null, armor: null },
  membership: "resident",
  contract: null,
  history: ["공동체의 창립 멤버가 되었다."],
});

const initialState = () => {
  const members = [1, 2, 3].map((id) => createMember(id, "김도윤", 30, "냉정", "무직", createStats(), false, "male"));
  rollStartingParty(members);
  initializeRelationships(members);
  return {
  schemaVersion: 2,
  started: false,
  faction: "마지막 불씨",
  day: 1,
  morale: 67,
  resources: { food: 18, material: 12, medicine: 4, ammo: 7, silver: 16 },
  members,
  facilities: [
    { id: "farm", name: "농지", level: 1, max: 4, description: "농사 임무의 식량 생산량 증가" },
    { id: "kitchen", name: "주방", level: 1, max: 3, description: "식사 효율과 사기 회복 증가" },
    { id: "wall", name: "방벽", level: 1, max: 5, description: "야간 방어력 증가" },
    { id: "barracks", name: "막사", level: 1, max: 5, description: "현재 수용 인원 4명" },
    { id: "clinic", name: "의무실", level: 0, max: 3, description: "부상 치료와 재활 해금" },
    { id: "workshop", name: "공방", level: 0, max: 3, description: "장비와 소모품 제작 해금" },
  ],
  selectedDestination: "homes",
  squad: [],
  rationPlan: "standard",
  riskPolicy: "leader",
  recruitPolicy: "leader",
  expeditionLeaderId: null,
  expeditionsToday: 0,
  expedition: null,
  factions: createFactions(),
  inventory: createInventory(),
  pendingEvent: null,
  eventCooldowns: {},
  eventHistory: [],
  uiView: { type: "base" },
  battleTeam: [],
  battleTactic: "defense",
  battleFactionId: null,
  combatReport: null,
  pendingRecruit: null,
  activeTab: "field",
  membersView: "status",
  expelTargetId: null,
  leaderTargetId: null,
  leaderShift: null,
  logs: [
    { day: 1, type: "good", text: "버려진 체육관에 작은 거점을 세웠다." },
    { day: 1, type: "", text: "근처에서 좀비의 울음소리가 들린다." },
  ],
  report: null,
  toast: "",
  guideDismissed: false,
  nightContact: null,
  battleContact: null,
  };
};

let state = initialState();
state.nightContact = rollNightContact(state.day, state.factions);
const listeners = new Set();

export const getState = () => state;
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const notify = () => listeners.forEach((listener) => listener(state));

export function startGame({ faction, names }) {
  state.faction = faction.trim() || "마지막 불씨";
  state.members.forEach((member, index) => {
    if (names[index]?.trim()) member.name = names[index].trim();
  });
  state.started = true;
  notify();
}

export function rerollStartingMembers() {
  if (state.started) return;
  rollStartingParty(state.members);
  notify();
}

function rollStartingParty(members) {
  const usedNames = [];
  members.forEach((member) => rollPerson(member, usedNames));
  const leader = [...members].sort((a, b) => getStat(b, "leadership") - getStat(a, "leadership") || a.id - b.id)[0];
  members.forEach((member) => {
    member.leader = member === leader;
    member.task = member.leader ? "경계" : "휴식";
  });
}

function rollPerson(member, usedNames) {
  member.gender = rollGender();
  member.name = createName(member.gender, usedNames);
  usedNames.push(member.name);
  member.age = random(16, 68);
  member.trait = pick(RECRUIT_TRAITS);
  member.background = rollJob(member.age);
  member.stats = rollStatsForAge(member.age, member.trait);
  member.xp = Object.fromEntries(STAT_DEFINITIONS.map(({ key }) => [key, 0]));
  member.appearance = createAppearance(member.gender);
}

function rollJob(age) {
  const fits = JOBS.filter(([, min, max]) => age >= min && age <= max);
  return pick(fits.length ? fits : JOBS)[0];
}

function rollStatsForAge(age, trait) {
  const cap = ageStatCap(age, trait);
  return createStats(STAT_DEFINITIONS.map(() => random(1, cap)));
}

export function setTab(tab) {
  state.activeTab = tab;
  state.report = null;
  notify();
}

export function assignTask(memberId, task) {
  const member = state.members.find((item) => item.id === Number(memberId));
  if (!member || state.squad.includes(member.id)) return;
  if (member.burnoutDays > 0 && task !== "휴식") {
    toast(`${member.name}은(는) 번아웃 상태라 휴식만 가능합니다.`);
    notify();
    return;
  }
  member.task = TASKS.includes(task) ? task : "휴식";
  toast(`${member.name}: ${member.task} 임무 배치`);
  notify();
}

export function autoAssign() {
  const preferredTasks = ["경계", "의학", "농사", "요리", "건축", "제작"];
  const used = new Set();
  preferredTasks.forEach((task) => {
    let best = null;
    let bestScore = -1;
    state.members.forEach((member) => {
      if (used.has(member.id) || member.task === "원정" || member.hp < 28 || expeditionBlockReason(member)) return;
      const statKey = TASK_STAT[task];
      let score = getStat(member, statKey);
      if (member.trait === "겁쟁이") {
        if (task === "경계") score -= 10;
        if (["농사", "요리", "제작"].includes(task)) score += 2;
      }
      if (score > bestScore) {
        best = member;
        bestScore = score;
      }
    });
    if (best && used.size < state.members.length) {
      best.task = task;
      used.add(best.id);
    }
  });
  state.members.filter((member) => member.hp < 28 || member.burnoutDays > 0).forEach((member) => { member.task = "휴식"; });
  toast("현재 능력과 거점 상황에 맞춰 배치했습니다.");
  notify();
}

export function dismissGuide() {
  state.guideDismissed = true;
  notify();
}

export function selectDestination(destinationId) {
  state.selectedDestination = destinationId;
  notify();
}

export function setRationPlan(plan) {
  state.rationPlan = plan === "generous" ? "generous" : "standard";
  notify();
}

export function setRiskPolicy(policy) {
  const next = ["safe", "risky", "leader"].includes(policy) ? policy : "leader";
  const leader = routeLeader();
  if (next === "risky" && leader?.trait === "겁쟁이") {
    toast(`${leader.name}${josa(leader.name, "은", "는")} 겁쟁이라 위험을 감수하지 않습니다.`);
    notify();
    return;
  }
  state.riskPolicy = next;
  notify();
}

export function setRecruitPolicy(policy) {
  state.recruitPolicy = ["active", "normal", "passive", "leader"].includes(policy) ? policy : "leader";
  notify();
}

export function setExpeditionLeader(memberId) {
  const id = Number(memberId);
  if (state.squad.includes(id)) state.expeditionLeaderId = id;
  settleCowardRisk();
  notify();
}

export function toggleSquad(memberId) {
  const id = Number(memberId);
  const index = state.squad.indexOf(id);
  if (index >= 0) {
    state.squad.splice(index, 1);
    if (state.expeditionLeaderId === id) state.expeditionLeaderId = state.squad[0] ?? null;
    settleCowardRisk();
  } else if (state.squad.length < 5) {
    const member = state.members.find((item) => item.id === id);
    const blocked = expeditionBlockReason(member);
    if (blocked) {
      toast(`${member.name}: ${blocked} 상태로 원정에 참여할 수 없습니다.`);
      notify();
      return;
    }
    state.squad.push(id);
    if (!state.expeditionLeaderId) state.expeditionLeaderId = id;
  }
  else toast("원정대는 최대 5명입니다.");
  settleCowardRisk();
  notify();
}

export function launchExpedition() {
  if (state.expeditionsToday >= 1) {
    toast("오늘은 이미 원정대를 꾸렸습니다. 다음 날 다시 출발할 수 있습니다.");
    notify();
    return;
  }
  const squadMembers = state.squad.map((id) => state.members.find((member) => member.id === id)).filter(Boolean);
  if (state.squad.length < 2 && !soloExpeditionOk(squadMembers)) {
    toast(state.squad.length === 1 ? "외톨이만 혼자 원정을 갈 수 있습니다." : "원정대는 최소 2명이 필요합니다.");
    notify();
    return;
  }
  const destination = DESTINATIONS.find((item) => item.id === state.selectedDestination);
  if (state.riskPolicy === "safe" && state.rationPlan !== "generous") {
    toast("안전 규율에는 넉넉한 휴대 식량이 필요합니다.");
    notify();
    return;
  }
  const baseFood = state.squad.length * destination.days;
  const packedFood = state.rationPlan === "generous" ? Math.ceil(baseFood * 1.5) : baseFood;
  if (state.resources.food < packedFood) {
    toast(`원정 식량이 ${packedFood - state.resources.food} 부족합니다.`);
    notify();
    return;
  }
  const leaderId = state.squad.includes(state.expeditionLeaderId)
    ? state.expeditionLeaderId
    : state.squad[0];
  state.resources.food -= packedFood;
  state.expeditionsToday += 1;
  state.expedition = {
    status: "active",
    destination,
    members: [...state.squad],
    leaderId,
    supplies: packedFood,
    safeRoute: state.rationPlan === "generous",
    carryCapacity: state.squad.length * (2 + destination.days),
    outcomes: [],
    deadIds: [],
    loot: { food: 0, material: 0, medicine: 0, ammo: 0 },
  };
  state.squad.forEach((id) => {
    const member = state.members.find((item) => item.id === id);
    member.task = "원정";
    if (member.trait === "외톨이" && state.squad.length >= 3) applyMood(member, -2, "사람이 많은 원정", state.day);
  });
  state.logs.unshift({ day: state.day, type: "", text: `${destination.name}(으)로 원정대가 출발했다.` });
  resolveExpedition();
  state.activeTab = "expedition";
  notify();
}

function resolveExpedition() {
  const expedition = state.expedition;
  if (!expedition) return;
  const members = expedition.members.map((id) => state.members.find((member) => member.id === id));
  const leader = members.find((member) => member.id === expedition.leaderId) ?? members[0];
  const leadership = getStat(leader, "leadership");
  const gearTotals = members.reduce((totals, member) => {
    const gear = equipmentBonus(member);
    totals.combat += gear.combat;
    totals.defense += gear.defense;
    return totals;
  }, { combat: 0, defense: 0 });
  const combat = members.reduce((sum, member) => sum + effectiveStat(member, "combat"), 0) + gearTotals.combat;
  const logistics = members.reduce((sum, member) => sum + Math.max(
    effectiveStat(member, "farming"),
    effectiveStat(member, "building"),
    effectiveStat(member, "crafting"),
  ), 0);
  const medical = members.reduce((sum, member) => sum + effectiveStat(member, "medical"), 0);
  const scouting = members.reduce((sum, member) => sum + effectiveStat(member, "scouting") + scoutingBonus(member, members.length, true), 0);
  const routeBias = leader?.trait === "겁쟁이"
    ? "safe"
    : (state.riskPolicy === "leader" ? leaderRouteBias(leader) : null);
  const resolvedRisk = routeBias
    ?? (state.riskPolicy === "leader"
      ? (leadership + combat / members.length >= 13 && expedition.safeRoute ? "safe" : "risky")
      : state.riskPolicy);
  const resolvedRecruit = state.recruitPolicy === "leader"
    ? (leadership >= 8 ? "active" : leadership >= 6 ? "normal" : "passive")
    : state.recruitPolicy;
  expedition.resolvedRisk = resolvedRisk === "safe" && !expedition.safeRoute ? "risky" : resolvedRisk;
  expedition.resolvedRecruit = resolvedRecruit;

  const danger = expedition.destination.danger;
  const risky = expedition.resolvedRisk === "risky";
  members.forEach((member) => {
    if (risky && member.trait === "겁쟁이") applyMood(member, -3, "위험한 원정", state.day);
  });
  const contact = rollExpeditionContact({ danger, risky, day: state.day, factions: state.factions });
  const ammoPlan = planAmmo(contact, members, risky ? "assault" : "defense");
  const expeditionAmmoUsed = Math.min(state.resources.ammo, ammoPlan.expected);
  const shortfall = ammoPlan.expected > 0 ? 1 - expeditionAmmoUsed / ammoPlan.expected : 0;
  state.resources.ammo -= expeditionAmmoUsed;
  const traitCombat = members.reduce((sum, member) => sum + combatBonus(member, { teamSize: members.length, risky, expedition: true }), 0);
  const fought = Math.max(1, combat + traitCombat) * (shortfall > 0 ? .7 + .3 * (1 - shortfall) : (!ammoPlan.guns && contact && contact.kind !== "zombies" ? .85 : 1));
  const distance = expedition.destination.days;
  const teamSize = expedition.members.length;
  const abilityBonus = Math.floor(logistics / Math.max(4, teamSize * 3)) + Math.min(3, Math.floor(scouting / 8));
  const expectedLoot = risky
    ? random(distance + danger, (distance + danger) * 2) + teamSize * 2 + abilityBonus
    : random(Math.max(1, distance), distance + danger) + teamSize + abilityBonus;
  const loaded = Math.min(expedition.carryCapacity, expectedLoot);
  const loot = distributeLoot(expedition.destination.id, loaded);
  expedition.loot = loot;
  state.resources.food += loot.food;
  state.resources.material += loot.material;
  state.resources.medicine += loot.medicine;
  state.resources.ammo += loot.ammo;
  state.resources.silver += loot.silver;

  const lootText = Object.entries(loot)
    .filter(([, amount]) => amount > 0)
    .map(([resource, amount]) => `${RESOURCE_NAMES[resource]} ${amount}`)
    .join(", ");
  expedition.outcomes.push({
    type: "loot",
    title: "자원 확보",
    text: `${lootText} · 적재량 ${loaded}/${expedition.carryCapacity}`,
  });
  if (contact) {
    const [damageMin, damageMax] = damageRange(contact, { shortfall, guns: ammoPlan.guns });
    expedition.outcomes.push({
      type: shortfall > 0 ? "hostile" : "info",
      title: contactLine(contact),
      text: `${describeAmmo(ammoPlan.expected, expeditionAmmoUsed)}. 부상 시 체력 ${damageMin}~${damageMax}.`,
    });
    expedition.contactDamage = [damageMin, damageMax];
  } else {
    expedition.outcomes.push({ type: "info", title: "무혈 통과", text: "교전 없이 목적지에 닿아 탄약을 쓰지 않았다." });
  }

  const [damageMin, damageMax] = contact ? expedition.contactDamage : [8, 16];
  const pressure = contact ? contact.power / Math.max(8, fought) : 0;
  const injuryChance = contact
    ? Math.min(.62, Math.max(.06, .1 + pressure * .28 - medical * .004 - gearTotals.defense * .008))
    : 0;
  const injuryRoll = injuryChance * members.reduce((sum, member) => sum + injuryChanceFactor(member), 0) / members.length;
  if (Math.random() < injuryRoll) {
    const victim = weightedPick(members, injuryChanceFactor);
    const rolled = random(damageMin, damageMax);
    const injury = createInjury(contact.kind === "zombies" ? danger : danger + 1, rolled >= Math.ceil((damageMin + damageMax) / 2));
    const injuryResult = addInjury(victim, injury, rolled, state.day);
    expedition.outcomes.push({
      type: "injury",
      title: `${victim.name} ${injury.severity === "major" ? "중상" : "부상"}`,
      text: `${injury.name} · 체력 ${injuryResult.damage} 감소 · 치료 예상 ${injury.daysRemaining}일${injuryResult.combatLoss ? " · 전투 -1" : ""}`,
    });
  }

  const deathChance = contact
    ? Math.max(0, (risky ? .04 : .01) + contact.death * .015 + contact.power / 90 - fought * .002 - medical * .002)
    : 0;
  if (state.members.length > 2 && Math.random() < deathChance) {
    const candidates = members.filter((member) => member.hp > 1);
    if (candidates.length) {
      const victim = pick(candidates);
      expedition.deadIds.push(victim.id);
      expedition.outcomes.push({ type: "death", title: `${victim.name} 사망`, text: "원정 도중 입은 치명상으로 목숨을 잃었다." });
      members.filter((member) => member.id !== victim.id).forEach((member) => {
        if (shieldsSocialGrief(member)) return;
        const relation = member.relationships[victim.id] ?? 0;
        applyMood(member, adjustCrisisMood(member, -(7 + Math.max(0, Math.floor(relation / 10)))), `${victim.name} 사망`, state.day);
      });
    }
  }

  resolveRecruitment(expedition, leader, leadership);
  const eventRoll = rollExpeditionEvent({
    members,
    danger,
    day: state.day,
    factions: state.factions,
    factionIds: Object.keys(state.factions).filter((id) => id !== "dogs" || state.factions[id].relation > -50),
  });
  if (eventRoll.manual) {
    expedition.status = "waiting";
    state.pendingEvent = eventRoll.event;
    return;
  }
  Object.entries(eventRoll.bonus).forEach(([resource, amount]) => {
    state.resources[resource] = (state.resources[resource] ?? 0) + amount;
  });
  expedition.outcomes.push({ type: "info", title: "정찰 결과", text: eventRoll.outcome });
  finalizeExpeditionResult();
}

function finalizeExpeditionResult() {
  const expedition = state.expedition;
  if (!expedition) return;
  expedition.status = "complete";
  const summary = expedition.outcomes.map((outcome) => outcome.title).join(", ");
  state.logs.unshift({ day: state.day, type: expedition.deadIds.length ? "bad" : "good", text: `${expedition.destination.name} 원정 결과: ${summary}` });
}

export function finishExpedition() {
  if (state.pendingRecruit) {
    toast("영입 여부를 먼저 결정해야 합니다.");
    notify();
    return;
  }
  if (!state.expedition || state.expedition.status !== "complete") return;
  const names = state.expedition.members.map((id) => state.members.find((m) => m.id === id)?.name).join(", ");
  state.expedition.members.filter((id) => !state.expedition.deadIds.includes(id)).forEach((id) => {
    const member = state.members.find((item) => item.id === id);
    member.task = "휴식";
    member.fatigue = Math.min(100, member.fatigue + state.expedition.destination.days * 5);
    member.xp.mental = (member.xp.mental ?? 0) + traitXp(member, 4);
    if (member.id === state.expedition.leaderId) member.xp.leadership = (member.xp.leadership ?? 0) + traitXp(member, 4);
  });
  state.members = state.members.filter((member) => !state.expedition.deadIds.includes(member.id));
  if (!state.members.some((member) => member.leader) && state.members.length) {
    const successor = [...state.members].sort((a, b) => getStat(b, "leadership") - getStat(a, "leadership"))[0];
    successor.leader = true;
    successor.history.push(`${state.day}일 차, 사망한 리더의 뒤를 이어 세력 리더가 되었다.`);
  }
  state.logs.unshift({ day: state.day, type: "good", text: `${names} 원정대가 거점으로 복귀했다.` });
  state.expedition = null;
  state.squad = [];
  state.expeditionLeaderId = null;
  state.activeTab = "field";
  notify();
}

export function upgradeFacility(id) {
  const facility = state.facilities.find((item) => item.id === id);
  if (!facility || facility.level >= facility.max) return;
  const cost = 6 + facility.level * 5;
  if (state.resources.material < cost) {
    toast(`자재가 ${cost - state.resources.material} 부족합니다.`);
    notify();
    return;
  }
  state.resources.material -= cost;
  facility.level += 1;
  if (id === "barracks") facility.description = `현재 수용 인원 ${2 + facility.level * 2}명`;
  state.logs.unshift({ day: state.day, type: "good", text: `${facility.name} 시설이 ${facility.level}단계로 강화되었다.` });
  toast(`${facility.name} 강화 완료`);
  notify();
}

export function passDay() {
  if (state.pendingEvent || state.pendingRecruit) {
    toast(state.pendingEvent ? "대기 중인 사건을 먼저 해결해야 합니다." : "영입 여부를 먼저 결정해야 합니다.");
    notify();
    return;
  }
  const before = { ...state.resources, morale: state.morale };
  const processedDay = state.day;
  const homeMembers = state.members.filter((member) => member.task !== "원정");
  const counts = Object.fromEntries(TASKS.map((task) => [task, homeMembers.filter((member) => member.task === task)]));
  const sumEffective = (members, statKey) => members.reduce((sum, member) => sum + effectiveStat(member, statKey) * taskGroupFactor(member, members.length), 0);
  const reportNotes = [];

  const foodMade = Math.floor(sumEffective(counts["농사"], "farming") * .7);
  const materialMade = Math.floor((sumEffective(counts["건축"], "building") + sumEffective(counts["제작"], "crafting")) * .35);
  const foodUsed = homeMembers.length;
  state.resources.food = Math.max(0, state.resources.food + foodMade - foodUsed);
  state.resources.material += materialMade;

  const defense = sumEffective(counts["경계"], "combat")
    + sumEffective(counts["경계"], "scouting") * .5
    + state.facilities.find((item) => item.id === "wall").level * 3;
  const night = resolveNightContact(counts["경계"], defense, processedDay);
  const nightText = night.text;
  const nightType = night.type;

  reportNotes.push(...applyTaskRelationshipMood(homeMembers, processedDay));
  homeMembers.forEach((member) => {
    if (member.burnoutDays > 0) member.task = "휴식";
    if (member.task === "휴식") {
      member.fatigue = Math.max(0, member.fatigue - 18);
      member.hp = Math.min(100, member.hp + 4);
      applyMood(member, 2, "충분한 휴식", processedDay);
    } else {
      member.fatigue = Math.min(100, member.fatigue + 7);
      const growth = addTaskExperience(member, member.task, traitXp(member, member.task === "훈련" ? 5 : 2), processedDay);
      if (growth) reportNotes.push(growth);
      if (member.fatigue >= 75) applyMood(member, -2, "과로", processedDay);
    }
    if (member.trait === "야심" && !member.leader) {
      const idle = member.task === "휴식" && member.hp >= 50 && member.burnoutDays === 0 && member.rehabDays === 0;
      const best = Math.max(...STAT_KEYS.map((stat) => getStat(member, stat.key)));
      const taskKey = TASK_STAT[member.task];
      if (idle) applyMood(member, -2, "할 일이 없음", processedDay);
      else if (taskKey && getStat(member, taskKey) + 3 < best) applyMood(member, -1, "능력 이하의 일", processedDay);
    }
  });

  if (state.resources.food === 0) {
    homeMembers.forEach((member) => applyMood(member, foodShortageMood(member), "식량 고갈", processedDay));
    reportNotes.push("식량이 바닥나 모든 구성원의 무드가 감소했다.");
  }
  const optimists = homeMembers.filter((member) => member.trait === "낙천");
  const lifted = [];
  optimists.forEach((optimist) => {
    homeMembers.forEach((other) => {
      if (other === optimist || other.mood >= 60 || !acceptsSocialLift(other)) return;
      applyMood(other, 1, `${optimist.name}의 낙관`, processedDay);
      lifted.push(other.name);
    });
  });
  if (lifted.length) reportNotes.push("낙천적인 동료가 침체한 사람들의 기분을 조금 끌어올렸다.");

  const clinicLevel = state.facilities.find((item) => item.id === "clinic").level;
  const medicalResult = processMedicalDay({
    members: homeMembers,
    clinicLevel,
    medicine: state.resources.medicine,
    day: processedDay,
  });
  state.resources.medicine = Math.max(0, state.resources.medicine - medicalResult.medicineUsed);
  reportNotes.push(...medicalResult.notes);

  const conversationNotes = processDailyConversation(homeMembers, processedDay);
  reportNotes.push(...conversationNotes);
  homeMembers.forEach((member) => reportNotes.push(...processBurnout(member, processedDay)));
  reportNotes.push(...processDefectors(processedDay));
  reportNotes.push(...processMemberFights(processedDay));
  state.morale = state.members.length
    ? Math.round(state.members.reduce((sum, member) => sum + member.mood, 0) / state.members.length)
    : 0;
  state.day += 1;
  state.nightContact = rollNightContact(state.day, state.factions);
  state.expeditionsToday = 0;
  tickFactions(state.factions);
  reportNotes.push(...processMercenaryContracts());
  state.logs.unshift({ day: processedDay, type: nightType, text: nightText });
  conversationNotes.forEach((text) => state.logs.unshift({ day: processedDay, type: "", text }));
  medicalResult.notes.forEach((text) => state.logs.unshift({ day: processedDay, type: text.includes("사고") ? "bad" : "good", text }));
  state.report = {
    day: processedDay,
    deltas: {
      food: state.resources.food - before.food,
      material: state.resources.material - before.material,
      medicine: state.resources.medicine - before.medicine,
      silver: state.resources.silver - before.silver,
      morale: state.morale - before.morale,
    },
    notes: [
      `거점 인원 ${homeMembers.length}명이 식량 ${foodUsed}을 소비했다.`,
      foodMade ? `농사 담당자가 식량 ${foodMade}을 생산했다.` : "오늘은 식량을 생산하지 못했다.",
      materialMade ? `작업을 통해 자재 ${materialMade}을 확보했다.` : "자재 생산이 없었다.",
      nightText,
      ...reportNotes,
    ],
  };
  const event = rollBaseEvent({
    day: state.day,
    members: state.members,
    facilities: state.facilities,
    cooldowns: state.eventCooldowns,
  });
  if (event) state.pendingEvent = event;
  notify();
}

export function closeReport() {
  state.report = null;
  notify();
}

export function resolvePendingEvent(choiceId) {
  const event = state.pendingEvent;
  if (!event) return;
  const definition = eventDefinition(event.id);
  if (!definition?.choices.some((choice) => choice.id === choiceId)) return;

  const result = event.source === "expedition"
    ? resolveExpeditionEventChoice(event, choiceId)
    : resolveBaseEventChoice(event, choiceId);
  if (!result.ok) {
    toast(result.message);
    notify();
    return;
  }

  state.eventHistory.unshift({ day: state.day, eventId: event.id, choiceId, text: result.message });
  state.eventHistory = state.eventHistory.slice(0, 30);
  setEventCooldown(state.eventCooldowns, event.id, state.day, definition.cooldown ?? 3);
  state.logs.unshift({ day: state.day, type: result.type ?? "", text: result.message });
  state.pendingEvent = null;
  if (event.source === "expedition") finalizeExpeditionResult();
  notify();
}

export function openBaseView(type = "base", factionId = null) {
  state.uiView = { type, factionId };
  if (factionId) state.battleFactionId = factionId;
  if (type === "battle" && state.factions[factionId]) {
    state.battleContact = rollContact({ situation: "faction", day: state.day, faction: state.factions[factionId] });
  }
  notify();
}

export function tradeFaction(factionId, itemId, direction) {
  const faction = state.factions[factionId];
  if (!faction) return;
  const result = tradeItem({
    faction,
    inventory: state.inventory,
    resources: state.resources,
    itemId,
    direction,
  });
  toast(result.message);
  if (result.ok) state.logs.unshift({ day: state.day, type: "good", text: `${faction.name}: ${result.message}` });
  notify();
}

export function hireMercenary(factionId) {
  const faction = state.factions[factionId];
  if (!faction || !canHire(faction)) {
    toast("이 관계 단계에서는 용병을 고용할 수 없습니다.");
    notify();
    return;
  }
  const capacity = 2 + state.facilities.find((facility) => facility.id === "barracks").level * 2;
  if (state.members.length >= capacity) {
    toast("막사 정원이 부족합니다.");
    notify();
    return;
  }
  const offer = faction.mercenary;
  if (state.resources.silver < offer.silverCost) {
    toast(`은이 ${offer.silverCost - state.resources.silver} 부족합니다.`);
    notify();
    return;
  }
  state.resources.silver -= offer.silverCost;
  const id = Math.max(0, ...state.members.map((member) => member.id)) + 1;
  const mercenary = createMember(
    id,
    `${offer.name} ${id}`,
    random(22, 45),
    "충직",
    faction.name,
    createStats({ mental: 6, leadership: 3, combat: offer.combat, medical: 3, scouting: offer.scouting, crafting: 3 }),
  );
  mercenary.membership = "mercenary";
  mercenary.contract = { factionId, daysRemaining: offer.days, dailySilver: offer.dailySilver };
  mercenary.history = [`${state.day}일 차, ${faction.name}과(와) ${offer.days}일 용병 계약을 맺었다.`];
  state.members.push(mercenary);
  ensureRelationshipsFor(mercenary, state.members);
  toast(`${mercenary.name}을(를) ${offer.days}일 동안 고용했습니다.`);
  notify();
}

export function equipMember(memberId, itemId) {
  const member = state.members.find((item) => item.id === Number(memberId));
  if (!member) return;
  const slot = itemId.startsWith("none-") ? itemId.slice(5) : null;
  const result = slot
    ? unequipSlot(member, slot, state.inventory)
    : equipItem(member, itemId, state.inventory);
  toast(result.message);
  notify();
}

export function setMembersView(view) {
  state.membersView = ["status", "equipment", "manage"].includes(view) ? view : "status";
  if (view !== "manage") {
    state.expelTargetId = null;
    state.leaderTargetId = null;
  }
  notify();
}

export function askAppointLeader(memberId) {
  const member = state.members.find((item) => item.id === Number(memberId));
  if (!member || member.leader) return;
  if (member.membership === "mercenary") {
    toast("용병은 공동체의 리더가 될 수 없습니다.");
    notify();
    return;
  }
  state.expelTargetId = null;
  state.leaderTargetId = member.id;
  notify();
}

export function cancelAppointLeader() {
  state.leaderTargetId = null;
  notify();
}

export function confirmAppointLeader() {
  const next = state.members.find((item) => item.id === state.leaderTargetId);
  const previous = state.members.find((item) => item.leader);
  state.leaderTargetId = null;
  if (!next || next.leader || next.membership === "mercenary" || !previous || previous.id === next.id) {
    notify();
    return;
  }
  state.members.forEach((member) => {
    member.leader = member.id === next.id;
  });
  const lines = leaderChangeReactions(previous, next, state.day);
  state.leaderShift = { fromName: previous.name, toName: next.name, lines };
  state.logs.unshift({
    day: state.day,
    type: "",
    text: `리더가 ${previous.name}에서 ${next.name}${josa(next.name, "으로", "로")} 바뀌었다.`,
  });
  toast(`${next.name}${josa(next.name, "이", "가")} 리더가 되었습니다.`);
  notify();
}

export function askExpel(memberId) {
  const member = state.members.find((item) => item.id === Number(memberId));
  if (!member) return;
  if (member.leader) {
    toast("리더는 방출할 수 없습니다.");
    notify();
    return;
  }
  if (member.task === "원정") {
    toast("원정 중인 구성원은 돌아온 뒤에 방출할 수 있습니다.");
    notify();
    return;
  }
  state.leaderTargetId = null;
  state.expelTargetId = member.id;
  notify();
}

export function cancelExpel() {
  state.expelTargetId = null;
  notify();
}

export function confirmExpel() {
  const member = state.members.find((item) => item.id === state.expelTargetId);
  if (!member || member.leader || member.task === "원정") {
    state.expelTargetId = null;
    notify();
    return;
  }
  dismissMember(member, state.day, "방출");
  state.logs.unshift({ day: state.day, type: "", text: `${member.name}을(를) 거점에서 방출했다.` });
  toast(`${member.name}을(를) 방출했습니다. 장비는 창고로 돌아왔습니다.`);
  notify();
}

export function toggleBattleMember(memberId) {
  const id = Number(memberId);
  const index = state.battleTeam.indexOf(id);
  if (index >= 0) state.battleTeam.splice(index, 1);
  else if (state.battleTeam.length < 5) {
    const member = state.members.find((item) => item.id === id);
    const blocked = expeditionBlockReason(member);
    if (blocked) {
      toast(`${member.name}: ${blocked}`);
      notify();
      return;
    }
    state.battleTeam.push(id);
  }
  notify();
}

export function setBattleTactic(tactic) {
  state.battleTactic = ["assault", "defense", "scout"].includes(tactic) ? tactic : "defense";
  notify();
}

export function startFactionBattle(factionId) {
  const faction = state.factions[factionId];
  const members = state.battleTeam.map((id) => state.members.find((member) => member.id === id)).filter(Boolean);
  if (!faction || members.length < 2) {
    toast("전투에는 최소 2명이 필요합니다.");
    notify();
    return;
  }
  const contact = state.battleContact?.factionId === factionId
    ? state.battleContact
    : rollContact({ situation: "faction", day: state.day, faction });
  const result = resolveFactionCombat({ members, faction, tactic: state.battleTactic, ammo: state.resources.ammo, contact, day: state.day });
  state.resources.ammo -= result.ammoUsed;
  const consequence = applyCombatConsequences(members, result, faction.name);
  Object.entries(result.loot).forEach(([resource, amount]) => {
    state.resources[resource] = (state.resources[resource] ?? 0) + amount;
  });
  faction.relation = Math.max(-100, faction.relation - 30);
  faction.retaliationDays = result.outcome === "victory" ? 5 : 3;
  faction.lastBattleDay = state.day;
  state.combatReport = { ...result, factionName: faction.name, notes: consequence.notes };
  state.logs.unshift({ day: state.day, type: result.outcome === "victory" ? "good" : "bad", text: `${faction.name} 전투: ${combatOutcomeName(result.outcome)}` });
  state.battleTeam = [];
  notify();
}

export function closeCombatReport() {
  state.combatReport = null;
  notify();
}

export function toast(message) {
  state.toast = message;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => {
    state.toast = "";
    notify();
  }, 2600);
}

function resolveBaseEventChoice(event, choiceId) {
  if (event.id === "wall_breach") {
    if (choiceId === "ammo") {
      const cost = event.ammoCost ?? stockpileAmmo(event.contact);
      if (state.resources.ammo < cost) return { ok: false, message: `탄약이 ${cost}개 필요합니다.` };
      state.resources.ammo -= cost;
      const horde = event.contact ? contactLine(event.contact) : "좀비 무리";
      return { ok: true, type: "good", message: `탄약 ${cost}를 써 ${horde}를 막았다.` };
    }
    if (choiceId === "abandon") {
      state.resources.food = Math.max(0, state.resources.food - 3);
      state.resources.material = Math.max(0, state.resources.material - 2);
      state.members.forEach((member) => applyMood(member, -3, "방어벽 후퇴", state.day));
      return { ok: true, type: "bad", message: "인명 피해는 피했지만 식량 3과 자재 2를 잃었다." };
    }
    const defenders = state.members.filter((member) => member.task !== "원정");
    const contact = event.contact ?? rollContact({ situation: "zombies", day: state.day, danger: 3, scale: "large" });
    const result = resolveFactionCombat({ members: defenders, faction: { name: "좀비", power: contact.power }, tactic: "defense", ammo: state.resources.ammo, contact, day: state.day });
    state.resources.ammo -= result.ammoUsed;
    const consequence = applyCombatConsequences(defenders, result, contactLine(contact));
    return { ok: true, type: result.outcome === "victory" ? "good" : "bad", message: `${contactLine(contact)} 방어 ${combatOutcomeName(result.outcome)}. ${describeAmmo(result.expectedAmmo, result.ammoUsed)}. ${consequence.notes.join(" ")}` };
  }

  if (event.id === "refugees") {
    if (choiceId === "accept") {
      const capacity = barracksCapacity();
      if (state.members.length >= capacity) return { ok: false, message: "막사 정원이 가득 찼습니다." };
      state.pendingRecruit = createRecruitOffer({ source: "refugees", affiliated: false, faction: null, foundBy: "거점" });
      return { ok: true, message: `${state.pendingRecruit.member.name}의 소속과 신원을 확인해야 한다.` };
    }
    if (choiceId === "support") {
      if (state.resources.food < 4) return { ok: false, message: "식량이 4개 필요합니다." };
      state.resources.food -= 4;
      Object.values(state.factions).filter((faction) => faction.relation >= 0).forEach((faction) => { faction.relation = Math.min(100, faction.relation + 2); });
      return { ok: true, type: "good", message: "난민에게 식량 4를 지원해 외부 평판이 좋아졌다." };
    }
    state.members.forEach((member) => applyMood(member, -2, "난민 거절", state.day));
    return { ok: true, type: "bad", message: "난민을 돌려보냈고 구성원들의 무드가 내려갔다." };
  }

  const pair = findWorstRelationshipPair();
  if (!pair) return { ok: true, message: "갈등 당사자들이 스스로 진정했다." };
  const [first, second] = pair;
  if (choiceId === "mediate") {
    const leader = state.members.find((member) => member.leader) ?? state.members[0];
    const success = getStat(leader, "leadership") + random(1, 6) >= 9;
    const delta = success ? 6 : -3;
    first.relationships[second.id] = Math.max(-100, Math.min(100, first.relationships[second.id] + delta));
    second.relationships[first.id] = Math.max(-100, Math.min(100, second.relationships[first.id] + delta));
    return { ok: true, type: success ? "good" : "bad", message: success ? "리더의 중재로 두 사람의 관계가 나아졌다." : "중재가 실패해 갈등이 더 깊어졌다." };
  }
  if (choiceId === "separate") {
    first.task = "휴식";
    second.task = "휴식";
    first.fatigue = Math.min(100, first.fatigue + 4);
    second.fatigue = Math.min(100, second.fatigue + 4);
    return { ok: true, message: "두 사람을 분리 배치해 충돌을 멈췄다." };
  }
  first.relationships[second.id] = Math.max(-100, first.relationships[second.id] - 5);
  second.relationships[first.id] = Math.max(-100, second.relationships[first.id] - 5);
  applyMood(first, -3, "해결되지 않은 갈등", state.day);
  applyMood(second, -3, "해결되지 않은 갈등", state.day);
  return { ok: true, type: "bad", message: "갈등을 방치해 관계와 무드가 악화됐다." };
}

function resolveExpeditionEventChoice(event, choiceId) {
  const expedition = state.expedition;
  const members = expedition.members.map((id) => state.members.find((member) => member.id === id)).filter(Boolean);
  if (event.id === "exp_emergency") {
    const victim = pick(members);
    if (choiceId === "treat") {
      if (state.resources.medicine < 1) return { ok: false, message: "의약품이 1개 필요합니다." };
      state.resources.medicine -= 1;
      const medic = members.sort((a, b) => getStat(b, "medical") - getStat(a, "medical"))[0];
      const success = getStat(medic, "medical") + random(1, 6) >= 8;
      if (success) {
        victim.hp = Math.max(1, victim.hp - 4);
        expedition.outcomes.push({ type: "good", title: "현장 치료 성공", text: `${medic.name}이(가) ${victim.name}을(를) 안정시켰다.` });
        return { ok: true, type: "good", message: "긴급 치료에 성공해 중상을 피했다." };
      }
      const injury = createInjury(expedition.destination.danger, true);
      addInjury(victim, injury, 10, state.day);
      expedition.outcomes.push({ type: "injury", title: "현장 치료 실패", text: `${victim.name}: ${injury.name}` });
      return { ok: true, type: "bad", message: "현장 치료가 실패해 부상이 악화됐다." };
    }
    if (choiceId === "return") {
      reduceExpeditionLoot(.25);
      const injury = createInjury(1, false);
      addInjury(victim, injury, 6, state.day);
      expedition.outcomes.push({ type: "info", title: "조기 복귀", text: "수확 일부를 버리고 안전하게 복귀했다." });
      return { ok: true, message: "수확 일부를 포기하고 응급처치 후 복귀했다." };
    }
    const injury = { ...createInjury(5, true), severity: "major", daysRemaining: random(5, 8) };
    addInjury(victim, injury, 15, state.day);
    expedition.outcomes.push({ type: "injury", title: "강행 후 중상", text: `${victim.name}: ${injury.name}, 전투 -1` });
    return { ok: true, type: "bad", message: "원정을 강행했지만 대원이 중상을 입었다." };
  }

  const faction = state.factions[event.factionId];
  if (choiceId === "negotiate") {
    const leader = members.find((member) => member.id === expedition.leaderId) ?? members[0];
    const success = getStat(leader, "leadership") + random(1, 6) >= 9;
    faction.relation = Math.max(-100, Math.min(100, faction.relation + (success ? 5 : -3)));
    expedition.outcomes.push({ type: success ? "good" : "hostile", title: `${faction.name} 협상`, text: success ? "충돌 없이 정보를 교환했다." : "협상이 결렬되어 관계가 악화됐다." });
    return { ok: true, type: success ? "good" : "bad", message: success ? "협상에 성공했다." : "협상이 결렬됐다." };
  }
  if (choiceId === "trade") {
    if (state.resources.silver < 4) return { ok: false, message: "현장 거래에는 은 4가 필요합니다." };
    state.resources.silver -= 4;
    state.resources.medicine += 1;
    faction.relation = Math.min(100, faction.relation + 2);
    expedition.outcomes.push({ type: "good", title: "현장 거래", text: "은 4를 내고 의약품 1을 샀다." });
    return { ok: true, type: "good", message: "현장 거래를 마쳤다." };
  }
  if (choiceId === "avoid") {
    if (state.resources.food < 2) return { ok: false, message: "우회에는 식량 2가 필요합니다." };
    state.resources.food -= 2;
    expedition.outcomes.push({ type: "info", title: "충돌 회피", text: "식량 2를 소모해 우회했다." });
    return { ok: true, message: "상대 정찰대를 피해 우회했다." };
  }
  const contact = event.contact ?? rollContact({ situation: "faction", day: state.day, faction });
  const result = resolveFactionCombat({ members, faction, tactic: state.battleTactic, ammo: state.resources.ammo, contact, day: state.day });
  state.resources.ammo -= result.ammoUsed;
  const consequence = applyCombatConsequences(members, result, faction.name);
  faction.relation = Math.max(-100, faction.relation - 35);
  faction.retaliationDays = 4;
  expedition.outcomes.push({ type: result.outcome === "victory" ? "good" : "hostile", title: `${contactLine(result.encounter)} 전투`, text: `${combatOutcomeName(result.outcome)} · ${describeAmmo(result.expectedAmmo, result.ammoUsed)} · ${consequence.notes.join(" ")}` });
  return { ok: true, type: result.outcome === "victory" ? "good" : "bad", message: `${faction.name}과(와) 전투했다.` };
}

function resolveNightContact(watchers, defense, day) {
  const contact = state.nightContact ?? rollNightContact(day, state.factions);
  const plan = planAmmo(contact, watchers, "defense");
  const used = Math.min(state.resources.ammo, plan.expected);
  const shortfall = plan.expected > 0 ? 1 - used / plan.expected : 0;
  state.resources.ammo -= used;
  const heldDefense = defense * (shortfall > 0 ? .75 + .25 * (1 - shortfall) : 1);
  const ammoText = describeAmmo(plan.expected, used);
  if (heldDefense >= contact.power) {
    return { type: "good", text: `${contactLine(contact)} 접근. ${ammoText}. 방어선이 버텼다.` };
  }

  const gap = contact.power - heldDefense;
  const foodLoss = Math.min(state.resources.food, contact.kind === "bandits" ? random(2, 4) : contact.kind === "faction" ? random(1, 3) : random(1, 2));
  state.resources.food -= foodLoss;
  const materialLost = contact.kind === "faction" && state.resources.material > 0 ? 1 : 0;
  state.resources.material -= materialLost;
  const [damageMin, damageMax] = damageRange(contact, { shortfall, guns: plan.guns });
  const boost = gap > 6 ? 1.2 : 1;
  const pool = watchers.length ? watchers : state.members.filter((member) => member.task !== "원정");
  const hits = Math.min(pool.length, gap > 6 ? 2 : 1);
  const injured = [];
  const candidates = [...pool];
  for (let index = 0; index < hits && candidates.length; index += 1) {
    const victim = weightedPick(candidates, injuryChanceFactor);
    candidates.splice(candidates.indexOf(victim), 1);
    const rolled = Math.round(random(damageMin, damageMax) * boost);
    const injury = createInjury(contact.kind === "zombies" ? 2 : 4, rolled >= Math.ceil((damageMin + damageMax) / 2));
    const injuryResult = addInjury(victim, injury, rolled, day);
    injured.push(`${victim.name} ${injury.name} 체력 ${injuryResult.damage}`);
  }
  state.members.filter((member) => member.task !== "원정").forEach((member) => applyMood(member, adjustCrisisMood(member, -4), "야간 침입", day));
  const losses = [foodLoss ? `식량 ${foodLoss}` : "", materialLost ? `자재 ${materialLost}` : ""].filter(Boolean).join(", ");
  return {
    type: "bad",
    text: `${contactLine(contact)} 접근. ${ammoText}. 방어가 뚫렸다.${losses ? ` ${losses}을 잃었다.` : ""} ${injured.join(", ") || "인명 피해는 없었다"}.`,
  };
}

function processMemberFights(day) {
  const home = state.members.filter((member) => member.task !== "원정");
  if (home.length < 2) return [];
  let hottest = null;
  for (let i = 0; i < home.length; i += 1) {
    for (let j = i + 1; j < home.length; j += 1) {
      const tension = pairTension(home[i], home[j]);
      if (!hottest || tension > hottest.tension) hottest = { first: home[i], second: home[j], tension };
    }
  }
  if (!hottest || Math.random() > Math.min(.2, .025 + hottest.tension)) return [];
  return resolveMemberFight(hottest.first, hottest.second, day);
}

function pairTension(first, second) {
  const relation = (first.relationships?.[second.id] ?? 0) + (second.relationships?.[first.id] ?? 0);
  let tension = 0;
  if (relation <= -40) tension += .16;
  else if (relation <= -16) tension += .08;
  if (traitsClash(first, second)) tension += .07;
  if (first.trait === "다혈질" || second.trait === "다혈질") tension += .05;
  if ((first.mood ?? 70) <= 25 || (second.mood ?? 70) <= 25) tension += .04;
  if (["냉정", "자비", "충직"].includes(first.trait) && ["냉정", "자비", "충직"].includes(second.trait)) tension -= .03;
  return Math.max(0, tension);
}

function resolveMemberFight(first, second, day) {
  const firstPower = getStat(first, "combat") + combatBonus(first, { battle: true }) + random(0, 4);
  const secondPower = getStat(second, "combat") + combatBonus(second, { battle: true }) + random(0, 4);
  const loser = firstPower === secondPower ? pick([first, second]) : (firstPower < secondPower ? first : second);
  const winner = loser === first ? second : first;
  const loserDamage = random(10, 22);
  const loserInjury = createInjury(loserDamage >= 16 ? 4 : 2, loserDamage >= 16);
  const loserResult = addInjury(loser, loserInjury, loserDamage, day);
  let winnerNote = "";
  if (Math.random() < .4) {
    const winnerDamage = random(4, 10);
    const winnerInjury = createInjury(1, false);
    const winnerResult = addInjury(winner, winnerInjury, winnerDamage, day);
    winnerNote = ` ${winner.name}도 ${winnerInjury.name}으로 체력 ${winnerResult.damage}을 잃었다.`;
  }
  const drop = random(6, 12);
  first.relationships[second.id] = Math.max(-100, (first.relationships[second.id] ?? 0) - drop);
  second.relationships[first.id] = Math.max(-100, (second.relationships[first.id] ?? 0) - drop);
  applyMood(first, -5, "구성원 싸움", day);
  applyMood(second, -5, "구성원 싸움", day);
  state.members
    .filter((member) => member !== first && member !== second && member.task !== "원정")
    .forEach((member) => {
      if (!shieldsSocialGrief(member)) applyMood(member, adjustCrisisMood(member, -2), "거점 싸움", day);
    });

  const relation = (first.relationships[second.id] ?? 0) + (second.relationships[first.id] ?? 0);
  const deathChance = state.members.length > 2
    ? Math.min(.14, .045 + (relation <= -70 ? .04 : 0) + (first.trait === "다혈질" || second.trait === "다혈질" ? .03 : 0) + (loser.hp < 35 ? .04 : 0))
    : 0;
  if (Math.random() < deathChance) {
    const text = `${first.name}과(와) ${second.name}의 싸움이 번졌다. ${loser.name}이(가) 사망했다.`;
    state.logs.unshift({ day, type: "bad", text });
    dismissMember(loser, day, "사망");
    return [text];
  }
  const text = `${first.name}과(와) ${second.name}이(가) 몸싸움을 벌였다. ${loser.name} ${loserInjury.name}, 체력 ${loserResult.damage}.${winnerNote}`;
  state.logs.unshift({ day, type: "bad", text });
  return [text];
}

function dismissMember(member, day, cause) {
  unequipSlot(member, null, state.inventory);
  const id = member.id;
  state.members = state.members.filter((item) => item.id !== id);
  state.squad = state.squad.filter((item) => Number(item) !== id);
  state.battleTeam = state.battleTeam.filter((item) => Number(item) !== id);
  if (state.expedition?.members) state.expedition.members = state.expedition.members.filter((item) => item !== id);
  if (state.expelTargetId === id) state.expelTargetId = null;
  if (state.leaderTargetId === id) state.leaderTargetId = null;
  state.members.forEach((other) => {
    if (shieldsSocialGrief(other)) return;
    const relation = other.relationships?.[id] ?? 0;
    let amount = cause === "방출" ? (relation >= 20 ? -6 : relation <= -20 ? -1 : -3) : -7;
    if (cause === "방출" && other.trait === "자비") amount -= 2;
    if (cause === "방출" && other.trait === "충직") amount -= 3;
    applyMood(other, adjustCrisisMood(other, amount), cause === "방출" ? `${member.name} 방출` : `${member.name} 사망`, day);
  });
  ensureFactionLeader();
}

function applyCombatConsequences(members, result, sourceName) {
  const notes = [];
  members.forEach((member) => {
    if (Math.random() < result.casualtyRisk * injuryChanceFactor(member)) {
      const rolled = random(result.damageMin ?? 7, result.damageMax ?? 16);
      const injury = createInjury(result.outcome === "defeat" ? 5 : 3, rolled >= Math.ceil(((result.damageMin ?? 7) + (result.damageMax ?? 16)) / 2));
      const injuryResult = addInjury(member, injury, rolled, state.day);
      notes.push(`${member.name} ${injury.name} · 체력 ${injuryResult.damage}.`);
    }
  });
  const battleMood = result.outcome === "defeat" ? -4 : result.outcome === "retreat" ? -2 : 0;
  members.forEach((member) => {
    if (member.trait === "겁쟁이") applyMood(member, -2, "전투 동원", state.day);
    if (member.trait === "다혈질" && battleMood) applyMood(member, battleMood - 2, result.outcome === "defeat" ? "전투 패배" : "전투 퇴각", state.day);
    else if (battleMood) applyMood(member, adjustCrisisMood(member, battleMood), result.outcome === "defeat" ? "전투 패배" : "전투 퇴각", state.day);
  });
  if (state.members.length > 2 && members.length && Math.random() < result.deathRisk) {
    const living = members.filter((member) => state.members.includes(member));
    const victim = weightedPick(living.length ? living : members, injuryChanceFactor);
    state.members = state.members.filter((member) => member.id !== victim.id);
    notes.push(`${victim.name} 사망.`);
    state.members.forEach((member) => {
      if (!shieldsSocialGrief(member)) applyMood(member, adjustCrisisMood(member, -8), `${sourceName} 전투 사망`, state.day);
    });
    ensureFactionLeader();
  }
  if (!notes.length) notes.push("인명 피해 없음.");
  return { notes };
}

function processMercenaryContracts() {
  const notes = [];
  const leaving = [];
  state.members.filter((member) => member.membership === "mercenary").forEach((member) => {
    if (state.resources.silver < member.contract.dailySilver) {
      leaving.push(member);
      notes.push(`${member.name}의 일당 은을 지급하지 못해 용병이 떠났다.`);
      return;
    }
    state.resources.silver -= member.contract.dailySilver;
    member.contract.daysRemaining -= 1;
    if (member.contract.daysRemaining <= 0) {
      leaving.push(member);
      notes.push(`${member.name}의 용병 계약이 만료됐다.`);
    }
  });
  leaving.forEach((member) => unequipSlot(member, null, state.inventory));
  state.members = state.members.filter((member) => !leaving.includes(member));
  return notes;
}

function findWorstRelationshipPair() {
  let result = null;
  let worst = 0;
  state.members.forEach((member) => {
    state.members.forEach((other) => {
      if (member.id >= other.id) return;
      const value = (member.relationships[other.id] ?? 0) + (other.relationships[member.id] ?? 0);
      if (value < worst) {
        worst = value;
        result = [member, other];
      }
    });
  });
  return result;
}

function reduceExpeditionLoot(ratio) {
  Object.entries(state.expedition.loot).forEach(([resource, amount]) => {
    const lost = Math.floor(amount * ratio);
    state.expedition.loot[resource] -= lost;
    state.resources[resource] = Math.max(0, state.resources[resource] - lost);
  });
}

function combatOutcomeName(outcome) {
  return { victory: "승리", retreat: "퇴각", defeat: "패배" }[outcome] ?? outcome;
}

function leaderChangeReactions(previous, next, day) {
  const lines = [];
  const react = (member, amount, text) => {
    const adjusted = applyMood(member, amount, text, day);
    if (member !== next && amount !== 0) {
      const relationDelta = amount < 0 ? Math.max(-5, Math.round(amount / 2)) : Math.min(3, Math.round(amount / 2));
      shiftRelation(member, next, relationDelta);
    }
    member.history.push(`${day}일 차, ${text}`);
    lines.push({ name: member.name, text, amount: adjusted });
  };

  const nextMood = {
    야심: [6, `${topic(next)} 자신이 리더가 된 것에 만족한다`],
    겁쟁이: [-4, `${topic(next)} 리더가 된 것이 두렵다`],
    만학: [2, `${topic(next)} 늦게라도 맡은 자리를 받아들이며 만족한다`],
    사이코패스: [1, `${topic(next)} 리더 자리를 담담히 받아들인다`],
    충직: [3, `${topic(next)} 맡겨진 리더 자리를 받아들이며 만족한다`],
    낙천: [3, `${topic(next)} 앞장서게 된 것을 좋게 여긴다`],
    냉정: [1, `${topic(next)} 필요한 자리라며 담담히 리더를 맡는다`],
    자비: [2, `${topic(next)} 사람들을 지키겠다며 리더를 맡는다`],
    다혈질: [2, `${topic(next)} 자신이 끌어야 한다며 자리를 잡는다`],
    생존본능: [2, `${topic(next)} 직접 결정하는 편이 안전하다고 여긴다`],
    외톨이: [-5, `${topic(next)} 리더가 된 것이 부담스럽다`],
  };
  const previousMood = {
    야심: [-8, `${topic(previous)} ${subject(next)} 리더를 맡는 것에 크게 불만이다`],
    겁쟁이: [3, `${topic(previous)} 책임에서 벗어나 안도한다`],
    만학: [-2, `${topic(previous)} 자리를 넘긴 것이 아쉽다`],
    사이코패스: [1, `${topic(previous)} 리더 자리에서 빠져 홀가분하다`],
    다혈질: [-6, `${topic(previous)} ${subject(next)} 리더가 된 것에 화가 났다`],
    냉정: [-2, `${topic(previous)} 리더가 바뀐 것을 담담히 받아들인다`],
    자비: [-3, `${topic(previous)} 사람들을 직접 챙기지 못하게 되어 마음에 걸린다`],
    생존본능: [-4, `${topic(previous)} 결정권을 잃은 것이 불안하다`],
    충직: [1, `${topic(previous)} 리더 자리를 넘긴 뒤에도 공동체를 따르겠다며 담담하다`],
    낙천: [2, `${topic(previous)} 어깨가 가벼워졌다며 만족한다`],
    외톨이: [4, `${topic(previous)} 리더에서 벗어나 한숨 돌리며 만족한다`],
  };
  react(next, ...(nextMood[next.trait] ?? [2, `${topic(next)} 리더가 된 것을 받아들인다`]));
  react(previous, ...(previousMood[previous.trait] ?? [-3, `${topic(previous)} ${subject(next)} 리더를 맡는 것에 불만이다`]));
  state.members.filter((member) => member !== next && member !== previous).forEach((member) => {
    react(member, ...witnessLeaderReaction(member, previous, next));
  });
  return lines;
}

function witnessLeaderReaction(member, previous, next) {
  const towardNext = member.relationships?.[next.id] ?? 0;
  const towardPrevious = member.relationships?.[previous.id] ?? 0;
  const name = topic(member);
  if (member.trait === "야심") return [-6, `${name} 자신이 아닌 ${subject(next)} 리더를 맡은 것에 불만이다`];
  if (member.trait === "충직") {
    if (towardPrevious >= 15) return [-6, `${name} ${subject(previous)} 리더에서 물러난 것에 불만이다`];
    if (towardNext >= 15 || getStat(next, "leadership") >= getStat(previous, "leadership")) return [4, `${name} ${subject(next)} 리더를 맡은 것에 만족한다`];
    return [2, `${name} 리더가 정해진 것에 안도한다`];
  }
  if (member.trait === "겁쟁이") return [-3, `${name} 리더가 바뀌면 거점이 불안해질까 걱정한다`];
  if (member.trait === "사이코패스") return [-1, `${name} 누가 리더가 되든 시큰둥하다`];
  if (member.trait === "만학") return [1, `${name} 리더가 바뀐 것을 지켜본다`];
  if (member.trait === "냉정") {
    return getStat(next, "leadership") >= getStat(previous, "leadership")
      ? [3, `${name} ${subject(next)} 리더로 더 낫다며 만족한다`]
      : [-4, `${name} ${subject(next)} 리더를 맡기에는 부족하다며 불만이다`];
  }
  if (member.trait === "낙천") return [3, `${name} 리더가 바뀐 것에 만족한다`];
  if (member.trait === "자비") {
    return ["다혈질", "야심"].includes(previous.trait)
      ? [3, `${name} ${previous.name} 대신 ${subject(next)} 리더가 된 것에 만족한다`]
      : [-2, `${name} 사람들이 흔들릴까 걱정한다`];
  }
  if (member.trait === "다혈질") {
    if (towardNext <= -10) return [-6, `${name} ${subject(next)} 리더가 되는 것을 못 봐 주겠다며 불만이다`];
    if (towardNext >= 15) return [3, `${name} ${subject(next)} 앞장서는 것이 마음에 든다`];
    return [-3, `${name} 갑자기 리더가 바뀐 것이 거슬린다`];
  }
  if (member.trait === "외톨이") return [-2, `${name} 리더 문제로 소란스러워진 것이 싫다`];
  if (member.trait === "생존본능") {
    const score = (person) => getStat(person, "mental") + getStat(person, "combat");
    return score(next) >= score(previous)
      ? [3, `${name} ${subject(next)} 리더가 되면 더 안전하다며 만족한다`]
      : [-4, `${name} 리더가 바뀌면 거점이 위험해진다며 불만이다`];
  }
  if (towardNext >= 20) return [3, `${name} ${subject(next)} 리더가 된 것에 만족한다`];
  if (towardNext <= -10) return [-4, `${name} ${subject(next)} 리더를 맡는 것에 불만이다`];
  return [1, `${name} 리더가 바뀐 것을 지켜본다`];
}

function shiftRelation(from, to, amount) {
  if (!amount || from.relationships?.[to.id] == null) return;
  from.relationships[to.id] = Math.max(-100, Math.min(100, from.relationships[to.id] + amount));
}

function topic(member) {
  return `${member.name}${josa(member.name, "은", "는")}`;
}

function subject(member) {
  return `${member.name}${josa(member.name, "이", "가")}`;
}

function routeLeader() {
  const squadLeader = state.members.find((member) => member.id === state.expeditionLeaderId && state.squad.includes(member.id));
  return squadLeader ?? state.members.find((member) => member.leader) ?? null;
}

function settleCowardRisk() {
  const leader = routeLeader();
  if (leader?.trait !== "겁쟁이" || state.riskPolicy !== "risky") return;
  state.riskPolicy = "safe";
  toast(`${leader.name}${josa(leader.name, "은", "는")} 겁쟁이라 위험 감수를 유지할 수 없습니다. 안전 우선으로 바꿨습니다.`);
}

function josa(name, withBatchim, withoutBatchim) {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return withoutBatchim;
  const batchim = (code - 0xac00) % 28;
  if (withBatchim === "으로" && (batchim === 0 || batchim === 8)) return "로";
  return batchim ? withBatchim : withoutBatchim;
}

function ensureFactionLeader() {
  if (state.members.some((member) => member.leader) || !state.members.length) return;
  const successor = [...state.members].sort((a, b) => getStat(b, "leadership") - getStat(a, "leadership"))[0];
  successor.leader = true;
  successor.history.push(`${state.day}일 차, 사망한 리더의 뒤를 이어 세력 리더가 되었다.`);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}
const RESOURCE_NAMES = { food: "식량", material: "자재", medicine: "의약품", ammo: "탄약", silver: "은" };

function resolveRecruitment(expedition, leader, leadership) {
  if (state.members.length >= barracksCapacity()) {
    expedition.outcomes.push({ type: "info", title: "영입 포기", text: "막사 정원이 가득 차 생존자를 데려오지 못했다." });
    return;
  }

  const settings = {
    active: { chance: .62, affiliated: .42 },
    normal: { chance: .36, affiliated: .2 },
    passive: { chance: .14, affiliated: 0 },
  };
  const setting = settings[expedition.resolvedRecruit];
  const recruitChance = setting.chance + leadership * .018;
  if (Math.random() >= recruitChance) {
    expedition.outcomes.push({ type: "info", title: "생존자 흔적", text: "사람의 흔적을 찾았지만 접촉하거나 설득하지 못했다." });
    return;
  }

  const affiliated = Math.random() < setting.affiliated;
  const faction = affiliated
    ? (Math.random() < .5 ? state.factions.iron : state.factions.church)
    : null;
  const offer = createRecruitOffer({ source: "expedition", affiliated, faction, foundBy: leader.name });
  expedition.outcomes.push({
    type: affiliated ? "hostile" : "recruit",
    title: `${offer.member.name} 영입 검토`,
    text: affiliated
      ? `${faction.name} 소속이다. 받아들이면 그 세력이 적대가 된다.`
      : "무소속 생존자다. 확인된 정보만 보고 영입 여부를 정해야 한다.",
  });
  offer.outcomeIndex = expedition.outcomes.length - 1;
  state.pendingRecruit = offer;
}

export function acceptRecruit() {
  const offer = state.pendingRecruit;
  if (!offer) return;
  if (state.members.length >= barracksCapacity()) {
    toast("막사 정원이 가득 찼습니다.");
    notify();
    return;
  }

  const member = offer.member;
  const affiliation = offer.affiliation;
  if (affiliation.id) {
    state.factions[affiliation.id].relation = -50;
    member.history = [`${state.day}일 차, ${affiliation.name}에서 넘어와 합류했다.`];
  } else if (offer.source === "refugees") {
    state.members.forEach((person) => applyMood(person, 2, "난민 영입", state.day));
    member.history = [`${state.day}일 차, 거점으로 찾아온 생존자로 합류했다.`];
  } else {
    member.history = [`${state.day}일 차, ${offer.foundBy}에게 발견되어 무소속 생존자로 합류했다.`];
  }

  state.members.push(member);
  ensureRelationshipsFor(member, state.members);
  const text = affiliation.id
    ? `${member.name}을(를) 받아들였다. ${affiliation.name} 관계가 적대로 떨어졌다.`
    : `${member.name}을(를) 구성원으로 영입했다.`;
  state.logs.unshift({ day: state.day, type: affiliation.id ? "bad" : "good", text });
  replaceRecruitOutcome(offer, {
    type: affiliation.id ? "hostile" : "recruit",
    title: `${member.name} 영입`,
    text,
  });
  state.pendingRecruit = null;
  toast(`${member.name}이(가) 합류했습니다.`);
  notify();
}

export function refuseRecruit() {
  const offer = state.pendingRecruit;
  if (!offer) return;
  if (offer.source === "refugees") {
    state.members.forEach((person) => {
      if (shieldsSocialGrief(person)) return;
      applyMood(person, person.trait === "자비" ? -3 : -1, "생존자 거절", state.day);
    });
  }
  state.logs.unshift({ day: state.day, type: "", text: `${offer.member.name}의 영입을 거절했다.` });
  replaceRecruitOutcome(offer, {
    type: "info",
    title: "영입 거절",
    text: `${offer.member.name}을(를) 돌려보냈다.`,
  });
  state.pendingRecruit = null;
  notify();
}

function replaceRecruitOutcome(offer, outcome) {
  const expedition = state.expedition;
  if (!expedition || offer.outcomeIndex == null) return;
  expedition.outcomes[offer.outcomeIndex] = outcome;
}

function barracksCapacity() {
  return 2 + state.facilities.find((facility) => facility.id === "barracks").level * 2;
}

function createRecruitOffer({ source, affiliated, faction, foundBy }) {
  const member = createRandomRecruit();
  member.history = [];
  member.origin = "recruit";
  member.loyalty = random(42, 68);
  const hiddenCount = random(2, 4);
  const hiddenStats = new Set();
  const statKeys = STAT_DEFINITIONS.map(({ key }) => key);
  while (hiddenStats.size < hiddenCount) hiddenStats.add(pick(statKeys));
  if (Math.random() < (affiliated ? .18 : .12)) {
    const defectorFaction = faction?.id ?? pick(Object.keys(state.factions));
    member.defector = { factionId: defectorFaction, daysLeft: random(5, 8) };
  }
  return {
    member,
    source,
    foundBy,
    affiliation: faction ? { id: faction.id, name: faction.name } : { id: null, name: "무소속" },
    known: {
      trait: Math.random() >= .55,
      stats: Object.fromEntries(statKeys.map((key) => [key, !hiddenStats.has(key)])),
    },
    outcomeIndex: null,
  };
}

function processDefectors(day) {
  const notes = [];
  const leaving = new Set();
  state.members.filter((member) => member.defector && member.task !== "원정").forEach((plant) => {
    if (leaving.has(plant)) return;
    plant.defector.daysLeft -= 1;
    if (plant.defector.daysLeft > 0) return;
    const faction = state.factions[plant.defector.factionId];
    const pool = state.members.filter((member) => (
      member !== plant
      && !leaving.has(member)
      && !member.leader
      && member.membership !== "mercenary"
      && member.task !== "원정"
    ));
    const swayed = pickSwayed(plant, pool);
    const group = [plant, ...swayed];
    group.forEach((member) => leaving.add(member));
    const destination = faction?.name ?? "외부 세력";
    const text = swayed.length
      ? `${plant.name}이(가) 처음부터 ${destination} 쪽 사람이었다. ${swayed.map((member) => member.name).join(", ")}을(를) 설득해 함께 도망쳤다.`
      : `${plant.name}이(가) ${destination} 쪽 첩자였다. 야밤에 홀로 도망쳤다.`;
    notes.push(text);
    state.logs.unshift({ day, type: "bad", text });
    if (faction) faction.relation = Math.max(-100, faction.relation - 12);
  });
  if (!leaving.size) return notes;
  leaving.forEach((member) => unequipSlot(member, null, state.inventory));
  const ids = new Set([...leaving].map((member) => member.id));
  state.members = state.members.filter((member) => !ids.has(member.id));
  state.members.forEach((member) => {
    if (shieldsSocialGrief(member)) return;
    applyMood(member, adjustCrisisMood(member, leaving.size > 1 ? -7 : -4), "구성원 이탈", day);
  });
  state.squad = state.squad.filter((id) => !ids.has(Number(id)));
  state.battleTeam = state.battleTeam.filter((id) => !ids.has(Number(id)));
  ensureFactionLeader();
  return notes;
}

function pickSwayed(plant, pool) {
  if (!pool.length || Math.random() < .22) return [];
  const weight = (member) => {
    const factor = swayFactor(member);
    if (!factor) return 0;
    const relation = (member.relationships?.[plant.id] ?? 0) + 20;
    return Math.max(1, relation + (80 - (member.loyalty ?? 70))) * factor;
  };
  const open = pool.filter((member) => weight(member) > 0);
  if (!open.length) return [];
  const first = weightedPick(open, weight);
  const swayed = [first];
  const rest = open.filter((member) => member !== first);
  if (rest.length && Math.random() < .36) swayed.push(weightedPick(rest, weight));
  return swayed;
}

function weightedPick(list, weight) {
  const total = list.reduce((sum, item) => sum + weight(item), 0);
  let roll = Math.random() * total;
  for (const item of list) {
    roll -= weight(item);
    if (roll <= 0) return item;
  }
  return list[list.length - 1];
}

function createRandomRecruit() {
  const id = Math.max(0, ...state.members.map((member) => member.id)) + 1;
  const gender = rollGender();
  const name = createName(gender, state.members.map((member) => member.name));
  const age = random(16, 68);
  const trait = pick(RECRUIT_TRAITS);
  return createMember(id, name, age, trait, rollJob(age), rollStatsForAge(age, trait), false, gender);
}

function rollGender() {
  return Math.random() < 0.5 ? "male" : "female";
}

function createName(gender, excluded = []) {
  const endings = gender === "female" ? FEMALE_GIVEN_LAST : MALE_GIVEN_LAST;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const surname = Math.random() < .08 ? pick(COMPOUND_SURNAMES) : pick(SURNAMES);
    const name = `${surname}${pick(GIVEN_FIRST)}${pick(endings)}`;
    if (!excluded.includes(name)) return name;
  }
  return `${pick(SURNAMES)}${pick(GIVEN_FIRST)}${pick(endings)}`;
}

function createAppearance(gender = "male") {
  const female = gender === "female";
  return {
    skin: random(1, 4),
    hair: female ? random(6, 10) : random(1, 5),
    beard: female ? 0 : random(0, BEARD_NAMES.length - 1),
    eyes: random(1, 4),
    mouth: random(1, 4),
    outfit: random(1, 5),
  };
}

function distributeLoot(destinationId, amount) {
  const loot = { food: 0, material: 0, medicine: 0, ammo: 0, silver: Math.max(1, Math.floor(amount * .25)) };
  if (destinationId === "hospital") {
    loot.medicine = Math.ceil(amount * .65);
    loot.material = amount - loot.medicine;
  } else if (destinationId === "checkpoint") {
    loot.ammo = Math.ceil(amount * .6);
    loot.material = amount - loot.ammo;
  } else if (["site", "factory", "school"].includes(destinationId)) {
    loot.material = Math.ceil(amount * .7);
    loot.food = amount - loot.material;
  } else {
    loot.food = Math.ceil(amount * .7);
    loot.material = amount - loot.food;
  }
  return loot;
}
