"use strict";

const SAVE_KEY = "ash-roster-v1";

const STATS = [
  { id: "mental", name: "정신력" },
  { id: "combat", name: "전투" },
  { id: "cook", name: "요리" },
  { id: "farm", name: "농사" },
  { id: "build", name: "건축" },
  { id: "craft", name: "손재주" },
  { id: "medic", name: "의학" },
];

const ROLES = [
  { id: "loot", name: "원정" },
  { id: "farm", name: "농사" },
  { id: "cook", name: "요리" },
  { id: "build", name: "건축·정비" },
  { id: "craft", name: "제작" },
  { id: "medic", name: "의학" },
  { id: "guard", name: "경계" },
  { id: "train", name: "훈련" },
  { id: "talk", name: "면담" },
  { id: "rest", name: "휴식" },
];

const TRAITS = [
  { id: "calm", name: "냉정", desc: "위기에서 정신력이 흔들리지 않는다.", mods: { crisisMental: 2 } },
  { id: "hot", name: "다혈질", desc: "싸움에 강하고, 거절당하면 주먹다짐으로 번지기 쉽다.", mods: { combat: 1, fightback: true } },
  { id: "sunny", name: "낙천", desc: "주변 기분을 끌어올린다.", mods: { aura: true } },
  { id: "wary", name: "의심", desc: "재능을 잘 꿰뚫지만, 본인도 쉽게 믿지 않는다.", mods: { scout: true, recruitResist: 14 } },
  { id: "lead", name: "리더십", desc: "거점에 있으면 훈련 효율이 오른다.", mods: { trainAura: true } },
  { id: "coward", name: "겁쟁이", desc: "위험한 곳을 피한다. 안전한 울타리 제안에는 약하다.", mods: { coward: true, safetySeek: true } },
  { id: "survivor", name: "생존본능", desc: "부상과 감염을 잘 버틴다.", mods: { tough: true } },
  { id: "thief", name: "손버릇", desc: "원정 수확이 좋고 충성심은 낮다.", mods: { loot: 0.28 } },
  { id: "kind", name: "자비", desc: "치료와 설득에 능하다.", mods: { medic: 1, recruitPower: 10 } },
  { id: "ambition", name: "야심", desc: "성장이 빠르다. 푸대접이면 떠난다.", mods: { growth: 1.28, ambition: true } },
  { id: "loyal", name: "충직", desc: "쉽게 배신하지 않고, 빼오기도 어렵다.", mods: { loyal: true, recruitResist: 20 } },
  { id: "lone", name: "외톨이", desc: "적은 인원 원정에서 날카롭다.", mods: { solo: true } },
  { id: "charm", name: "카리스마", desc: "사람을 끌어들이는 힘이 있다.", mods: { recruitPower: 12 } },
  { id: "para", name: "편집증", desc: "경계에 뛰어나고 마음을 잘 열지 않는다.", mods: { guard: 1, recruitResist: 10 } },
  { id: "late", name: "만학", desc: "나이가 들어도 맡은 일에서 자란다. 쇠퇴도 늦다.", mods: { lateGrowth: true } },
];

const ZONES = [
  { id: "homes", name: "주택가", days: 1, danger: 2, loot: { food: 2.4, mat: 1.6, med: 0.25, ammo: 0.15 }, zombie: 0.24, neutral: 0.28, faction: 0.08, bias: null, tags: ["dogs"] },
  { id: "school", name: "폐교", days: 2, danger: 2, loot: { food: 1.4, mat: 1.2, med: 0.45, ammo: 0.15 }, zombie: 0.2, neutral: 0.32, faction: 0.05, bias: "mental", young: true, tags: ["chapel"] },
  { id: "fields", name: "근교 농장", days: 3, danger: 2, loot: { food: 3.4, mat: 1.3, med: 0.15, ammo: 0.1 }, zombie: 0.18, neutral: 0.24, faction: 0.06, bias: "farm", tags: ["dogs"] },
  { id: "mart", name: "대형마트", days: 4, danger: 3, loot: { food: 4.2, mat: 0.8, med: 0.35, ammo: 0.25 }, zombie: 0.34, neutral: 0.16, faction: 0.1, bias: "cook", tags: ["market"] },
  { id: "site", name: "공사장", days: 5, danger: 3, loot: { food: 0.5, mat: 3.6, med: 0.15, ammo: 0.25 }, zombie: 0.3, neutral: 0.16, faction: 0.1, bias: "build", tags: ["market", "iron"] },
  { id: "hospital", name: "시립병원", days: 6, danger: 4, loot: { food: 0.7, mat: 0.8, med: 2.3, ammo: 0.2 }, zombie: 0.36, neutral: 0.18, faction: 0.12, bias: "medic", tags: ["chapel"] },
  { id: "plant", name: "폐공장", days: 6, danger: 4, loot: { food: 0.4, mat: 3.2, med: 0.2, ammo: 0.7 }, zombie: 0.32, neutral: 0.12, faction: 0.16, bias: "craft", tags: ["market"] },
  { id: "outpost", name: "군 초소", days: 7, danger: 5, loot: { food: 0.8, mat: 1.6, med: 0.45, ammo: 2.2 }, zombie: 0.34, neutral: 0.08, faction: 0.3, bias: "combat", tags: ["iron"] },
];

const FACILITIES = [
  { id: "farm", name: "농지", max: 5, mat: 6, work: 16, blurb: "식량 생산" },
  { id: "kitchen", name: "주방", max: 3, mat: 5, work: 12, blurb: "식사 효율" },
  { id: "clinic", name: "의무실", max: 3, mat: 6, work: 13, blurb: "치료" },
  { id: "workshop", name: "공방", max: 3, mat: 6, work: 13, blurb: "무기와 공구 해금" },
  { id: "wall", name: "방벽", max: 5, mat: 7, work: 15, blurb: "야간 방어" },
  { id: "bunk", name: "막사", max: 5, mat: 5, work: 13, blurb: "단계마다 수용 인원 +2" },
  { id: "warehouse", name: "창고", max: 3, mat: 6, work: 12, blurb: "보존과 물자 제작" },
  { id: "yard", name: "훈련장", max: 3, mat: 5, work: 12, blurb: "성장 속도" },
];

const RECIPES = [
  { id: "pipe", name: "쇠파이프", mat: 2, med: 0, work: 8, kind: "gear", combat: 2, desc: "전투 +2", workshop: 0 },
  { id: "machete", name: "날붙이", mat: 4, med: 0, work: 12, kind: "gear", combat: 4, desc: "전투 +4", workshop: 1 },
  { id: "toolkit", name: "공구세트", mat: 3, med: 0, work: 10, kind: "gear", build: 2, craft: 1, desc: "건축·제작 보정", workshop: 1 },
  { id: "pistol", name: "권총", mat: 4, med: 0, work: 14, kind: "gear", combat: 3, gun: true, desc: "전투 +3, 탄약이 있으면 더 강하다", workshop: 2 },
  { id: "rifle", name: "소총", mat: 6, med: 0, work: 16, kind: "gear", combat: 5, gun: true, desc: "전투 +5", workshop: 3 },
  { id: "medkit", name: "구급낭", mat: 2, med: 1, work: 8, kind: "medkit", desc: "치료에 쓴다", clinic: 1 },
  { id: "antidote", name: "해독제", mat: 2, med: 2, work: 10, kind: "antidote", desc: "감염을 잠재운다", clinic: 2 },
  { id: "surgery", name: "수술 도구", mat: 4, med: 2, work: 14, kind: "gear", medic: 2, desc: "치료 효율", clinic: 3, workshop: 1 },
  { id: "trap", name: "함정", mat: 3, med: 0, work: 8, kind: "trap", desc: "위험한 밤에 방어로 소모", workshop: 1, warehouse: 1 },
  { id: "cache", name: "보존 식량", mat: 3, med: 0, work: 8, kind: "food", desc: "식량 6", warehouse: 1 },
  { id: "ammoBox", name: "탄약 상자", mat: 3, med: 0, work: 9, kind: "ammo", desc: "탄약 4", warehouse: 2, workshop: 1 },
];

const BACKGROUNDS = {
  mental: ["상담사", "교사", "학생회장", "군종병"],
  combat: ["경호원", "복싱 동호인", "예비군 교관", "사냥 동호회"],
  cook: ["식당 주방장", "제빵사", "급식 조리원", "분식집 사장"],
  farm: ["농장 일손", "조경 기사", "화훼 농부"],
  build: ["현장 반장", "설비 기사", "목수", "전기 기사"],
  craft: ["자동차 정비사", "시계 수리공", "공방 작가", "용접공"],
  medic: ["간호사", "약사", "응급구조사", "수의대생"],
};

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "전", "홍", "고", "문", "양", "손", "배", "백", "허", "유", "남", "심", "노", "하", "곽", "성", "차", "주", "우", "구", "민", "진", "엄", "원", "천", "편", "염", "변", "채", "지", "반", "공", "현", "함", "여", "추", "도", "소", "석", "선", "설", "마", "길", "위", "표", "명", "기", "왕", "금", "옥", "육", "인", "맹", "봉", "빈", "범", "복", "팽", "감", "견", "경", "계", "고", "곡", "궁", "제갈", "남궁", "선우", "독고", "황보", "사공"];
const MALE = ["서준", "도윤", "예준", "시우", "하준", "주원", "지호", "준우", "건우", "현우", "민재", "지훈", "승민", "태윤", "유준", "은우", "시윤", "정우", "연우", "승현", "재원", "민성", "태양", "지환", "우진", "한결", "시현", "도현", "준혁", "태민", "성민", "진우", "동현", "상우", "민준", "서진", "이안", "로운", "하율", "은호", "지안", "시원", "건호", "유찬", "민호", "재민", "태현", "성훈", "동하", "승우", "현준", "지성", "민규", "우빈", "서우", "하민", "준서", "도하", "이든", "시온", "재훈", "현석", "민석", "준성", "태경", "지율", "은찬", "서호", "강현", "다온", "리안"];
const FEMALE = ["서연", "하은", "지우", "서윤", "지유", "하린", "수아", "지민", "예은", "다은", "채원", "수빈", "윤서", "지아", "소율", "하윤", "예린", "민서", "유진", "서아", "나연", "아린", "유나", "채은", "소연", "가은", "다인", "혜원", "미래", "주아", "세아", "보민", "하영", "서현", "윤아", "지혜", "수민", "예진", "유리", "다연", "소민", "채린", "하람", "서우", "윤아", "지율", "은서", "하진", "수연", "예나", "다혜", "소희", "채아", "민지", "서하", "윤지", "지효", "은채", "하은", "수현", "예서", "다온", "소윤", "채윤", "민아", "서린", "윤슬", "지안", "은별", "하늘"];
const MALE_ONE = ["준", "민", "현", "우", "진", "호", "석", "훈", "성", "재", "혁", "건", "율", "한", "솔", "람"];
const FEMALE_ONE = ["아", "린", "윤", "서", "민", "연", "주", "하", "율", "빈", "솔", "별", "나", "람", "슬", "온"];
const FOREIGN = [["알렉스", "m"], ["마리", "f"], ["켄", "m"], ["유키", "f"], ["노아", "m"], ["레나", "f"], ["하나", "f"], ["사무엘", "m"], ["에릭", "m"], ["소피아", "f"], ["이반", "m"], ["미나", "f"], ["루카", "m"], ["엘라", "f"], ["준", "m"], ["사샤", "f"], ["마르코", "m"], ["리나", "f"], ["올리버", "m"], ["나오미", "f"], ["카이", "m"], ["아이샤", "f"], ["드미트리", "m"], ["클라라", "f"]];

const QUOTES = {
  calm: "감정부터 식히고 얘기하자.",
  hot: "말 돌리지 마. 원하는 게 뭐야.",
  sunny: "같이 있으면 좀 덜 무섭겠는데.",
  wary: "달콤한 말은 많이 들었어. 근거를 보여 줘.",
  lead: "내가 가면, 남은 사람들은 누가 지키지?",
  coward: "거긴 진짜 안전한 거야? 좀비는 없어?",
  survivor: "살아남는 쪽이 옳은 쪽이지.",
  thief: "먹을 게 확실하면 생각해 볼게.",
  kind: "다친 사람은 제대로 돌보나?",
  ambition: "더 큰 이름이 될 자리라면 갈 수 있어.",
  loyal: "내 사람들은 쉽게 못 버려.",
  lone: "북적이는 곳은 질색이야.",
  charm: "재밌는 제안이네. 들어는 보지.",
  para: "따라오면 뒤를 보일 순 없어.",
  late: "이 나이에도 손은 아직 는다.",
};

const DIFF = {
  easy: { food: 26, mat: 18, med: 6, ammo: 10, morale: 70, medkits: 2, label: "이지", desc: "식량과 탄약에 여유가 있고 밤이 느슨하다." },
  normal: { food: 18, mat: 14, med: 4, ammo: 6, morale: 62, medkits: 1, label: "노말", desc: "표준 생존. 농지와 경계가 필요하다." },
  hard: { food: 12, mat: 10, med: 2, ammo: 3, morale: 52, medkits: 0, label: "하드", desc: "물자가 빠듯하고 밤이 사납다." },
};

let meta = { nextId: 1 };
let state = null;
let draft = null;
let pending = null;
const scrollMem = { roster: 0, side: 0 };

function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function vary(arr) { return pick(arr); }
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function josa(name, kind) {
  const word = String(name ?? "");
  const ch = word.charCodeAt(word.length - 1);
  const batchim = ch >= 0xac00 && ch <= 0xd7a3 && (ch - 0xac00) % 28 !== 0;
  const table = { obj: ["을", "를"], sub: ["이", "가"], topic: ["은", "는"], and: ["과", "와"] };
  const pair = table[kind] || ["", ""];
  return word + (batchim ? pair[0] : pair[1]);
}
function nid(prefix) { return (prefix || "m") + (meta.nextId++); }
function statName(id) { return STATS.find((s) => s.id === id)?.name || id; }
function traitOf(m) { return TRAITS.find((t) => t.id === m.trait) || TRAITS[0]; }
function zoneById(id) { return ZONES.find((z) => z.id === id) || ZONES[0]; }
function facilityById(id) { return FACILITIES.find((f) => f.id === id); }
function recipeById(id) { return RECIPES.find((r) => r.id === id); }
function memberById(id) { return state.members.find((m) => m.id === id); }
function factionById(id) { return state.factions.find((f) => f.id === id); }
function gearOf(m) { return state.armory.find((g) => g.uid === m.gearId) || null; }
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function xpNeed(ca, m, stat) {
  let need = 5 + Math.floor(ca * 1.15);
  if (!m || !stat) return need;
  const pa = stat.pa || ca;
  const room = pa - ca;
  const late = !!traitOf(m).mods.lateGrowth;
  if ((m.age || 0) <= 24) return need;
  if (late) return room <= 1 ? Math.round(need * 1.8) : need;
  if (room <= 1) need = Math.round(need * 3.4);
  else if (room === 2) need = Math.round(need * 2.4);
  else if (room === 3) need = Math.round(need * 1.7);
  else if (pa > 0 && ca / pa >= 0.72) need = Math.round(need * 1.45);
  return Math.max(1, need);
}
function capFor(bunk) { return 2 + (bunk || 0) * 2; }
function cap() { return capFor(state.facilities.bunk); }
function leadScore(m) {
  if (!m) return 0;
  let v = eff(m, "mental");
  if (traitOf(m).mods.trainAura) v += 4;
  if (traitOf(m).mods.recruitPower) v += Math.round(traitOf(m).mods.recruitPower / 4);
  if (m.leader) v += 1;
  return v;
}
function recipeUnlocked(r) {
  if (!r) return false;
  return (state.facilities.workshop || 0) >= (r.workshop || 0)
    && (state.facilities.clinic || 0) >= (r.clinic || 0)
    && (state.facilities.warehouse || 0) >= (r.warehouse || 0);
}
function lockText(r) {
  const bits = [];
  if ((r.workshop || 0) > (state.facilities.workshop || 0)) bits.push(`공방 ${r.workshop}단계`);
  if ((r.clinic || 0) > (state.facilities.clinic || 0)) bits.push(`의무실 ${r.clinic}단계`);
  if ((r.warehouse || 0) > (state.facilities.warehouse || 0)) bits.push(`창고 ${r.warehouse}단계`);
  return bits.join(", ");
}
function knowBand(k) {
  if (k < 20) return 0;
  if (k < 52) return 1;
  if (k < 84) return 2;
  return 3;
}
function avgKnow(m) {
  return STATS.reduce((sum, st) => sum + (m.stats[st.id].know || 0), 0) / STATS.length;
}
function onTrip(m) {
  return !!(state && state.expedition && m && state.expedition.memberIds.includes(m.id));
}
function activeRole(m) {
  if (onTrip(m)) return "loot";
  if (m.hp < 28 && m.role !== "cook" && m.role !== "medic" && m.role !== "talk") return "rest";
  return m.role;
}

function addKnow(stat, amt) {
  const before = knowBand(stat.know || 0);
  stat.know = clamp((stat.know || 0) + amt, 0, 100);
  if (knowBand(stat.know) !== before) stat.fogSpread = -1;
}

function paView(stat) {
  const k = stat.know || 0;
  if (stat.ca >= stat.pa && k >= 52) return { text: String(stat.pa), lo: stat.pa, hi: stat.pa, known: true };
  if (k < 20) return { text: "??", lo: null, hi: null, known: false };
  if (k >= 84) return { text: String(stat.pa), lo: stat.pa, hi: stat.pa, known: true };
  const spread = k >= 52 ? 2 : 4;
  if (stat.fogSpread !== spread || stat.fogLo == null) {
    const shift = rand(-1, 1);
    let lo = clamp(stat.pa - spread + shift, 1, stat.pa);
    let hi = clamp(stat.pa + spread + shift, stat.pa, 20);
    if (hi < lo) hi = lo;
    stat.fogLo = lo;
    stat.fogHi = hi;
    stat.fogSpread = spread;
  }
  const lo = stat.fogLo;
  const hi = stat.fogHi;
  return { text: lo === hi ? String(lo) : `${lo}~${hi}`, lo, hi, known: true };
}

