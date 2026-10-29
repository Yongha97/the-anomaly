import { getState, jobModLines, STAT_KEYS, TASKS } from "../core/state.js";
import { fatigueLabel, moodLabel } from "../core/member-system.js";
import { TRAIT_EFFECTS } from "../core/trait-system.js";

export const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export function faceHtml(member, extraClass = "") {
  const face = member.appearance ?? { skin: 1, hair: 1, eyes: 1, mouth: 1, outfit: 1, beard: 0 };
  return `
    <div class="pixel-face skin-${face.skin} hair-${face.hair} eyes-${face.eyes} mouth-${face.mouth} beard-${face.beard ?? 0} ${extraClass}" aria-label="${escapeHtml(member.name)} 얼굴">
      <i class="face-hair"></i>
      <i class="face-beard"></i>
      <i class="face-eyes"></i>
      <i class="face-mouth"></i>
    </div>
  `;
}

export function characterHtml(member, extraClass = "") {
  const appearance = member.appearance ?? { skin: 1, outfit: 1 };
  return `
    <div class="pixel-character skin-${appearance.skin} outfit-${appearance.outfit} ${extraClass}" aria-label="${escapeHtml(member.name)} 캐릭터">
      ${faceHtml(member, "character-face")}
      <i class="character-arms"></i>
      <i class="character-body"></i>
      <i class="character-legs"></i>
    </div>
  `;
}

export function topBar() {
  const state = getState();
  const resourceItems = [
    ["food", state.resources.food, "식량"],
    ["material", state.resources.material, "자재"],
    ["medicine", state.resources.medicine, "의약품"],
    ["ammo", state.resources.ammo, "탄약"],
    ["silver", state.resources.silver, "은"],
  ];
  return `
    <header class="topbar">
      <div class="status-line">
        <div class="day"><strong>${state.day}일</strong><span>${escapeHtml(state.faction)}</span></div>
      </div>
      <div class="resources">
        ${resourceItems.map(([key, value, label]) => `
          <div class="resource ${key}">
            <i aria-hidden="true"></i>
            <b>${label}</b>
            <span>${value}</span>
          </div>
        `).join("")}
      </div>
      <div class="weather"><span>10월 27일 · 흐림 · 11°C</span><span>사기 <b>${state.morale}</b></span></div>
    </header>
  `;
}

export function bottomNav() {
  const active = getState().activeTab;
  const tabs = [
    ["field", "현장"],
    ["members", "생존자"],
    ["expedition", "원정"],
    ["base", "관리"],
  ];
  return `
    <nav class="bottom-nav" aria-label="주요 화면">
      ${tabs.map(([id, label]) => `
        <button class="nav-btn ${active === id ? "active" : ""}" data-action="tab" data-tab="${id}">
          <i></i>${label}
        </button>
      `).join("")}
    </nav>
  `;
}

