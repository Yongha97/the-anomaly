import { getState } from "../core/state.js";
import { escapeHtml, faceHtml, memberCard } from "../components/common.js";
import { relationshipLabel } from "../core/relationship-system.js";
import { itemName } from "../core/equipment-system.js";
import { ITEMS } from "../data/items.js";

export function renderMembers() {
  const state = getState();
  const healthy = state.members.filter((member) => member.hp >= 70).length;
  return `
    <main class="screen">
      <div class="screen-title">
        <div><p>ROSTER / ${state.faction}</p><h1>생존자 명부</h1></div>
        <p>건강 ${healthy} · 부상 ${state.members.length - healthy}</p>
      </div>
      <div class="member-tabs" role="tablist" aria-label="생존자 정보">
        <button class="${state.membersView !== "equipment" ? "active" : ""}" data-action="members-view" data-view="status" role="tab">상태</button>
        <button class="${state.membersView === "equipment" ? "active" : ""}" data-action="members-view" data-view="equipment" role="tab">장비</button>
      </div>
      ${state.membersView === "equipment" ? renderEquipment(state) : renderStatus(state)}
    </main>
  `;
}

function renderStatus(state) {
  return `
      <div class="alert">
        <span>◇</span>
        <div><strong>능력과 성장</strong><br>임무를 오래 수행할수록 관련 능력이 성장합니다.</div>
      </div>
      <section class="panel" style="margin-top:10px">
        <div class="panel-head"><div><span class="eyebrow">ALL MEMBERS</span><h2>전체 ${state.members.length}명</h2></div></div>
        <div class="panel-body member-list">${state.members.map((member) => `
          <div class="member-detail">
            ${memberCard(member, false)}
            <div class="detail-section">
              <b>구성원 관계</b>
              <div class="relation-list">
                ${state.members.filter((other) => other.id !== member.id).map((other) => {
                  const value = member.relationships[other.id] ?? 0;
                  return `<span class="relation-chip ${value < -19 ? "bad" : value > 19 ? "good" : ""}">${escapeHtml(other.name)} · ${relationshipLabel(value)} ${value > 0 ? "+" : ""}${value}</span>`;
                }).join("") || '<span class="empty-note">관계 정보 없음</span>'}
              </div>
            </div>
            <div class="detail-section">
              <b>최근 대화와 무드</b>
              ${(member.recentConversations ?? []).slice(0, 2).map((conversation) => `
                <small>${conversation.day}일 · ${escapeHtml(conversation.text)} (${conversation.delta > 0 ? "+" : ""}${conversation.delta})</small>
              `).join("") || '<small>아직 기록된 대화가 없습니다.</small>'}
              ${(member.moodNotes ?? []).slice(0, 2).map((note) => `
                <small>${note.reason} · 무드 ${note.amount > 0 ? "+" : ""}${note.amount}</small>
              `).join("")}
            </div>
          </div>
        `).join("")}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">PERSONAL HISTORY</span><h2>최근 개인 기록</h2></div></div>
        <div class="panel-body log-list">
          ${state.members.flatMap((member) => member.history.slice(-1).map((history) => `
            <div class="log"><b>${member.name}</b> · ${history}</div>
          `)).join("")}
        </div>
      </section>
  `;
}

function renderEquipment(state) {
  return `
    <div class="alert">
      <span>▣</span>
      <div><strong>장비 관리</strong><br>무기와 방어구는 장착한 구성원의 원정·전투 판정에 적용됩니다.</div>
    </div>
    <section class="panel" style="margin-top:10px">
      <div class="panel-head"><div><span class="eyebrow">INVENTORY</span><h2>보유 장비</h2></div></div>
      <div class="panel-body inventory-list">
        ${Object.values(ITEMS).map((item) => `
          <span class="inventory-chip">${escapeHtml(item.name)} <b>${state.inventory[item.id] ?? 0}</b></span>
        `).join("")}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">EQUIPMENT</span><h2>구성원 장비</h2></div></div>
      <div class="panel-body equipment-list">
        ${state.members.map((member) => `
          <article class="equipment-member">
            <div class="equipment-member-head">
              <div class="portrait">${faceHtml(member)}</div>
              <div>
                <b>${escapeHtml(member.name)}${member.leader ? " · 리더" : ""}</b>
                <small>${itemName(member.equipment?.weapon)} · ${itemName(member.equipment?.armor)}</small>
              </div>
            </div>
            <label>
              <span>무기</span>
              ${equipmentSelect(state, member, "weapon", "무기 없음")}
            </label>
            <label>
              <span>방어구</span>
              ${equipmentSelect(state, member, "armor", "방어구 없음")}
            </label>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function equipmentSelect(state, member, slot, emptyLabel) {
  const current = member.equipment?.[slot] ?? null;
  const options = Object.values(ITEMS).filter((item) =>
    item.slot === slot && ((state.inventory[item.id] ?? 0) > 0 || current === item.id)
  );
  return `
    <select data-action="equip" data-id="${member.id}" aria-label="${escapeHtml(member.name)} ${emptyLabel}">
      <option value="none-${slot}" ${current ? "" : "selected"}>${emptyLabel}</option>
      ${options.map((item) => `
        <option value="${item.id}" ${current === item.id ? "selected" : ""}>${escapeHtml(item.name)} · 보유 ${state.inventory[item.id] ?? 0}</option>
      `).join("")}
    </select>
  `;
}
