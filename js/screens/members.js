import { getState } from "../core/state.js";
import { memberCard } from "../components/common.js";

export function renderMembers() {
  const state = getState();
  const healthy = state.members.filter((member) => member.hp >= 70).length;
  return `
    <main class="screen">
      <div class="screen-title">
        <div><p>ROSTER / ${state.faction}</p><h1>생존자 명부</h1></div>
        <p>건강 ${healthy} · 부상 ${state.members.length - healthy}</p>
      </div>
      <div class="alert">
        <span>◇</span>
        <div><strong>능력과 성장</strong><br>임무를 오래 수행할수록 관련 능력이 성장합니다.</div>
      </div>
      <section class="panel" style="margin-top:10px">
        <div class="panel-head"><div><span class="eyebrow">ALL MEMBERS</span><h2>전체 ${state.members.length}명</h2></div></div>
        <div class="panel-body member-list">${state.members.map((member) => memberCard(member, false)).join("")}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">PERSONAL HISTORY</span><h2>최근 개인 기록</h2></div></div>
        <div class="panel-body log-list">
          ${state.members.flatMap((member) => member.history.slice(-1).map((history) => `
            <div class="log"><b>${member.name}</b> · ${history}</div>
          `)).join("")}
        </div>
      </section>
    </main>
  `;
}