function eff(m, statId, ctx) {
  let v = m.stats[statId].ca;
  const t = traitOf(m);
  if (statId === "combat" && t.mods.combat) v += t.mods.combat;
  if (statId === "medic" && t.mods.medic) v += t.mods.medic;
  if (statId === "mental" && ctx === "crisis" && t.mods.crisisMental) v += t.mods.crisisMental;
  if (statId === "combat" && ctx === "guard" && t.mods.guard) v += t.mods.guard;
  if (m.fatigue > 75) v -= 2;
  if (m.hp < 45) v -= 2;
  if (m.mood < 28) v -= 1;
  if (m.infected) v -= 1;
  return clamp(v, 1, 24);
}

function growthMult(m) {
  const t = traitOf(m);
  let g = 1;
  if (t.mods.growth) g *= t.mods.growth;
  const age = m.age || 30;
  if (age <= 24) g *= 1.28;
  else if (age >= 40) g *= t.mods.lateGrowth ? 0.92 : 0.7;
  g *= 1 + state.facilities.yard * 0.12;
  if (state.difficulty === "easy") g *= 1.12;
  if (state.difficulty === "hard") g *= 0.92;
  if (m.fatigue > 80) g *= 0.8;
  return g;
}

function growthStopped(m) {
  const age = m.age || 0;
  if (traitOf(m).mods.lateGrowth) return age >= 72;
  return age >= 56;
}

function declineAge(m) {
  const age = m.age || 0;
  return age >= (traitOf(m).mods.lateGrowth ? 68 : 56);
}

function naturalStat(m) {
  let best = STATS[0].id;
  STATS.forEach((st) => {
    const s = m.stats[st.id];
    const b = m.stats[best];
    if (s.pa > b.pa || (s.pa === b.pa && s.ca > b.ca)) best = st.id;
  });
  return best;
}

function secondStat(m) {
  const top = naturalStat(m);
  let best = null;
  STATS.forEach((st) => {
    if (st.id === top) return;
    if (!best) { best = st.id; return; }
    const s = m.stats[st.id];
    const b = m.stats[best];
    if (s.pa > b.pa || (s.pa === b.pa && s.ca > b.ca)) best = st.id;
  });
  return best;
}

function fitMult(m, statId) {
  const young = (m.age || 0) <= 24;
  const training = activeRole(m) === "train" && (m.trainStat || "combat") === statId;
  let g = 0.62;
  if (statId === naturalStat(m)) g = 1.35;
  else if (statId === secondStat(m)) g = 1;
  if (training) g = Math.max(g, young ? 0.95 : 0.75);
  if (young && g < 1) g = Math.max(g, 0.88);
  if ((m.stint || 0) >= 5 && statId === naturalStat(m)) g *= 1.12;
  return g;
}

function aptitude(m, stat) {
  const s = m.stats[stat];
  let score = s.ca * 3 + s.pa;
  if (stat === naturalStat(m)) score += 5;
  if ((m.age || 0) <= 24 && s.pa - s.ca >= 3) score += 2;
  if ((m.age || 0) >= 56 && !traitOf(m).mods.lateGrowth && (stat === "combat" || stat === "build" || stat === "farm")) score -= 8;
  return score;
}

function agePhase(m) {
  if (traitOf(m).mods.lateGrowth && (m.age || 0) < 72) return "만학";
  if ((m.age || 0) <= 24) return "성장기";
  if (growthStopped(m)) return "성장 멈춤";
  return "";
}

function ageHint(m) {
  const late = !!traitOf(m).mods.lateGrowth;
  if (late && (m.age || 0) >= 72) return "만학의 성장도 여기서 멈췄다. 시간이 지나면 능력이 조금씩 무뎌진다.";
  if (late && (m.age || 0) >= 68) return "만학이라 아직 맡은 일에서 자란다. 몸 쪽 능력은 슬슬 무뎌진다.";
  if (late) return "만학. 나이가 들어도 적성에 맞는 일을 오래 맡기면 자란다.";
  if ((m.age || 0) <= 24) return "성장기. 적성에 맞는 일을 며칠씩 맡기면 포텐 끝까지 갈 수 있다.";
  if (growthStopped(m)) return "56세를 지나 성장이 멈췄다. 시간이 지나면 능력이 조금씩 떨어진다.";
  return "젊은 때를 지나 포텐의 끝 몇 칸은 매우 느리다. 적성에 안 맞는 일은 거의 늘지 않는다.";
}

function noteRoleStint(m) {
  const role = activeRole(m);
  if (m.stintRole === role) m.stint = (m.stint || 0) + 1;
  else { m.stintRole = role; m.stint = 1; }
}

function ageOneDay(events) {
  state.members.forEach((m) => {
    if (m.ageClock == null) m.ageClock = rand(0, 24);
    m.ageClock += 1;
    if (m.ageClock >= 30) {
      m.ageClock = 0;
      m.age += 1;
      events.push({ type: "info", text: `${josa(displayName(m), "sub")} ${m.age}살이 되었다.` });
      addStory(m, `${m.age}세`);
      if (m.age === 56 && !traitOf(m).mods.lateGrowth) {
        events.push({ type: "info", text: `${josa(displayName(m), "topic")} 더 이상 능력이 늘지 않는다.` });
      }
      if (m.age === 72 && traitOf(m).mods.lateGrowth) {
        events.push({ type: "info", text: `${josa(displayName(m), "topic")} 만학의 성장도 여기서 멈췄다.` });
      }
    }
    if (declineAge(m)) wearDown(m, events);
  });
}

function wearDown(m, events) {
  m.wear = (m.wear || 0) + 1;
  const heavy = ["loot", "guard", "build", "farm"].includes(activeRole(m));
  const pace = (heavy ? 9 : 14) + (traitOf(m).mods.lateGrowth ? 4 : 0);
  if (m.wear < pace) return;
  m.wear = 0;
  const body = ["combat", "farm", "build"];
  const pool = heavy ? body : body.concat(["mental", "cook", "craft", "medic"]);
  const floorOf = (id) => Math.max(1, Math.round(m.stats[id].pa * (body.includes(id) ? 0.4 : 0.55)));
  const candidates = pool.filter((id) => m.stats[id].ca > floorOf(id));
  if (!candidates.length) return;
  const id = candidates.sort((a, b) => m.stats[b].ca - m.stats[a].ca)[0];
  const s = m.stats[id];
  const prev = s.ca;
  s.ca -= 1;
  s.xp = 0;
  events.push({ type: "bad", text: `${josa(displayName(m), "topic")} 나이와 함께 ${josa(statName(id), "sub")} ${prev}에서 ${s.ca}로 무뎌졌다.` });
  addStory(m, `${statName(id)} 쇠퇴`);
}

function genName(gender) {
  if (Math.random() < 0.08) {
    const pool = FOREIGN.filter((row) => row[1] === gender);
    return pick(pool)[0];
  }
  const sur = pick(SURNAMES);
  if (Math.random() < 0.09) return sur + pick(gender === "f" ? FEMALE_ONE : MALE_ONE);
  return sur + pick(gender === "f" ? FEMALE : MALE);
}

function displayName(person) {
  if (!person) return "누군가";
  const nick = String(person.nick || "").trim();
  return nick || person.name || "무명";
}

function genderLabel(gender) {
  return gender === "f" ? "여" : "남";
}

function deadLabel(entry) {
  const nick = String(entry.nick || "").trim();
  return nick || entry.name || "무명";
}

function cleanNick(person) {
  person.nick = String(person.nick || "").trim().slice(0, 16);
}

function rollPA(age) {
  let pa = rand(1, 6) + rand(1, 6) + rand(1, 6);
  if (Math.random() < 0.08) pa = rand(16, 20);
  else if (Math.random() < 0.07) pa = rand(2, 6);
  if (age <= 22) pa += 1;
  if (age >= 50) pa -= 2;
  return clamp(pa, 1, 20);
}

function rollCA(pa, age) {
  let ca = Math.round(pa * (0.3 + Math.random() * 0.48));
  if (age >= 40) ca += rand(1, 3);
  if (age <= 20) ca -= 1;
  return clamp(ca, 1, pa);
}

function createMember(opts = {}) {
  const gender = opts.gender || (Math.random() < 0.5 ? "f" : "m");
  const age = rand(opts.ageMin || 18, opts.ageMax || 55);
  const m = {
    id: opts.id || nid("m"),
    name: opts.name || genName(gender),
    nick: "",
    gender,
    age,
    trait: opts.trait || (opts.leader && Math.random() < 0.55 ? pick(["lead", "calm", "charm", "survivor"]) : pick(TRAITS).id),
    leader: !!opts.leader,
    faction: opts.faction ?? null,
    boss: !!opts.boss,
    loyalty: 50,
    mood: rand(52, 70),
    hp: rand(86, 100),
    fatigue: rand(4, 16),
    infected: false,
    role: "rest",
    zone: "homes",
    trainStat: "combat",
    talkTarget: null,
    gearId: null,
    joinedDay: 0,
    met: false,
    reserved: false,
    lowMood: 0,
    growthNote: "",
    growthNoteDay: 0,
    ageClock: rand(0, 24),
    stint: 0,
    stintRole: "rest",
    wear: 0,
    scar: Math.random() < 0.28,
    story: [],
    stats: {},
  };
  STATS.forEach((st) => {
    const pa = rollPA(age);
    m.stats[st.id] = { ca: rollCA(pa, age), pa, xp: 0, know: opts.know || 0, fogSpread: -1, fogLo: null, fogHi: null };
  });
  if (opts.bias) {
    const s = m.stats[opts.bias];
    s.pa = clamp(s.pa + rand(2, 5), 1, 20);
    s.ca = clamp(s.ca + rand(0, 2), 1, s.pa);
  }
  if (opts.leader) {
    const s = m.stats.mental;
    s.pa = Math.max(s.pa, 13);
    s.ca = clamp(Math.max(s.ca, 10), 1, s.pa);
  }
  const top = STATS.slice().sort((a, b) => m.stats[b.id].pa - m.stats[a.id].pa)[0];
  m.background = pick(BACKGROUNDS[top.id]);
  m.trainStat = top.id;
  const t = traitOf(m);
  if (t.mods.loyal) m.loyalty = rand(72, 90);
  else if (t.mods.ambition) m.loyalty = rand(28, 46);
  else m.loyalty = rand(42, 70);
  if (m.trait === "thief") m.loyalty = clamp(m.loyalty - 10, 10, 100);
  if (opts.know >= 100) STATS.forEach((st) => { m.stats[st.id].know = 100; });
  else if (opts.know > 0) STATS.forEach((st) => { m.stats[st.id].know = opts.know; });
  return m;
}

function makeGear(recipe) {
  return {
    uid: nid("g"),
    recipeId: recipe.id,
    name: recipe.name,
    kind: "gear",
    combat: recipe.combat || 0,
    build: recipe.build || 0,
    craft: recipe.craft || 0,
    medic: recipe.medic || 0,
    gun: !!recipe.gun,
  };
}

function portrait(m) {
  const h = hashStr(m.id + "|" + m.name);
  const skins = ["#f0c7a0", "#e0ac84", "#c68642", "#8d5524", "#f2d3b5", "#deb887"];
  const skin = skins[h % skins.length];
  const hair = `hsl(${h % 40} 18% ${12 + (h % 22)}%)`;
  const shirt = `hsl(${(h >> 4) % 360} 24% 34%)`;
  const female = m.gender === "f";
  const hairPath = female
    ? `<path d="M16 32 Q18 12 32 11 Q48 13 48 34 L47 50 Q32 42 17 50 Z" fill="${hair}"/>`
    : `<path d="M18 30 Q20 12 32 12 Q46 13 46 30 L44 38 Q32 30 20 38 Z" fill="${hair}"/>`;
  const beard = !female && h % 3 === 0 ? `<path d="M24 40 Q32 54 40 40 Q36 48 32 48 Q28 48 24 40" fill="${hair}"/>` : "";
  const glasses = h % 5 === 0
    ? `<rect x="22" y="30" width="8" height="6" rx="1" fill="none" stroke="#222" stroke-width="1.2"/><rect x="34" y="30" width="8" height="6" rx="1" fill="none" stroke="#222" stroke-width="1.2"/><path d="M30 33 H34" stroke="#222"/>`
    : "";
  const scar = m.scar ? `<path d="M40 26 L47 36" stroke="#a14a3a" stroke-width="1.2"/>` : "";
  return `<svg class="avatar" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="8" fill="#2a2622"/><rect y="40" width="64" height="24" fill="${shirt}"/><circle cx="32" cy="30" r="14" fill="${skin}"/>${hairPath}${beard}<circle cx="27" cy="30" r="1.4" fill="#1b1b1b"/><circle cx="37" cy="30" r="1.4" fill="#1b1b1b"/>${glasses}${scar}</svg>`;
}

function campArt() {
  const wall = state.facilities.wall;
  const farm = state.facilities.farm;
  const bunk = state.facilities.bunk;
  const tents = Array.from({ length: Math.min(5, bunk + 1) }, (_, i) => {
    const x = 28 + i * 28;
    return `<polygon points="${x},78 ${x + 12},58 ${x + 24},78" fill="#8c6239"/>`;
  }).join("");
  const crops = Array.from({ length: farm }, (_, i) => `<rect x="${210 + (i % 3) * 16}" y="${58 + Math.floor(i / 3) * 12}" width="10" height="8" rx="2" fill="#6e8b4f"/>`).join("");
  const wallH = 18 + wall * 8;
  return `<svg class="camp" viewBox="0 0 320 120">
    <rect width="320" height="120" rx="10" fill="#1d242c"/>
    <circle cx="270" cy="28" r="12" fill="#f0d7a2"/>
    <rect x="0" y="86" width="320" height="34" fill="#2a241c"/>
    <rect x="16" y="${86 - wallH}" width="14" height="${wallH}" fill="#6d655c"/>
    <rect x="150" y="${86 - wallH}" width="14" height="${wallH}" fill="#6d655c"/>
    <rect x="16" y="${78 - wallH}" width="148" height="8" fill="#8a8176"/>
    ${tents}
    <rect x="200" y="70" width="100" height="16" fill="#3e3428"/>
    ${crops}
    <circle cx="250" cy="92" r="4" fill="#e07a3d"/>
  </svg>`;
}

function condition(m) {
  if (m.infected) return "감염";
  if (m.hp < 35) return "중상";
  if (m.hp < 70) return "부상";
  if (m.fatigue > 75) return "탈진";
  return "양호";
}

function relLabel(n) {
  if (n <= -60) return "적대";
  if (n <= -25) return "험악";
  if (n < 15) return "중립";
  if (n < 45) return "우호";
  return "동맹";
}

function threatScore() {
  const diff = state.difficulty === "easy" ? 0.82 : state.difficulty === "hard" ? 1.22 : 1;
  const away = state.expedition ? 0.45 : 0;
  const alive = state.members.length;
  return (1.55 + (state.day - 1) * 0.15 + away + alive * 0.05) * diff;
}

function defenseParts() {
  const wall = state.facilities.wall * 2.5;
  let guard = 0;
  state.members.forEach((m) => {
    if (activeRole(m) === "guard") {
      const gear = gearOf(m);
      guard += eff(m, "combat", "guard") * 0.38 + (gear?.combat || 0) * 0.22;
    }
  });
  let maint = state.maint || 0;
  if (!maint && !state.project) {
    state.members.forEach((m) => {
      if (activeRole(m) === "build") {
        const gear = gearOf(m);
        maint += 1.6 + eff(m, "build") * 0.42 + (gear?.build || 0);
      }
    });
  }
  return { wall, guard, maint, base: wall + guard + maint };
}

function nightOutlook() {
  const threat = threatScore();
  const parts = defenseParts();
  const guard = parts.guard;
  const item = state.traps * 1.4 + (guard > 0 ? Math.min(state.resources.ammo, 3) * 1.7 : 0);
  const withItems = parts.base + item;
  let tone = "ok";
  let text = "방벽만으로도 조용한 밤이 예상된다.";
  if (parts.base >= threat) {
    tone = "ok";
    text = "현재 배치로 밤을 버틴다.";
  } else if (withItems >= threat) {
    tone = "mid";
    text = "함정이나 탄약을 쓰면 버틴다.";
  } else {
    tone = "bad";
    text = "이대로면 야습에 다친다. 경계를 세우거나 방벽을 올려라.";
  }
  return { threat, ...parts, withItems, tone, text };
}

function equippedSet() {
  return new Set(state.members.map((m) => m.gearId).filter(Boolean));
}

function autoEquip() {
  const used = equippedSet();
  state.members.forEach((m) => {
    if (m.gearId || m.hp <= 0) return;
    const role = activeRole(m);
    let mode = null;
    if (role === "build") mode = "build";
    else if (role === "craft") mode = "craft";
    else if (role === "loot" || role === "guard") mode = "combat";
    if (!mode) return;
    let best = null;
    let score = 0;
    state.armory.forEach((g) => {
      if (used.has(g.uid)) return;
      const s = mode === "build" ? (g.build || 0) * 2 + (g.craft || 0) : mode === "craft" ? (g.craft || 0) * 2 + (g.build || 0) : (g.combat || 0);
      if (s > score) { score = s; best = g; }
    });
    if (best) {
      m.gearId = best.uid;
      used.add(best.uid);
    }
  });
}

function addStory(m, text) {
  m.story = m.story || [];
  m.story.push(`${state.day}일차 ${text}`);
  if (m.story.length > 14) m.story.shift();
}

