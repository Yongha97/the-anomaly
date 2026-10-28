import { BASE_EVENTS, EXPEDITION_EVENTS } from "../data/events.js";
import { getStat } from "./member-system.js";

export function rollBaseEvent({ day, members, facilities, cooldowns }) {
  if (Math.random() > Math.min(.55, .25 + day * .01)) return null;
  const capacity = 2 + facilities.find((facility) => facility.id === "barracks").level * 2;
  const candidates = BASE_EVENTS.filter((event) => {
    if ((cooldowns[event.id] ?? 0) > day) return false;
    if (event.id === "refugees" && members.length >= capacity) return false;
    if (event.id === "conflict") {
      return members.some((member) => Object.values(member.relationships ?? {}).some((value) => value <= -20));
    }
    return true;
  });
  if (!candidates.length) return null;
  const event = pick(candidates);
  return createPendingEvent(event, "base");
}

export function rollExpeditionEvent({ members, danger, factionIds }) {
  const scouting = members.reduce((sum, member) => sum + getStat(member, "scouting"), 0);
  const chance = Math.min(.65, .22 + danger * .06 + scouting * .008);
  if (Math.random() > chance) {
    return {
      manual: false,
      outcome: scouting >= 12
        ? "정찰대가 숨겨진 우회로를 찾아 추가 자재 2를 확보했다."
        : "이동 중 특별한 사건은 없었다.",
      bonus: scouting >= 12 ? { material: 2 } : {},
    };
  }
  const type = Math.random() < .5 ? "emergency" : "faction";
  const pending = createPendingEvent(EXPEDITION_EVENTS[type], "expedition");
  if (type === "faction") pending.factionId = pick(factionIds);
  return { manual: true, event: pending };
}

export function setEventCooldown(cooldowns, eventId, day, days) {
  cooldowns[eventId] = day + days;
}

export function eventDefinition(eventId) {
  return BASE_EVENTS.find((event) => event.id === eventId)
    ?? Object.values(EXPEDITION_EVENTS).find((event) => event.id === eventId);
}

function createPendingEvent(event, source) {
  return {
    id: event.id,
    source,
    title: event.title,
    description: event.description,
    choices: event.choices.map((choice) => ({ ...choice })),
  };
}

const pick = (array) => array[Math.floor(Math.random() * array.length)];
