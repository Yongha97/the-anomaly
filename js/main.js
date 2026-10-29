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
  acceptRecruit,
  refuseRecruit,
  openBaseView,
  passDay,
  rerollStartingMembers,
  resolvePendingEvent,
  selectDestination,
  setExpeditionLeader,
  setMembersView,
  askExpel,
  cancelExpel,
  confirmExpel,
  askAppointLeader,
  cancelAppointLeader,
  confirmAppointLeader,
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
import { combatReportModal, eventModal, recruitModal } from "./components/event-modal.js";

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
      ${recruitModal(state)}
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
        <p class="leader-hint">리더십이 가장 높은 사람이 시작 리더입니다. 시작한 뒤에는 관리에서 바꿀 수 있습니다.</p>
        <div class="start-party">
          ${state.members.map((member) => `
            <div class="start-member ${member.leader ? "is-leader" : ""}">
              ${faceHtml(member)}
              <div>
                <small>${member.gender === "female" ? "여" : "남"} · ${member.age}세${member.leader ? " · 리더" : ""}</small>
                <b>${escapeHtml(member.name)}</b>
                <em>${escapeHtml(member.trait)} · ${escapeHtml(member.background)}</em>
              </div>
            </div>
          `).join("")}
        </div>
        <button class="secondary reroll" type="button" data-action="reroll-start">↻ 다시 뽑기</button>
        <p class="start-note">나이, 직업, 능력, 이름, 성별, 성격, 얼굴이 다시 정해집니다. 능력은 1부터 나이 상한까지 나옵니다. 16세는 상한 4, 45세는 10이고 그 뒤로는 5년마다 1씩 낮아집니다. 만학은 늙어도 상한이 줄지 않습니다. 시작 리더는 리더십이 가장 높은 사람입니다.</p>
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
    "ask-expel": () => askExpel(id),
    "cancel-expel": cancelExpel,
    "confirm-expel": confirmExpel,
    "ask-appoint": () => askAppointLeader(id),
    "cancel-appoint": cancelAppointLeader,
    "confirm-appoint": confirmAppointLeader,
    "open-base-view": () => openBaseView(view, faction),
    trade: () => tradeFaction(faction, item, direction),
    hire: () => hireMercenary(faction),
    "accept-recruit": acceptRecruit,
    "refuse-recruit": refuseRecruit,
    "battle-member": () => toggleBattleMember(id),
    "battle-tactic": () => setBattleTactic(value),
    "start-battle": () => startFactionBattle(faction),
    "close-combat-report": closeCombatReport,
  };
  actions[action]?.();
});

subscribe(render);
render();
