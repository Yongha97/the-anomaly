import { getState } from "../core/state.js";
import { characterHtml, escapeHtml, memberCard } from "../components/common.js";

export function renderField() {
  const state = getState();
  const wall = state.facilities.find((item) => item.id === "wall");
  const assigned = (task) => state.members.filter((member) => member.task === task).length;
  const defense = state.members
    .filter((member) => member.task === "경계")
    .reduce((sum, member) => sum + member.stats[1], wall.level * 3);
  const threat = 7 + Math.floor(state.day / 4);

  return `
    <main class="screen">
      <div class="screen-title">
        <div><p>FIELD / SHELTER 09</p><h1>거점 현장</h1></div>
        <p>${state.members.length} / ${2 + state.facilities.find((item) => item.id === "barracks").level * 2}명</p>
      </div>

      <section class="panel">
        <div class="scene">
          <div class="moon"></div><div class="skyline"></div><div class="ground"></div>
          <div class="building b1 active"><span>방벽 LV.${wall.level}</span></div>
          <div class="building b2"><span>막사</span></div>
          <div class="building b3"><span>창고</span></div>
          <div class="campfire"></div>
          ${state.members.filter((member) => member.task !== "원정").map((member, index) => `
            <div class="worker" style="--delay:-${index * 2.1}s">
              <div class="worker-face">${characterHtml(member, "scene-character")}</div>
              <small>${escapeHtml(member.name)} · ${escapeHtml(member.task)}</small>
            </div>
          `).join("")}
          <div class="scene-info"><span class="badge">거점 안정</span><span class="badge">소음 낮음</span></div>
        </div>
        <div class="alert ${defense >= threat ? "good" : ""}">
          <span>◆</span>
          <div><strong>오늘 밤 위협 ${threat}</strong><br>현재 방어력 ${defense} · ${defense >= threat ? "방어선이 안정적입니다." : "경계 인원을 추가하세요."}</div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">TODAY'S OPERATION</span><h2>오늘의 임무</h2></div></div>
        <div class="panel-body">
          <div class="quick-grid">
            <div class="quick"><span>농사</span><b>${assigned("농사")}</b><em>식량 생산</em></div>
            <div class="quick"><span>경계</span><b>${assigned("경계")}</b><em>야간 방어</em></div>
            <div class="quick"><span>제작</span><b>${assigned("제작")}</b><em>물자 생산</em></div>
            <div class="quick"><span>휴식</span><b>${assigned("휴식")}</b><em>피로 회복</em></div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">SURVIVORS</span><h2>현장 인원</h2></div><button class="secondary" data-action="auto-assign">추천 배치</button></div>
        <div class="panel-body member-list">${state.members.map((member) => memberCard(member)).join("")}</div>
      </section>

      <button class="primary" data-action="pass-day">하루 보내기</button>
    </main>
  `;
}
