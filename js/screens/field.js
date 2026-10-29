import { getState } from "../core/state.js";
import { characterHtml, escapeHtml, memberCard } from "../components/common.js";

export function renderField() {
  const state = getState();
  const assigned = (task) => state.members.filter((member) => member.task === task).length;
  const guide = getGuide(state);

  return `
    <main class="screen">
      <div class="screen-title">
        <div><p>FIELD / SHELTER 09</p><h1>거점 현장</h1></div>
        <p>${state.members.length} / ${2 + state.facilities.find((item) => item.id === "barracks").level * 2}명</p>
      </div>

      ${!state.guideDismissed ? `
        <section class="guide-card">
          <div><span class="eyebrow">SURVIVAL GUIDE</span><b>${guide.title}</b><small>${guide.text}</small></div>
          <button class="icon-btn" data-action="dismiss-guide" aria-label="가이드 닫기">×</button>
        </section>
      ` : ""}

      <section class="panel">
        <div class="scene">
          <div class="moon"></div><div class="skyline"></div><div class="ground"></div>
          ${compoundMarkup(state)}
          ${state.members.filter((member) => member.task !== "원정").map((member, index) => `
            <div class="worker" style="--delay:-${index * 2.1}s">
              <div class="worker-face">${characterHtml(member, "scene-character")}</div>
              <small>${escapeHtml(member.name)} · ${escapeHtml(member.task)}</small>
            </div>
          `).join("")}
          <div class="scene-info"><span class="badge">거점 안정</span><span class="badge">소음 낮음</span></div>
        </div>
        <div class="alert ${state.lastNight?.type === "good" ? "good" : ""}">
          <span>◆</span>
          <div>
            <strong>경계의 전투·정찰이 높을수록 안전한 밤을 보낼 수 있습니다.</strong>
            ${state.lastNight ? `<br>${escapeHtml(state.lastNight.text)}` : ""}
          </div>
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

function compoundMarkup(state) {
  const level = (id) => state.facilities.find((item) => item.id === id).level;
  const tier = (value) => (value <= 0 ? 0 : value >= 3 ? 2 : 1);
  const yard = [
    ["farm", "농지", `<i class="soil"></i><i class="sprout"></i><i class="sprout s2"></i>`],
    ["barracks", "막사", `<i class="roof"></i><i class="shell"></i><i class="door"></i><i class="win"></i><i class="win r"></i>`],
    ["kitchen", "주방", `<i class="chimney"></i><i class="roof"></i><i class="shell"></i><i class="pot"></i>`],
    ["clinic", "의무실", `<i class="roof"></i><i class="shell"></i><i class="cross"></i><i class="win"></i>`],
    ["workshop", "공방", `<i class="chimney"></i><i class="roof"></i><i class="shell"></i><i class="forge"></i>`],
  ];
  const structureHtml = ([id, name, parts]) => `
    <div class="structure ${id} t-${tier(level(id))}" aria-label="${name} ${level(id)}단계">
      ${parts}<em>${name} ${level(id)}</em>
    </div>
  `;
  return `
    <div class="fence lv-${level("wall")}" aria-label="방벽 ${level("wall")}단계">
      <i class="rail"></i><i class="gate"></i><i class="lamp"></i><em>방벽 ${level("wall")}</em>
    </div>
    <div class="yard">
      ${yard.slice(0, 3).map(structureHtml).join("")}
      <div class="firepit" aria-hidden="true"><i></i></div>
      ${yard.slice(3).map(structureHtml).join("")}
    </div>
  `;
}

function getGuide(state) {
  const burnout = state.members.find((member) => member.burnoutDays > 0);
  if (burnout) return { title: "번아웃 발생", text: `${burnout.name}은(는) 휴식과 긍정적인 대화가 필요합니다.` };
  const injured = state.members.find((member) => member.injuries?.length);
  if (injured) return { title: "부상자 치료", text: "의무실을 1단계로 강화하고 의학 담당자를 배치하세요." };
  const tired = state.members.find((member) => member.fatigue >= 75);
  if (tired) return { title: "피로 위험", text: `${tired.name}의 작업 효율이 감소했습니다. 휴식을 배치하세요.` };
  if (state.resources.food < state.members.length * 3) return { title: "식량 부족", text: "보유 식량이 3일치 미만입니다. 농사 담당자를 배치하세요." };
  return { title: "첫날 가이드", text: "능력에 맞춰 임무를 배치하고 피로와 무드를 확인한 뒤 하루를 보내세요." };
}