function gainXp(m, statId, amount, events) {
  if (!m || m.hp <= 0) return;
  const s = m.stats[statId];
  addKnow(s, statId === m.trainStat && m.role === "train" ? 8 : 10);
  if (growthStopped(m)) return;
  if (s.ca >= s.pa) {
    const training = activeRole(m) === "train" && m.trainStat === statId;
    const late = !!traitOf(m).mods.lateGrowth;
    const chance = (m.age || 0) <= 24 ? 0.04 : late ? 0.02 : 0.008;
    if (training && s.pa < 20 && eff(m, "mental") >= 13 && Math.random() < chance) {
      s.pa += 1;
      s.fogSpread = -1;
      events.push({ type: "gold", text: `${displayName(m)}, ${statName(statId)}의 한계를 깨고 포텐이 ${s.pa}이 되었다.` });
      addStory(m, `${statName(statId)} 포텐 돌파`);
    }
    return;
  }
  let amt = amount * growthMult(m) * fitMult(m, statId);
  if (state.members.some((x) => traitOf(x).mods.trainAura && activeRole(x) !== "loot" && x.hp > 0) && activeRole(m) === "train") {
    amt *= 1.12;
  }
  s.xp += amt;
  const need = xpNeed(s.ca, m, s);
  if (s.xp >= need) {
    s.xp -= need;
    const prev = s.ca;
    s.ca += 1;
    const note = `${statName(statId)} ${prev}→${s.ca}`;
    if (m.growthNoteDay === state.day && m.growthNote) m.growthNote += " · " + note;
    else m.growthNote = note;
    m.growthNoteDay = state.day;
    const capped = s.ca >= s.pa;
    events.push({
      type: "gold",
      text: capped
        ? `${displayName(m)}, ${statName(statId)} ${prev} → ${s.ca}. 포텐의 끝에 닿았다.`
        : `${displayName(m)}, ${statName(statId)} ${prev} → ${s.ca}. 아직 포텐이 남아 있다.`,
    });
    addStory(m, note);
  }
}

function hurt(m, dmg) {
  if (traitOf(m).mods.tough) dmg = Math.round(dmg * 0.72);
  m.hp = Math.max(0, m.hp - dmg);
  m.mood = clamp(m.mood - 6, 0, 100);
}

function kill(m, events, why) {
  if (!state.members.some((x) => x.id === m.id)) return;
  m.hp = 0;
  state.members = state.members.filter((x) => x.id !== m.id);
  state.dead.push({ name: m.name, nick: m.nick || "", day: state.day, why, leader: m.leader });
  state.deathsToday += 1;
  state.morale = clamp(state.morale - 14, 0, 100);
  state.members.forEach((o) => { o.mood = clamp(o.mood - 8, 0, 100); });
  events.push({ type: "bad", text: `${displayName(m)}, ${why} 쓰러졌다.` });
  if (m.leader) state.leaderDown = true;
}

function succeedLeader(events) {
  if (!state.leaderDown) return;
  state.leaderDown = false;
  if (!state.members.length) return;
  const next = state.members.slice().sort((a, b) => b.stats.mental.ca - a.stats.mental.ca)[0];
  state.members.forEach((m) => { m.leader = false; });
  next.leader = true;
  next.loyalty = Math.max(next.loyalty, 75);
  state.morale = clamp(state.morale - 18, 0, 100);
  events.push({ type: "bad", text: `${displayName(next)}, 쓰러진 리더의 명부를 이어받았다.` });
  addStory(next, "리더가 됨");
}

function projCost(id) {
  const f = facilityById(id);
  const lv = state.facilities[id];
  return { mat: f.mat + lv * 3, work: f.work + lv * 4, next: lv + 1 };
}

function pushLog(e) {
  state.log.push({ day: e.day || state.day, type: e.type || "info", text: e.text });
  if (state.log.length > 260) state.log.splice(0, state.log.length - 260);
}

function makeFactions() {
  const defs = [
    { id: "iron", name: "철문단", bossName: "강태식", bossGender: "m", desc: "무장을 앞세운 규율 집단. 초소와 공사장을 자주 돈다.", relation: 4, aggression: 0.34, bias: "combat", size: 5, cap: 8 },
    { id: "chapel", name: "성당 피난소", bossName: "오세라", bossGender: "f", desc: "치료와 보호를 내세운다. 병원과 폐교에 사람이 있다.", relation: 12, aggression: 0.16, bias: "medic", size: 5, cap: 8 },
    { id: "market", name: "시장 조합", bossName: "배춘식", bossGender: "m", desc: "물물교환으로 버티는 제작 집단.", relation: 0, aggression: 0.22, bias: "craft", size: 6, cap: 8 },
    { id: "dogs", name: "들개패", bossName: "차도윤", bossGender: "m", desc: "약한 거점을 털어 먹는 약탈 세력.", relation: -18, aggression: 0.78, bias: "combat", size: 5, cap: 8 },
  ];
  return defs.map((d) => {
    const members = [];
    const boss = createMember({ name: d.bossName, gender: d.bossGender, faction: d.id, boss: true, bias: d.bias, know: 0, ageMin: 32, ageMax: 48 });
    boss.stats[d.bias].pa = Math.max(boss.stats[d.bias].pa, 16);
    boss.stats[d.bias].ca = clamp(Math.max(boss.stats[d.bias].ca, 13), 1, boss.stats[d.bias].pa);
    boss.loyalty = 90;
    members.push(boss);
    for (let i = 1; i < d.size; i++) {
      const m = createMember({ faction: d.id, bias: d.bias, know: 0 });
      members.push(m);
    }
    return { ...d, members };
  });
}

function makeDraft() {
  const leader = createMember({ leader: true, know: 100, ageMin: 26, ageMax: 40, faction: "player" });
  leader.loyalty = 100;
  leader.mood = 68;
  const mates = [0, 1].map(() => {
    const m = createMember({ know: 74, faction: "player", ageMin: 19, ageMax: 44 });
    m.loyalty = rand(64, 82);
    return m;
  });
  return { leader, mates, factionName: draft?.factionName || "", difficulty: draft?.difficulty || "normal", leaderLocked: draft?.leaderLocked || false };
}

function cleanRealName(person) {
  const name = String(person.name || "").trim().slice(0, 12);
  person.name = name || genName(person.gender);
}

function beginGame() {
  const diff = DIFF[draft.difficulty] ? draft.difficulty : "normal";
  const pack = DIFF[diff];
  const leader = draft.leader;
  cleanRealName(leader);
  cleanNick(leader);
  draft.mates.forEach((m) => { cleanRealName(m); cleanNick(m); });
  leader.joinedDay = 0;
  leader.role = "guard";
  const mates = draft.mates;
  mates[0].role = "loot";
  mates[1].role = "loot";
  const pipe = makeGear(RECIPES[0]);
  const fighter = [leader, ...mates].slice().sort((a, b) => b.stats.combat.ca - a.stats.combat.ca)[0];
  fighter.gearId = pipe.uid;
  state = {
    version: 1,
    day: 1,
    difficulty: diff,
    factionName: (draft.factionName || "").trim().slice(0, 16) || "우리 세력",
    resources: { food: pack.food, mat: pack.mat, med: pack.med, ammo: pack.ammo },
    morale: pack.morale,
    facilities: { farm: 0, kitchen: 0, clinic: 0, workshop: 0, wall: 1, bunk: 1, yard: 0, warehouse: 0 },
    project: null,
    craft: null,
    buildPick: "farm",
    craftPick: "pipe",
    traps: 0,
    medkits: pack.medkits,
    antidotes: 0,
    armory: [pipe],
    members: [leader, ...mates],
    factions: makeFactions(),
    wanderers: [],
    log: [],
    dead: [],
    flags: {},
    starved: 0,
    maint: 0,
    cooldowns: {},
    statsRecruited: 0,
    statsPoached: 0,
    sort: "join",
    over: null,
    leaderDown: false,
    deathsToday: 0,
    nextId: meta.nextId,
    lootZone: "homes",
    expeditionLead: mates[0].id,
    expedition: null,
    ui: blankUi(),
    busy: false,
  };
  pushLog({ type: "info", text: `${state.factionName}의 명부를 열었다. 원정은 최소 두 명, 하루 한 곳이다. 막사를 올리면 수용 인원이 늘어난다.` });
  save();
  draft = makeDraft();
  render();
}

function blankUi() {
  return { panel: "expedition", view: "roster", detailId: null, report: false, help: false };
}

function save(force) {
  if (!state || (state.busy && !force)) return;
  const copy = JSON.parse(JSON.stringify(state));
  delete copy.ui;
  delete copy.busy;
  delete copy.maint;
  delete copy.leaderDown;
  delete copy.deathsToday;
  copy.nextId = meta.nextId;
  localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
}

function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Array.isArray(data.members)) return null;
    return data;
  } catch (err) {
    return null;
  }
}

function continueGame() {
  const data = readSave();
  if (!data) return;
  state = data;
  meta.nextId = state.nextId || 1000;
  state.ui = blankUi();
  state.busy = false;
  state.maint = 0;
  state.leaderDown = false;
  state.deathsToday = 0;
  state.flags = state.flags || {};
  state.cooldowns = state.cooldowns || {};
  state.wanderers = state.wanderers || [];
  state.dead = state.dead || [];
  state.lootZone = state.lootZone || "homes";
  state.expedition = state.expedition || null;
  state.expeditionLead = state.expeditionLead || (state.members.find((m) => m.leader) || state.members[0] || {}).id || null;
  state.facilities = state.facilities || {};
  state.facilities.warehouse = state.facilities.warehouse || 0;
  state.antidotes = state.antidotes || 0;
  render();
}

function wipeSave() {
  localStorage.removeItem(SAVE_KEY);
  render();
}

function backToTitle() {
  localStorage.removeItem(SAVE_KEY);
  state = null;
  meta = { nextId: 1 };
  draft = null;
  draft = makeDraft();
  render();
}

function recommend() {
  const away = state.members.filter((m) => onTrip(m));
  const ms = state.members.filter((m) => m.hp > 0 && !onTrip(m));
  ms.forEach((m) => { m.role = "rest"; });
  const resting = (m) => m.hp < 50 || m.fatigue > 78 || m.infected;
  const free = () => ms.filter((m) => m.role === "rest" && !resting(m));
  const best = (stat, pool) => (pool.length ? pool.slice().sort((a, b) => aptitude(b, stat) - aptitude(a, stat))[0] : null);
  const hurt = state.members.some((m) => m.hp < 70 || m.infected);
  const medic = best("medic", free());
  if (hurt && medic && eff(medic, "medic") >= 6) medic.role = "medic";
  const builder = best("build", free());
  if (builder && (state.project || state.facilities.farm < 1 || state.facilities.wall < 2)) builder.role = "build";
  if (state.facilities.farm > 0) {
    const farmers = free().slice().sort((a, b) => aptitude(b, "farm") - aptitude(a, "farm"));
    const count = ms.length >= 7 ? 2 : 1;
    farmers.slice(0, count).forEach((m) => { if (eff(m, "farm") >= 5) m.role = "farm"; });
  }
  if (state.resources.food > 0) {
    const cook = best("cook", free());
    if (cook && eff(cook, "cook") >= 6) cook.role = "cook";
  }
  if (state.craft) {
    const crafter = best("craft", free());
    if (crafter) crafter.role = "craft";
  }
  let guardCount = 0;
  while (guardCount < 2 && threatScore() > defenseParts().base + 0.35) {
    const guard = best("combat", free());
    if (!guard) break;
    guard.role = "guard";
    guardCount += 1;
  }
  if (!state.expedition) {
    const looters = free().slice().sort((a, b) => {
      const pen = (m) => ((m.age || 0) >= 56 && !traitOf(m).mods.lateGrowth ? -12 : 0);
      return (aptitude(b, "combat") + aptitude(b, "mental") + pen(b)) - (aptitude(a, "combat") + aptitude(a, "mental") + pen(a));
    });
    const count = ms.length >= 6 ? 3 : 2;
    looters.slice(0, count).forEach((m) => { m.role = "loot"; });
    const squad = ms.filter((m) => m.role === "loot");
    if (squad.length && !squad.some((m) => m.id === state.expeditionLead)) {
      state.expeditionLead = squad.slice().sort((a, b) => leadScore(b) - leadScore(a))[0].id;
    }
    if (!state.lootZone) state.lootZone = "homes";
  }
  if (!away.length && !ms.some((m) => m.role === "loot")) {
    const one = best("combat", free());
    if (one) one.role = "loot";
  }
  free().filter((m) => (m.age || 0) <= 24 && state.resources.food >= state.members.length * 2).slice(0, 1).forEach((m) => {
    const st = naturalStat(m);
    if (m.stats[st].pa - m.stats[st].ca >= 3) {
      m.role = "train";
      m.trainStat = st;
    }
  });
  autoEquip();
  save();
  render();
}

function startProject(id) {
  if (state.project || state.over) return;
  const f = facilityById(id);
  if (!f || state.facilities[id] >= f.max) return;
  const cost = projCost(id);
  if (state.resources.mat < cost.mat) return;
  state.resources.mat -= cost.mat;
  state.project = { id, work: 0, need: cost.work, mat: cost.mat, next: cost.next };
  pushLog({ type: "info", text: `${f.name} ${cost.next}단계 공사를 시작했다.` });
  save();
  render();
}

function cancelProject() {
  if (!state.project) return;
  const refund = Math.floor(state.project.mat * 0.5);
  state.resources.mat += refund;
  const name = facilityById(state.project.id).name;
  state.project = null;
  pushLog({ type: "info", text: `${name} 공사를 중단하고 자재 ${refund}을 돌려받았다.` });
  save();
  render();
}

function startCraft(id) {
  if (state.craft || state.over) return;
  const r = recipeById(id);
  if (!r || !recipeUnlocked(r)) return;
  if (state.resources.mat < r.mat || state.resources.med < r.med) return;
  state.resources.mat -= r.mat;
  state.resources.med -= r.med;
  state.craft = { id: r.id, work: 0, need: Math.max(6, Math.round(r.work * (1 - state.facilities.workshop * 0.12))), mat: r.mat, med: r.med };
  pushLog({ type: "info", text: `${r.name} 제작을 시작했다.` });
  save();
  render();
}

function cancelCraft() {
  if (!state.craft) return;
  const r = recipeById(state.craft.id);
  state.resources.mat += Math.floor(state.craft.mat * 0.5);
  state.resources.med += Math.floor((state.craft.med || 0) * 0.5);
  state.craft = null;
  pushLog({ type: "info", text: `${r.name} 제작을 중단했다.` });
  save();
  render();
}

function bumpRelation(f, delta, events) {
  const prev = Math.round(f.relation);
  f.relation = clamp(f.relation + delta, -100, 100);
  const next = Math.round(f.relation);
  if (prev > -40 && f.relation <= -40) events.push({ type: "bad", text: `${f.name} 쪽과 적대가 되었다. 밤길이 위험해진다.` });
  if (prev < 40 && f.relation >= 40) events.push({ type: "good", text: `${f.name} 쪽과 우호가 쌓였다.` });
  return { prev, next };
}

function aidFaction(fid, kind) {
  const f = factionById(fid);
  if (!f || state.over || state.busy) return;
  if ((state.cooldowns[fid] || 0) > state.day) return;
  if (kind === "food") {
    if (state.resources.food < 5 || f.relation >= 90) return;
    state.resources.food -= 5;
    bumpRelation(f, 8, []);
    pushLog({ type: "good", text: `${f.name}에 식량 5를 건넸다. 관계 +8.` });
  } else if (kind === "sorry") {
    if (f.relation >= 0 || state.resources.food < 4 || state.resources.mat < 3) return;
    state.resources.food -= 4;
    state.resources.mat -= 3;
    bumpRelation(f, 14, []);
    pushLog({ type: "good", text: `${f.name}에 사과 물자를 보냈다. 관계 +14.` });
  } else if (kind === "trade") {
    if (f.relation < 30 || state.resources.food < 4) return;
    state.resources.food -= 4;
    const roll = rand(1, 3);
    let got = "";
    if (roll === 1) { state.resources.med += 2; got = "의약품 2"; }
    else if (roll === 2) { state.resources.ammo += 2; got = "탄약 2"; }
    else { state.resources.mat += 5; got = "자재 5"; }
    bumpRelation(f, 3, []);
    pushLog({ type: "good", text: `${josa(f.name, "and")} 교역했다. ${got}.` });
  }
  state.cooldowns[fid] = state.day + 3;
  save();
  render();
}

function personValue(m) {
  return STATS.reduce((sum, st) => sum + m.stats[st.id].ca * 1.05 + m.stats[st.id].pa * 0.4, 0);
}

function relationDamage(m, mode, success) {
  let hit = 8 + personValue(m) / 14;
  if (mode === "food") hit *= 0.78;
  if (!success) hit *= 0.5;
  return Math.max(4, Math.round(hit));
}

function recruitChance(enc, mode) {
  const actor = memberById(enc.actorId);
  const person = enc.person;
  if (!actor || !person) return 5;
  const leader = state.members.find((m) => m.leader);
  const field = enc.leadId ? memberById(enc.leadId) : null;
  const tp = traitOf(person);
  const ta = traitOf(actor);
  let c = 18;
  c += eff(actor, "mental") * 0.85;
  if (field) c += leadScore(field) * 1.35;
  else if (leader) c += leadScore(leader) * 0.35;
  if (ta.mods.recruitPower) c += ta.mods.recruitPower;
  c += state.morale * 0.12;
  c += Math.min(10, state.facilities.wall * 2);
  if (mode === "food") c += 16;
  if (mode === "poach") c += 4;
  if (tp.mods.recruitResist) c -= tp.mods.recruitResist;
  if (tp.mods.ambition) c += 12;
  if (tp.mods.safetySeek) c += state.facilities.wall >= 2 || mode === "food" ? 12 : -6;
  if (enc.factionId) c -= 8 + person.loyalty * 0.22;
  else c += 8;
  const over = Math.max(0, state.members.length - cap());
  if (over > 0) c -= 10 + over * 16;
  if (state.morale < 35) c -= 12;
  if (state.resources.food < 6) c -= 6;
  return clamp(Math.round(c), over > 0 ? 1 : 6, 92);
}

function revealMeet(m, zone) {
  if (!m.met) {
    if (zone.bias) addKnow(m.stats[zone.bias], 56);
    const others = STATS.map((s) => s.id).filter((id) => id !== zone.bias);
    addKnow(m.stats[pick(others)], 32);
    addKnow(m.stats.mental, 22);
    m.met = true;
  } else {
    STATS.forEach((st) => addKnow(m.stats[st.id], 8));
  }
}

