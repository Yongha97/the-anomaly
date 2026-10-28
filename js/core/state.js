import {
  STAT_DEFINITIONS,
  TASK_STAT,
  addTaskExperience,
  applyMood,
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
} from "./relationship-system.js";
import { createInventory, equipItem, equipmentBonus, unequipSlot } from "./equipment-system.js";
import { canHire, createFactions, tickFactions, tradeItem } from "./faction-system.js";
import { resolveFactionCombat } from "./combat-system.js";
import { eventDefinition, rollBaseEvent, rollExpeditionEvent, setEventCooldown } from "./event-system.js";

export const TASKS = ["휴식", "농사", "요리", "건축", "제작", "의학", "경계", "훈련"];
export const STAT_KEYS = STAT_DEFINITIONS;

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"];
const GIVEN_FIRST = ["도", "서", "하", "민", "지", "유", "태", "시", "가", "현", "로", "은", "재", "수", "해"];
const GIVEN_LAST = ["윤", "진", "안", "우", "민", "연", "준", "린", "원", "호", "아", "율", "온", "빈", "혁"];
const RECRUIT_TRAITS = ["냉정", "다혈질", "낙천", "생존본능", "자비", "야심", "충직", "외톨이"];
const RECRUIT_BACKGROUNDS = ["정비공", "교사", "농부", "응급구조사", "상인", "경비원", "요리사", "일용직"];

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

