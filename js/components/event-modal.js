import { escapeHtml } from "./common.js";

export function eventModal(state) {
  const event = state.pendingEvent;
  if (!event || state.report || state.combatReport) return "";
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="${escapeHtml(event.title)}">
      <section class="modal">
        <div class="modal-head">
          <span class="eyebrow">${event.source === "expedition" ? "EXPEDITION EVENT" : "BASE EVENT"}</span>
          <h2>${escapeHtml(event.title)}</h2>
          <p>${escapeHtml(event.description)}</p>
        </div>
        <div class="modal-body event-choices">
          ${event.choices.map((choice) => `
            <button class="choice" data-action="resolve-event" data-choice="${choice.id}">
              <span><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.hint)}</small></span><b>›</b>
            </button>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

export function combatReportModal(state) {
  const report = state.combatReport;
  if (!report) return "";
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="전투 결과">
      <section class="modal">
        <div class="modal-head">
          <span class="eyebrow">COMBAT REPORT</span>
          <h2>${escapeHtml(report.factionName)} 전투</h2>
          <p>${outcomeName(report.outcome)} · 전술 ${report.tactic} · 탄약 ${report.ammoUsed} 사용</p>
        </div>
        <div class="modal-body">
          <div class="battle-score"><b>${report.playerScore}</b><span>우리 전력 / 적 전력</span><b>${report.enemyScore}</b></div>
          <div class="log-list">
            ${report.notes.map((note) => `<div class="log ${note.includes("사망") ? "bad" : ""}">${escapeHtml(note)}</div>`).join("")}
            ${Object.keys(report.loot).length ? `<div class="log good">전리품 · ${Object.entries(report.loot).map(([key, value]) => `${resourceName(key)} ${value}`).join(", ")}</div>` : ""}
          </div>
        </div>
        <div class="modal-actions"><button class="primary" data-action="close-combat-report">확인</button></div>
      </section>
    </div>
  `;
}

const outcomeName = (outcome) => ({ victory: "승리", retreat: "퇴각", defeat: "패배" }[outcome] ?? outcome);
const resourceName = (key) => ({ food: "식량", material: "자재", medicine: "의약품", ammo: "탄약" }[key] ?? key);