function eventKind(zone) {
  const x = Math.random();
  if (x < zone.zombie) return "zombie";
  if (x < zone.zombie + zone.neutral) return "neutral";
  if (x < zone.zombie + zone.neutral + zone.faction) return "faction";
  return "quiet";
}

function spawnNeutral(zone) {
  const waiting = state.wanderers.filter((w) => !w.reserved);
  if (waiting.length && Math.random() < 0.45) return pick(waiting);
  const m = createMember({
    faction: null,
    bias: zone.bias,
    know: 0,
    ageMin: zone.young ? 16 : 18,
    ageMax: zone.young ? 23 : 58,
  });
  return m;
}

function spawnFaction(zone) {
  const pool = [];
  state.factions.forEach((f) => {
    const w = (zone.tags || []).includes(f.id) ? 3 : 1;
    f.members.forEach((m) => {
      if (!m.boss && !m.reserved) pool.push({ m, w });
    });
  });
  if (!pool.length) return null;
  const total = pool.reduce((s, it) => s + it.w, 0);
  let r = Math.random() * total;
  for (const it of pool) {
    r -= it.w;
    if (r <= 0) return it.m;
  }
  return pool[pool.length - 1].m;
}

function lootFactor(m) {
  const skill = eff(m, "mental") * 0.45 + eff(m, "craft") * 0.35 + eff(m, "combat") * 0.2;
  let f = 0.62 + skill / 16;
  if (traitOf(m).mods.loot) f += traitOf(m).mods.loot;
  const same = state.expedition ? state.expedition.memberIds.length : state.members.filter((x) => activeRole(x) === "loot" && x.zone === m.zone).length;
  if (traitOf(m).mods.solo) f += same <= 1 ? 0.2 : -0.08;
  if (m.mood < 30) f -= 0.1;
  return clamp(f, 0.35, 1.85);
}

function addLoot(m, zone, factor, events) {
  const gain = {};
  ["food", "mat", "med", "ammo"].forEach((k) => {
    const n = Math.round((zone.loot[k] || 0) * factor * (0.6 + Math.random() * 0.75));
    gain[k] = n;
    if (n > 0) state.resources[k] += n;
  });
  const parts = [];
  if (gain.food) parts.push(`식량 ${gain.food}`);
  if (gain.mat) parts.push(`자재 ${gain.mat}`);
  if (gain.med) parts.push(`의약품 ${gain.med}`);
  if (gain.ammo) parts.push(`탄약 ${gain.ammo}`);
  if (parts.length) events.push({ type: "good", text: `${displayName(m)}, ${zone.name}에서 ${parts.join(", ")}.` });
  else events.push({ type: "info", text: `${displayName(m)}, ${josa(zone.name, "topic")} 이미 털려 있었다.` });
  if (Math.random() < 0.07 + zone.danger * 0.012) {
    const recipe = pick(RECIPES.filter((r) => r.kind === "gear"));
    const g = makeGear(recipe);
    state.armory.push(g);
    events.push({ type: "gold", text: `${displayName(m)}, ${g.name} 획득.` });
  }
}

function fightZombies(m, zone, events) {
  const gear = gearOf(m);
  let weapon = gear?.combat || 0;
  if (gear?.gun) {
    if (state.resources.ammo > 0) {
      state.resources.ammo -= 1;
      weapon += 4;
      events.push({ type: "info", text: `${displayName(m)}, 권총 탄환 1 사용.` });
    } else weapon = Math.max(1, Math.floor(weapon * 0.5));
  }
  const power = eff(m, "combat") + weapon + eff(m, "mental", "crisis") * 0.35 + rand(-2, 2);
  const danger = zone.danger * 2.35 + rand(0, 4);
  if (power >= danger) {
    if (Math.random() < 0.12) {
      hurt(m, rand(4, 9));
      events.push({ type: "info", text: `${displayName(m)}, 좀비를 쓰러뜨렸지만 긁혔다.` });
    } else {
      events.push({ type: "good", text: `${displayName(m)}, ${zone.name}의 좀비를 따돌렸다.` });
    }
    return 1.12;
  }
  const dmg = Math.round(8 + (danger - power) * 5);
  hurt(m, dmg);
  events.push({ type: "bad", text: `${displayName(m)}, 좀비에게 몰렸다. 체력 ${Math.max(0, m.hp)}.` });
  const infectChance = traitOf(m).mods.tough ? 0.12 : 0.28;
  if (zone.danger >= 3 && Math.random() < infectChance) {
    m.infected = true;
    events.push({ type: "bad", text: `${displayName(m)}, 물린 자리가 감염됐다.` });
  }
  return 0.45;
}

function driftRelations() {
  if (state.day <= 1) return;
  state.factions.forEach((f) => {
    if (f.relation < 0) f.relation = Math.min(0, f.relation + 1.1);
    else if (f.relation > 0) f.relation = Math.max(0, f.relation - 0.6);
  });
}

function morningInfection(events) {
  state.members.slice().forEach((m) => {
    if (!m.infected) return;
    hurt(m, traitOf(m).mods.tough ? 5 : 9);
    events.push({ type: "bad", text: `${displayName(m)}, 감염이 깊어진다. 체력 ${Math.max(0, m.hp)}.` });
    if (m.hp <= 0) kill(m, events, "감염으로");
  });
}

function runProduce(events) {
  const farmers = state.members.filter((m) => activeRole(m) === "farm");
  if (farmers.length) {
    if (state.facilities.farm <= 0) {
      events.push({ type: "info", text: "농지가 없어 밭일을 제대로 못했다. 공사를 시작하자." });
      farmers.forEach((m) => gainXp(m, "farm", 1.3, events));
    } else {
      let out = 0;
      farmers.forEach((m) => {
        out += 0.7 + state.facilities.farm * (0.65 + eff(m, "farm") * 0.16);
        gainXp(m, "farm", 2.5, events);
        m.fatigue = clamp(m.fatigue + 16, 0, 100);
      });
      out = Math.max(farmers.length, Math.round(out));
      state.resources.food += out;
      events.push({ type: "good", text: `농사로 식량 ${out} 수확.` });
    }
  }

  const builders = state.members.filter((m) => activeRole(m) === "build");
  let work = 0;
  builders.forEach((m) => {
    const gear = gearOf(m);
    work += 1.6 + eff(m, "build") * 0.42 + (gear?.build || 0);
    gainXp(m, "build", 2.5, events);
    m.fatigue = clamp(m.fatigue + 16, 0, 100);
  });
  if (builders.length && state.project) {
    state.project.work += work;
    if (state.project.work >= state.project.need) {
      const id = state.project.id;
      state.facilities[id] += 1;
      const built = facilityById(id);
      const extra = id === "bunk" ? ` 수용 ${cap()}명.` : "";
      events.push({ type: "good", text: `${built.name} ${state.facilities[id]}단계 완성.${extra}` });
      state.project = null;
      state.maint = 0;
    } else {
      events.push({ type: "info", text: `공사 진행 ${Math.floor(state.project.work)}/${state.project.need}.` });
      state.maint = 0;
    }
  } else if (builders.length) {
    state.maint = work;
    events.push({ type: "info", text: `방벽을 정비했다. 오늘 밤 방어 +${work.toFixed(1)}.` });
  } else state.maint = 0;

  const crafters = state.members.filter((m) => activeRole(m) === "craft");
  if (crafters.length) {
    let cw = 0;
    crafters.forEach((m) => {
      const gear = gearOf(m);
      cw += (1.4 + eff(m, "craft") * 0.4 + (gear?.craft || 0)) * (1 + state.facilities.workshop * 0.2);
      gainXp(m, "craft", 2.5, events);
      m.fatigue = clamp(m.fatigue + 12, 0, 100);
    });
    if (!state.craft) {
      events.push({ type: "info", text: "제작 목표가 없어 공구만 만졌다." });
    } else {
      state.craft.work += cw;
      const recipe = recipeById(state.craft.id);
      if (state.craft.work >= state.craft.need) {
        if (recipe.kind === "medkit") {
          state.medkits += 1;
          events.push({ type: "good", text: "구급낭 1 완성." });
        } else if (recipe.kind === "antidote") {
          state.antidotes = (state.antidotes || 0) + 1;
          events.push({ type: "good", text: "해독제 1 완성." });
        } else if (recipe.kind === "trap") {
          state.traps += 1;
          events.push({ type: "good", text: "함정 1 완성." });
        } else if (recipe.kind === "ammo") {
          state.resources.ammo += 4;
          events.push({ type: "good", text: "탄약 상자에서 탄약 4." });
        } else if (recipe.kind === "food") {
          state.resources.food += 6;
          events.push({ type: "good", text: "보존 식량 6을 창고에 넣었다." });
        } else {
          const g = makeGear(recipe);
          state.armory.push(g);
          events.push({ type: "gold", text: `${recipe.name} 완성.` });
        }
        state.craft = null;
        autoEquip();
      } else {
        events.push({ type: "info", text: `${recipe.name} 제작 ${Math.floor(state.craft.work)}/${state.craft.need}.` });
      }
    }
  }

  state.members.filter((m) => activeRole(m) === "train").forEach((m) => {
    const stat = m.trainStat || "combat";
    gainXp(m, stat, 4.8, events);
    m.fatigue = clamp(m.fatigue + 14, 0, 100);
    m.mood = clamp(m.mood + 1, 0, 100);
  });

  state.members.filter((m) => activeRole(m) === "talk").forEach((m) => {
    const target = state.members.find((x) => x.id === m.talkTarget && x.id !== m.id)
      || state.members.filter((x) => x.id !== m.id).sort((a, b) => avgKnow(a) - avgKnow(b))[0];
    if (!target) {
      events.push({ type: "info", text: `${displayName(m)}, 면담할 상대가 없다.` });
      return;
    }
    const gain = 22 + Math.round(eff(m, "mental") / 3) + (traitOf(m).mods.scout ? 14 : 0);
    STATS.forEach((st) => addKnow(target.stats[st.id], gain));
    gainXp(m, "mental", 2.2, events);
    m.fatigue = clamp(m.fatigue + 8, 0, 100);
    target.mood = clamp(target.mood + 4, 0, 100);
    events.push({ type: "info", text: `${displayName(m)}, ${displayName(target)}의 포텐을 가늠했다.` });
    addStory(target, "면담");
  });

  state.members.filter((m) => activeRole(m) === "guard").forEach((m) => {
    gainXp(m, "combat", 1.1, events);
    m.fatigue = clamp(m.fatigue + 14, 0, 100);
  });

  state.members.filter((m) => activeRole(m) === "rest").forEach((m) => {
    if (!m.infected) m.hp = clamp(m.hp + 10, 0, 100);
    m.mood = clamp(m.mood + 3, 0, 100);
  });
}

function runLoots(encounters, events) {
  return tickExpedition(encounters, events);
}

function appointLeader(id) {
  const next = memberById(id);
  if (!next || next.hp <= 0 || next.leader) return;
  state.members.forEach((m) => { m.leader = m.id === next.id; });
  addStory(next, "세력의 리더가 됨");
  pushLog({ type: "gold", text: `${displayName(next)}이 세력의 리더가 되었다.` });
  save();
  render();
}

function sceneHTML() {
  const home = state.members.filter((m) => !onTrip(m) && m.hp > 0).slice(0, 4);
  const working = !!(state.craft || state.project);
  const label = state.craft ? recipeById(state.craft.id)?.name : state.project ? `${facilityById(state.project.id).name} 공사` : "대기";
  const people = home.map((m, i) => `<div class="walker ${working ? "busy" : "idle"}" style="--i:${i}">${portrait(m)}<span>${esc(displayName(m))}</span></div>`).join("");
  const wh = state.facilities.warehouse || 0;
  return `<div class="scene ${working ? "is-work" : ""}">
    <div class="plot wall">방벽 ${state.facilities.wall}</div>
    <div class="plot bunk">막사 ${state.facilities.bunk}<small>수용 ${cap()}</small></div>
    <div class="plot clinic ${state.facilities.clinic ? "on" : ""}">의무실 ${state.facilities.clinic}</div>
    <div class="plot ware ${wh ? "on" : ""}">창고 ${wh}</div>
    <div class="plot shop">공방 ${state.facilities.workshop}</div>
    <div class="plot farm">농지 ${state.facilities.farm}</div>
    ${people}
    <div class="scene-caption">${working ? `${esc(label)} 진행 중` : "거점은 조용하다"}</div>
  </div>`;
}

function departExpedition() {
  if (!state || state.expedition || state.over || state.busy) return;
  const team = state.members.filter((m) => m.role === "loot" && m.hp >= 28);
  if (team.length < 2) return;
  const lead = team.find((m) => m.id === state.expeditionLead) || null;
  if (!lead) return;
  const zone = zoneById(state.lootZone || "homes");
  const days = zone.days || 1;
  const need = team.length * days;
  const packed = Math.min(state.resources.food, need);
  state.resources.food -= packed;
  state.expedition = {
    zoneId: zone.id,
    memberIds: team.map((m) => m.id),
    leadId: lead.id,
    days,
    left: days,
    foodLeft: packed,
    need,
    phase: "choose",
    event: null,
    notes: [],
    todayEvents: [],
    openedDay: null,
  };
  chargeExpeditionDay(state.expedition);
  state.expedition.openedDay = state.day;
  const names = team.map((m) => displayName(m)).join(", ");
  const short = packed < need;
  pushLog({
    type: short ? "bad" : "info",
    text: `${names}이 ${zone.name}으로 떠났다. 원정 리더 ${displayName(lead)} (리더십 ${leadScore(lead)}). ${days}일, 식량 ${packed}/${need}.${short ? " 식량이 모자라 위험한 구간은 회피하지 못하고 강행한다." : ""}`,
  });
  save();
  render();
}

function tripMembers(ex) {
  return ex.memberIds.map(memberById).filter((m) => m && m.hp > 0);
}

function tryAvoid(team, zone, forced) {
  if (forced || !team.length) return false;
  const lead = team.find((m) => state.expedition && m.id === state.expedition.leadId) || team[0];
  const skill = leadScore(lead);
  const chance = clamp(0.18 + skill * 0.045 - zone.danger * 0.07, 0.08, 0.9);
  return Math.random() < chance;
}

function pickWeighted(pairs) {
  const total = pairs.reduce((s, it) => s + it[1], 0);
  let r = Math.random() * total;
  for (const it of pairs) {
    r -= it[1];
    if (r <= 0) return it[0];
  }
  return pairs[pairs.length - 1][0];
}

function teamFactor(team, arrived) {
  const base = team.reduce((s, m) => s + lootFactor(m), 0) / Math.max(1, team.length);
  return base * (arrived ? 1 : 0.48);
}

function hurtOne(team, zone, amount, events, why) {
  const alive = team.filter((m) => m.hp > 0);
  if (!alive.length) return;
  const victim = pick(alive);
  hurt(victim, amount);
  if (victim.hp <= 0) {
    kill(victim, events, why);
    return;
  }
  events.push({ type: "bad", text: `${displayName(victim)} 부상. 체력 ${victim.hp}.` });
  if (zone.danger >= 3 && Math.random() < 0.14) {
    victim.infected = true;
    events.push({ type: "bad", text: `${displayName(victim)}, 상처에 감염이 번졌다.` });
  }
}

function chargeExpeditionDay(ex) {
  const team = tripMembers(ex);
  const forced = ex.foodLeft < team.length;
  if (forced) ex.foodLeft = 0;
  else ex.foodLeft -= team.length;
  team.forEach((m) => { m.rationed = true; });
  ex.forced = forced;
  ex.phase = "choose";
  ex.event = null;
  ex.notes = [];
  ex.todayEvents = [];
}

function ensureExpeditionMorning() {
  const ex = state.expedition;
  if (!ex) return;
  if (!ex.phase) ex.phase = "choose";
  if (ex.openedDay === state.day) return;
  if (ex.openedDay == null && ex.left < ex.days) {
    ex.openedDay = state.day;
    return;
  }
  chargeExpeditionDay(ex);
  ex.openedDay = state.day;
  save();
}

function fieldNote(ex, event) {
  ex.notes = ex.notes || [];
  ex.todayEvents = ex.todayEvents || [];
  ex.notes.push(event.text);
  ex.todayEvents.push({ ...event, logged: true, day: state.day });
  pushLog({ ...event, day: state.day });
}

function fieldLead(ex, team) {
  return team.find((m) => m.id === ex.leadId) || team[0];
}

function applyRoute(ex, choice) {
  const zone = zoneById(ex.zoneId);
  let alive = tripMembers(ex);
  if (!alive.length) return;
  const lead = fieldLead(ex, alive);
  const skill = leadScore(lead);
  const arrived = ex.left === 1;
  const speaker = alive.slice().sort((a, b) => lootFactor(b) - lootFactor(a))[0];
  const base = teamFactor(alive, arrived);
  const bag = [];
  const sink = (e) => fieldNote(ex, e);
  if (choice === "safe" && !ex.forced) {
    addLoot(speaker, zone, base * 0.5, bag);
    sink({ type: "info", text: "안전한 경로로 조금 챙겼다." });
    if (Math.random() < 0.08) hurtOne(alive, zone, rand(6, 10), bag, `${zone.name}에서`);
  } else {
    addLoot(speaker, zone, base * (ex.forced ? 1.2 : 1.75), bag);
    const injure = clamp(0.4 + zone.danger * 0.05 - skill * 0.02, 0.1, 0.82);
    if (Math.random() < injure) hurtOne(alive, zone, rand(10, 18) + (ex.forced ? 8 : 0) + zone.danger, bag, ex.forced ? `${zone.name} 강행 중` : `${zone.name}에서`);
    else sink({ type: "good", text: `${displayName(lead)}의 리더십으로 위험한 수확을 버텼다.` });
  }
  bag.filter((e) => !ex.todayEvents.some((x) => x.text === e.text)).forEach((e) => fieldNote(ex, e));
  rollFieldEvent(ex);
}