const createMember = (id, name, age, trait, background, stats, leader = false) => ({
  id, name, age, trait, background, stats, leader,
  appearance: createAppearance(),
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
  const names = createUniqueNames(3);
  const members = [
    createMember(1, names[0], 34, "리더십", "소방관", createStats([7, 6, 2, 3, 5, 4, 3, 5]), true),
    createMember(2, names[1], 27, "냉정", "간호사", createStats([6, 3, 3, 2, 2, 4, 8, 4])),
    createMember(3, names[2], 21, "낙천", "대학생", createStats([5, 4, 4, 6, 3, 5, 2, 7])),
  ];
  initializeRelationships(members);
  return {
  schemaVersion: 2,
  started: false,
  faction: "마지막 불씨",
  day: 1,
  morale: 67,
  resources: { food: 18, material: 12, medicine: 4, ammo: 7 },
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
  activeTab: "field",
  membersView: "status",
  logs: [
    { day: 1, type: "good", text: "버려진 체육관에 작은 거점을 세웠다." },
    { day: 1, type: "", text: "근처에서 좀비의 울음소리가 들린다." },
  ],
  report: null,
  toast: "",
  guideDismissed: false,
  };
};

let state = initialState();
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
  const names = createUniqueNames(state.members.length);
  state.members.forEach((member, index) => {
    member.name = names[index];
    member.appearance = createAppearance();
  });
  notify();
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
      if (getStat(member, statKey) > bestScore) {
        best = member;
        bestScore = getStat(member, statKey);
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
  state.riskPolicy = ["safe", "risky", "leader"].includes(policy) ? policy : "leader";
  notify();
}

export function setRecruitPolicy(policy) {
  state.recruitPolicy = ["active", "normal", "passive", "leader"].includes(policy) ? policy : "leader";
  notify();
}

export function setExpeditionLeader(memberId) {
  const id = Number(memberId);
  if (state.squad.includes(id)) state.expeditionLeaderId = id;
  notify();
}

export function toggleSquad(memberId) {
  const id = Number(memberId);
  const index = state.squad.indexOf(id);
  if (index >= 0) {
    state.squad.splice(index, 1);
    if (state.expeditionLeaderId === id) state.expeditionLeaderId = state.squad[0] ?? null;
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
  notify();
}

export function launchExpedition() {
  if (state.expeditionsToday >= 1) {
    toast("오늘은 이미 원정대를 꾸렸습니다. 다음 날 다시 출발할 수 있습니다.");
    notify();
    return;
  }
  if (state.squad.length < 2) {
    toast("원정대는 최소 2명이 필요합니다.");
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
  const leadership = getStat(leader, "mental") + (leader.trait === "리더십" ? 3 : 0);
  const gearTotals = members.reduce((totals, member) => {
    const gear = equipmentBonus(member);
    totals.combat += gear.combat;
    totals.defense += gear.defense;
    totals.ammo += gear.ammo;
    return totals;
  }, { combat: 0, defense: 0, ammo: 0 });
  const expeditionAmmoUsed = Math.min(state.resources.ammo, gearTotals.ammo);
  const firearmPenalty = expeditionAmmoUsed < gearTotals.ammo ? .75 : 1;
  state.resources.ammo -= expeditionAmmoUsed;
  const combat = (members.reduce((sum, member) => sum + effectiveStat(member, "combat"), 0) + gearTotals.combat) * firearmPenalty;
  const logistics = members.reduce((sum, member) => sum + Math.max(
    effectiveStat(member, "farming"),
    effectiveStat(member, "building"),
    effectiveStat(member, "crafting"),
  ), 0);
  const medical = members.reduce((sum, member) => sum + effectiveStat(member, "medical"), 0);
  const scouting = members.reduce((sum, member) => sum + effectiveStat(member, "scouting"), 0);
  const resolvedRisk = state.riskPolicy === "leader"
    ? (leadership + combat / members.length >= 13 && expedition.safeRoute ? "safe" : "risky")
    : state.riskPolicy;
  const resolvedRecruit = state.recruitPolicy === "leader"
    ? (leadership >= 8 ? "active" : leadership >= 6 ? "normal" : "passive")
    : state.recruitPolicy;
  expedition.resolvedRisk = resolvedRisk === "safe" && !expedition.safeRoute ? "risky" : resolvedRisk;
  expedition.resolvedRecruit = resolvedRecruit;

  const danger = expedition.destination.danger;
  const distance = expedition.destination.days;
  const teamSize = expedition.members.length;
  const risky = expedition.resolvedRisk === "risky";
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

  const lootText = Object.entries(loot)
    .filter(([, amount]) => amount > 0)
    .map(([resource, amount]) => `${RESOURCE_NAMES[resource]} ${amount}`)
    .join(", ");
  expedition.outcomes.push({
    type: "loot",
    title: "자원 확보",
    text: `${lootText} · 적재량 ${loaded}/${expedition.carryCapacity}`,
  });
  if (expeditionAmmoUsed) {
    expedition.outcomes.push({ type: "info", title: "장비 사용", text: `총기 운용으로 탄약 ${expeditionAmmoUsed}을 사용했다.` });
  }

  const injuryChance = Math.max(.04, (risky ? .24 : .08) + danger * .045 - combat * .006 - medical * .004 - scouting * .002 - gearTotals.defense * .006);
  if (Math.random() < injuryChance) {
    const victim = pick(members);
    const damage = random(9, 19);
    const injury = createInjury(danger, risky);
    const injuryResult = addInjury(victim, injury, damage, state.day);
    expedition.outcomes.push({
      type: "injury",
      title: `${victim.name} ${injury.severity === "major" ? "중상" : "부상"}`,
      text: `${injury.name} · 체력 ${damage} 감소 · 치료 예상 ${injury.daysRemaining}일${injuryResult.combatLoss ? " · 전투 -1" : ""}`,
    });
  }

  const deathChance = Math.max(0, (risky ? .055 : .008) + danger * .012 - combat * .003 - medical * .002 - scouting * .001);
  if (state.members.length > 2 && Math.random() < deathChance) {
    const candidates = members.filter((member) => member.hp > 1);
    if (candidates.length) {
      const victim = pick(candidates);
      expedition.deadIds.push(victim.id);
      expedition.outcomes.push({ type: "death", title: `${victim.name} 사망`, text: "원정 도중 입은 치명상으로 목숨을 잃었다." });
      members.filter((member) => member.id !== victim.id).forEach((member) => {
        const relation = member.relationships[victim.id] ?? 0;
        applyMood(member, -(7 + Math.max(0, Math.floor(relation / 10))), `${victim.name} 사망`, state.day);
      });
    }
  }

  resolveRecruitment(expedition, leader, leadership);
  const eventRoll = rollExpeditionEvent({
    members,
    danger,
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
  if (!state.expedition || state.expedition.status !== "complete") return;
  const names = state.expedition.members.map((id) => state.members.find((m) => m.id === id)?.name).join(", ");
  state.expedition.members.filter((id) => !state.expedition.deadIds.includes(id)).forEach((id) => {
    const member = state.members.find((item) => item.id === id);
    member.task = "휴식";
    member.fatigue = Math.min(100, member.fatigue + state.expedition.destination.days * 5);
    member.xp.mental = (member.xp.mental ?? 0) + 4;
  });
  state.members = state.members.filter((member) => !state.expedition.deadIds.includes(member.id));
  if (!state.members.some((member) => member.leader) && state.members.length) {
    state.members.sort((a, b) => getStat(b, "mental") - getStat(a, "mental"));
    state.members[0].leader = true;
    state.members[0].history.push(`${state.day}일 차, 사망한 리더의 뒤를 이어 세력 리더가 되었다.`);
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
  if (state.pendingEvent) {
    toast("대기 중인 사건을 먼저 해결해야 합니다.");
    notify();
    return;
  }
  const before = { ...state.resources, morale: state.morale };
  const processedDay = state.day;
  const homeMembers = state.members.filter((member) => member.task !== "원정");
  const counts = Object.fromEntries(TASKS.map((task) => [task, homeMembers.filter((member) => member.task === task)]));
  const sumEffective = (members, statKey) => members.reduce((sum, member) => sum + effectiveStat(member, statKey), 0);
  const reportNotes = [];

  const foodMade = Math.floor(sumEffective(counts["농사"], "farming") * .7);
  const materialMade = Math.floor((sumEffective(counts["건축"], "building") + sumEffective(counts["제작"], "crafting")) * .35);
  const foodUsed = homeMembers.length;
  state.resources.food = Math.max(0, state.resources.food + foodMade - foodUsed);
  state.resources.material += materialMade;

  const defense = sumEffective(counts["경계"], "combat")
    + sumEffective(counts["경계"], "scouting") * .5
    + state.facilities.find((item) => item.id === "wall").level * 3;
  const threat = random(3, 13) + Math.floor(state.day / 4);
  let nightText = "별다른 일 없이 밤을 넘겼다.";
  let nightType = "good";
  if (defense < threat) {
    const lost = Math.min(state.resources.food, random(1, 3));
    state.resources.food -= lost;
    homeMembers.forEach((member) => applyMood(member, -4, "불안한 야간 방어", processedDay));
    nightText = `방어선이 흔들렸다. 식량 ${lost}을 잃고 구성원 무드가 내려갔다.`;
    nightType = "bad";
  }

  reportNotes.push(...applyTaskRelationshipMood(homeMembers, processedDay));
  homeMembers.forEach((member) => {
    if (member.burnoutDays > 0) member.task = "휴식";
    if (member.task === "휴식") {
      member.fatigue = Math.max(0, member.fatigue - 18);
      member.hp = Math.min(100, member.hp + 4);
      applyMood(member, 2, "충분한 휴식", processedDay);
    } else {
      member.fatigue = Math.min(100, member.fatigue + 7);
      const growth = addTaskExperience(member, member.task, member.task === "훈련" ? 5 : 2, processedDay);
      if (growth) reportNotes.push(growth);
      if (member.fatigue >= 75) applyMood(member, -2, "과로", processedDay);
    }
  });

  if (state.resources.food === 0) {
    homeMembers.forEach((member) => applyMood(member, -10, "식량 고갈", processedDay));
    reportNotes.push("식량이 바닥나 모든 구성원의 무드가 감소했다.");
  }

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
  state.morale = state.members.length
    ? Math.round(state.members.reduce((sum, member) => sum + member.mood, 0) / state.members.length)
    : 0;
  state.day += 1;
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
  if (state.resources.food < offer.foodCost) {
    toast(`고용 식량이 ${offer.foodCost - state.resources.food} 부족합니다.`);
    notify();
    return;
  }
  state.resources.food -= offer.foodCost;
  const id = Math.max(0, ...state.members.map((member) => member.id)) + 1;
  const mercenary = createMember(
    id,
    `${offer.name} ${id}`,
    random(22, 45),
    "충직",
    faction.name,
    createStats({ mental: 6, combat: offer.combat, medical: 3, scouting: offer.scouting, crafting: 3 }),
  );
  mercenary.membership = "mercenary";
  mercenary.contract = { factionId, daysRemaining: offer.days, dailyFood: 1 };
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
  state.membersView = view === "equipment" ? "equipment" : "status";
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
  const result = resolveFactionCombat({ members, faction, tactic: state.battleTactic, ammo: state.resources.ammo });
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
      if (state.resources.ammo < 3) return { ok: false, message: "탄약이 3개 필요합니다." };
      state.resources.ammo -= 3;
      return { ok: true, type: "good", message: "집중 사격으로 방어벽 돌파를 막았다." };
    }
    if (choiceId === "abandon") {
      state.resources.food = Math.max(0, state.resources.food - 3);
      state.resources.material = Math.max(0, state.resources.material - 2);
      state.members.forEach((member) => applyMood(member, -3, "방어벽 후퇴", state.day));
      return { ok: true, type: "bad", message: "인명 피해는 피했지만 식량 3과 자재 2를 잃었다." };
    }
    const defenders = state.members.filter((member) => member.task !== "원정");
    const result = resolveFactionCombat({ members: defenders, faction: { power: 16 + Math.floor(state.day / 3) }, tactic: "defense", ammo: state.resources.ammo });
    state.resources.ammo -= result.ammoUsed;
    const consequence = applyCombatConsequences(defenders, result, "좀비 무리");
    return { ok: true, type: result.outcome === "victory" ? "good" : "bad", message: `방어 결과 ${combatOutcomeName(result.outcome)}. ${consequence.notes.join(" ")}` };
  }

  if (event.id === "refugees") {
    if (choiceId === "accept") {
      const capacity = 2 + state.facilities.find((facility) => facility.id === "barracks").level * 2;
      if (state.members.length >= capacity) return { ok: false, message: "막사 정원이 가득 찼습니다." };
      const recruit = createRandomRecruit();
      state.members.push(recruit);
      ensureRelationshipsFor(recruit, state.members);
      state.members.forEach((member) => applyMood(member, 2, "난민 구조", state.day));
      return { ok: true, type: "good", message: `${recruit.name}을(를) 새로운 구성원으로 받아들였다.` };
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
    const success = getStat(leader, "mental") + random(1, 6) >= 9;
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
    const success = getStat(leader, "mental") + random(1, 6) >= 9;
    faction.relation = Math.max(-100, Math.min(100, faction.relation + (success ? 5 : -3)));
    expedition.outcomes.push({ type: success ? "good" : "hostile", title: `${faction.name} 협상`, text: success ? "충돌 없이 정보를 교환했다." : "협상이 결렬되어 관계가 악화됐다." });
    return { ok: true, type: success ? "good" : "bad", message: success ? "협상에 성공했다." : "협상이 결렬됐다." };
  }
  if (choiceId === "trade") {
    if (state.resources.food < 2) return { ok: false, message: "현장 거래에는 식량 2가 필요합니다." };
    state.resources.food -= 2;
    state.resources.medicine += 1;
    faction.relation = Math.min(100, faction.relation + 2);
    expedition.outcomes.push({ type: "good", title: "현장 거래", text: "식량 2를 의약품 1로 교환했다." });
    return { ok: true, type: "good", message: "현장 거래를 마쳤다." };
  }
  if (choiceId === "avoid") {
    if (state.resources.food < 2) return { ok: false, message: "우회에는 식량 2가 필요합니다." };
    state.resources.food -= 2;
    expedition.outcomes.push({ type: "info", title: "충돌 회피", text: "식량 2를 소모해 우회했다." });
    return { ok: true, message: "상대 정찰대를 피해 우회했다." };
  }
  const result = resolveFactionCombat({ members, faction, tactic: state.battleTactic, ammo: state.resources.ammo });
  state.resources.ammo -= result.ammoUsed;
  const consequence = applyCombatConsequences(members, result, faction.name);
  faction.relation = Math.max(-100, faction.relation - 35);
  faction.retaliationDays = 4;
  expedition.outcomes.push({ type: result.outcome === "victory" ? "good" : "hostile", title: `${faction.name} 전투`, text: `${combatOutcomeName(result.outcome)} · ${consequence.notes.join(" ")}` });
  return { ok: true, type: result.outcome === "victory" ? "good" : "bad", message: `${faction.name}과(와) 전투했다.` };
}

function applyCombatConsequences(members, result, sourceName) {
  const notes = [];
  members.forEach((member) => {
    if (Math.random() < result.casualtyRisk) {
      const injury = createInjury(result.outcome === "defeat" ? 5 : 3, result.outcome !== "victory");
      addInjury(member, injury, random(7, 16), state.day);
      notes.push(`${member.name} ${injury.name}.`);
    }
  });
  if (state.members.length > 2 && members.length && Math.random() < result.deathRisk) {
    const victim = pick(members);
    state.members = state.members.filter((member) => member.id !== victim.id);
    notes.push(`${victim.name} 사망.`);
    state.members.forEach((member) => applyMood(member, -8, `${sourceName} 전투 사망`, state.day));
    ensureFactionLeader();
  }
  if (!notes.length) notes.push("인명 피해 없음.");
  return { notes };
}

function processMercenaryContracts() {
  const notes = [];
  const leaving = [];
  state.members.filter((member) => member.membership === "mercenary").forEach((member) => {
    if (state.resources.food < member.contract.dailyFood) {
      leaving.push(member);
      notes.push(`${member.name}의 계약비를 지급하지 못해 용병이 떠났다.`);
      return;
    }
    state.resources.food -= member.contract.dailyFood;
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

function ensureFactionLeader() {
  if (state.members.some((member) => member.leader) || !state.members.length) return;
  const successor = [...state.members].sort((a, b) => getStat(b, "mental") - getStat(a, "mental"))[0];
  successor.leader = true;
  successor.history.push(`${state.day}일 차, 사망한 리더의 뒤를 이어 세력 리더가 되었다.`);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}
const RESOURCE_NAMES = { food: "식량", material: "자재", medicine: "의약품", ammo: "탄약" };

function resolveRecruitment(expedition, leader, leadership) {
  const capacity = 2 + state.facilities.find((facility) => facility.id === "barracks").level * 2;
  if (state.members.length >= capacity) {
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
  const faction = Math.random() < .5
    ? { id: "iron", name: "철문단" }
    : { id: "church", name: "성당 피난소" };
  const recruit = createRandomRecruit();
  state.members.push(recruit);
  ensureRelationshipsFor(recruit, state.members);

  if (affiliated) {
    state.factions[faction.id].relation = -50;
    recruit.history = [`${state.day}일 차, ${faction.name}에서 회유되어 합류했다.`];
    expedition.outcomes.push({
      type: "hostile",
      title: `${recruit.name} 회유`,
      text: `${faction.name} 소속 구성원을 설득해 데려왔다. ${faction.name}이 적대 상태가 되었다.`,
    });
  } else {
    recruit.history = [`${state.day}일 차, ${leader.name}에게 발견되어 무소속 생존자로 합류했다.`];
    expedition.outcomes.push({
      type: "recruit",
      title: `${recruit.name} 영입`,
      text: `무소속 생존자 · ${recruit.age}세 · ${recruit.trait} · ${recruit.background}`,
    });
  }
}

function createRandomRecruit() {
  const id = Math.max(0, ...state.members.map((member) => member.id)) + 1;
  const name = createUniqueNames(1, state.members.map((member) => member.name))[0];
  return createMember(
    id,
    name,
    random(19, 54),
    pick(RECRUIT_TRAITS),
    pick(RECRUIT_BACKGROUNDS),
    createStats(Object.fromEntries(STAT_DEFINITIONS.map(({ key }) => [key, random(2, 8)]))),
  );
}

function createUniqueNames(count, excluded = []) {
  const names = new Set(excluded);
  while (names.size < excluded.length + count) {
    names.add(`${pick(SURNAMES)}${pick(GIVEN_FIRST)}${pick(GIVEN_LAST)}`);
  }
  return [...names].slice(-count);
}

function createAppearance() {
  return {
    skin: random(1, 4),
    hair: random(1, 5),
    eyes: random(1, 4),
    mouth: random(1, 4),
    outfit: random(1, 5),
  };
}

function distributeLoot(destinationId, amount) {
  const loot = { food: 0, material: 0, medicine: 0, ammo: 0 };
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
