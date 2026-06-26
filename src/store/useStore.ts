import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Employee, OKRSet, CategoryNames, AppTab,
  PerformanceLevel, PotentialLevel, KeyResult, Objective,
} from '../types'
import { DEFAULT_CATEGORY_NAMES } from '../types'
import { SAMPLE_EMPLOYEES, SAMPLE_COMPANY_OKRS, SAMPLE_DEPT_OKRS_BY_AREA } from '../data/sampleData'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function makeKRs(): KeyResult[] {
  return [
    { id: uid(), text: '', completion: 0 },
    { id: uid(), text: '', completion: 0 },
    { id: uid(), text: '', completion: 0 },
  ]
}


type State = {
  activeTab: AppTab
  companyOKRs: OKRSet
  deptOKRs: Record<string, OKRSet>
  activeDept: string
  employees: Employee[]
  challengedIds: string[]
  categoryNames: CategoryNames
  marketContext: number // -30 to +30, default 0
  companyOKRWeight: number // 0-100, dept weight = 100 - this
  cycleLabel: string
  prevCycleLabel: string
  hasPrevCycle: boolean
  nineBoxFilterDept:    string
  nineBoxFilterGrade:   string
  nineBoxFilterRole:    string
  nineBoxFilterManager: string
  curvasFilterDept:     string
  curvasFilterGrade:    string
  curvasFilterManager:  string
  peersFilterGrade:     string
  peersFilterDepts:     string[]
  peersFilterManager:   string
}

type Actions = {
  setTab: (tab: AppTab) => void
  setCycleLabel: (v: string) => void
  setPrevCycleLabel: (v: string) => void
  setHasPrevCycle: (v: boolean) => void
  setMarketContext: (v: number) => void
  setCompanyOKRWeight: (v: number) => void
  setActiveDept: (dept: string) => void
  setNineBoxFilter: (key: 'dept' | 'grade' | 'role' | 'manager', value: string) => void
  setCurvasFilter:    (key: 'dept' | 'grade' | 'manager', value: string) => void
  setPeersFilterGrade: (grade: string) => void
  setPeersFilterDepts: (depts: string[]) => void
  setPeersFilterManager: (manager: string) => void

  // OKR actions
  toggleWeights: (set: 'company' | 'dept') => void
  addObjective: (set: 'company' | 'dept') => void
  removeObjective: (set: 'company' | 'dept', id: string) => void
  updateObjective: (set: 'company' | 'dept', id: string, text: string) => void
  updateObjectiveWeight: (set: 'company' | 'dept', id: string, weight: number) => void
  addKeyResult: (set: 'company' | 'dept', objectiveId: string) => void
  removeKeyResult: (set: 'company' | 'dept', objectiveId: string, krId: string) => void
  updateKeyResult: (set: 'company' | 'dept', objectiveId: string, krId: string, patch: Partial<KeyResult>) => void

  // Employee actions
  addEmployee: () => void
  removeEmployee: (id: string) => void
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  moveEmployee: (id: string, performance: PerformanceLevel, potential: PotentialLevel) => void
  toggleChallenge: (id: string) => void
  updateCalibration: (id: string, performance?: PerformanceLevel, potential?: PotentialLevel) => void
  clearEmployees: () => void
  clearAll: () => void

  // Category names
  updateCategoryName: (id: keyof CategoryNames, name: string) => void
}

function patchOKRSet(
  okrs: OKRSet,
  fn: (o: OKRSet) => OKRSet,
): OKRSet {
  return fn(okrs)
}

const INITIAL_DEPT = 'Engineering'

function emptyOKRSetLocal(): OKRSet {
  return { enableWeights: false, objectives: [] }
}

function getDeptOKRs(state: State, dept: string): OKRSet {
  return state.deptOKRs[dept] ?? emptyOKRSetLocal()
}

