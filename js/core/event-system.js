import { BASE_EVENTS, EXPEDITION_EVENTS } from "../data/events.js";
import { getStat } from "./member-system.js";
import { contactLine, planAmmo, rollContact, stockpileAmmo } from "./combat-system.js";

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
  const pending = createPendingEvent(event, "base");
  if (event.id === "wall_breach") {
    pending.contact = rollContact({ situation: "zombies", day, danger: 3, scale: "large" });
    pending.ammoCost = stockpileAmmo(pending.contact);
    pending.description = `${contactLine(pending.contact)}가 약해진 방벽을 밀어붙입니다. 막지 못하면 거점 안으로 들어옵니다.`;
    const ammoChoice = pending.choices.find((choice) => choice.id === "ammo");
    if (ammoChoice) ammoChoice.hint = `탄약 ${pending.ammoCost} 소모, 피해 감소`;
  }
  return pending;
}

export function rollExpeditionEvent({ members, danger, factionIds, factions = {}, day = 1 }) {
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
  if (type === "faction") {
    pending.factionId = pick(factionIds);
    const faction = factions[pending.factionId];
    pending.contact = rollContact({ situation: "faction", day, danger, faction });
    const ammoPlan = planAmmo(pending.contact, members, "defense");
    const ammoSpan = ammoPlan.min === ammoPlan.max ? `${ammoPlan.min}` : `${ammoPlan.min}~${ammoPlan.max}`;
    pending.description = `${pending.contact.label} ${pending.contact.count}명이 길을 막았습니다. 싸우면 탄약 ${ammoSpan}발을 씁니다.`;
    const fight = pending.choices.find((choice) => choice.id === "fight");
    if (fight) fight.hint = ammoPlan.guns ? `탄약 ${ammoSpan}, 관계 급락` : "화기 없음, 근접 피해 증가";
  }
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
