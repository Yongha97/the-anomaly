import { getState } from "../core/state.js";
import { escapeHtml } from "../components/common.js";

export function renderBase() {
  const state = getState();
  return `
    <main class="screen">
      <div class="screen-title">
        <div><p>MANAGEMENT / BASE</p><h1>거점 관리</h1></div>
        <p>보유 자재 ${state.resources.material}</p>
      </div>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">FACILITIES</span><h2>시설 강화</h2></div></div>
        <div class="panel-body facility-list">
          ${state.facilities.map((facility) => {
            const cost = 6 + facility.level * 5;
            const maxed = facility.level >= facility.max;
            return `
              <div class="facility">
                <div>
                  <b>${escapeHtml(facility.name)} · LV.${facility.level}</b>
                  <small>${escapeHtml(facility.description)}</small>
                </div>
                <button class="secondary" data-action="upgrade" data-id="${facility.id}" ${maxed ? "disabled" : ""}>${maxed ? "최대" : `자재 ${cost}`}</button>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">JOURNAL</span><h2>생존 일지</h2></div></div>
        <div class="panel-body log-list">
          ${state.logs.slice(0, 12).map((log) => `
            <div class="log ${log.type}"><b>${log.day}일</b> · ${escapeHtml(log.text)}</div>
          `).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">FACTIONS</span><h2>외부 세력</h2></div></div>
        <div class="panel-body facility-list">
          <div class="facility"><div><b>철문단</b><small>무장과 규율을 중시하는 생존 집단</small></div><span class="badge">${relationLabel(state.relations.iron)}</span></div>
          <div class="facility"><div><b>성당 피난소</b><small>치료와 보호를 우선하는 공동체</small></div><span class="badge">${relationLabel(state.relations.church)}</span></div>
          <div class="facility"><div><b>들개패</b><small>약한 거점을 노리는 약탈자 무리</small></div><span class="badge">${relationLabel(state.relations.dogs)}</span></div>
        </div>
      </section>
    </main>
  `;
}

function relationLabel(value) {
  if (value <= -30) return "적대";
  if (value >= 10) return "우호";
  return "중립";
}
