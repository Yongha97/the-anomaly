import { DESTINATIONS, getState } from "../core/state.js";
import { characterHtml, escapeHtml } from "../components/common.js";
import { expeditionBlockReason, getStat } from "../core/member-system.js";
import { soloExpeditionOk } from "../core/trait-system.js";

export function renderExpedition() {
  const state = getState();
  if (state.expedition) return renderActiveExpedition(state);

  const destination = DESTINATIONS.find((item) => item.id === state.selectedDestination);
  const standardFood = destination.days * state.squad.length;
  const generousFood = Math.ceil(standardFood * 1.5);
  const packedFood = state.rationPlan === "generous" ? generousFood : standardFood;
  const carryCapacity = state.squad.length * (2 + destination.days);
  const alreadyDeparted = state.expeditionsToday >= 1;
  const safeReady = state.riskPolicy !== "safe" || state.rationPlan === "generous";
  const squadMembers = state.squad.map((id) => state.members.find((member) => member.id === id)).filter(Boolean);
  const partyReady = state.squad.length >= 2 || soloExpeditionOk(squadMembers);
  const squadLeader = state.members.find((member) => member.id === state.expeditionLeaderId && state.squad.includes(member.id));
  const routeLeader = squadLeader ?? state.members.find((member) => member.leader);
  const riskyBlocked = routeLeader?.trait === "겁쟁이";
  const canLaunch = partyReady
    && state.expeditionLeaderId
    && !alreadyDeparted
    && safeReady
    && state.resources.food >= packedFood;
  return `
    <main class="screen">
      <div class="screen-title">
        <div><p>OUTSIDE / ROUTE</p><h1>원정 준비</h1></div>
        <p>하루 1회 · 외톨이 1명 또는 2~5명</p>
      </div>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">DESTINATION</span><h2>목적지 선택</h2></div></div>
        <div class="panel-body destination-grid">
          ${DESTINATIONS.map((item) => `
            <button class="destination ${item.id === state.selectedDestination ? "selected" : ""}" data-action="destination" data-id="${item.id}">
              <b>${item.name}</b>
              <span>위험 ${"◆".repeat(item.danger)} · ${item.days}일</span>
              <small>${item.reward}</small>
            </button>
          `).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">SQUAD</span><h2>원정대 편성 ${state.squad.length}/5</h2></div><span class="badge">적재 ${carryCapacity}</span></div>
        <div class="panel-body squad-picks">
          ${state.members.map((member) => {
            const blocked = expeditionBlockReason(member);
            return `
            <button class="squad-pick ${state.squad.includes(member.id) ? "selected" : ""} ${blocked ? "blocked" : ""}" data-action="squad" data-id="${member.id}" ${blocked ? "disabled" : ""}>
              <div><b>${escapeHtml(member.name)}</b><small>${blocked ? escapeHtml(blocked) : `전투 ${getStat(member, "combat")} · 정찰 ${getStat(member, "scouting")}`}</small></div>
              <span class="check">✓</span>
            </button>
          `}).join("")}
          ${soloExpeditionOk(squadMembers) ? `<p class="policy-title">외톨이는 혼자 출발할 수 있습니다.</p>` : ""}
          ${state.squad.length ? `
            <label class="leader-select">
              <span>원정대 리더</span>
              <select data-action="expedition-leader">
                ${state.squad.map((id) => {
                  const member = state.members.find((item) => item.id === id);
                  return `<option value="${id}" ${state.expeditionLeaderId === id ? "selected" : ""}>${escapeHtml(member.name)} · 리더십 ${getStat(member, "leadership")} / 전투 ${getStat(member, "combat")}</option>`;
                }).join("")}
              </select>
            </label>
          ` : ""}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">ORDERS</span><h2>원정 규율</h2></div></div>
        <div class="panel-body">
          <p class="policy-title">행동 규율</p>
          <div class="policy-grid three">
            ${policyButton("risk-policy", "safe", "안전 우선", "생존 우선 · 보상 감소", state.riskPolicy)}
            ${policyButton("risk-policy", "risky", "위험 감수", riskyBlocked ? `${escapeHtml(routeLeader.name)}${particle(routeLeader.name, "은", "는")} 겁쟁이라 고를 수 없습니다` : "보상 증가 · 사망 위험", state.riskPolicy, riskyBlocked)}
            ${policyButton("risk-policy", "leader", "리더 판단", "리더십·전투로 자동 결정", state.riskPolicy)}
          </div>
          <p class="policy-title">구성원 영입</p>
          <div class="policy-grid">
            ${policyButton("recruit-policy", "active", "적극적", "타 세력 회유 가능", state.recruitPolicy)}
            ${policyButton("recruit-policy", "normal", "중간", "균형 잡힌 접촉", state.recruitPolicy)}
            ${policyButton("recruit-policy", "passive", "소극적", "무소속만 제한 접촉", state.recruitPolicy)}
            ${policyButton("recruit-policy", "leader", "리더 판단", "리더십으로 자동 결정", state.recruitPolicy)}
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">SUPPLIES</span><h2>휴대 식량</h2></div></div>
        <div class="panel-body ration-grid">
          <button class="ration ${state.rationPlan === "standard" ? "selected" : ""}" data-action="ration" data-plan="standard">
            <b>기본 배급 · ${standardFood}</b><small>위험 경로만 선택 가능</small>
          </button>
          <button class="ration ${state.rationPlan === "generous" ? "selected" : ""}" data-action="ration" data-plan="generous">
            <b>넉넉한 배급 · ${generousFood}</b><small>안전 경로 선택 가능</small>
          </button>
        </div>
      </section>

      <div class="alert ${state.resources.food >= packedFood && !alreadyDeparted ? "good" : ""}">
        <span>◆</span><div><strong>${destination.name} · 왕복 ${destination.days}일</strong><br>
        ${alreadyDeparted
          ? "오늘은 이미 원정대를 꾸렸습니다. 하루를 보내야 다시 출발할 수 있습니다."
          : !safeReady
            ? "안전 우선 규율은 넉넉한 배급을 선택해야 합니다."
          : state.resources.food >= packedFood
            ? `식량 ${packedFood} · 최대 적재량 ${carryCapacity}. 멀고 인원이 많을수록 더 많이 운반합니다.`
            : `식량이 ${packedFood - state.resources.food} 부족합니다.`}</div>
      </div>
      <button class="primary" style="margin-top:10px" data-action="launch" ${canLaunch ? "" : "disabled"}>${alreadyDeparted ? "오늘 원정 완료" : "원정 출발"}</button>
    </main>
  `;
}

