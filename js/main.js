import {
  assignTask,
  autoAssign,
  closeReport,
  dismissGuide,
  closeCombatReport,
  equipMember,
  finishExpedition,
  getState,
  launchExpedition,
  hireMercenary,
  openBaseView,
  passDay,
  rerollStartingMembers,
  resolvePendingEvent,
  selectDestination,
  setExpeditionLeader,
  setMembersView,
  setRationPlan,
  setRecruitPolicy,
  setRiskPolicy,
  setBattleTactic,
  setTab,
  startGame,
  subscribe,
  toggleSquad,
  toggleBattleMember,
  tradeFaction,
  upgradeFacility,
  startFactionBattle,
} from "./core/state.js";
import { bottomNav, escapeHtml, faceHtml, reportModal, toastView, topBar } from "./components/common.js";
import { renderField } from "./screens/field.js";
import { renderMembers } from "./screens/members.js";
import { renderExpedition } from "./screens/expedition.js";
import { renderBase } from "./screens/base.js";
import { combatReportModal, eventModal } from "./components/event-modal.js";

const app = document.querySelector("#app");
const screens = {
  field: renderField,
  members: renderMembers,
  expedition: renderExpedition,
  base: renderBase,
};

function render() {
  const state = getState();
  if (!state.started) {
    app.innerHTML = renderTitle();
    return;
  }
  const screen = screens[state.activeTab] || renderField;
  app.innerHTML = `
    <div class="app">
      ${topBar()}
      ${screen()}
      ${bottomNav()}
      ${reportModal()}
      ${eventModal(state)}
      ${combatReportModal(state)}
      ${toastView()}
    </div>
  `;
}

function renderTitle() {
  const state = getState();
  return `
    <div class="app title-screen">
      <div class="title-logo">
        <small>SURVIVAL MANAGEMENT</small>
        <h1>더<br>어노말리</h1>
        <p>무너진 도시, 살아남은 사람들.<br>오늘의 선택이 내일의 공동체를 만듭니다.</p>
      </div>
      <form class="setup" id="start-form">
        <div class="field">
          <label for="faction">세력 이름</label>
          <input id="faction" name="faction" maxlength="12" value="${escapeHtml(state.faction)}" autocomplete="off">
        </div>
        <div class="start-party">
          ${state.members.map((member, index) => `
            <div class="start-member">
              ${faceHtml(member)}
              <div><small>${index === 0 ? "리더" : `동료 ${index}`}</small><b>${escapeHtml(member.name)}</b></div>
            </div>
          `).join("")}
        </div>
        <button class="secondary reroll" type="button" data-action="reroll-start">↻ 이름과 얼굴 다시 뽑기</button>
        <p class="start-note">모든 생존자의 이름, 머리, 눈과 입은 무작위로 생성됩니다. 리더 1명과 동료 2명, 식량 18개로 시작합니다.</p>
        <button class="primary" type="submit">생존 시작</button>
      </form>
    </div>
  `;
}

app.addEventListener("submit", (event) => {
  if (event.target.id !== "start-form") return;
  event.preventDefault();
  const data = new FormData(event.target);
  startGame({
    faction: data.get("faction"),
    names: [],
  });
});

app.addEventListener("change", (event) => {
  if (event.target.dataset.action === "assign") {
    assignTask(event.target.dataset.id, event.target.value);
  }
  if (event.target.dataset.action === "expedition-leader") {
    setExpeditionLeader(event.target.value);
  }
  if (event.target.dataset.action === "equip") {
    equipMember(event.target.dataset.id, event.target.value);
  }
});

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, id, tab, plan, value, choice, faction, item, direction, view } = target.dataset;
  const actions = {
    tab: () => setTab(tab),
    "auto-assign": autoAssign,
    "reroll-start": rerollStartingMembers,
    "pass-day": passDay,
    destination: () => selectDestination(id),
    ration: () => setRationPlan(plan),
    "risk-policy": () => setRiskPolicy(value),
    "recruit-policy": () => setRecruitPolicy(value),
    squad: () => toggleSquad(id),
    launch: launchExpedition,
    "finish-expedition": finishExpedition,
    upgrade: () => upgradeFacility(id),
    "close-report": closeReport,
    "dismiss-guide": dismissGuide,
    "resolve-event": () => resolvePendingEvent(choice),
    "members-view": () => setMembersView(view),
    "open-base-view": () => openBaseView(view, faction),
    trade: () => tradeFaction(faction, item, direction),
    hire: () => hireMercenary(faction),
    "battle-member": () => toggleBattleMember(id),
    "battle-tactic": () => setBattleTactic(value),
    "start-battle": () => startFactionBattle(faction),
    "close-combat-report": closeCombatReport,
  };
  actions[action]?.();
});

subscribe(render);
render();