export const useStore = create<State & Actions>()(
  persist(
    (set, _get) => ({
  activeTab: 'datos',
  companyOKRs: SAMPLE_COMPANY_OKRS,
  deptOKRs: SAMPLE_DEPT_OKRS_BY_AREA,
  activeDept: INITIAL_DEPT,
  employees: SAMPLE_EMPLOYEES,
  challengedIds: [],
  categoryNames: { ...DEFAULT_CATEGORY_NAMES },
  marketContext: 0,
  companyOKRWeight: 40,
  cycleLabel: 'H1 2025',
  prevCycleLabel: 'H2 2024',
  hasPrevCycle: false,
  nineBoxFilterDept:    'Todos',
  nineBoxFilterGrade:   'Todos',
  nineBoxFilterRole:    'Todos',
  nineBoxFilterManager: 'Todos',
  curvasFilterDept:     'Todos',
  curvasFilterGrade:    'Todos',
  curvasFilterManager:  'Todos',
  peersFilterGrade:     'L4',
  peersFilterDepts:     [],
  peersFilterManager:   'Todos',

  setTab: (tab) => set({ activeTab: tab }),
  setCycleLabel: (v) => set({ cycleLabel: v }),
  setPrevCycleLabel: (v) => set({ prevCycleLabel: v }),
  setHasPrevCycle: (v) => set({ hasPrevCycle: v }),
  setMarketContext: (v) => set({ marketContext: v }),
  setCompanyOKRWeight: (v) => set({ companyOKRWeight: v }),
  setNineBoxFilter: (key, value) => set(
    key === 'dept'    ? { nineBoxFilterDept:    value } :
    key === 'grade'   ? { nineBoxFilterGrade:   value } :
    key === 'manager' ? { nineBoxFilterManager: value } :
                        { nineBoxFilterRole:    value }
  ),
  setCurvasFilter: (key, value) => set(
    key === 'dept'    ? { curvasFilterDept:    value } :
    key === 'manager' ? { curvasFilterManager: value } :
                        { curvasFilterGrade:   value }
  ),
  setPeersFilterGrade:   (grade)   => set({ peersFilterGrade:   grade }),
  setPeersFilterDepts:   (depts)   => set({ peersFilterDepts:   depts }),
  setPeersFilterManager: (manager) => set({ peersFilterManager: manager }),

  setActiveDept: (dept) => set((s) => {
    // Ensure the dept has an entry
    if (!s.deptOKRs[dept]) {
      return { activeDept: dept, deptOKRs: { ...s.deptOKRs, [dept]: emptyOKRSetLocal() } }
    }
    return { activeDept: dept }
  }),

  toggleWeights: (which) =>
    set((s) => {
      if (which === 'company') {
        return { companyOKRs: { ...s.companyOKRs, enableWeights: !s.companyOKRs.enableWeights } }
      }
      const dept = s.activeDept
      const okrs = getDeptOKRs(s, dept)
      return { deptOKRs: { ...s.deptOKRs, [dept]: { ...okrs, enableWeights: !okrs.enableWeights } } }
    }),

  addObjective: (which) =>
    set((s) => {
      const newObj: Objective = { id: uid(), text: '', weight: 0, keyResults: makeKRs() }
      if (which === 'company') {
        return { companyOKRs: { ...s.companyOKRs, objectives: [...s.companyOKRs.objectives, newObj] } }
      }
      const dept = s.activeDept
      const okrs = getDeptOKRs(s, dept)
      return { deptOKRs: { ...s.deptOKRs, [dept]: { ...okrs, objectives: [...okrs.objectives, newObj] } } }
    }),

  removeObjective: (which, id) =>
    set((s) => {
      if (which === 'company') {
        return { companyOKRs: { ...s.companyOKRs, objectives: s.companyOKRs.objectives.filter((o) => o.id !== id) } }
      }
      const dept = s.activeDept
      const okrs = getDeptOKRs(s, dept)
      return { deptOKRs: { ...s.deptOKRs, [dept]: { ...okrs, objectives: okrs.objectives.filter((o) => o.id !== id) } } }
    }),

  updateObjectiveWeight: (which, id, weight) =>
    set((s) => {
      const patch = (okrs: OKRSet) => ({ ...okrs, objectives: okrs.objectives.map((o) => o.id === id ? { ...o, weight } : o) })
      if (which === 'company') return { companyOKRs: patch(s.companyOKRs) }
      const dept = s.activeDept
      return { deptOKRs: { ...s.deptOKRs, [dept]: patch(getDeptOKRs(s, dept)) } }
    }),

  updateObjective: (which, id, text) =>
    set((s) => {
      const patch = (okrs: OKRSet) => ({ ...okrs, objectives: okrs.objectives.map((o) => o.id === id ? { ...o, text } : o) })
      if (which === 'company') return { companyOKRs: patch(s.companyOKRs) }
      const dept = s.activeDept
      return { deptOKRs: { ...s.deptOKRs, [dept]: patch(getDeptOKRs(s, dept)) } }
    }),

  addKeyResult: (which, objectiveId) =>
    set((s) => {
      const patch = (okrs: OKRSet) => ({
        ...okrs,
        objectives: okrs.objectives.map((o) =>
          o.id === objectiveId ? { ...o, keyResults: [...o.keyResults, { id: uid(), text: '', completion: 0 }] } : o
        ),
      })
      if (which === 'company') return { companyOKRs: patch(s.companyOKRs) }
      const dept = s.activeDept
      return { deptOKRs: { ...s.deptOKRs, [dept]: patch(getDeptOKRs(s, dept)) } }
    }),

  removeKeyResult: (which, objectiveId, krId) =>
    set((s) => {
      const patch = (okrs: OKRSet) => patchOKRSet(okrs, (o) => ({
        ...o,
        objectives: o.objectives.map((obj) =>
          obj.id === objectiveId ? { ...obj, keyResults: obj.keyResults.filter((kr) => kr.id !== krId) } : obj
        ),
      }))
      if (which === 'company') return { companyOKRs: patch(s.companyOKRs) }
      const dept = s.activeDept
      return { deptOKRs: { ...s.deptOKRs, [dept]: patch(getDeptOKRs(s, dept)) } }
    }),

  updateKeyResult: (which, objectiveId, krId, patch) =>
    set((s) => {
      const applyPatch = (okrs: OKRSet) => patchOKRSet(okrs, (o) => ({
        ...o,
        objectives: o.objectives.map((obj) =>
          obj.id === objectiveId
            ? { ...obj, keyResults: obj.keyResults.map((kr) => kr.id === krId ? { ...kr, ...patch } : kr) }
            : obj
        ),
      }))
      if (which === 'company') return { companyOKRs: applyPatch(s.companyOKRs) }
      const dept = s.activeDept
      return { deptOKRs: { ...s.deptOKRs, [dept]: applyPatch(getDeptOKRs(s, dept)) } }
    }),

  addEmployee: () =>
    set((s) => ({
      employees: [
        ...s.employees,
        {
          id: uid(),
          name: '',
          area: '',
          role: '',
          performance: 'medio',
          potential: 'medio',
        },
      ],
    })),

  removeEmployee: (id) =>
    set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),

  updateEmployee: (id, patch) =>
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),

  moveEmployee: (id, performance, potential) =>
    set((s) => ({
      employees: s.employees.map((e) =>
        e.id === id ? { ...e, performance, potential } : e
      ),
    })),

  toggleChallenge: (id) =>
    set((s) => ({
      challengedIds: s.challengedIds.includes(id)
        ? s.challengedIds.filter((x) => x !== id)
        : [...s.challengedIds, id],
    })),

  updateCalibration: (id, performance, potential) =>
    set((s) => ({
      employees: s.employees.map((e) =>
        e.id === id
          ? { ...e, calibratedPerformance: performance, calibratedPotential: potential }
          : e
      ),
    })),

  updateCategoryName: (id, name) =>
    set((s) => ({ categoryNames: { ...s.categoryNames, [id]: name } })),

  clearEmployees: () => set({ employees: [] }),
  clearAll: () => set({
    employees: [],
    companyOKRs: { enableWeights: false, objectives: [] },
    deptOKRs: {},
  }),
    }),
    {
      name: 'calibracion-hr-store',
      partialize: (s) => ({
        companyOKRs:       s.companyOKRs,
        deptOKRs:          s.deptOKRs,
        challengedIds:     s.challengedIds,
        categoryNames:     s.categoryNames,
        marketContext:     s.marketContext,
        companyOKRWeight:  s.companyOKRWeight,
        cycleLabel:        s.cycleLabel,
        prevCycleLabel:    s.prevCycleLabel,
        hasPrevCycle:      s.hasPrevCycle,
        nineBoxFilterDept:    s.nineBoxFilterDept,
        nineBoxFilterGrade:   s.nineBoxFilterGrade,
        nineBoxFilterRole:    s.nineBoxFilterRole,
        nineBoxFilterManager: s.nineBoxFilterManager,
        curvasFilterDept:     s.curvasFilterDept,
        curvasFilterGrade:    s.curvasFilterGrade,
        curvasFilterManager:  s.curvasFilterManager,
        peersFilterGrade:     s.peersFilterGrade,
        peersFilterDepts:     s.peersFilterDepts,
        peersFilterManager:   s.peersFilterManager,
      }),
    }
  )
)
