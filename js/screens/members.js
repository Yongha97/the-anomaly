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
        <button class="${state.membersView === "status" ? "active" : ""}" data-action="members-view" data-view="status" role="tab">상태</button>
        <button class="${state.membersView === "equipment" ? "active" : ""}" data-action="members-view" data-view="equipment" role="tab">장비</button>
        <button class="${state.membersView === "manage" ? "active" : ""}" data-action="members-view" data-view="manage" role="tab">관리</button>
      </div>
      ${state.membersView === "equipment" ? renderEquipment(state) : state.membersView === "manage" ? renderManage(state) : renderStatus(state)}
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
      <div class="panel-head"><div><span class="eyebrow">EQUIPMENT</span><h2>구성원 장비</h2></div><button class="secondary" data-action="auto-equip">자동 장착</button></div>
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

function renderManage(state) {
  const shift = state.leaderShift;
  return `
    <div class="alert">
      <span>◇</span>
      <div><strong>거점 관리</strong><br>리더를 바꾸면 성격과 관계에 따라 만족하거나 불만을 드러냅니다. 방출한 사람은 돌아오지 않습니다.</div>
    </div>
    ${shift ? `
      <section class="panel" style="margin-top:10px">
        <div class="panel-head"><div><span class="eyebrow">REACTION</span><h2>${escapeHtml(shift.toName)} 임명 이후</h2></div></div>
        <div class="panel-body leader-shift">
          ${shift.lines.map((line) => `
            <small class="${line.amount < 0 ? "down" : "up"}">${escapeHtml(line.text)}. 무드 ${line.amount > 0 ? "+" : ""}${line.amount}</small>
          `).join("")}
        </div>
      </section>
    ` : ""}
    <section class="panel" style="margin-top:10px">
      <div class="panel-head"><div><span class="eyebrow">LEADER</span><h2>리더 임명</h2></div></div>
      <div class="panel-body equipment-list manage-list">
        ${state.members.map((member) => renderAppointCard(state, member)).join("")}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">DISMISS</span><h2>방출</h2></div></div>
      <div class="panel-body equipment-list manage-list">
        ${state.members.map((member) => {
          const pending = state.expelTargetId === member.id;
          const away = member.task === "원정";
          return `
            <article class="equipment-member">
              <div class="equipment-member-head">
                <div class="portrait">${faceHtml(member)}</div>
                <div>
                  <b>${escapeHtml(member.name)}${member.leader ? " · 리더" : ""}</b>
                  <small>${member.gender === "female" ? "여" : "남"} · ${member.age}세 · ${escapeHtml(member.trait)} · ${itemName(member.equipment?.weapon)} · ${itemName(member.equipment?.armor)}</small>
                </div>
              </div>
              ${member.leader ? `<small class="expel-note">리더는 방출할 수 없습니다.</small>` : away ? `<small class="expel-note">원정에서 돌아오면 방출할 수 있습니다.</small>` : pending ? `
                <p class="expel-note">${escapeHtml(member.name)}${josa(member.name, "을", "를")} 거점에서 내보냅니다.</p>
                <div class="expel-actions">
                  <button class="secondary" data-action="cancel-expel">취소</button>
                  <button class="expel-confirm" data-action="confirm-expel">방출 확정</button>
                </div>
              ` : `<div class="expel-actions"><button class="secondary" data-action="ask-expel" data-id="${member.id}">방출</button></div>`}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderAppointCard(state, member) {
  const pending = state.leaderTargetId === member.id;
  const mercenary = member.membership === "mercenary";
  const action = member.leader
    ? `<small class="manage-note">현재 리더입니다.</small>`
    : mercenary
      ? `<small class="expel-note">용병은 리더가 될 수 없습니다.</small>`
      : pending
        ? `
          <p class="manage-note">${escapeHtml(member.name)}${josa(member.name, "을", "를")} 리더로 임명합니다.</p>
          <div class="expel-actions">
            <button class="secondary" data-action="cancel-appoint">취소</button>
            <button class="primary" data-action="confirm-appoint">임명 확정</button>
          </div>
        `
        : `<div class="expel-actions"><button class="secondary" data-action="ask-appoint" data-id="${member.id}">리더 임명</button></div>`;
  return `
    <article class="equipment-member">
      <div class="equipment-member-head">
        <div class="portrait">${faceHtml(member)}</div>
        <div>
          <b>${escapeHtml(member.name)}${member.leader ? " · 리더" : ""}</b>
          <small>${member.gender === "female" ? "여" : "남"} · ${member.age}세 · ${escapeHtml(member.trait)}</small>
        </div>
      </div>
      ${action}
    </article>
  `;
}

function josa(name, withBatchim, withoutBatchim) {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return withoutBatchim;
  return (code - 0xac00) % 28 ? withBatchim : withoutBatchim;
}

function equipmentSelect(state, member, slot, emptyLabel) {
  const current = member.equipment?.[slot] ?? null;
  const options = Object.values(ITEMS).filter((item) =>
    item.slot === slot && ((state.inventory[item.id] ?? 0) > 0 || current === item.id)
  );
  return `
    <select data-action="equip" data-id="${member.id}" aria-label="${escapeHtml(member.name)} ${emptyLabel}">
      <option value="none-${slot}" ${current ? "" : "selected"}>${emptyLabel}</option>
      ${options.map((item) => {
        const worn = current === item.id;
        const label = worn ? escapeHtml(item.name) : `${escapeHtml(item.name)} · 보유 ${state.inventory[item.id] ?? 0}`;
        return `<option value="${item.id}" ${worn ? "selected" : ""}>${label}</option>`;
      }).join("")}
    </select>
  `;
}