export function memberCard(member, editable = true) {
  const away = member.task === "원정";
  const statusText = [
    member.burnoutDays > 0 ? `번아웃 ${member.burnoutDays}일` : "",
    member.injuries?.map((injury) => `${injury.name} ${injury.daysRemaining}일`).join(", "),
    member.rehabDays > 0 ? `재활 ${member.rehabDays}일` : "",
  ].filter(Boolean).join(" · ");
  return `
    <article class="member ${member.leader ? "leader" : ""}">
      <div class="portrait">${faceHtml(member)}</div>
      <div>
        <div class="member-name">${escapeHtml(member.name)}${member.leader ? "<small>리더</small>" : ""}</div>
        <div class="identity-set">
          <div class="member-meta">${member.gender === "female" ? "여" : "남"} · ${member.age}세 · ${editable ? escapeHtml(member.trait) : `<span class="identity trait-identity">${traitNameButton(member)}</span>`} · ${editable ? escapeHtml(member.background) : `<span class="identity job-identity">${jobNameButton(member)}</span>`}${member.membership === "mercenary" ? ` · 용병 ${member.contract.daysRemaining}일` : ""}</div>
          ${editable ? "" : `${traitPanel(member)}${jobPanel(member)}`}
        </div>
        <div class="status-bars">
          ${statusBar("체력", member.hp, `${member.hp}`)}
          ${statusBar("피로", member.fatigue, fatigueLabel(member.fatigue), "fatigue")}
          ${statusBar("무드", member.mood, moodLabel(member.mood), "mood")}
        </div>
        ${statusText ? `<div class="condition-line">${escapeHtml(statusText)}</div>` : ""}
        ${!editable ? `
          <div class="stat-strip">
            ${STAT_KEYS.map(({ key, label }) => `<div class="stat"><span>${label}</span><b>${member.stats[key]}</b></div>`).join("")}
          </div>
        ` : ""}
      </div>
      ${editable ? `
        <select class="task-select" data-action="assign" data-id="${member.id}" ${away || member.burnoutDays > 0 ? "disabled" : ""} aria-label="${escapeHtml(member.name)} 임무">
          ${TASKS.map((task) => `<option ${member.task === task ? "selected" : ""}>${task}</option>`).join("")}
          ${away ? '<option selected>원정</option>' : ""}
        </select>
      ` : `<span class="badge">${escapeHtml(member.task)}</span>`}
    </article>
  `;
}

export function traitNameButton(member) {
  return `<button type="button" class="trait-name" aria-describedby="trait-${member.id}">${escapeHtml(member.trait)}</button>`;
}

export function jobNameButton(member) {
  return `<button type="button" class="trait-name" aria-describedby="job-${member.id}">${escapeHtml(member.background)}</button>`;
}

export function traitPanel(member) {
  const lines = TRAIT_EFFECTS[member.trait] ?? ["드러난 특성이 없습니다."];
  return `
    <div class="trait-pop" id="trait-${member.id}" role="tooltip">
      <b>${escapeHtml(member.trait)}</b>
      ${lines.map((line) => `<small>${escapeHtml(line)}</small>`).join("")}
    </div>
  `;
}

export function jobPanel(member) {
  const lines = jobModLines(member.background);
  return `
    <div class="trait-pop job-pop" id="job-${member.id}" role="tooltip">
      <b>${escapeHtml(member.background)}</b>
      ${lines.map((line) => `<small>${escapeHtml(line)}</small>`).join("")}
    </div>
  `;
}

function statusBar(label, value, text, className = "") {
  return `
    <div class="status-row ${className}">
      <span>${label}</span>
      <div class="bar"><i style="width:${Math.max(0, Math.min(100, value))}%"></i></div>
      <b>${text}</b>
    </div>
  `;
}

export function reportModal() {
  const report = getState().report;
  if (!report) return "";
  const labels = { food: "식량", material: "자재", medicine: "의약품", silver: "은", morale: "사기" };
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="하루 보고서">
      <section class="modal">
        <div class="modal-head">
          <span class="eyebrow">DAILY REPORT</span>
          <h2>${report.day}일 차 보고서</h2>
          <p>오늘 거점에서 일어난 일을 정리했습니다.</p>
        </div>
        <div class="modal-body">
          <div class="report-delta">
            ${Object.entries(report.deltas).map(([key, value]) => `
              <div class="delta">
                <span>${labels[key]}</span>
                <b class="${value < 0 ? "minus" : ""}">${value > 0 ? "+" : ""}${value}</b>
              </div>
            `).join("")}
          </div>
          <div class="log-list">${report.notes.map((note) => `<div class="log">${escapeHtml(note)}</div>`).join("")}</div>
        </div>
        <div class="modal-actions"><button class="primary" data-action="close-report">확인하고 계속</button></div>
      </section>
    </div>
  `;
}

export function toastView() {
  const message = getState().toast;
  return message ? `<div class="toast" role="status">${escapeHtml(message)}</div>` : "";
}
