import { applyMood } from "./member-system.js";
import { joinsConversation, keepsPositiveBond, loyalNewcomerOffset } from "./trait-system.js";

const FRIENDLY_PAIRS = [
  ["낙천", "냉정"], ["자비", "생존본능"], ["충직", "자비"], ["외톨이", "냉정"],
  ["유순함", "자비"], ["유순함", "낙천"],
];
const CLASH_PAIRS = [
  ["다혈질", "냉정"], ["야심", "충직"], ["외톨이", "낙천"], ["다혈질", "자비"],
  ["사이코패스", "자비"], ["겁쟁이", "다혈질"], ["유순함", "다혈질"], ["유순함", "야심"],
];

export function initializeRelationships(members) {
  members.forEach((member) => {
    member.relationships ??= {};
    member.recentConversations ??= [];
  });
  members.forEach((member) => ensureRelationshipsFor(member, members));
}

export function ensureRelationshipsFor(member, members) {
  member.relationships ??= {};
  member.recentConversations ??= [];
  members.forEach((other) => {
    if (other.id === member.id) return;
    other.relationships ??= {};
    if (member.relationships[other.id] == null) member.relationships[other.id] = random(-8, 8) + compatibility(member, other) + loyalNewcomerOffset(member, other);
    if (other.relationships[member.id] == null) other.relationships[member.id] = random(-8, 8) + compatibility(other, member) + loyalNewcomerOffset(other, member);
  });
}

export function processDailyConversation(members, day) {
  const pool = members.filter((member) => joinsConversation(member));
  if (pool.length < 2) return [];
  const shuffled = [...pool].sort(() => Math.random() - .5);
  const [first, second] = shuffled;
  const base = compatibility(first, second);
  const delta = clamp(base + random(-2, 2), -4, 4) || 1;
  let firstDelta = clamp(delta, -4, 4);
  let secondDelta = clamp(delta + random(-1, 1), -4, 4);
  if (!keepsPositiveBond(first) && firstDelta > 0) firstDelta = 0;
  if (!keepsPositiveBond(second) && secondDelta > 0) secondDelta = 0;
  if (firstDelta) first.relationships[second.id] = clamp((first.relationships[second.id] ?? 0) + firstDelta, -100, 100);
  if (secondDelta) second.relationships[first.id] = clamp((second.relationships[first.id] ?? 0) + secondDelta, -100, 100);

  const positive = firstDelta + secondDelta >= 0;
  const text = positive
    ? `${first.name}과(와) ${second.name}이(가) 편안한 대화를 나눴다.`
    : `${first.name}과(와) ${second.name}의 대화가 불편하게 끝났다.`;
  const moodFor = (member) => {
    if (positive && member.trait === "냉정") return 0;
    return positive ? 2 : -2;
  };
  const firstMood = moodFor(first);
  const secondMood = moodFor(second);
  if (firstMood) applyMood(first, firstMood, `${second.name}과의 대화`, day);
  if (secondMood) applyMood(second, secondMood, `${first.name}과의 대화`, day);
  recordConversation(first, second, text, firstDelta, day);
  recordConversation(second, first, text, secondDelta, day);
  return [text];
}

export function applyTaskRelationshipMood(members, day) {
  const notes = [];
  members.forEach((member) => {
    const coworkers = members.filter((other) => other.id !== member.id && other.task === member.task);
    if (member.trait === "외톨이" && coworkers.length) {
      applyMood(member, -1, "여럿이 같은 일", day);
      notes.push(`${member.name}은(는) 여럿이 같은 일을 하는 것이 불편했다.`);
    }
    if (!coworkers.length) return;
    const strongest = coworkers.reduce((best, other) => {
      const value = member.relationships[other.id] ?? 0;
      return Math.abs(value) > Math.abs(best.value) ? { other, value } : best;
    }, { other: null, value: 0 });
    if (strongest.value >= 20 && member.trait !== "사이코패스" && strongest.other.trait !== "사이코패스") {
      applyMood(member, 1, `${strongest.other.name}과 함께 일함`, day);
      notes.push(`${member.name}은(는) 친한 동료와 함께 일해 기분이 좋아졌다.`);
    } else if (strongest.value <= -20) {
      applyMood(member, -1, `${strongest.other.name}과 함께 일함`, day);
      notes.push(`${member.name}은(는) 불편한 동료와 일해 기분이 나빠졌다.`);
    }
  });
  return notes;
}

export function relationshipLabel(value) {
  if (value <= -60) return "원수";
  if (value <= -20) return "불편";
  if (value < 20) return "중립";
  if (value < 60) return "친함";
  return "절친";
}

function recordConversation(member, other, text, delta, day) {
  member.recentConversations.unshift({ day, memberId: other.id, text, delta });
  member.recentConversations = member.recentConversations.slice(0, 10);
}

export function traitsClash(first, second) {
  return CLASH_PAIRS.some((pair) => pair.includes(first.trait) && pair.includes(second.trait));
}

function compatibility(first, second) {
  if (FRIENDLY_PAIRS.some((pair) => pair.includes(first.trait) && pair.includes(second.trait))) return 2;
  if (traitsClash(first, second)) return -2;
  if (first.trait === second.trait) return 1;
  return 0;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
