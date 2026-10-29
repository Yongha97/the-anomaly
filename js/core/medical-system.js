import { applyMood, effectiveStat, getStat } from "./member-system.js";
import { adjustInjuryMood, harmDamage } from "./trait-system.js";

const INJURY_TYPES = {
  minor: ["타박상", "얕은 열상", "염좌"],
  major: ["골절", "깊은 열상", "내부 손상"],
};

export function createInjury(danger, risky) {
  const severity = risky && Math.random() < Math.min(.65, .25 + danger * .08) ? "major" : "minor";
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: pick(INJURY_TYPES[severity]),
    severity,
    daysRemaining: severity === "major" ? random(5, 8) : random(2, 4),
  };
}

export function addInjury(member, injury, damage, day) {
  const taken = harmDamage(member, damage);
  member.hp = Math.max(1, member.hp - taken);
  member.injuries.push(injury);
  member.history.push(`${day}일 차, ${injury.name} 부상을 입었다.`);
  applyMood(member, adjustInjuryMood(member, injury.severity === "major" ? -8 : -4), `${injury.name} 부상`, day);
  let combatLoss = 0;
  if (injury.severity === "major" && member.stats.combat > 1) {
    member.stats.combat -= 1;
    combatLoss = 1;
    member.history.push(`${day}일 차, 장기 부상의 후유증으로 전투 능력이 1 감소했다.`);
  }
  return { combatLoss, damage: taken };
}

export function processMedicalDay({ members, clinicLevel, medicine, day }) {
  const notes = [];

  members.forEach((member) => {
    if (member.rehabDays > 0) {
      member.rehabDays -= 1;
      if (member.rehabDays === 0) {
        member.history.push(`${day}일 차, 재활을 마쳤다.`);
        notes.push(`${member.name}이(가) 재활을 마쳤다.`);
      }
    }
  });

  const patients = members
    .filter((member) => member.injuries.length)
    .sort((a, b) => injuryWeight(b) - injuryWeight(a));
  const healers = members
    .filter((member) => member.task === "의학" && !member.injuries.some((injury) => injury.severity === "major"))
    .sort((a, b) => effectiveStat(b, "medical") - effectiveStat(a, "medical"));

  if (!patients.length) return { medicineUsed: 0, notes };
  if (clinicLevel < 1) {
    notes.push("의무실이 없어 부상자를 안정시키는 것 외에는 치료하지 못했다.");
    return { medicineUsed: 0, notes };
  }
  if (!healers.length) {
    notes.push("의학 담당자가 없어 부상 치료가 진행되지 않았다.");
    return { medicineUsed: 0, notes };
  }

  let medicineUsed = 0;
  healers.forEach((healer, index) => {
    const patient = patients[index];
    if (!patient || medicine - medicineUsed <= 0) return;
    const injury = patient.injuries.sort((a, b) => severityValue(b.severity) - severityValue(a.severity))[0];
    const medical = getStat(healer, "medical");
    const baseRisk = injury.severity === "major" ? .32 : .2;
    const accidentChance = Math.max(.02, baseRisk - medical * .02 - clinicLevel * .02);
    medicineUsed += 1;

    if (Math.random() < accidentChance) {
      const damage = random(3, 8);
      patient.hp = Math.max(1, patient.hp - damage);
      injury.daysRemaining += 2;
      applyMood(patient, -5, "의료 사고", day);
      healer.history.push(`${day}일 차, ${patient.name} 치료 중 의료 사고를 냈다.`);
      notes.push(`의료 사고: ${patient.name}의 회복이 2일 늦어지고 체력이 ${damage} 감소했다.`);
      return;
    }

    const progress = 1 + Math.floor(medical / 4) + clinicLevel;
    injury.daysRemaining -= progress;
    patient.hp = Math.min(100, patient.hp + 3 + clinicLevel);
    healer.xp.medical = (healer.xp.medical ?? 0) + 2;
    if (injury.daysRemaining <= 0) {
      patient.injuries = patient.injuries.filter((item) => item.id !== injury.id);
      patient.rehabDays = injury.severity === "major" ? Math.max(1, 5 - Math.floor(medical / 3) - clinicLevel) : 0;
      if (healer.trait === "자비" && patient.rehabDays > 0) patient.rehabDays -= 1;
      patient.history.push(`${day}일 차, ${injury.name} 치료를 마쳤다.`);
      applyMood(patient, healer.trait === "자비" ? 5 : 3, "치료 성공", day);
      notes.push(`${healer.name}이(가) ${patient.name}의 ${injury.name} 치료에 성공했다.`);
    } else {
      notes.push(`${healer.name}이(가) ${patient.name}을(를) 치료했다. 회복까지 ${injury.daysRemaining}일.`);
    }
  });

  if (medicine - medicineUsed <= 0 && patients.length > medicineUsed) notes.push("의약품이 부족해 일부 치료를 진행하지 못했다.");
  return { medicineUsed, notes };
}

function injuryWeight(member) {
  return member.injuries.reduce((sum, injury) => sum + severityValue(injury.severity) * 10 + injury.daysRemaining, 0);
}

const severityValue = (severity) => severity === "major" ? 2 : 1;
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (array) => array[Math.floor(Math.random() * array.length)];