function rollFieldEvent(ex) {
  const alive = tripMembers(ex);
  if (!alive.length) {
    ex.phase = "done";
    return;
  }
  const zone = zoneById(ex.zoneId);
  const arrived = ex.left === 1;
  const rare = pickWeighted([
    ["none", arrived ? 48 : 62],
    ["weapon", 16],
    ["survivor", arrived ? 22 : 14],
    ["faction", arrived ? 14 : 8],
  ]);
  if (rare === "none") {
    ex.phase = "done";
    ex.event = null;
    return;
  }
  if (rare === "weapon") {
    ex.phase = "event";
    ex.event = { kind: "weapon" };
    return;
  }
  let person = rare === "faction" ? spawnFaction(zone) : spawnNeutral(zone);
  if (!person) person = spawnNeutral(zone);
  const actor = alive.slice().sort((a, b) => eff(b, "mental") - eff(a, "mental"))[0];
  revealMeet(person, zone);
  person.reserved = true;
  ex.phase = "event";
  ex.event = { kind: "person", person, actorId: actor.id, factionId: person.faction || null };
}

function applyFieldEvent(ex, choice, encounters) {
  const zone = zoneById(ex.zoneId);
  const team = tripMembers(ex);
  const lead = fieldLead(ex, team);
  const skill = lead ? leadScore(lead) : 0;
  const bag = [];
  const sink = (e) => fieldNote(ex, e);
  const ev = ex.event;
  if (!ev) {
    ex.phase = "done";
    return;
  }
  if (ev.kind === "weapon") {
    if (choice === "grab" && team.length) {
      const chance = clamp(0.26 + skill * 0.028, 0.18, 0.78);
      if (Math.random() < chance) {
        const recipe = pick(RECIPES.filter((r) => r.kind === "gear"));
        const gear = makeGear(recipe);
        state.armory.push(gear);
        autoEquip();
        sink({ type: "gold", text: `${josa(gear.name, "obj")} 챙겼다.` });
        if (Math.random() < 0.4) {
          const ammo = rand(1, 3);
          state.resources.ammo += ammo;
          sink({ type: "good", text: `탄약 ${ammo}도 같이 나왔다.` });
        }
      } else sink({ type: "bad", text: "무기고는 비어 있었고, 소음만 남았다." });
      const bite = clamp(0.32 + zone.danger * 0.05 - skill * 0.012, 0.1, 0.72);
      if (Math.random() < bite) hurtOne(tripMembers(ex), zone, rand(12, 24), bag, "무기고에서");
      bag.filter((e) => !ex.todayEvents.some((x) => x.text === e.text)).forEach((e) => fieldNote(ex, e));
    } else sink({ type: "info", text: "무기고를 두고 지나갔다." });
  } else if (ev.kind === "person") {
    const person = ev.person;
    const faction = ev.factionId ? factionById(ev.factionId) : null;
    const actor = memberById(ev.actorId);
    if (choice === "talk" && actor && actor.hp > 0) {
      encounters.push({ actorId: actor.id, person, zoneId: zone.id, factionId: ev.factionId, leadId: ex.leadId });
      sink({ type: "info", text: `${displayName(actor)}, ${zone.name}에서 ${josa(faction ? displayName(person) : displayName(person), "obj")} 만났다.` });
    } else {
      person.reserved = false;
      if (!faction) keepWanderer(person);
      sink({ type: "info", text: `${displayName(person)}와 거리를 두고 지나갔다.` });
    }
  }
  ex.event = null;
  ex.phase = "done";
}

function routeScene(ex) {
  const zone = zoneById(ex.zoneId);
  const team = tripMembers(ex);
  const lead = fieldLead(ex, team);
  const dayNo = ex.days - ex.left + 1;
  return {
    title: `${zone.name} ${dayNo}/${ex.days}일`,
    text: `${lead ? displayName(lead) : "원정대"}이 앞장선다. 리더십 ${lead ? leadScore(lead) : 0}. 위험한 수확은 자원이 많고, 안전한 길은 적다.`,
    note: ex.forced ? "식량이 떨어져 안전한 우회를 할 수 없다. 위험한 구간을 강행해야 한다." : "원정 리더의 리더십이 높으면 위험한 수확에서 덜 다친다.",
    choices: [
      { id: "risk", danger: true, title: "위험하게 뒤진다", detail: "자원을 많이 건진다. 부상과 감염 위험이 있다." },
      { id: "safe", disabled: ex.forced, title: "안전하게 고른다", detail: ex.forced ? "식량이 없어 이 길은 막혀 있다." : "자원은 적어도 거의 다치지 않는다." },
    ],
  };
}

function eventScene(ex) {
  const ev = ex.event || {};
  const zone = zoneById(ex.zoneId);
  const team = tripMembers(ex);
  const lead = fieldLead(ex, team);
  const skill = lead ? leadScore(lead) : 0;
  if (ev.kind === "weapon") {
    return {
      title: `${zone.name} · 무기`,
      text: "녹슨 무기고가 보인다. 문을 열면 소리가 크고, 안에 무기가 있을 수도 있다.",
      note: `성공 가능성에는 원정 리더 ${lead ? displayName(lead) : "없음"}의 리더십 ${skill}이 반영된다.`,
      choices: [
        { id: "grab", danger: true, title: "문을 연다", detail: "무기를 얻을 수 있다. 비어 있거나 좀비가 몰릴 수 있다." },
        { id: "leave", title: "조용히 지나간다", detail: "아무것도 가져가지 않는다." },
      ],
    };
  }
  const person = ev.person;
  const faction = ev.factionId ? factionById(ev.factionId) : null;
  return {
    title: person ? displayName(person) : "생존자",
    html: person ? personMeetHTML(person, faction, zone) : "",
    text: "",
    choices: [
      { id: "talk", title: "말을 건다", detail: faction ? "빼오기나 회유를 고를 수 있다. 관계는 흔들린다." : "영입하거나 재능만 보고 헤어질 수 있다." },
      { id: "pass", title: "거리를 둔다", detail: "이번 만남은 없던 일이 된다." },
    ],
  };
}

function personMeetHTML(person, faction, zone) {
  const t = traitOf(person);
  const quote = QUOTES[person.trait] || "…한참을 망설인다.";
  return `<div class="person-head">${portrait(person)}
    <div>
      <h3>${esc(displayName(person))}</h3>
      <div class="sub">${person.age}세 · ${genderLabel(person.gender)} · ${esc(t.name)} · ${esc(person.background)}</div>
      <div class="sub">본명 ${esc(person.name)}</div>
      <div class="sub">${esc(belongLine(person, faction))}</div>
      ${faction ? `<div class="sub">${esc(faction.desc)} · 수장 ${esc(faction.bossName)}</div>` : `<div class="sub">어느 세력의 명부에도 없다.</div>`}
      <div class="sub">${esc(zone.name)}</div>
    </div>
  </div>
  <div class="quote">“${esc(quote)}”</div>
  <div class="stats">${statRows(person)}</div>`;
}

async function finishFieldIfNeeded(encounters, events) {
  const ex = state.expedition;
  if (!ex) return;
  if (ex.phase === "choose") {
    const choice = await openScene(routeScene(ex));
    state.ui.scene = null;
    applyRoute(ex, choice === "safe" ? "safe" : "risk");
  }
  if (ex.phase === "event") {
    const choice = await openScene(eventScene(ex));
    state.ui.scene = null;
    applyFieldEvent(ex, choice, encounters);
  }
  ex.phase = "done";
}

let fieldLock = false;
async function onField(choice) {
  const ex = state.expedition;
  if (!ex || state.busy || state.over || fieldLock) return;
  fieldLock = true;
  const events = [];
  const encounters = [];
  try {
  if (ex.phase === "choose") applyRoute(ex, choice);
  else if (ex.phase === "event") applyFieldEvent(ex, choice, encounters);
  if (encounters[0]) {
    const enc = encounters[0];
    const picked = await openEncounter(enc);
    applyDecision(enc, picked, events);
    events.filter((e) => !ex.todayEvents.some((x) => x.text === e.text)).forEach((e) => fieldNote(ex, e));
  }
  } finally {
    fieldLock = false;
    save();
    render();
  }
}

function openScene(scene) {
  return new Promise((resolve) => {
    pending = resolve;
    state.ui.scene = scene;
    render();
  });
}

async function tickExpedition(encounters, events) {
  ensureExpeditionMorning();
  const ex = state.expedition;
  if (!ex) return;
  const zone = zoneById(ex.zoneId);
  let team = tripMembers(ex);
  if (!team.length) {
    state.expedition = null;
    events.push({ type: "bad", text: `${zone.name} 원정대가 돌아오지 못했다.` });
    return;
  }
  if (ex.phase !== "done") await finishFieldIfNeeded(encounters, events);
  if (!state.expedition) return;
  (state.expedition.todayEvents || []).forEach((e) => events.push(e));
  team = tripMembers(state.expedition);
  if (state.expedition.leadId && !team.some((m) => m.id === state.expedition.leadId) && team.length) {
    const next = team.slice().sort((a, b) => leadScore(b) - leadScore(a))[0];
    state.expedition.leadId = next.id;
    events.push({ type: "info", text: `원정 리더가 쓰러져 ${displayName(next)}이 앞장을 섰다. 리더십 ${leadScore(next)}.` });
  }
  team.forEach((m) => {
    m.fatigue = clamp(m.fatigue + (state.expedition.forced ? 22 : 14), 0, 100);
    gainXp(m, "mental", 0.7, events);
  });
  state.expedition.left -= 1;
  if (state.expedition.left <= 0 || !team.length) {
    const back = team.length;
    state.expedition = null;
    if (back) events.push({ type: "good", text: `${zone.name}에서 원정대가 거점으로 돌아왔다.` });
    return;
  }
  state.expedition.openedDay = -1;
  state.expedition.phase = "choose";
}

function openEncounter(enc) {
  return new Promise((resolve) => {
    pending = resolve;
    state.ui.encounter = enc;
    render();
  });
}

function applyDecision(enc, choice, events) {
  const actor = memberById(enc.actorId);
  const person = enc.person;
  person.reserved = false;
  const faction = enc.factionId ? factionById(enc.factionId) : null;
  if (!actor || actor.hp <= 0) {
    if (!faction) keepWanderer(person);
    return;
  }
  if (choice === "ignore") {
    events.push({ type: "info", text: `${josa(displayName(actor), "sub")} ${josa(displayName(person), "obj")} 그냥 지나쳤다.` });
    if (!faction) keepWanderer(person);
    return;
  }
  if (choice === "observe") {
    const bonus = 18 + Math.round(eff(actor, "mental") / 3) + (traitOf(actor).mods.scout ? 16 : 0);
    STATS.forEach((st) => addKnow(person.stats[st.id], bonus));
    gainXp(actor, "mental", 1.4, events);
    events.push({ type: "info", text: `${displayName(actor)}, ${displayName(person)}의 재능만 눈여겨보고 헤어졌다.` });
    if (!faction) keepWanderer(person);
    return;
  }
  if ((choice === "food" || choice === "poach" || choice === "ask") && choice === "food") {
    if (state.resources.food < 3) {
      events.push({ type: "bad", text: "건넬 식량이 없다." });
      if (!faction) keepWanderer(person);
      return;
    }
    state.resources.food -= 3;
  }
  const mode = choice === "ask" ? "ask" : choice;
  const chance = recruitChance(enc, mode === "ask" ? "ask" : mode);
  const success = Math.random() * 100 < chance;
  if (success) {
    joinMember(person, faction, actor, mode, events);
  } else {
    actor.mood = clamp(actor.mood - 4, 0, 100);
    if (faction) {
      const hit = relationDamage(person, mode, false);
      const rel = bumpRelation(faction, -hit, events);
      events.push({ type: "bad", text: `${displayName(person)}, 거절했다. ${faction.name} 관계 ${rel.prev} → ${rel.next}.` });
      maybeFight(actor, person, faction, mode, events);
    } else {
      events.push({ type: "info", text: `${displayName(person)}, 고개를 저었다.` });
      person.loyalty = clamp((person.loyalty || 40) + 8, 0, 100);
      keepWanderer(person);
    }
  }
}

function maybeFight(actor, person, faction, mode, events) {
  const hot = traitOf(person).mods.fightback || faction.aggression >= 0.6;
  let p = 0.12;
  if (hot) p += 0.38;
  if (mode === "poach") p += 0.12;
  if (mode === "food") p -= 0.08;
  if (Math.random() > p) return;
  const ap = eff(actor, "combat") + (gearOf(actor)?.combat || 0);
  const dp = eff(person, "combat") + rand(0, 3);
  if (dp > ap) {
    hurt(actor, 8 + (dp - ap) * 3);
    events.push({ type: "bad", text: `${displayName(person)}의 반격으로 ${josa(displayName(actor), "sub")} 다쳤다. 체력 ${Math.max(0, actor.hp)}.` });
    if (actor.hp <= 0) kill(actor, events, "회유 중 싸움으로");
  } else {
    hurt(actor, 6);
    events.push({ type: "info", text: `${displayName(actor)}, ${displayName(person)}의 주먹을 뿌리쳤다.` });
  }
  bumpRelation(faction, -3, events);
}

function keepWanderer(person) {
  person.faction = null;
  person.reserved = false;
  if (!state.wanderers.some((w) => w.id === person.id)) state.wanderers.push(person);
}

function joinMember(person, faction, actor, mode, events) {
  state.wanderers = state.wanderers.filter((w) => w.id !== person.id);
  if (faction) faction.members = faction.members.filter((m) => m.id !== person.id);
  person.faction = "player";
  person.role = "rest";
  person.joinedDay = state.day;
  person.loyalty = rand(44, 70);
  person.mood = 62;
  person.reserved = false;
  person.leader = false;
  STATS.forEach((st) => addKnow(person.stats[st.id], 12));
  state.members.push(person);
  state.statsRecruited += 1;
  gainXp(actor, "mental", 2.1, events);
  addStory(person, faction ? `${faction.name}에서 합류` : "생존자로 합류");
  if (faction) {
    state.statsPoached += 1;
    const hit = relationDamage(person, mode, true);
    const rel = bumpRelation(faction, -hit, events);
    events.push({ type: "recruit", text: `${josa(displayName(person), "sub")} ${josa(faction.name, "obj")} 떠나 ${state.factionName}에 합류했다.` });
    events.push({ type: "bad", text: `${josa(faction.bossName, "sub")} 배신을 기억한다. ${faction.name} 관계 ${rel.prev} → ${rel.next}.` });
  } else {
    events.push({ type: "recruit", text: `${displayName(person)}, 명부에 이름을 올렸다.` });
  }
  if (state.members.length > cap()) {
    state.morale = clamp(state.morale - 4, 0, 100);
    events.push({ type: "info", text: "막사가 비좁다. 수용 인원을 늘릴 때가 됐다." });
  }
}

function runMedic(events) {
  const medics = state.members.filter((m) => activeRole(m) === "medic");
  if (!medics.length) return;
  let power = 0;
  medics.forEach((m) => {
    power += eff(m, "medic") * (1 + state.facilities.clinic * 0.28) + (gearOf(m)?.medic || 0);
    gainXp(m, "medic", 2.4, events);
    m.fatigue = clamp(m.fatigue + 10, 0, 100);
  });
  const patients = state.members.filter((m) => m.hp < 100 || m.infected).sort((a, b) => a.hp - b.hp);
  if (!patients.length) {
    events.push({ type: "info", text: "치료할 사람이 없어 의무 인원은 준비를 했다." });
    return;
  }
  patients.forEach((p) => {
    if (power < 6 || !state.members.some((m) => m.id === p.id)) return;
    const needSupply = p.infected || p.hp < 60;
    const canSpend = state.medkits > 0 || state.resources.med > 0 || (p.infected && state.antidotes > 0);
    let spent = false;
    if (needSupply && canSpend) {
      if (p.infected && state.antidotes > 0) {
        state.antidotes -= 1;
        p.infected = false;
        spent = true;
      } else if (state.medkits > 0) state.medkits -= 1;
      else state.resources.med -= 1;
      if (!p.infected) spent = true;
      else spent = true;
    }
    const heal = Math.round((spent ? 16 : 7) + power * (spent ? 0.7 : 0.3));
    p.hp = clamp(p.hp + heal, 0, 100);
    power -= spent ? 8 : 6;
    if (p.infected && spent && medics.some((m) => eff(m, "medic") >= 8)) {
      p.infected = false;
      events.push({ type: "good", text: `${displayName(p)}, 감염이 잡혔다. 체력 ${p.hp}.` });
    } else if (p.infected && spent) {
      events.push({ type: "info", text: `${displayName(p)}, 감염은 남았지만 체력 ${p.hp}.` });
    } else {
      events.push({ type: "good", text: `${displayName(p)} 치료. 체력 ${p.hp}.` });
    }
  });
}

function runFood(events) {
  const home = state.members.filter((m) => !onTrip(m) && !m.rationed && m.hp > 0);
  const cooks = home.filter((m) => activeRole(m) === "cook");
  let quality = 0;
  if (cooks.length && state.resources.food > 0) {
    cooks.forEach((m) => {
      quality += eff(m, "cook") * (1 + state.facilities.kitchen * 0.35);
      gainXp(m, "cook", 2.5, events);
      m.fatigue = clamp(m.fatigue + 10, 0, 100);
    });
  } else if (cooks.length) {
    events.push({ type: "bad", text: "솥이 비어 요리를 하지 못했다." });
  }
  const n = home.length;
  if (!n) {
    events.push({ type: "info", text: "거점에 남은 사람이 없어 끼니를 건너뛰었다." });
    return;
  }
  let rate = 1;
  if (quality > 0) rate -= Math.min(0.45, quality / 30);
  const need = Math.max(1, Math.ceil(n * rate));
  if (state.resources.food >= need) {
    state.resources.food -= need;
    state.starved = 0;
    events.push({ type: "info", text: quality > 0 ? `따뜻한 끼니. 식량 ${need} 소비.` : `식량 ${need} 소비.` });
    state.meal = quality;
  } else {
    const had = state.resources.food;
    state.resources.food = 0;
    state.starved += 1;
    state.meal = 0;
    home.slice().forEach((m) => {
      hurt(m, 8 + state.starved * 2);
      m.mood = clamp(m.mood - 12, 0, 100);
      if (m.hp <= 0) kill(m, events, "굶주림으로");
    });
    events.push({ type: "bad", text: had > 0 ? `식량 ${had}뿐이라 거점에 남은 사람들이 굶었다.` : "먹을 것이 전혀 없다." });
  }
}

