export const TASKS = ["휴식", "농사", "요리", "건축", "제작", "의학", "경계", "훈련"];
export const STAT_KEYS = ["정신", "전투", "요리", "농사", "건축", "손재주", "의학"];

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
  task: leader ? "경계" : "휴식", xp: 0, history: ["공동체의 창립 멤버가 되었다."],
});

const initialState = () => {
  const names = createUniqueNames(3);
  return {
  started: false,
  faction: "마지막 불씨",
  day: 1,
  morale: 67,
  resources: { food: 18, material: 12, medicine: 4, ammo: 7 },
  members: [
    createMember(1, names[0], 34, "리더십", "소방관", [7, 6, 2, 3, 5, 4, 3], true),
    createMember(2, names[1], 27, "냉정", "간호사", [6, 3, 3, 2, 2, 4, 8]),
    createMember(3, names[2], 21, "낙천", "대학생", [5, 4, 4, 6, 3, 5, 2]),
  ],
  facilities: [
    { id: "farm", name: "농지", level: 1, max: 4, description: "농사 임무의 식량 생산량 증가" },
    { id: "kitchen", name: "주방", level: 1, max: 3, description: "식사 효율과 사기 회복 증가" },
    { id: "wall", name: "방벽", level: 1, max: 5, description: "야간 방어력 증가" },
    { id: "barracks", name: "막사", level: 1, max: 5, description: "현재 수용 인원 4명" },
    { id: "clinic", name: "의무실", level: 0, max: 3, description: "부상과 감염 치료 해금" },
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
  relations: { iron: 0, church: 15, dogs: -35 },
  activeTab: "field",
  logs: [
    { day: 1, type: "good", text: "버려진 체육관에 작은 거점을 세웠다." },
    { day: 1, type: "", text: "근처에서 좀비의 울음소리가 들린다." },
  ],
  report: null,
  toast: "",
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
  member.task = TASKS.includes(task) ? task : "휴식";
  toast(`${member.name}: ${member.task} 임무 배치`);
  notify();
}

export function autoAssign() {
  const preferredTasks = ["경계", "의학", "농사", "요리", "건축", "제작"];
  const used = new Set();
  preferredTasks.forEach((task, taskIndex) => {
    let best = null;
    let bestScore = -1;
    state.members.forEach((member) => {
      if (used.has(member.id) || member.task === "원정" || member.hp < 28) return;
      const statIndex = Math.min(taskIndex + 1, 6);
      if (member.stats[statIndex] > bestScore) {
        best = member;
        bestScore = member.stats[statIndex];
      }
    });
    if (best && used.size < state.members.length) {
      best.task = task;
      used.add(best.id);
    }
  });
  state.members.filter((member) => member.hp < 28).forEach((member) => { member.task = "휴식"; });
  toast("현재 능력과 거점 상황에 맞춰 배치했습니다.");
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
  const leadership = leader.stats[0] + (leader.trait === "리더십" ? 3 : 0);
  const combat = members.reduce((sum, member) => sum + member.stats[1], 0);
  const logistics = members.reduce((sum, member) => sum + Math.max(member.stats[3], member.stats[4], member.stats[5]), 0);
  const medical = members.reduce((sum, member) => sum + member.stats[6], 0);
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
  const abilityBonus = Math.floor(logistics / Math.max(4, teamSize * 3));
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

  const injuryChance = Math.max(.04, (risky ? .24 : .08) + danger * .045 - combat * .006 - medical * .004);
  if (Math.random() < injuryChance) {
    const victim = pick(members);
    const damage = random(9, 19);
    victim.hp = Math.max(1, victim.hp - damage);
    expedition.outcomes.push({ type: "injury", title: `${victim.name} 부상`, text: `체력 ${damage} 감소 · 현재 ${victim.hp}` });
  }

  const deathChance = Math.max(0, (risky ? .055 : .008) + danger * .012 - combat * .003 - medical * .002);
  if (state.members.length > 2 && Math.random() < deathChance) {
    const candidates = members.filter((member) => member.hp > 1);
    const victim = pick(candidates);
    expedition.deadIds.push(victim.id);
    expedition.outcomes.push({ type: "death", title: `${victim.name} 사망`, text: "원정 도중 입은 치명상으로 목숨을 잃었다." });
  }

  resolveRecruitment(expedition, leader, leadership);
  const summary = expedition.outcomes.map((outcome) => outcome.title).join(", ");
  state.logs.unshift({ day: state.day, type: expedition.deadIds.length ? "bad" : "good", text: `${expedition.destination.name} 원정 결과: ${summary}` });
}

export function finishExpedition() {
  if (!state.expedition) return;
  const names = state.expedition.members.map((id) => state.members.find((m) => m.id === id)?.name).join(", ");
  state.expedition.members.filter((id) => !state.expedition.deadIds.includes(id)).forEach((id) => {
    const member = state.members.find((item) => item.id === id);
    member.task = "휴식";
    member.fatigue = Math.min(100, member.fatigue + state.expedition.destination.days * 5);
    member.xp += 4;
  });
  state.members = state.members.filter((member) => !state.expedition.deadIds.includes(member.id));
  if (!state.members.some((member) => member.leader) && state.members.length) {
    state.members.sort((a, b) => b.stats[0] - a.stats[0]);
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
  const before = { ...state.resources, morale: state.morale };
  const homeMembers = state.members.filter((member) => member.task !== "원정");
  const counts = Object.fromEntries(TASKS.map((task) => [task, homeMembers.filter((member) => member.task === task)]));
  const sumStat = (members, statIndex) => members.reduce((sum, member) => sum + member.stats[statIndex], 0);

  const foodMade = Math.floor(sumStat(counts["농사"], 3) * .7);
  const materialMade = Math.floor((sumStat(counts["건축"], 4) + sumStat(counts["제작"], 5)) * .35);
  const foodUsed = homeMembers.length;
  state.resources.food = Math.max(0, state.resources.food + foodMade - foodUsed);
  state.resources.material += materialMade;

  const defense = sumStat(counts["경계"], 1) + state.facilities.find((item) => item.id === "wall").level * 3;
  const threat = random(3, 13) + Math.floor(state.day / 4);
  let nightText = "별다른 일 없이 밤을 넘겼다.";
  let nightType = "good";
  if (defense < threat) {
    const lost = Math.min(state.resources.food, random(1, 3));
    state.resources.food -= lost;
    state.morale = Math.max(0, state.morale - 4);
    nightText = `방어선이 흔들렸다. 식량 ${lost}을 잃고 사기가 내려갔다.`;
    nightType = "bad";
  } else {
    state.morale = Math.min(100, state.morale + 1);
  }

  homeMembers.forEach((member) => {
    if (member.task === "휴식") {
      member.fatigue = Math.max(0, member.fatigue - 18);
      member.hp = Math.min(100, member.hp + 4);
    } else {
      member.fatigue = Math.min(100, member.fatigue + 7);
      member.xp += member.task === "훈련" ? 5 : 2;
      const statIndex = TASKS.indexOf(member.task) - 1;
      if (member.xp >= 10 && statIndex >= 0) {
        member.stats[Math.min(statIndex + 1, 6)] = Math.min(10, member.stats[Math.min(statIndex + 1, 6)] + 1);
        member.xp = 0;
        member.history.push(`${state.day}일 차, ${member.task} 경험으로 능력이 성장했다.`);
      }
    }
  });

  if (state.resources.food === 0) {
    state.morale = Math.max(0, state.morale - 8);
    homeMembers.forEach((member) => { member.mood = Math.max(0, member.mood - 10); });
  }

  state.day += 1;
  state.expeditionsToday = 0;
  state.logs.unshift({ day: state.day, type: nightType, text: nightText });
  state.report = {
    day: state.day - 1,
    deltas: {
      food: state.resources.food - before.food,
      material: state.resources.material - before.material,
      medicine: 0,
      morale: state.morale - before.morale,
    },
    notes: [
      `거점 인원 ${homeMembers.length}명이 식량 ${foodUsed}을 소비했다.`,
      foodMade ? `농사 담당자가 식량 ${foodMade}을 생산했다.` : "오늘은 식량을 생산하지 못했다.",
      materialMade ? `작업을 통해 자재 ${materialMade}을 확보했다.` : "자재 생산이 없었다.",
      nightText,
    ],
  };
  notify();
}

export function closeReport() {
  state.report = null;
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

  if (affiliated) {
    state.relations[faction.id] = -50;
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
    Array.from({ length: 7 }, () => random(2, 8)),
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
