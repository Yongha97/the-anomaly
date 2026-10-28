export const BASE_EVENTS = [
  {
    id: "wall_breach", title: "방어벽 돌파", cooldown: 5,
    description: "좀비 무리가 약해진 방벽을 밀어붙입니다. 지금 대응하지 않으면 거점 안으로 침투합니다.",
    choices: [
      { id: "fight", label: "직접 방어", hint: "전투·장비 판정, 부상 위험" },
      { id: "ammo", label: "탄약을 쏟아붓는다", hint: "탄약 3 소모, 피해 감소" },
      { id: "abandon", label: "물자를 버리고 후퇴", hint: "식량·자재 손실, 인명 피해 없음" },
    ],
  },
  {
    id: "refugees", title: "난민의 구호 요청", cooldown: 7,
    description: "지친 생존자들이 거점 문을 두드립니다. 아이는 없지만 모두 며칠째 굶은 상태입니다.",
    choices: [
      { id: "accept", label: "한 명을 받아들인다", hint: "정원 필요, 무드 상승" },
      { id: "support", label: "식량 4를 지원한다", hint: "우호 세력 관계 소폭 상승" },
      { id: "refuse", label: "문을 열지 않는다", hint: "자원 보존, 일부 무드 감소" },
    ],
  },
  {
    id: "conflict", title: "내부 갈등", cooldown: 4,
    description: "사이가 좋지 않은 두 구성원이 작업 방식 문제로 크게 충돌했습니다.",
    choices: [
      { id: "mediate", label: "리더가 중재한다", hint: "정신력 판정" },
      { id: "separate", label: "역할을 분리한다", hint: "관계 악화 방지, 피로 증가" },
      { id: "ignore", label: "스스로 해결하게 둔다", hint: "관계와 무드 악화 가능" },
    ],
  },
];

export const EXPEDITION_EVENTS = {
  emergency: {
    id: "exp_emergency", title: "긴급 현장 치료",
    description: "대원이 깊은 상처를 입었습니다. 지금 처치하지 않으면 상태가 악화될 수 있습니다.",
    choices: [
      { id: "treat", label: "즉시 치료", hint: "의약품 1, 의학 판정" },
      { id: "return", label: "응급처치 후 복귀", hint: "수확 감소, 안전한 귀환" },
      { id: "push", label: "위험을 감수하고 강행", hint: "수확 유지, 중상 위험" },
    ],
  },
  faction: {
    id: "exp_faction", title: "다른 세력과 조우",
    description: "무장한 정찰대가 길을 막았습니다. 상대도 아직 공격할지 결정하지 못한 눈치입니다.",
    choices: [
      { id: "negotiate", label: "협상한다", hint: "정신력·관계 판정" },
      { id: "trade", label: "현장 거래를 제안한다", hint: "식량과 의약품 교환" },
      { id: "fight", label: "선제 공격한다", hint: "전투, 관계 급락" },
      { id: "avoid", label: "우회한다", hint: "식량 2 소모, 충돌 회피" },
    ],
  },
};
