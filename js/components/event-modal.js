import { escapeHtml, faceHtml } from "./common.js";
import { STAT_KEYS } from "../core/state.js";

export function eventModal(state) {
  const event = state.pendingEvent;
  if (!event || state.report || state.combatReport) return "";
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="${escapeHtml(event.title)}">
      <section class="modal">
        <div class="modal-head">
          <span class="eyebrow">${event.source === "expedition" ? "EXPEDITION EVENT" : event.source === "night" ? "NIGHT" : "BASE EVENT"}</span>
          <h2>${escapeHtml(event.title)}</h2>
          <p>${escapeHtml(event.description)}</p>
        </div>
        <div class="modal-body event-choices">
          ${event.choices.map((choice) => `
            <button class="choice ${choice.blocked ? "blocked" : ""}" data-action="resolve-event" data-choice="${choice.id}">
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
          <p>${report.encounter ? `${report.encounter.label} ${report.encounter.count}${report.encounter.unit} · ` : ""}${outcomeName(report.outcome)} · 전술 ${report.tactic}</p>
          <p>예상 탄약 ${report.expectedAmmo ?? report.ammoUsed} · 사용 ${report.ammoUsed}${report.shortfall > 0 ? " · 탄약 부족으로 피해 증가" : ""}${report.damageMin ? ` · 부상 시 체력 ${report.damageMin}~${report.damageMax}` : ""}</p>
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

export function recruitModal(state) {
  const offer = state.pendingRecruit;
  if (!offer || state.report || state.combatReport || state.pendingEvent) return "";
  const member = offer.member;
  const unknown = "알 수 없음";
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="영입 검토">
      <section class="modal">
        <div class="modal-head">
          <span class="eyebrow">RECRUIT</span>
          <h2>영입 검토</h2>
          <p>바로 받아들이지 않습니다. 확인된 정보만 보고 결정하세요.</p>
        </div>
        <div class="modal-body recruit-sheet">
          <div class="recruit-head">
            <div class="portrait">${faceHtml(member)}</div>
            <div>
              <b>${escapeHtml(member.name)}</b>
              <small>${member.gender === "female" ? "여" : "남"} · ${member.age}세</small>
            </div>
          </div>
          <div class="kv-line"><span>소속</span><b>${escapeHtml(offer.affiliation.name)}</b></div>
          <div class="kv-line"><span>배경</span><b>${escapeHtml(member.background)}</b></div>
          <div class="kv-line"><span>성격</span><b class="${offer.known.trait ? "" : "unknown"}">${offer.known.trait ? escapeHtml(member.trait) : unknown}</b></div>
          <div class="stat-strip">
            ${STAT_KEYS.map(({ key, label }) => {
              const known = offer.known.stats[key];
              return `<div class="stat ${known ? "" : "unknown"}"><span>${label}</span><b>${known ? member.stats[key] : unknown}</b></div>`;
            }).join("")}
          </div>
          <p class="recruit-note">${offer.affiliation.id ? `${escapeHtml(offer.affiliation.name)} 소속입니다. 받아들이면 그 세력이 적대가 됩니다.` : "무소속 생존자입니다. 숨겨진 능력과 성격은 합류한 뒤에 드러납니다."}</p>
        </div>
        <div class="modal-actions">
          <button class="secondary" data-action="refuse-recruit">돌려보낸다</button>
          <button class="primary" data-action="accept-recruit">영입한다</button>
        </div>
      </section>
    </div>
  `;
}

const outcomeName = (outcome) => ({ victory: "승리", retreat: "퇴각", defeat: "패배" }[outcome] ?? outcome);
const resourceName = (key) => ({ food: "식량", material: "자재", medicine: "의약품", ammo: "탄약", silver: "은" }[key] ?? key);
