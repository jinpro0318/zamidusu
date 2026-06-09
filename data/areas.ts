// data/areas.ts — the 12 palaces / life-areas (single source of truth)
import type { Area } from '@/lib/ziwei-types';

export const AREAS: Area[] = [
  { h: '宅', ko: '집·가정', cn: '田宅宮', c: 1, r: 1, stars: ['廉貞', '天相'], br: '廟', line: '안정된 보금자리와 가정 운이 따라요' },
  { h: '官', ko: '직업·커리어', cn: '官祿宮', c: 2, r: 1, stars: ['天梁'], br: '旺', line: '책임지는 자리에서 빛나는 타입' },
  { h: '友', ko: '대인관계', cn: '奴僕宮', c: 3, r: 1, stars: ['七殺'], br: '平', line: '사람을 끄는 힘, 인맥이 자산' },
  { h: '遷', ko: '이동·해외', cn: '遷移宮', c: 4, r: 1, stars: ['天同'], br: '陷', line: '움직일수록 기회가 열려요' },
  { h: '福', ko: '복·취미', cn: '福德宮', c: 1, r: 2, stars: ['巨門'], br: '廟', line: '생각이 깊고 취향이 분명해요' },
  { h: '疾', ko: '건강·체질', cn: '疾厄宮', c: 4, r: 2, stars: ['武曲'], br: '旺', line: '기력은 좋되 과로는 주의' },
  { h: '父', ko: '부모·윗사람', cn: '父母宮', c: 1, r: 3, stars: ['貪狼'], br: '平', line: '윗사람의 도움을 받는 운' },
  { h: '財', ko: '돈·재물', cn: '財帛宮', c: 4, r: 3, stars: ['太陽'], br: '廟', line: '벌이는 좋아요, 씀씀이만 챙기면 OK' },
  { h: '命', ko: '나·성격', cn: '命宮', c: 1, r: 4, stars: ['紫微', '天府'], br: '廟', line: '중심을 잡는 리더, 품위가 있어요', sel: true },
  { h: '兄', ko: '형제·친구', cn: '兄弟宮', c: 2, r: 4, stars: ['天機'], br: '旺', line: '머리 좋은 친구·형제 복' },
  { h: '妻', ko: '연애·결혼', cn: '夫妻宮', c: 3, r: 4, stars: ['太陰'], br: '平', line: '감정이 깊고 헌신적인 인연' },
  { h: '子', ko: '자녀·후배', cn: '子女宮', c: 4, r: 4, stars: ['破軍'], br: '陷', line: '독립심 강한 아이·후배 인연' },
];
