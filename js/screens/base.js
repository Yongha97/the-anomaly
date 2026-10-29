import { getState } from "../core/state.js";
import { escapeHtml } from "../components/common.js";
import { factionRelationLabel, tradePrice } from "../core/faction-system.js";
import { ITEMS } from "../data/items.js";
import { contactLine, damageRange, planAmmo, raidOutlook } from "../core/combat-system.js";

export function renderBase() {
  const state = getState();
  if (state.uiView.type !== "base") return renderFactionView(state);
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
                <i class="fico ${facility.id}" aria-hidden="true"></i>
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
          ${Object.values(state.factions).map((faction) => `
            <button class="facility faction-button" data-action="open-base-view" data-view="faction" data-faction="${faction.id}">
              <div><b>${escapeHtml(faction.name)}</b><small>${escapeHtml(faction.description)}</small></div>
              <span class="badge">${factionRelationLabel(faction.relation)} ${faction.relation}</span>
            </button>
          `).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderFactionView(state) {
  const faction = state.factions[state.uiView.factionId];
  if (!faction) return "";
  return `
    <main class="screen">
      <button class="secondary back-button" data-action="open-base-view" data-view="base">← 거점 관리</button>
      <div class="screen-title">
        <div><p>FACTION / ${factionRelationLabel(faction.relation)}</p><h1>${escapeHtml(faction.name)}</h1></div>
        <p>전력 ${faction.power}</p>
      </div>
      <div class="alert ${faction.relation >= 20 ? "good" : ""}"><span>◆</span><div><strong>관계 ${faction.relation} · ${factionRelationLabel(faction.relation)}</strong><br>${escapeHtml(faction.description)}${faction.relation < 0 || faction.retaliationDays ? ` · ${raidOutlook(faction)}` : ""}</div></div>
      <div class="faction-actions">
        <button class="secondary" data-action="open-base-view" data-view="trade" data-faction="${faction.id}">거래</button>
        <button class="secondary" data-action="open-base-view" data-view="merc" data-faction="${faction.id}">용병</button>
        <button class="secondary" data-action="open-base-view" data-view="battle" data-faction="${faction.id}">전투</button>
      </div>
      ${state.uiView.type === "trade" ? renderTrade(state, faction) : ""}
      ${state.uiView.type === "merc" ? renderMercenary(state, faction) : ""}
      ${state.uiView.type === "battle" ? renderBattle(state, faction) : ""}
      ${state.uiView.type === "faction" ? `
        <section class="panel"><div class="panel-head"><h2>세력 정보</h2></div><div class="panel-body">
          <div class="kv-line"><span>관계 단계</span><b>${factionRelationLabel(faction.relation)}</b></div>
          <div class="kv-line"><span>보복 위험</span><b>${faction.retaliationDays ? `${faction.retaliationDays}일` : "없음"}</b></div>
          <div class="kv-line"><span>습격</span><b>${raidOutlook(faction)}</b></div>
          <div class="kv-line"><span>주요 수요</span><b>${resourceName(faction.wants)}</b></div>
        </div></section>
      ` : ""}
    </main>
  `;
}

function renderTrade(state, faction) {
  return `
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">TRADE</span><h2>거래소 · 보유 은 ${state.resources.silver}</h2></div></div>
      <div class="panel-body trade-list">
        ${Object.entries(faction.stock).map(([itemId, amount]) => {
          const buy = tradePrice(faction, itemId, "buy");
          const sell = tradePrice(faction, itemId, "sell");
          const owned = ownedAmount(state, itemId);
          return `
          <div class="trade-row">
            <div><b>${displayName(itemId)}</b><small>세력 재고 ${amount} · 내 보유 ${owned}</small></div>
            <button class="secondary" data-action="trade" data-faction="${faction.id}" data-item="${itemId}" data-direction="buy" ${amount < 1 || state.resources.silver < buy ? "disabled" : ""}>구매 ${buy}</button>
            <button class="secondary" data-action="trade" data-faction="${faction.id}" data-item="${itemId}" data-direction="sell" ${owned < 1 ? "disabled" : ""}>판매 ${sell}</button>
          </div>
        `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderMercenary(state, faction) {
  const offer = faction.mercenary;
  return `
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">CONTRACT</span><h2>기간제 용병</h2></div></div>
      <div class="panel-body">
        <div class="merc-card"><b>${escapeHtml(offer.name)}</b><span>${offer.days}일 계약</span><small>전투 ${offer.combat} · 정찰 ${offer.scouting} · 선금 은 ${offer.silverCost} · 일당 은 ${offer.dailySilver}</small></div>
        <button class="primary" data-action="hire" data-faction="${faction.id}">용병 고용</button>
      </div>
    </section>
  `;
}

function renderBattle(state, faction) {
  const contact = state.battleContact?.factionId === faction.id ? state.battleContact : null;
  const squad = state.members.filter((member) => state.battleTeam.includes(member.id));
  const plan = contact ? planAmmo(contact, squad, state.battleTactic) : null;
  const shortfall = plan?.expected > 0 ? Math.max(0, 1 - state.resources.ammo / plan.expected) : 0;
  const harm = contact ? damageRange(contact, { shortfall, guns: plan.guns }) : null;
  return `
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">FORMATION</span><h2>전투 편성 ${state.battleTeam.length}/5</h2></div></div>
      <div class="panel-body battle-team">
        ${state.members.map((member) => `
          <div class="battle-member ${state.battleTeam.includes(member.id) ? "selected" : ""}">
            <button data-action="battle-member" data-id="${member.id}">
              <b>${escapeHtml(member.name)}</b>
              <small>${member.membership === "mercenary" ? `용병 ${member.contract.daysRemaining}일` : member.trait} · 전투대 ${state.battleTeam.includes(member.id) ? "선택됨" : "대기"}</small>
            </button>
          </div>
        `).join("")}
        ${contact ? `<p class="battle-brief">${contactLine(contact)} · 위협 ${contact.power} · 탄약 ${plan.min === plan.max ? plan.min : `${plan.min}~${plan.max}`} · 보유 ${state.resources.ammo}${plan.guns ? "" : " · 화기 없음"} · 부상 시 체력 ${harm[0]}~${harm[1]}</p>` : ""}
        <div class="policy-grid three">
          ${tacticButton("assault", "공격", state.battleTactic)}
          ${tacticButton("defense", "방어", state.battleTactic)}
          ${tacticButton("scout", "정찰", state.battleTactic)}
        </div>
        <button class="primary" data-action="start-battle" data-faction="${faction.id}" ${state.battleTeam.length < 2 ? "disabled" : ""}>${escapeHtml(faction.name)} 공격</button>
      </div>
    </section>
  `;
}

function tacticButton(value, label, selected) {
  return `<button class="policy ${value === selected ? "selected" : ""}" data-action="battle-tactic" data-value="${value}"><b>${label}</b></button>`;
}

function ownedAmount(state, itemId) {
  return itemId in state.resources ? state.resources[itemId] : (state.inventory[itemId] ?? 0);
}

function displayName(itemId) {
  return ITEMS[itemId]?.name ?? resourceName(itemId);
}

function resourceName(id) {
  return { food: "식량", material: "자재", medicine: "의약품", ammo: "탄약" }[id] ?? id;
}