function pickRaid() {
  let chosen = null;
  state.factions.forEach((f) => {
    const base = f.relation <= -70 ? 0.5 : f.relation <= -40 ? 0.26 : 0;
    if (base <= 0) return;
    const chance = base * (0.45 + f.aggression);
    if (Math.random() < chance && (!chosen || f.aggression > chosen.aggression)) chosen = f;
  });
  return chosen;
}

function runNight(events) {
  const raid = pickRaid();
  let threat = threatScore();
  if (raid) {
    threat += 2.4 + raid.members.length * 0.38;
    bumpRelation(raid, -2, events);
  }
  const parts = defenseParts();
  let defense = parts.base;
  let usedTraps = 0;
  if (defense < threat && state.traps > 0) {
    usedTraps = Math.min(state.traps, Math.ceil((threat - defense) / 1.4));
    state.traps -= usedTraps;
    defense += usedTraps * 1.4;
  }
  let usedAmmo = 0;
  if (defense < threat && parts.guard > 0 && state.resources.ammo > 0) {
    usedAmmo = Math.min(state.resources.ammo, Math.ceil((threat - defense) / 1.7), 3);
    state.resources.ammo -= usedAmmo;
    defense += usedAmmo * 1.7;
  }
  const spent = [];
  if (usedTraps) spent.push(`함정 ${usedTraps}`);
  if (usedAmmo) spent.push(`탄약 ${usedAmmo}`);
  const prefix = raid ? `${raid.name}의 습격. ` : "";
  if (defense >= threat) {
    const line = raid
      ? `${prefix}막아 냈다.${spent.length ? " " + spent.join(", ") + " 사용." : ""}`
      : vary(["밤이 조용히 지나갔다.", "담장 너머 신음이 있었지만 거점은 버텼다.", "경계가 그림자를 돌려보냈다."]) + (spent.length ? ` ${spent.join(", ")} 사용.` : "");
    events.push({ type: raid ? "info" : "good", text: line });
    return;
  }
  const gap = threat - defense;
  const foodLoss = Math.min(state.resources.food, Math.max(0, Math.round(gap)));
  state.resources.food -= foodLoss;
  const hits = gap >= 5 ? 2 : 1;
  for (let i = 0; i < hits; i++) {
    const pool = state.members.slice();
    if (!pool.length) break;
    const victim = pool[rand(0, pool.length - 1)];
    hurt(victim, Math.round(10 + gap * 4));
    events.push({ type: "bad", text: `${prefix}${displayName(victim)}, 야습에 다쳤다. 체력 ${Math.max(0, victim.hp)}.` });
    if (gap >= 4 && Math.random() < 0.18) {
      victim.infected = true;
      events.push({ type: "bad", text: `${displayName(victim)}, 밤에 물렸다.` });
    }
    if (victim.hp <= 0) kill(victim, events, "야습으로");
  }
  if (gap >= 5 && state.facilities.wall > 0 && Math.random() < 0.65) {
    state.facilities.wall -= 1;
    events.push({ type: "bad", text: "방벽 한 겹이 무너졌다." });
  }
  const loss = foodLoss > 0 ? `식량 ${foodLoss}을 잃었다.` : "지킬 식량은 없었다.";
  events.push({ type: "bad", text: `${prefix}거점이 털렸다. ${loss}${spent.length ? " " + spent.join(", ") + "을 쓰고도 막지 못했다." : ""}` });
}

function runMorale(events) {
  const sunny = state.members.filter((m) => traitOf(m).mods.aura).length;
  let delta = 0;
  if (state.meal > 0) delta += 3;
  else delta -= 4;
  if (state.starved > 0) delta -= 6;
  delta += Math.min(3, state.facilities.wall);
  delta -= state.members.filter((m) => m.hp < 60).length * 2;
  delta += Math.min(4, sunny * 2);
  const over = Math.max(0, state.members.length - cap());
  if (over > 0) delta -= Math.min(28, over * 5);
  state.morale = clamp(state.morale + delta, 0, 100);
  state.members.forEach((m) => {
    let d = (state.morale - 55) / 18;
    if (activeRole(m) === "rest") d += 3;
    if (state.meal > 0) d += 2;
    if (state.starved) d -= 6;
    if (m.infected) d -= 5;
    if (m.hp < 50) d -= 3;
    if (traitOf(m).mods.solo && activeRole(m) !== "loot") d -= 2;
    if (traitOf(m).mods.aura) d += 2;
    const over = Math.max(0, state.members.length - cap());
    if (over > 0) d -= Math.min(10, over * 2);
    m.mood = clamp(m.mood + d, 0, 100);
  });
  }

function runDesert(events) {
  state.members.slice().forEach((m) => {
    if (m.leader) return;
    const ambitious = traitOf(m).mods.ambition;
    const limit = ambitious ? 36 : 22;
    if (m.mood < limit) m.lowMood += 1;
    else m.lowMood = 0;
    const need = ambitious ? 2 : 3;
    if (m.lowMood < need) return;
    let chance = ambitious ? 0.55 : 0.4;
    if (traitOf(m).mods.loyal) chance = 0.08;
    if (Math.random() > chance) return;
    state.members = state.members.filter((x) => x.id !== m.id);
    state.morale = clamp(state.morale - 6, 0, 100);
    if (ambitious && Math.random() < 0.55) {
      const f = pick(state.factions);
      m.faction = f.id;
      m.role = "rest";
      m.leader = false;
      f.members.push(m);
      bumpRelation(f, -6, events);
      events.push({ type: "bad", text: `${displayName(m)}, 푸대접에 질려 ${f.name}로 넘어갔다.` });
    } else {
      m.faction = null;
      keepWanderer(m);
      events.push({ type: "bad", text: `${displayName(m)}, 세력을 떠나 홀로 걸었다.` });
    }
  });
}

function runAI(events) {
  state.factions.forEach((f) => {
    if (f.members.length < f.cap && Math.random() < 0.22) {
      f.members.push(createMember({ faction: f.id, bias: f.bias, know: 0 }));
    }
    if (f.members.length > 3 && Math.random() < 0.07) {
      const pool = f.members.filter((m) => !m.boss && !m.reserved);
      if (pool.length) {
        const lost = pick(pool);
        f.members = f.members.filter((m) => m.id !== lost.id);
        events.push({ type: "info", text: `${f.name}에서 ${displayName(lost)}의 소식이 끊겼다.` });
      }
    }
  });
}

function runRandom(events) {
  if (Math.random() > 0.2) return;
  const roll = rand(1, 5);
  if (roll === 1) {
    const food = rand(2, 5);
    state.resources.food += food;
    events.push({ type: "good", text: `잊고 있던 상자에서 식량 ${food}.` });
  } else if (roll === 2 && state.facilities.farm > 0) {
    state.resources.food += state.facilities.farm;
    events.push({ type: "good", text: "비가 농지를 적셨다." });
  } else if (roll === 3) {
    state.morale = clamp(state.morale + 5, 0, 100);
    events.push({ type: "good", text: "누군가 낡은 노래를 흥얼거렸다. 사기가 조금 올랐다." });
  } else if (roll === 4) {
    const mat = rand(2, 4);
    state.resources.mat += mat;
    events.push({ type: "good", text: `무너진 창고에서 자재 ${mat}.` });
  } else if (state.resources.med > 0 && state.members.length) {
    state.resources.med -= 1;
    const m = pick(state.members);
    hurt(m, 6);
    events.push({ type: "bad", text: `${displayName(m)}의 상처가 덧나 의약품 1을 더 썼다.` });
    if (m.hp <= 0) kill(m, events, "상처가 악화되어");
  }
}

function grantMilestones(events) {
  const lived = state.day - 1;
  const checks = [
    ["recruit", state.statsRecruited >= 1, "첫 영입. 명부가 한 줄 늘었다."],
    ["poach", state.statsPoached >= 1, "다른 세력에서 사람을 빼왔다. 그 대가는 관계로 남는다."],
    ["ten", state.members.length >= 10, "구성원 10명. 이제 세력이라 부를 만하다."],
    ["d15", lived >= 15, "15일을 버텼다."],
    ["d30", lived >= 30, "한 달. 이름은 남는다."],
    ["d60", lived >= 60, "두 달. 이 구역에서 이름을 아는 사람이 늘었다."],
    ["cap", state.members.some((m) => STATS.some((st) => m.stats[st.id].ca >= m.stats[st.id].pa && m.stats[st.id].pa >= 14 && m.stats[st.id].know >= 52)), "누군가 높은 포텐의 끝에 닿았다."],
    ["wall", state.facilities.wall >= 5, "방벽이 최고 단계에 올랐다."],
    ["farm", state.facilities.farm >= 3, "농지가 세력을 먹여 살릴 크기가 되었다."],
  ];
  checks.forEach(([id, ok, text]) => {
    if (ok && !state.flags[id]) {
      state.flags[id] = true;
      events.push({ type: "gold", text });
    }
  });
}

function checkOver(events) {
  state.members = state.members.filter((m) => m.hp > 0);
  if (!state.members.length) {
    state.over = { reason: "마지막 구성원까지 쓰러져 명부가 닫혔다.", lived: state.day };
    return;
  }
  succeedLeader(events);
  if (state.resources.food <= 0 && state.morale <= 8 && state.starved >= 3) {
    state.over = { reason: "굶주림과 사기 붕괴로 사람들이 흩어졌다.", lived: state.day };
  }
}

function snapshot() {
  return {
    food: state.resources.food,
    mat: state.resources.mat,
    med: state.resources.med,
    ammo: state.resources.ammo,
    morale: Math.round(state.morale),
    people: state.members.length,
  };
}

async function endDay() {
  if (!state || state.busy || state.over) return;
  state.busy = true;
  state.ui.detailId = null;
  state.ui.help = false;
  state.ui.report = false;
  render();
  const events = [];
  const before = snapshot();
  let failed = null;
  try {
    state.deathsToday = 0;
    state.meal = 0;
    state.maint = 0;
    state.members.forEach((m) => { m.reserved = false; });
    driftRelations();
    morningInfection(events);
    if (!state.members.length) {
      checkOver(events);
    } else {
      state.members.forEach((m) => noteRoleStint(m));
      runProduce(events);
      const encounters = [];
      await runLoots(encounters, events);
      for (const enc of encounters) {
        if (!state.members.some((m) => m.id === enc.actorId && m.hp > 0)) {
          enc.person.reserved = false;
          if (!enc.factionId) keepWanderer(enc.person);
          continue;
        }
        const choice = await openEncounter(enc);
        applyDecision(enc, choice, events);
        if (!state.members.length) break;
      }
      state.members.forEach((m) => { m.reserved = false; });
      state.factions.forEach((f) => f.members.forEach((m) => { m.reserved = false; }));
      if (state.members.length) {
        runMedic(events);
        runFood(events);
        runNight(events);
        runMorale(events);
        state.members.forEach((m) => {
          if (activeRole(m) === "rest") m.fatigue = clamp(m.fatigue - 36, 0, 100);
          else m.fatigue = clamp(m.fatigue - 8, 0, 100);
        });
        runDesert(events);
        runAI(events);
        runRandom(events);
        ageOneDay(events);
        checkOver(events);
      }
    }
    const lived = state.day;
    if (!state.over) state.day += 1;
    grantMilestones(events);
    events.forEach((e) => { if (!e.logged) pushLog({ ...e, day: lived }); });
    state.lastReport = { day: lived, events, before, after: snapshot(), over: state.over };
    autoEquip();
    state.members.forEach((m) => { m.rationed = false; });
    if (!failed) save(true);
  } catch (err) {
    failed = err;
    console.error(err);
    state.ui.error = "하루를 정리하다가 문제가 생겼다. 새로고침하면 마지막 저장으로 돌아간다.";
  } finally {
    state.busy = false;
    state.maint = 0;
    if (!failed) state.ui.report = true;
    render();
  }
}

function sortedMembers() {
  const list = state.members.slice();
  const leaders = list.filter((m) => m.leader);
  let rest = list.filter((m) => !m.leader);
  if (state.sort === "combat") rest.sort((a, b) => b.stats.combat.ca - a.stats.combat.ca);
  else if (state.sort === "ca") rest.sort((a, b) => sumCA(b) - sumCA(a));
  else if (state.sort === "name") rest.sort((a, b) => displayName(a).localeCompare(displayName(b), "ko"));
  else rest.sort((a, b) => (a.joinedDay || 0) - (b.joinedDay || 0));
  return leaders.concat(rest);
}

function sumCA(m) { return STATS.reduce((s, st) => s + m.stats[st.id].ca, 0); }
function sumPA(m) { return STATS.reduce((s, st) => s + m.stats[st.id].pa, 0); }

function statRows(m) {
  return STATS.map((st) => {
    const s = m.stats[st.id];
    const pa = paView(s);
    const need = xpNeed(s.ca, m, s);
    const stopped = growthStopped(m);
    const xp = stopped ? 0 : s.ca >= s.pa ? 100 : Math.max(4, Math.min(100, (s.xp / Math.max(1, need)) * 100));
    const capClass = s.ca >= s.pa ? "at-cap" : "";
    const paWidth = pa.hi ? (pa.hi / 20) * 100 : 0;
    return `<div class="stat-row"><span>${st.name}</span><div class="meter ${capClass}">${pa.hi ? `<i style="width:${paWidth}%"></i>` : ""}<b style="width:${(s.ca / 20) * 100}%"></b><em style="width:${xp}%"></em></div><span class="ca num">${s.ca}</span><span class="pa num">${pa.text}</span></div>`;
  }).join("");
}

function roleControls(m) {
  if (onTrip(m)) {
    const ex = state.expedition;
    const zone = zoneById(ex.zoneId);
    const done = ex.days - ex.left;
    return `<div class="assign"><span class="away-tag">원정 ${zone.name} · ${done}/${ex.days}일</span></div>`;
  }
  const role = m.role;
  const roles = ROLES.map((r) => `<option value="${r.id}" ${r.id === role ? "selected" : ""}>${r.name}</option>`).join("");
  let extra = "";
  if (role === "loot" && state.expedition) extra = `<span class="hint">이번 원정에는 빠졌다. 끝나면 다음 팀에 넣을 수 있다.</span>`;
  else if (role === "train") {
    extra = `<select data-bind="train:${m.id}">${STATS.map((s) => `<option value="${s.id}" ${s.id === m.trainStat ? "selected" : ""}>${s.name}</option>`).join("")}</select>`;
  } else if (role === "talk") {
    const options = state.members.filter((x) => x.id !== m.id).map((x) => `<option value="${x.id}" ${x.id === m.talkTarget ? "selected" : ""}>${esc(displayName(x))}</option>`).join("");
    extra = `<select data-bind="talk:${m.id}">${options}</select>`;
  }
  return `<div class="assign">${extra ? `<div class="assign-row" style="width:100%"><select data-bind="role:${m.id}">${roles}</select>${extra}</div>` : `<select data-bind="role:${m.id}">${roles}</select>`}</div>`;
}

function memberCard(m) {
  const t = traitOf(m);
  const gear = gearOf(m);
  const hpClass = m.hp < 35 ? "low" : m.hp < 70 ? "mid" : "";
  const newbie = m.joinedDay > 0 && m.joinedDay === state.day - 1;
  const prospect = STATS.some((st) => {
    const view = paView(m.stats[st.id]);
    return view.known && view.lo >= 15;
  });
  return `<article class="card ${m.leader ? "is-leader" : ""} ${m.infected ? "is-sick" : ""} ${onTrip(m) ? "is-away" : ""}">
    <header class="card-h">${portrait(m)}
      <div>
        <div class="name"><span data-showname="${m.id}">${esc(displayName(m))}</span> ${m.leader ? '<span class="tag">리더</span>' : ""} ${newbie ? '<span class="tag green">신입</span>' : ""} ${prospect ? '<span class="tag gold">유망</span>' : ""}</div>
        <div class="sub">${m.age}세${agePhase(m) ? ` · ${agePhase(m)}` : ""} · ${genderLabel(m.gender)} · ${t.name} · ${esc(m.background)}</div>
        <div class="sub" data-realnote="${m.id}">${String(m.nick || "").trim() ? `본명 ${esc(m.name)}` : ""}</div>
        <div class="sub">${condition(m)} · 피로 ${m.fatigue} · 기분 ${Math.round(m.mood)}${m.hp < 28 ? " · 중상이라 쉬게 된다" : ""}</div>
      </div>
      <div class="card-actions">
        <button class="btn-small" data-act="detail" data-id="${m.id}">기록</button>
        ${m.leader ? "" : `<button class="btn-small" data-act="appoint" data-id="${m.id}">리더</button>`}
      </div>
    </header>
    <div class="hp ${hpClass}"><span style="width:${m.hp}%"></span></div>
    ${m.growthNote ? `<div class="growth">${esc(m.growthNote)}</div>` : ""}
    ${roleControls(m)}
    <div class="gear-line">${gear ? esc(gear.name) : "맨손"}</div>
  </article>`;
}