function renderActiveExpedition(state) {
  const expedition = state.expedition;
  const members = expedition.members.map((id) => state.members.find((member) => member.id === id));
  const leader = members.find((member) => member.id === expedition.leaderId);
  const riskLabels = { safe: "안전 우선", risky: "위험 감수" };
  const recruitLabels = { active: "적극적", normal: "중간", passive: "소극적" };
  return `
    <main class="screen">
      <div class="screen-title">
        <div><p>EXPEDITION / ACTIVE</p><h1>${expedition.destination.name}</h1></div>
        <p>위험 ${expedition.destination.danger}</p>
      </div>
      <section class="panel">
        <div class="expedition-scene">
          <div class="road"></div>
          ${members.slice(0, 2).map((member) => `
            <div class="runner"><div class="worker-face">${characterHtml(member, "scene-character")}</div><small>${escapeHtml(member.name)}</small></div>
          `).join("")}
          <div class="zombie">♟</div>
          <div class="scene-info"><span class="badge">${expedition.status === "waiting" ? "사건 대응 중" : "원정 완료"}</span><span class="badge">적재 ${expedition.carryCapacity}</span></div>
        </div>
        <div class="panel-body">
          <span class="eyebrow">EXPEDITION REPORT</span>
          <h2 style="margin:5px 0;font-size:18px">원정 결과</h2>
          <p style="color:var(--muted);font-size:10px;line-height:1.7">
            리더 ${escapeHtml(leader.name)} · ${riskLabels[expedition.resolvedRisk]} · 영입 ${recruitLabels[expedition.resolvedRecruit]}
          </p>
          <div class="result-list">
            ${expedition.outcomes.map((outcome) => `
              <div class="result ${outcome.type}">
                <span class="result-icon">${outcomeIcon(outcome.type)}</span>
                <div><b>${escapeHtml(outcome.title)}</b><small>${escapeHtml(outcome.text)}</small></div>
              </div>
            `).join("")}
          </div>
          <button class="primary" style="margin-top:10px" data-action="finish-expedition" ${expedition.status !== "complete" || state.pendingRecruit ? "disabled" : ""}>${expedition.status === "waiting" ? "사건을 먼저 해결하세요" : state.pendingRecruit ? "영입 여부를 먼저 결정하세요" : "결과 확인 · 거점 복귀"}</button>
        </div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">PARTY</span><h2>원정대</h2></div></div>
        <div class="panel-body squad-picks">
          ${members.map((member) => {
            const dead = expedition.deadIds.includes(member.id);
            return `<div class="squad-pick ${dead ? "dead" : "selected"}"><div><b>${escapeHtml(member.name)}</b><small>${member.id === expedition.leaderId ? "원정 리더" : "대원"} · ${dead ? "사망" : `체력 ${member.hp}`}</small></div><span class="badge">${escapeHtml(member.trait)}</span></div>`;
          }).join("")}
        </div>
      </section>
    </main>
  `;
}

function particle(name, withBatchim, withoutBatchim) {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return withoutBatchim;
  return (code - 0xac00) % 28 ? withBatchim : withoutBatchim;
}

function policyButton(action, value, title, description, selectedValue, blocked = false) {
  return `
    <button class="policy ${selectedValue === value ? "selected" : ""} ${blocked ? "blocked" : ""}" data-action="${action}" data-value="${value}">
      <b>${title}</b><small>${description}</small>
    </button>
  `;
}

function outcomeIcon(type) {
  return { loot: "▣", injury: "+", death: "×", recruit: "◇", hostile: "!", info: "·" }[type] ?? "·";
}