function facilityBlock() {
  const rows = FACILITIES.map((f) => {
    const lv = state.facilities[f.id];
    const pips = Array.from({ length: f.max }, (_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("");
    const extra = f.id === "bunk" ? `<span class="num">수용 ${capFor(lv)}</span>` : `<span class="num">${lv}/${f.max}</span>`;
    return `<div class="fac-row"><span>${f.name}</span><span class="pips" title="${f.blurb}">${pips}</span>${extra}</div>`;
  }).join("");
  const canBuild = FACILITIES.filter((f) => state.facilities[f.id] < f.max);
  let project = "";
  if (state.project) {
    const f = facilityById(state.project.id);
    const pct = Math.min(100, (state.project.work / state.project.need) * 100);
    project = `<div class="block"><strong>${f.name} ${state.project.next}단계</strong><div class="progress"><span style="width:${pct}%"></span></div><div class="hint">${Math.floor(state.project.work)} / ${state.project.need} · 건축 담당이 진행한다.</div><button class="btn-small" data-act="cancel-project">중단 (자재 절반 회수)</button></div>`;
  } else if (!canBuild.length) {
    project = `<p class="hint">시설은 더 올릴 곳이 없다.</p>`;
  } else {
    if (!canBuild.some((f) => f.id === state.buildPick)) state.buildPick = canBuild[0].id;
    const options = canBuild.map((f) => {
      const cost = projCost(f.id);
      return `<option value="${f.id}" ${state.buildPick === f.id ? "selected" : ""}>${f.name} ${cost.next}단계 · 자재 ${cost.mat}</option>`;
    }).join("");
    const cost = projCost(state.buildPick);
    const bunkNote = state.buildPick === "bunk" ? ` 수용 ${cap()}명에서 ${capFor(state.facilities.bunk + 1)}명.` : "";
    project = `<div class="block"><select data-bind="buildPick">${options}</select><p class="hint">${facilityById(state.buildPick).blurb}.${bunkNote} 필요 자재 ${cost.mat}.</p><button class="btn" data-act="start-project" ${state.resources.mat < cost.mat ? "disabled" : ""}>공사 시작</button></div>`;
  }
  return `<div class="block"><strong>시설</strong>${rows}</div>${project}`;
}

function craftBlock() {
  if (state.craft) {
    const r = recipeById(state.craft.id);
    const pct = Math.min(100, (state.craft.work / state.craft.need) * 100);
    return `<div class="block"><strong>${r.name}</strong><div class="progress"><span style="width:${pct}%"></span></div><div class="hint">${Math.floor(state.craft.work)} / ${state.craft.need}</div><button class="btn-small" data-act="cancel-craft">중단</button></div>`;
  }
  const open = RECIPES.filter(recipeUnlocked);
  const locked = RECIPES.filter((r) => !recipeUnlocked(r));
  if (!open.some((r) => r.id === state.craftPick)) state.craftPick = open[0] ? open[0].id : "pipe";
  const options = open.map((r) => `<option value="${r.id}" ${state.craftPick === r.id ? "selected" : ""}>${r.name} · 자재 ${r.mat}${r.med ? ` 의약품 ${r.med}` : ""}</option>`).join("");
  const r = recipeById(state.craftPick || "pipe");
  const ok = r && state.resources.mat >= r.mat && state.resources.med >= r.med;
  const lockedLines = locked.map((item) => `<div class="lock-line">${esc(item.name)} · ${esc(lockText(item))}</div>`).join("");
  return `<div class="block"><strong>제작</strong><select data-bind="craftPick">${options}</select><p class="hint">${r ? r.desc : ""}. 공방 ${state.facilities.workshop} · 의무실 ${state.facilities.clinic} · 창고 ${state.facilities.warehouse || 0}</p><button class="btn" data-act="start-craft" ${ok ? "" : "disabled"}>제작 시작</button><p class="hint">구급낭 ${state.medkits} · 해독제 ${state.antidotes || 0} · 함정 ${state.traps}</p>${lockedLines}</div>`;
}

function basePanel() {
  const night = nightOutlook();
  const foodDays = (state.resources.food / Math.max(1, state.members.length)).toFixed(1);
  return `${sceneHTML()}
    <div class="night-box ${night.tone}">
      <strong>오늘 밤</strong>
      <div class="kv"><span>위협</span><span class="num">${night.threat.toFixed(1)}</span></div>
      <div class="kv"><span>방벽</span><span class="num">${night.wall.toFixed(1)}</span></div>
      <div class="kv"><span>경계</span><span class="num">${night.guard.toFixed(1)}</span></div>
      <div class="kv"><span>정비</span><span class="num">${night.maint.toFixed(1)}</span></div>
      <div class="kv"><span>물자까지</span><span class="num">${night.withItems.toFixed(1)}</span></div>
      <p class="hint">${night.text} 식량으로 약 ${foodDays}일.${state.factions.some((f) => f.relation <= -40) ? " 적대 세력의 습격이 올 수 있다." : ""}</p>
    </div>
    <p class="hint">수용 ${state.members.length}/${cap()} · 사기 ${Math.round(state.morale)}</p>
    ${facilityBlock()}
    ${craftBlock()}
    ${state.facilities.farm < 1 ? '<p class="hint">농지가 없으면 식량은 원정에만 기대게 된다.</p>' : ""}`;
}

function expeditionPanel() {
  const team = state.members.filter((m) => m.role === "loot" && m.hp >= 28 && !onTrip(m));
  const ex = state.expedition;
  if (ex) {
    const zone = zoneById(ex.zoneId);
    const lead = memberById(ex.leadId);
    const names = tripMembers(ex).map((m) => displayName(m)).join(", ") || "전원 이탈";
    const done = ex.days - ex.left;
    const forced = ex.foodLeft < tripMembers(ex).length;
    return `<div class="block">
      <strong>${esc(zone.name)} 원정</strong>
      <p class="hint">경과 ${done}/${ex.days}일 · 남은 식량 ${ex.foodLeft}/${ex.need} · 위험 ${zone.danger}</p>
      <p class="hint">원정 리더 ${lead ? esc(displayName(lead)) : "없음"} · 리더십 ${lead ? leadScore(lead) : 0}</p>
      <p class="hint">${esc(names)}</p>
      ${fieldChoices(ex)}
      <div class="progress"><span style="width:${((ex.days - ex.left) / ex.days) * 100}%"></span></div>
    </div>
    <p class="hint">원정이 끝나기 전에는 다른 곳으로 갈 수 없다. 팀에 없는 원정 담당은 거점에 남는다.</p>`;
  }
  if (team.length && !team.some((m) => m.id === state.expeditionLead)) {
    state.expeditionLead = team.slice().sort((a, b) => leadScore(b) - leadScore(a))[0].id;
  }
  const zone = zoneById(state.lootZone || "homes");
  const need = team.length * (zone.days || 1);
  const short = team.length > 0 && state.resources.food < need;
  const ready = team.length >= 2 && team.some((m) => m.id === state.expeditionLead);
  const zones = ZONES.map((z) => `<button class="zone ${z.id === zone.id ? "on" : ""}" data-act="pick-zone" data-zone="${z.id}"><b>${z.name}</b><span>${z.days}일 · 위험 ${z.danger}</span></button>`).join("");
  const leads = team.map((m) => `<option value="${m.id}" ${m.id === state.expeditionLead ? "selected" : ""}>${esc(displayName(m))} · 리더십 ${leadScore(m)}</option>`).join("");
  return `<div class="block">
      <strong>원정</strong>
      <p class="hint">최소 2명. 원정 리더의 리더십이 회피와 영입 확률을 올린다. 식량은 인원 × 일수.</p>
      <div class="zone-grid">${zones}</div>
      <p class="hint">${esc(zone.name)} · ${zone.days}일 · 팀 ${team.length}명 · 필요 식량 ${need} · 보유 ${state.resources.food}</p>
      ${team.length ? `<div class="field"><span>원정 리더</span><select data-bind="expeditionLead">${leads}</select></div>` : `<p class="hint">원정으로 배치한 사람이 없다.</p>`}
      ${team.length < 2 ? `<p class="hint warn-line">원정은 최소 2명이 필요하다.</p>` : ""}
      ${short ? `<p class="hint warn-line">식량이 ${need - state.resources.food} 모자라다. 부족한 날은 위험한 구간을 회피하지 못하고 강행한다.</p>` : ""}
      <button class="btn" data-act="depart" ${ready ? "" : "disabled"}>출발</button>
    </div>`;
}

function fieldChoices(ex) {
  if (!ex || ex.phase === "done") {
    const notes = (ex && ex.notes || []).map((t) => `<div class="log-line info">${esc(t)}</div>`).join("");
    return `${notes}<p class="hint">오늘의 선택은 끝났다. 하루를 보내면 거점이 밤을 넘긴다.</p>`;
  }
  const scene = ex.phase === "event" ? eventScene(ex) : routeScene(ex);
  const buttons = scene.choices.map((c) => `<button class="choice ${c.danger ? "danger" : ""}" data-act="field" data-choice="${c.id}" ${c.disabled || state.busy ? "disabled" : ""}><b>${esc(c.title)}</b><span>${esc(c.detail)}</span></button>`).join("");
  const notes = (ex.notes || []).map((t) => `<div class="log-line info">${esc(t)}</div>`).join("");
  return `${scene.html || `<p>${esc(scene.text || "")}</p>`}${scene.note ? `<p class="hint">${esc(scene.note)}</p>` : ""}${notes}<div class="choice-grid">${buttons}</div>`;
}

function pawnBar() {
  return `<footer class="pawnbar">${sortedMembers().map((m) => {
    const hpClass = m.hp < 35 ? "low" : m.hp < 70 ? "mid" : "";
    return `<button class="pawn ${m.leader ? "is-leader" : ""} ${onTrip(m) ? "is-away" : ""}" data-act="detail" data-id="${m.id}">
      ${portrait(m)}
      <span>${esc(displayName(m))}</span>
      <i class="hp ${hpClass}"><b style="width:${m.hp}%"></b></i>
      ${onTrip(m) ? "<em>원정</em>" : `<em>${ROLES.find((r) => r.id === m.role)?.name || ""}</em>`}
    </button>`;
  }).join("")}</footer>`;
}
function factionPanel() {
  return state.factions.map((f) => {
    const rel = Math.round(f.relation);
    const width = Math.abs(rel) / 2;
    const known = f.members.filter((m) => m.met && !m.boss).map((m) => displayName(m));
    const cool = (state.cooldowns[f.id] || 0) > state.day;
    return `<article class="faction">
      <strong>${esc(f.name)}</strong>
      <div class="sub">${esc(f.desc)}</div>
      <div class="sub">수장 ${esc(f.bossName)} · 구성원 ${f.members.length}명 · ${relLabel(rel)} ${rel}</div>
      <div class="rel"><i class="rel-zero"></i><b class="${rel >= 0 ? "plus" : "minus"}" style="width:${width}%"></b></div>
      <div class="sub">${known.length ? `마주친 사람: ${known.map(esc).join(", ")}` : "아직 얼굴을 본 구성원이 없다."}</div>
      <div class="row-btns">
        <button class="btn-small" data-act="aid" data-kind="food" data-id="${f.id}" ${cool || state.resources.food < 5 ? "disabled" : ""}>식량 5 지원 +8</button>
        <button class="btn-small" data-act="aid" data-kind="sorry" data-id="${f.id}" ${cool || f.relation >= 0 || state.resources.food < 4 || state.resources.mat < 3 ? "disabled" : ""}>사과 +14</button>
        <button class="btn-small" data-act="aid" data-kind="trade" data-id="${f.id}" ${cool || f.relation < 30 || state.resources.food < 4 ? "disabled" : ""}>교역</button>
      </div>
      ${cool ? `<p class="hint">${state.cooldowns[f.id]}일차까지 다음 접촉을 기다린다.</p>` : ""}
    </article>`;
  }).join("") + `<p class="hint">길에서 마주친 생존자 ${state.wanderers.length}명. 빼오기에 성공하면 관계가 크게 떨어지고, 실패해도 절반쯤 떨어진다.</p>`;
}

function logPanel() {
  const lines = state.log.slice().reverse().map((e) => `<div class="log-line ${e.type}"><span class="when">${e.day}일</span>${esc(e.text)}</div>`).join("");
  const dead = state.dead.length ? `<div class="block"><strong>닫힌 이름</strong><p class="hint">${state.dead.map((d) => `${esc(deadLabel(d))} · ${d.day}일차 ${esc(d.why)}`).join("<br>")}</p></div>` : "";
  return (lines || '<p class="empty">아직 기록이 없다.</p>') + dead;
}

function gameHTML() {
  const night = nightOutlook();
  const lowFood = state.resources.food < state.members.length * 2;
  const res = [
    ["food", "식량", state.resources.food, lowFood],
    ["mat", "자재", state.resources.mat, false],
    ["med", "의약품", state.resources.med, false],
    ["ammo", "탄약", state.resources.ammo, false],
    ["morale", "사기", Math.round(state.morale), state.morale < 35],
    ["kit", "구급", state.medkits, false],
    ["trap", "함정", state.traps, false],
  ].map(([k, n, v, warn]) => `<span class="tile ${warn ? "warn" : ""}"><i class="ico ${k}"></i><b class="num">${v}</b><em>${n}</em></span>`).join("");
  const ops = state.ui.view === "ops";
  const panel = state.ui.panel === "expedition" ? expeditionPanel() : state.ui.panel === "factions" ? factionPanel() : state.ui.panel === "log" ? logPanel() : basePanel();
  const body = ops
    ? `<div class="layout ops-layout">
        <section class="ledger"><div class="ledger-bar"><h2>거점</h2></div><div class="side-body">${basePanel()}</div></section>
        <section class="ledger"><div class="ledger-bar"><h2>원정</h2></div><div class="side-body">${expeditionPanel()}</div></section>
      </div>`
    : `<div class="layout">
      <section class="ledger">
        <div class="ledger-bar">
          <div class="bar-left"><h2>인원 ${state.members.length}/${cap()}</h2>
            <select data-bind="sort">
              <option value="join" ${state.sort === "join" ? "selected" : ""}>합류순</option>
              <option value="combat" ${state.sort === "combat" ? "selected" : ""}>전투</option>
              <option value="ca" ${state.sort === "ca" ? "selected" : ""}>능력 합</option>
              <option value="name" ${state.sort === "name" ? "selected" : ""}>이름</option>
            </select>
          </div>
          <div class="bar-right"><button class="btn-ghost" data-act="recommend" ${state.busy || state.over ? "disabled" : ""}>추천 배치</button></div>
        </div>
        <div class="roster-scroll"><div class="roster">${sortedMembers().map(memberCard).join("")}</div>
          ${state.day <= 2 ? '<p class="hint">능력 수치는 기록을 열면 본다. 막대 오른쪽은 포텐이고, ?? 는 아직 모른다.</p>' : ""}
        </div>
      </section>
      <aside class="ledger">
        <div class="tabs">
          <button data-act="panel" data-panel="expedition" class="${state.ui.panel === "expedition" ? "on" : ""}">원정</button>
          <button data-act="panel" data-panel="base" class="${state.ui.panel === "base" ? "on" : ""}">거점</button>
          <button data-act="panel" data-panel="factions" class="${state.ui.panel === "factions" ? "on" : ""}">세력</button>
          <button data-act="panel" data-panel="log" class="${state.ui.panel === "log" ? "on" : ""}">일지</button>
        </div>
        <div class="side-body">${panel}</div>
      </aside>
    </div>`;
  return `<div class="shell">
    <header class="top">
      <div class="brand">더 어노말리<small>${esc(state.factionName)}</small></div>
      <div class="res">${res}</div>
      <div class="top-actions">
        <div class="day-stamp"><div class="d num">${state.day}</div><div class="sub">일차 · 밤 ${night.tone === "bad" ? "위험" : night.tone === "mid" ? "아슬" : "안정"}</div></div>
        <button class="btn-ghost ${ops ? "" : "on"}" data-act="view" data-view="roster">명부</button>
        <button class="btn-ghost ${ops ? "on" : ""}" data-act="view" data-view="ops">현장</button>
        <button class="btn-ghost" data-act="help">도움말</button>
        <button class="btn" data-act="end" ${state.busy || state.over ? "disabled" : ""}>${state.busy ? "하루가 가는 중" : "하루 보내기"}</button>
      </div>
    </header>
    ${body}
    ${pawnBar()}
  </div>${modalHTML()}`;
}

function modalHTML() {
  if (state.ui.scene) return sceneModal(state.ui.scene);
  if (state.ui.encounter) return encounterModal(state.ui.encounter);
  if (state.ui.report && state.lastReport) return reportModal(state.lastReport);
  if (state.over && !state.ui.report) return overModal();
  if (state.ui.help) return helpModal();
  if (state.ui.detailId) return detailModal(state.ui.detailId);
  if (state.ui.error) return `<div class="modal-back"><div class="modal"><h3>문제</h3><p>${esc(state.ui.error)}</p><button class="btn" data-act="clear-error">확인</button></div></div>`;
  return "";
}

function sceneModal(scene) {
  const choices = scene.choices.map((c) => `<button class="choice ${c.danger ? "danger" : ""}" data-act="choice" data-choice="${c.id}" ${c.disabled ? "disabled" : ""}><b>${esc(c.title)}</b><span>${esc(c.detail)}</span></button>`).join("");
  return `<div class="modal-back"><div class="modal wide sheet">
    <div class="sheet-body">
      <h3>${esc(scene.title)}</h3>
      ${scene.html || `<p>${esc(scene.text || "")}</p>`}
      ${scene.note ? `<p class="hint">${esc(scene.note)}</p>` : ""}
    </div>
    <div class="choice-grid">${choices}</div>
  </div></div>`;
}

function belongLine(person, faction) {
  if (person.boss && faction) return `${faction.name} 수장 · 관계 ${relLabel(Math.round(faction.relation))} ${Math.round(faction.relation)}`;
  if (faction) return `${faction.name} 소속 · 관계 ${relLabel(Math.round(faction.relation))} ${Math.round(faction.relation)}`;
  return "소속 없음 · 홀로 있는 생존자";
}

function encounterModal(enc) {
  const person = enc.person;
  const actor = memberById(enc.actorId);
  const faction = enc.factionId ? factionById(enc.factionId) : null;
  const t = traitOf(person);
  const zone = zoneById(enc.zoneId);
  const ask = recruitChance(enc, faction ? "poach" : "ask");
  const food = recruitChance(enc, "food");
  const hit = relationDamage(person, "poach", true);
  const foodHit = relationDamage(person, "food", true);
  const quote = QUOTES[person.trait] || "…한참을 망설인다.";
  const choices = [];
  choices.push(`<button class="choice" data-act="choice" data-choice="observe"><b>눈여겨보기</b><span>영입하지 않고 포텐 정보를 얻는다. 관계는 그대로다.</span></button>`);
  if (!faction) {
    choices.push(`<button class="choice" data-act="choice" data-choice="ask"><b>설득해서 영입 · ${ask}%</b><span>소속 없는 생존자다. 거점의 사기와 발견자의 정신력이 통한다.</span></button>`);
    choices.push(`<button class="choice" data-act="choice" data-choice="food" ${state.resources.food < 3 ? "disabled" : ""}><b>식량을 건넴 · ${food}%</b><span>식량 3. 성공률이 오른다.</span></button>`);
  } else {
    choices.push(`<button class="choice danger" data-act="choice" data-choice="poach"><b>빼오기 · ${ask}%</b><span>성공 시 ${faction.name} 관계 약 -${hit}. 실패해도 약 -${Math.max(4, Math.round(hit * 0.5))}.</span></button>`);
    choices.push(`<button class="choice danger" data-act="choice" data-choice="food" ${state.resources.food < 3 ? "disabled" : ""}><b>식량으로 회유 · ${food}%</b><span>식량 3. 관계 하락은 약 -${foodHit}로 조금 덜하다.</span></button>`);
  }
  choices.push(`<button class="choice" data-act="choice" data-choice="ignore"><b>지나치기</b><span>아무것도 변하지 않는다.</span></button>`);
  return `<div class="modal-back"><div class="modal wide sheet">
    <div class="sheet-body">
    <div class="person-head">${portrait(person)}
      <div>
        <h3>${esc(displayName(person))}</h3>
        <div class="sub">${person.age}세 · ${genderLabel(person.gender)} · ${t.name} · ${esc(person.background)}</div>
        <div class="sub">본명 ${esc(person.name)}</div>
        <div class="sub">${esc(belongLine(person, faction))}</div>
        ${faction ? `<div class="sub">${esc(faction.desc)}</div>` : ""}
        <div class="sub">${esc(zone.name)} · 발견 ${esc(actor ? displayName(actor) : "누군가")}</div>
      </div>
    </div>
    <div class="quote">“${esc(quote)}”</div>
    <p class="hint">${esc(t.desc)} 현재 능력은 보이고, 포텐은 아는 만큼만 열린다.</p>
    ${enc.leadId && memberById(enc.leadId) ? `<p class="hint">원정 리더 ${esc(displayName(memberById(enc.leadId)))} · 리더십 ${leadScore(memberById(enc.leadId))}. 이 수치가 설득 확률에 더해진다.</p>` : ""}
    ${state.members.length >= cap() ? `<p class="hint">막사 정원 ${cap()}명을 넘었다. 이 상태의 영입은 거의 통하지 않는다.</p>` : ""}
    <div class="stats">${statRows(person)}</div>
    </div>
    <div class="choice-grid">${choices.join("")}</div>
  </div></div>`;
}

function reportModal(rep) {
  const keys = [["food", "식량"], ["mat", "자재"], ["med", "의약품"], ["ammo", "탄약"], ["morale", "사기"], ["people", "인원"]];
  const deltas = keys.map(([k, label]) => {
    const a = rep.before[k];
    const b = rep.after[k];
    const d = b - a;
    const sign = d > 0 ? `+${d}` : `${d}`;
    return `<span class="chip">${label} ${a}→${b} (${sign})</span>`;
  }).join("");
  const lines = rep.events.length
    ? rep.events.map((e) => `<div class="log-line ${e.type}">${esc(e.text)}</div>`).join("")
    : '<p class="empty">조용히 지나간 하루.</p>';
  return `<div class="modal-back"><div class="modal wide">
    <h3>${rep.day}일차의 기록</h3>
    <div class="res" style="justify-content:flex-start;margin-bottom:8px">${deltas}</div>
    ${lines}
    ${rep.over ? `<p class="hint">${esc(rep.over.reason)}</p>` : ""}
    <div class="row-btns"><button class="btn" data-act="close-report">${rep.over ? "결말" : "다음 아침"}</button></div>
  </div></div>`;
}

function overModal() {
  const best = state.members.slice().sort((a, b) => sumCA(b) - sumCA(a))[0];
  return `<div class="modal-back"><div class="modal">
    <div class="over-stamp">명부 폐쇄</div>
    <h3>${esc(state.over.reason)}</h3>
    <p>${esc(state.factionName)}은 ${state.over.lived}일차까지 이름을 지켰다.</p>
    <p class="hint">영입 ${state.statsRecruited} · 빼오기 ${state.statsPoached} · 사망 ${state.dead.length}${best ? ` · 마지막 중심 ${esc(displayName(best))}` : ""}</p>
    <button class="btn" data-act="title">새 명부</button>
  </div></div>`;
}

function helpModal() {
  return `<div class="modal-back"><div class="modal help" data-act="noop">
    <h3>더 어노말리</h3>
    <p>당신은 세력의 리더다. 구성원을 배치하고 하루를 보낸다. 시작 화면에서 본명을 정할 수 있고, 게임 안에서는 별명만 바꾼다. 본명은 기록에 남는다.</p>
    <p>각 능력은 현재 수치와 포텐으로 나뉜다. 포텐은 성장 한도다. 처음 만난 사람은 ?? 로 가려져 있고, 그 일과를 맡기거나 면담하면 범위가 드러난다. 24세까지는 적성에 맞는 일을 오래 맡기면 포텐 끝까지 갈 수 있다. 그 다음부터는 끝 몇 칸이 매우 느리고, 적성에 안 맞는 일은 거의 늘지 않는다. 56세부터는 성장이 멈추고, 시간이 지나면 능력이 조금씩 떨어진다. 만학은 일흔을 넘길 때까지 자란다.</p>
    <p>원정 중에는 그날의 선택이 뜬다. 위험하게 뒤지면 자원을 많이 얻고, 안전하게 고르면 적게 얻는다. 식량이 떨어지면 안전한 길은 막힌다. 낮은 확률로 무기고나 생존자가 나타나고, 생존자는 소속과 그 세력과의 관계가 보인다. 위쪽 현장에서는 거점과 원정을 한 화면에서 같이 본다.</p>
    <p>세력 리더는 기록이나 카드의 리더 버튼으로 바꿀 수 있다. 막사를 올릴 때마다 수용 인원이 2명씩 늘어난다. 공방, 의무실, 창고 단계가 오르면 만들 수 있는 물건이 열린다.</p>
    <p>생존자는 영입할 수 있다. 이미 세력이 있으면 빼올 수 있지만, 그 세력과 관계가 떨어진다. 실패해도 절반쯤 떨어진다. 적대까지 가면 밤에 습격이 온다. 식량 지원, 사과, 교역으로 관계를 되돌릴 수 있다.</p>
    <p>농사·요리·건축·제작·의학·경계는 거점을 먹이고 지킨다. 훈련은 성장을 앞당기고, 휴식은 피로와 부상을 돌본다. 야간 위협이 방어를 넘으면 사람이 다친다.</p>
    <button class="btn" data-act="close-help">닫기</button>
  </div></div>`;
}

function detailModal(id) {
  const m = memberById(id);
  if (!m) return "";
  const t = traitOf(m);
  const used = equippedSet();
  const gears = state.armory.filter((g) => g.uid === m.gearId || !used.has(g.uid));
  const gearOpts = `<option value="">맨손</option>` + gears.map((g) => `<option value="${g.uid}" ${g.uid === m.gearId ? "selected" : ""}>${esc(g.name)}</option>`).join("");
  const story = (m.story || []).slice().reverse().map((s) => `<div class="log-line info">${esc(s)}</div>`).join("") || '<p class="empty">아직 이력이 없다.</p>';
  return `<div class="modal-back" data-act="close-detail"><div class="modal wide" data-act="noop">
    <div class="person-head">${portrait(m)}
      <div><h3><span data-showname="${m.id}">${esc(displayName(m))}</span> ${m.leader ? '<span class="tag">리더</span>' : ""}</h3>
      <div class="sub">${m.age}세${agePhase(m) ? ` · ${agePhase(m)}` : ""} · ${genderLabel(m.gender)} · ${t.name} · ${esc(m.background)}</div>
      <div class="sub">${esc(t.desc)}</div>
      <div class="sub">${esc(ageHint(m))}</div></div>
    </div>
    <div class="field" style="margin-top:10px"><span>본명</span><input value="${esc(m.name)}" readonly></div>
    <div class="field"><span>별명</span><input data-bind="nick:${m.id}" maxlength="16" placeholder="비워 두면 본명으로 불린다" value="${esc(m.nick || "")}"></div>
    <div class="stats" style="margin-top:10px">${statRows(m)}</div>
    <div class="field" style="margin-top:10px"><span>장비</span><select data-bind="gear:${m.id}">${gearOpts}</select></div>
    ${m.leader ? "" : `<button class="btn" data-act="appoint" data-id="${m.id}">세력 리더로 세우기</button>`}
    <h3 style="font-size:16px">이력</h3>
    ${story}
    <button class="btn" data-act="close-detail">닫기</button>
  </div></div>`;
}

function titleHTML() {
  const saved = readSave();
  const leader = draft.leader;
  const mateCards = draft.mates.map((m) => `<article class="mini">
        <div class="field"><span>본명</span><input data-bind="mateName:${m.id}" maxlength="12" placeholder="본명을 고칠 수 있다" value="${esc(m.name)}"></div>
      <div class="sub">${m.age}세${agePhase(m) ? ` · ${agePhase(m)}` : ""} · ${genderLabel(m.gender)} · ${traitOf(m).name} · ${esc(m.background)}</div>
      <div class="field"><span>별명</span><input data-bind="mateNick:${m.id}" maxlength="16" placeholder="없으면 본명" value="${esc(m.nick || "")}"></div>
      <div class="stats">${statRows(m)}</div>
    </article>`).join("");
  return `<div class="title-wrap"><div class="title-card">
    <h1>더 어노말리</h1>
    <p class="lede">좀비가 길을 막은 도시에서, 당신은 세력의 리더다. 원정대를 보내 생존자를 영입하고, 다른 세력의 사람을 빼오며 이름을 불린다. 사람마다 일곱 가지 재능과, 끝까지 끌어올릴 포텐이 있다.</p>
    <div class="field"><span>세력 이름</span><input data-bind="draftFaction" maxlength="16" placeholder="우리 세력" value="${esc(draft.factionName)}"></div>
    <div class="diff">
      ${Object.entries(DIFF).map(([id, d]) => `<button data-act="diff" data-diff="${id}" class="${draft.difficulty === id ? "on" : ""}"><b>${d.label}</b><div class="sub">${d.desc}</div></button>`).join("")}
    </div>
    <div class="party">
      <article class="mini leader">
        <div class="field"><span>본명</span><input data-bind="draftName" maxlength="12" placeholder="본명을 고칠 수 있다" value="${esc(leader.name)}"></div>
        <div class="field"><span>별명</span><input data-bind="draftNick" maxlength="16" placeholder="없으면 본명으로 불린다" value="${esc(leader.nick || "")}"></div>
        <div class="sub">${leader.age}세${agePhase(leader) ? ` · ${agePhase(leader)}` : ""} · ${genderLabel(leader.gender)} · ${traitOf(leader).name} · ${esc(leader.background)} · 능력 합 ${sumCA(leader)} · 포텐 합 ${sumPA(leader)}</div>
        <div class="stats">${statRows(leader)}</div>
      </article>
      ${mateCards}
    </div>
    <div class="row-btns" style="margin-top:14px">
      <button class="btn" data-act="start">이 구성으로 시작</button>
      <button class="btn-ghost" data-act="reroll">구성 다시 뽑기</button>
      ${saved ? '<button class="btn-ghost" data-act="continue">이어하기</button><button class="btn-ghost" data-act="wipe">기록 지우기</button>' : ""}
    </div>
  </div></div>`;
}

function render() {
  if (state && state.expedition) ensureExpeditionMorning();
  const roster = document.querySelector(".roster-scroll");
  const side = document.querySelector(".side-body");
  if (roster) scrollMem.roster = roster.scrollTop;
  if (side) scrollMem.side = side.scrollTop;
  document.getElementById("app").innerHTML = state ? gameHTML() : titleHTML();
  const r2 = document.querySelector(".roster-scroll");
  const s2 = document.querySelector(".side-body");
  if (r2) r2.scrollTop = scrollMem.roster;
  if (s2) s2.scrollTop = scrollMem.side;
}

function onClick(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === "noop") { e.stopPropagation(); return; }
  if (act === "diff") {
    draft.difficulty = btn.dataset.diff;
    render();
    return;
  }
  if (act === "reroll") {
    const nameLocked = draft.leaderNameLocked;
    const leaderName = draft.leader.name || "";
    const factionName = draft.factionName;
    const locked = draft.leaderLocked;
    const leaderNick = draft.leader.nick || "";
    const difficulty = draft.difficulty;
    draft = null;
    draft = makeDraft();
    draft.factionName = factionName;
    draft.difficulty = difficulty;
    if (locked) {
      draft.leader.nick = leaderNick;
      draft.leaderLocked = true;
    }
    if (nameLocked && leaderName.trim()) {
      draft.leader.name = leaderName.trim().slice(0, 12);
      draft.leaderNameLocked = true;
    }
    render();
    return;
  }
  if (act === "start") { beginGame(); return; }
  if (act === "continue") { continueGame(); return; }
  if (act === "wipe" || act === "title") { backToTitle(); return; }
  if (!state) return;
  if (act === "end") { endDay(); return; }
  if (act === "view") {
    state.ui.view = btn.dataset.view === "ops" ? "ops" : "roster";
    render();
    return;
  }
  if (act === "depart") { departExpedition(); return; }
  if (act === "appoint") { appointLeader(btn.dataset.id); return; }
  if (act === "pick-zone") {
    if (!state.expedition) {
      state.lootZone = btn.dataset.zone;
      save();
      render();
    }
    return;
  }
  if (act === "field") { onField(btn.dataset.choice); return; }
  if (act === "recommend") { recommend(); return; }
  if (act === "help") { state.ui.help = true; render(); return; }
  if (act === "close-help") { state.ui.help = false; render(); return; }
  if (act === "panel") { state.ui.panel = btn.dataset.panel; render(); return; }
  if (act === "detail") { state.ui.detailId = btn.dataset.id; render(); return; }
  if (act === "close-detail") { state.ui.detailId = null; render(); return; }
  if (act === "close-report") {
    state.ui.report = false;
    render();
    return;
  }
  if (act === "clear-error") { state.ui.error = null; render(); return; }
  if (act === "start-project") { startProject(state.buildPick); return; }
  if (act === "cancel-project") { cancelProject(); return; }
  if (act === "start-craft") { startCraft(state.craftPick); return; }
  if (act === "cancel-craft") { cancelCraft(); return; }
  if (act === "aid") { aidFaction(btn.dataset.id, btn.dataset.kind); return; }
  if (act === "choice") {
    if (!pending) return;
    const resolve = pending;
    pending = null;
    state.ui.encounter = null;
    state.ui.scene = null;
    resolve(btn.dataset.choice);
  }
}

function onNickInput(e) {
  const el = e.target;
  if (!el || !el.dataset || !el.dataset.bind) return;
  const [kind, id] = el.dataset.bind.split(":");
  const value = el.value.slice(0, 16);
  if (!state) {
    if (kind === "draftNick") {
      draft.leader.nick = value;
      draft.leaderLocked = true;
    } else if (kind === "draftName") {
      draft.leader.name = value.trim().slice(0, 12);
      draft.leaderNameLocked = true;
    } else if (kind === "mateNick") {
      const mate = draft.mates.find((person) => person.id === id);
      if (mate) mate.nick = value;
    } else if (kind === "mateName") {
      const mate = draft.mates.find((person) => person.id === id);
      if (mate) mate.name = value.trim().slice(0, 12);
    }
    return;
  }
  if (kind !== "nick") return;
  const member = memberById(id);
  if (!member) return;
  member.nick = value;
  const shown = displayName(member);
  document.querySelectorAll(`[data-showname="${id}"]`).forEach((node) => {
    node.textContent = shown;
  });
  document.querySelectorAll(`[data-realnote="${id}"]`).forEach((node) => {
    node.textContent = value.trim() ? `본명 ${member.name}` : "";
  });
}

function onChange(e) {
  const el = e.target.closest("[data-bind]");
  if (!el) return;
  const [kind, id] = el.dataset.bind.split(":");
  if (!state) {
    if (kind === "draftFaction") draft.factionName = el.value.slice(0, 16);
    return;
  }
  if (kind === "nick") {
    const m = memberById(id);
    if (m) {
      m.nick = el.value.trim().slice(0, 16);
      save();
    }
    return;
  }
  if (kind === "role") {
    const m = memberById(id);
    if (!m || onTrip(m)) return;
    m.role = el.value;
    autoEquip();
  } else if (kind === "lootZone") {
    if (!state.expedition) state.lootZone = el.value;
  } else if (kind === "expeditionLead") {
    if (!state.expedition) state.expeditionLead = el.value;
  } else if (kind === "train") {
    const m = memberById(id);
    if (m) m.trainStat = el.value;
  } else if (kind === "talk") {
    const m = memberById(id);
    if (m) m.talkTarget = el.value;
  } else if (kind === "gear") {
    const m = memberById(id);
    if (m) m.gearId = el.value || null;
  } else if (kind === "buildPick") state.buildPick = el.value;
  else if (kind === "craftPick") state.craftPick = el.value;
  else if (kind === "sort") state.sort = el.value;
  else return;
  save();
  render();
}

function onKey(e) {
  if (e.key !== "Escape" || !state || state.ui.encounter) return;
  if (state.ui.detailId || state.ui.help) {
    state.ui.detailId = null;
    state.ui.help = false;
    render();
  }
}

function boot() {
  draft = makeDraft();
  document.getElementById("app").addEventListener("click", onClick);
  document.getElementById("app").addEventListener("change", onChange);
  document.getElementById("app").addEventListener("input", onNickInput);
  document.addEventListener("keydown", onKey);
  render();
}

boot();
