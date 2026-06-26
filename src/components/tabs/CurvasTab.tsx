import { useState, useMemo, useRef } from 'react'
import { TrendingUp, Users, Target, AlertTriangle, Flag, Zap } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { categoryFromBox } from '../../types'
import type { CategoryId, PerformanceLevel, PotentialLevel, OKRSet } from '../../types'
import { calcOKRScore, idealRange, okrAvg } from '../../utils/okrCalc'
import { ManagerSearch } from '../ManagerSearch'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: '#F5F3FF', surface: '#FFFFFF', border: '#E5E7EB',
  primary: '#7C3AED', primaryBg: '#EDE9FE', primaryMid: '#DDD6FE',
  text1: '#1E1B4B', text2: '#4B5563', text3: '#9CA3AF',
  success: '#059669', successBg: '#D1FAE5',
  warning: '#D97706', warningBg: '#FEF3C7',
  danger: '#DC2626', dangerBg: '#FEE2E2',
}
const card: React.CSSProperties = {
  background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden',
}

// ── Category config ───────────────────────────────────────────────────────────
const CAT_ORDER: CategoryId[] = ['critico', 'desarrollo', 'core', 'alto', 'promesa']
const CAT_LEVEL: Record<CategoryId, number> = { critico: 1, desarrollo: 2, core: 3, alto: 4, promesa: 5 }

const CAT_STYLE: Record<CategoryId, { bar: string; label: string; text: string }> = {
  critico:    { bar: '#FCA5A5', label: '#FEE2E2', text: '#B91C1C' }, // red
  desarrollo: { bar: '#FDE68A', label: '#FEF9C3', text: '#92400E' }, // yellow
  core:       { bar: '#6EE7B7', label: '#D1FAE5', text: '#065F46' }, // green
  alto:       { bar: '#93C5FD', label: '#DBEAFE', text: '#1D4ED8' }, // blue
  promesa:    { bar: '#C4B5FD', label: '#EDE9FE', text: '#5B21B6' }, // purple
}

// Short labels for chart x-axis (numbered)
const CAT_SHORT: Record<CategoryId, string[]> = {
  critico:    ['1. Desempeño', 'insuficiente'],
  desarrollo: ['2. Desarrollo', 'requerido'],
  core:       ['3. Desempeño', 'esperado'],
  alto:       ['4. Alto', 'desempeño'],
  promesa:    ['5. Alta', 'promesa'],
}

// ── Trigger logic ─────────────────────────────────────────────────────────────
const TODAY = new Date('2026-06-25')
function yearsSince(dateStr: string): number {
  const d = new Date(dateStr)
  return (TODAY.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
}

type TriggerKey = 'lessThan1YrHighRating' | 'twoLevelsUp' | 'twoLevelsDown' | 'roleChangedHighRating' | 'consecutiveLow'

const TRIGGER_LABELS: Record<TriggerKey, string> = {
  lessThan1YrHighRating:  'Lleva menos de 1 año y fue evaluado/a con rating 3 o 4',
  twoLevelsUp:            'Subió 2 o más niveles desde el último ciclo',
  twoLevelsDown:          'Bajó 2 o más niveles desde el último ciclo',
  roleChangedHighRating:  'Cambió de rol en el último ciclo y recibe rating 3 o 4',
  consecutiveLow:         'Evaluado/a consecutivamente como 1 o 2 — recomendación: Accionar',
}

function evalTriggers(emp: ReturnType<typeof useStore.getState>['employees'][0]): Set<TriggerKey> {
  const fired = new Set<TriggerKey>()
  const effPerf  = emp.calibratedPerformance ?? emp.performance
  const effPot   = emp.calibratedPotential   ?? emp.potential
  const cat      = categoryFromBox(effPerf, effPot)
  const lvl      = CAT_LEVEL[cat]
  const rating34 = lvl === 3 || lvl === 4

  if (emp.hireDate && yearsSince(emp.hireDate) < 1 && rating34)
    fired.add('lessThan1YrHighRating')

  if (emp.prevPerformance && emp.prevPotential) {
    const prevCat = categoryFromBox(emp.prevPerformance, emp.prevPotential)
    const prevLvl = CAT_LEVEL[prevCat]
    if (lvl - prevLvl >= 2) fired.add('twoLevelsUp')
    if (prevLvl - lvl >= 2) fired.add('twoLevelsDown')
    if ((prevLvl <= 2) && (lvl <= 2)) fired.add('consecutiveLow')
  }

  if (emp.prevRole && emp.prevRole !== emp.role && rating34)
    fired.add('roleChangedHighRating')

  return fired
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon, color, bg }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; color: string; bg: string
}) {
  return (
    <div style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: T.text3, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function DistBarChart({
  counts, total, ideal,
}: {
  counts: Record<CategoryId, number>
  total: number
  ideal: Record<CategoryId, { min: number; max: number }>
}) {
  const maxVal = 75
  const actual = useMemo(() => {
    const r = {} as Record<CategoryId, number>
    CAT_ORDER.forEach(cat => { r[cat] = total > 0 ? Math.round((counts[cat] / total) * 100) : 0 })
    return r
  }, [counts, total])

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 260, paddingBottom: 0 }}>
      {CAT_ORDER.map((cat) => {
        const pct = actual[cat]
        const n   = counts[cat]
        const range = ideal[cat]
        const style = CAT_STYLE[cat]
        const chartH = 190
        const toH = (v: number) => Math.round((Math.min(v, maxVal) / maxVal) * chartH)
        const barH = toH(pct)
        const minH = toH(range.min)
        const maxH = toH(range.max)
        const inRange  = pct >= range.min && pct <= range.max
        const barColor = inRange ? '#6EE7B7' : pct > range.max ? '#FCA5A5' : '#FCD34D'

        return (
          <div key={cat} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {/* Percentage + count label */}
            <div style={{ fontSize: 11, fontWeight: 700, color: style.text, minHeight: 32, textAlign: 'center', lineHeight: 1.4 }}>
              {total > 0 ? (
                <>
                  <div>{pct}%</div>
                  <div style={{ fontWeight: 500, color: T.text3, fontSize: 10 }}>({n} {n === 1 ? 'persona' : 'personas'})</div>
                </>
              ) : '—'}
            </div>

            {/* Chart area */}
            <div style={{ position: 'relative', width: '100%', height: chartH }}>
              <div style={{ position: 'absolute', bottom: minH, left: '12%', right: '12%', height: maxH - minH, background: style.bar + '22', border: `1px dashed ${style.bar}`, borderRadius: 4 }} />
              <div style={{ position: 'absolute', bottom: maxH, left: '8%', right: '8%', height: 2, background: style.text, opacity: 0.5 }} />
              <div style={{ position: 'absolute', bottom: maxH + 4, right: '9%', fontSize: 8, fontWeight: 700, color: style.text, opacity: 0.65 }}>{range.max}%</div>
              <div style={{ position: 'absolute', bottom: minH, left: '8%', right: '8%', height: 2, background: style.text, opacity: 0.35 }} />
              <div style={{ position: 'absolute', bottom: minH - 12, right: '9%', fontSize: 8, fontWeight: 700, color: style.text, opacity: 0.5 }}>{range.min}%</div>
              {total > 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: '18%', right: '18%', height: barH, background: barColor, borderRadius: '5px 5px 0 0' }} />
              )}
            </div>

            {/* Category chip */}
            <div style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, lineHeight: 1.4, color: style.text, background: style.label, borderRadius: 6, padding: '3px 4px', width: '100%', boxSizing: 'border-box' }}>
              {CAT_SHORT[cat][0]}<br />{CAT_SHORT[cat][1]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Trigger badge + tooltip ───────────────────────────────────────────────────
function TriggerBadge({ triggers }: { triggers: Set<TriggerKey> }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  if (triggers.size === 0) return <span style={{ color: T.text3, fontSize: 11 }}>—</span>

  const isAccionar = triggers.has('consecutiveLow')
  const badgeColor    = isAccionar ? T.danger   : T.warning
  const badgeBg       = isAccionar ? '#FEE2E2'  : '#FEF3C7'
  const badgeLabel    = isAccionar ? 'Accionar' : `${triggers.size} alerta${triggers.size > 1 ? 's' : ''}`

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          setOpenUp(rect.top > 220)
        }
        setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
        background: badgeBg, color: badgeColor, cursor: 'default', whiteSpace: 'nowrap',
      }}>
        {isAccionar ? <Zap size={11} /> : <AlertTriangle size={11} />}
        {badgeLabel}
      </span>

      {open && (
        <div style={{
          position: 'absolute',
          ...(openUp
            ? { bottom: 'calc(100% + 6px)' }
            : { top: 'calc(100% + 6px)' }),
          left: '50%', transform: 'translateX(-50%)',
          minWidth: 320, background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '12px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Calibration Triggers
          </div>
          {(Object.entries(TRIGGER_LABELS) as [TriggerKey, string][]).map(([key, label]) => {
            const active = triggers.has(key)
            const isDes  = key === 'consecutiveLow'
            return (
              <div key={key} style={{
                padding: '5px 0',
                borderBottom: `1px solid ${T.border}`,
                opacity: active ? 1 : 0.3,
              }}>
                <span style={{
                  fontSize: 12, lineHeight: 1.4,
                  fontWeight: active ? 700 : 400,
                  color: active ? (isDes ? T.danger : T.primary) : T.text3,
                }}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Calibration table ─────────────────────────────────────────────────────────
type SortCol = 'name' | 'role' | 'grade' | 'area' | 'rating' | 'challenge' | 'trigger'
type SortDir = 'asc' | 'desc'

function CalibrationTable({ employees, filterDept, filterGrade, filterManager }: {
  employees: ReturnType<typeof useStore.getState>['employees']
  filterDept: string
  filterGrade: string
  filterManager: string
}) {
  const { challengedIds, toggleChallenge, updateCalibration } = useStore()
  const [sortCol, setSortCol] = useState<SortCol>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (col: SortCol) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const baseRows = useMemo(() => employees.filter(e => {
    if (filterDept !== 'Todos' && e.area !== filterDept) return false
    if (filterGrade !== 'Todos' && e.grade !== filterGrade) return false
    if (filterManager !== 'Todos' && e.managerName !== filterManager) return false
    return true
  }), [employees, filterDept, filterGrade, filterManager])

  const allTriggers = useMemo(() => {
    const map = new Map<string, Set<TriggerKey>>()
    baseRows.forEach(e => map.set(e.id, evalTriggers(e)))
    return map
  }, [baseRows])

  const rows = useMemo(() => {
    const gradeOrder = ['L1','L2','L3','L4','L5','L6','L7']
    return [...baseRows].sort((a, b) => {
      const effPerfA = a.calibratedPerformance ?? a.performance
      const effPotA  = a.calibratedPotential   ?? a.potential
      const effPerfB = b.calibratedPerformance ?? b.performance
      const effPotB  = b.calibratedPotential   ?? b.potential
      let cmp = 0
      switch (sortCol) {
        case 'name':      cmp = a.name.localeCompare(b.name); break
        case 'role':      cmp = a.role.localeCompare(b.role); break
        case 'grade':     cmp = gradeOrder.indexOf(a.grade ?? '') - gradeOrder.indexOf(b.grade ?? ''); break
        case 'area':      cmp = a.area.localeCompare(b.area); break
        case 'rating':    cmp = CAT_LEVEL[categoryFromBox(effPerfA, effPotA)] - CAT_LEVEL[categoryFromBox(effPerfB, effPotB)]; break
        case 'challenge': cmp = (challengedIds.includes(b.id) ? 1 : 0) - (challengedIds.includes(a.id) ? 1 : 0); break
        case 'trigger':   cmp = (allTriggers.get(b.id)?.size ?? 0) - (allTriggers.get(a.id)?.size ?? 0); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [baseRows, sortCol, sortDir, challengedIds, allTriggers])

  // Summary stats
  const changed     = baseRows.filter(e =>
    (e.calibratedPerformance && e.calibratedPerformance !== e.performance) ||
    (e.calibratedPotential   && e.calibratedPotential   !== e.potential)
  ).length
  const challenged  = baseRows.filter(e => challengedIds.includes(e.id)).length
  const warnings    = baseRows.filter(e => { const t = allTriggers.get(e.id)!; return t.size > 0 && !t.has('consecutiveLow') }).length
  const accionar    = baseRows.filter(e => allTriggers.get(e.id)!.has('consecutiveLow')).length

  const PERF_OPTS: { value: PerformanceLevel; label: string }[] = [
    { value: 'alto',  label: 'Alto'  },
    { value: 'medio', label: 'Medio' },
    { value: 'bajo',  label: 'Bajo'  },
  ]

  const SortArrow = ({ col }: { col: SortCol }) => (
    <span style={{ marginLeft: 3, opacity: sortCol === col ? 1 : 0.25, fontSize: 9 }}>
      {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '▲'}
    </span>
  )

  const thStyle = (col: SortCol): React.CSSProperties => ({
    padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700,
    color: sortCol === col ? T.primary : T.text3,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
    cursor: 'pointer', userSelect: 'none',
    background: sortCol === col ? '#FAFAFE' : '#FAFAFA',
  })

  return (
    <div style={{ ...card, marginTop: 0 }}>
      {/* Summary strip */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, background: '#FAFAFA', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { label: 'Calibraciones cambiadas', value: `${changed}`, sub: `de ${baseRows.length}`, color: T.text1 },
          { label: 'Challengeos',              value: `${challenged}`, sub: '',                    color: T.primary },
          { label: 'Warnings',                 value: `${warnings}`,   sub: '',                    color: T.warning },
          { label: 'Accionar',                 value: `${accionar}`,   sub: '',                    color: T.danger  },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>
                {item.value}
                {item.sub && <span style={{ fontSize: 12, fontWeight: 400, color: T.text3, marginLeft: 4 }}>{item.sub}</span>}
              </div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, height: 32, background: T.border }} />}
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle('name')}    onClick={() => handleSort('name')}>Nombre <SortArrow col="name" /></th>
              <th style={thStyle('role')}    onClick={() => handleSort('role')}>Rol <SortArrow col="role" /></th>
              <th style={thStyle('grade')}   onClick={() => handleSort('grade')}>Grado <SortArrow col="grade" /></th>
              <th style={thStyle('area')}    onClick={() => handleSort('area')}>Departamento <SortArrow col="area" /></th>
              <th style={thStyle('rating')}  onClick={() => handleSort('rating')}>Rating <SortArrow col="rating" /></th>
              <th style={thStyle('challenge')} onClick={() => handleSort('challenge')}>Challenge <SortArrow col="challenge" /></th>
              <th style={thStyle('trigger')} onClick={() => handleSort('trigger')}>Trigger <SortArrow col="trigger" /></th>
              <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${T.border}`, background: '#FAFAFA', whiteSpace: 'nowrap' }}>Nuevo Rend.</th>
              <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${T.border}`, background: '#FAFAFA', whiteSpace: 'nowrap' }}>Nuevo Pot.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((emp, i) => {
              const triggers     = allTriggers.get(emp.id)!
              const isChallenged = challengedIds.includes(emp.id)
              const effPerf      = emp.calibratedPerformance ?? emp.performance
              const effPot       = emp.calibratedPotential   ?? emp.potential
              const isChanged    = (emp.calibratedPerformance && emp.calibratedPerformance !== emp.performance) || (emp.calibratedPotential && emp.calibratedPotential !== emp.potential)
              const cat          = categoryFromBox(effPerf, effPot)
              const lvl          = CAT_LEVEL[cat]
              const cs           = CAT_STYLE[cat]

              return (
                <tr key={emp.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : '#FAFAFA' }}>
                  <td style={{ padding: '7px 12px', fontWeight: 500, color: T.text1, whiteSpace: 'nowrap' }}>
                    {emp.name}
                    {isChanged && <span style={{ marginLeft: 6, fontSize: 9, background: T.primaryBg, color: T.primary, borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>MODIFICADO</span>}
                  </td>
                  <td style={{ padding: '7px 12px', color: T.text2, whiteSpace: 'nowrap' }}>{emp.role}</td>
                  <td style={{ padding: '7px 12px', color: T.text2, fontWeight: 600 }}>{emp.grade ?? '—'}</td>
                  <td style={{ padding: '7px 12px', color: T.text2, whiteSpace: 'nowrap' }}>{emp.area}</td>
                  <td style={{ padding: '7px 12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: 6,
                      background: cs.label, color: cs.text,
                      fontSize: 12, fontWeight: 700,
                    }}>{lvl}</span>
                  </td>
                  <td style={{ padding: '7px 12px' }}>
                    <button onClick={() => toggleChallenge(emp.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                      border: `1px solid ${isChallenged ? T.primary : T.border}`,
                      background: isChallenged ? T.primaryBg : 'transparent',
                      color: isChallenged ? T.primary : T.text3,
                      cursor: 'pointer', transition: 'all 120ms', whiteSpace: 'nowrap',
                    }}>
                      <Flag size={11} fill={isChallenged ? T.primary : 'none'} />
                      {isChallenged ? 'Challengeado' : 'Challengear'}
                    </button>
                  </td>
                  <td style={{ padding: '7px 12px' }}>
                    <TriggerBadge triggers={triggers} />
                  </td>
                  <td style={{ padding: '7px 10px' }}>
                    <select value={effPerf}
                      onChange={e => updateCalibration(emp.id, e.target.value as PerformanceLevel, effPot)}
                      style={{ fontSize: 11, border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 6px', background: T.surface, color: T.text1, cursor: 'pointer' }}>
                      {PERF_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '7px 10px' }}>
                    <select value={effPot}
                      onChange={e => updateCalibration(emp.id, effPerf, e.target.value as PotentialLevel)}
                      style={{ fontSize: 11, border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 6px', background: T.surface, color: T.text1, cursor: 'pointer' }}>
                      {PERF_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main CurvasTab ────────────────────────────────────────────────────────────
export function CurvasTab() {
  const { employees, companyOKRs, deptOKRs, curvasFilterDept, curvasFilterGrade, curvasFilterManager, setCurvasFilter } = useStore()

  const filterDept    = curvasFilterDept
  const filterGrade   = curvasFilterGrade
  const filterManager = curvasFilterManager
  const setFilterDept    = (v: string) => setCurvasFilter('dept',    v)
  const setFilterGrade   = (v: string) => setCurvasFilter('grade',   v)
  const setFilterManager = (v: string) => setCurvasFilter('manager', v)

  const departments = useMemo(() => {
    const s = new Set(employees.map(e => e.area).filter(Boolean))
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  const grades = useMemo(() => {
    const s = new Set(employees.map(e => e.grade).filter(Boolean) as string[])
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  const resolvedDeptOKRs = useMemo((): OKRSet => {
    if (filterDept !== 'Todos' && deptOKRs[filterDept]) return deptOKRs[filterDept]
    const all = Object.values(deptOKRs).filter(o => o.objectives.length > 0)
    if (!all.length) return { enableWeights: false, objectives: [] }
    return { enableWeights: false, objectives: all.flatMap(o => o.objectives) }
  }, [deptOKRs, filterDept])

  const managers = useMemo(() => {
    const s = new Set(employees.map(e => e.managerName).filter(Boolean) as string[])
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  const filtered = useMemo(() => employees.filter(e => {
    if (filterDept !== 'Todos' && e.area !== filterDept) return false
    if (filterGrade !== 'Todos' && e.grade !== filterGrade) return false
    if (filterManager !== 'Todos' && e.managerName !== filterManager) return false
    return true
  }), [employees, filterDept, filterGrade, filterManager])

  const okrScore  = calcOKRScore(companyOKRs, resolvedDeptOKRs)
  const deptScore = okrAvg(resolvedDeptOKRs)
  const ideal     = idealRange(okrScore, deptScore)

  const counts = useMemo(() => {
    const c: Record<CategoryId, number> = { critico: 0, desarrollo: 0, core: 0, alto: 0, promesa: 0 }
    filtered.forEach(e => {
      const effPerf = e.calibratedPerformance ?? e.performance
      const effPot  = e.calibratedPotential   ?? e.potential
      c[categoryFromBox(effPerf, effPot)]++
    })
    return c
  }, [filtered])

  const actual = useMemo(() => {
    if (!filtered.length) return null
    const r = {} as Record<CategoryId, number>
    CAT_ORDER.forEach(cat => { r[cat] = Math.round((counts[cat] / filtered.length) * 100) })
    return r
  }, [counts, filtered.length])

  const scoreColor   = okrScore >= 70 ? T.success : T.warning
  const scoreBg      = okrScore >= 70 ? T.successBg : T.warningBg
  const inRangeCount = actual ? CAT_ORDER.filter(c => actual[c] >= ideal[c].min && actual[c] <= ideal[c].max).length : 0

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px', fontSize: 12, fontWeight: 500, color: T.text1,
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
    cursor: 'pointer', outline: 'none', minWidth: 150,
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: T.bg, minHeight: '100%' }}>

      {/* Welcome */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primaryBg} 0%, #fff 60%)`,
        border: `1px solid ${T.primaryMid}`, borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrendingUp size={20} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 4 }}>Distribución y calibración del equipo</div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
            Las <strong style={{ color: T.text1 }}>barras</strong> muestran la distribución actual.
            Las <strong style={{ color: T.text1 }}>líneas</strong> indican el rango ideal según OKRs.
            Usá la tabla inferior para <strong style={{ color: T.text1 }}>challengear</strong> personas y ajustar calibraciones.
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <MetricCard label="Score OKRs" value={`${Math.round(okrScore)}%`}
          sub={okrScore >= 70 ? 'Buen desempeño' : 'En progreso'}
          icon={<Target size={18} />} color={scoreColor} bg={scoreBg} />
        <MetricCard label="Personas analizadas" value={`${filtered.length}`}
          sub={filtered.length !== employees.length ? `de ${employees.length} totales` : 'equipo completo'}
          icon={<Users size={18} />} color={T.primary} bg={T.primaryBg} />
        <MetricCard
          label="Categorías en rango ideal"
          value={actual ? `${inRangeCount} / 5` : '—'}
          sub={actual ? (inRangeCount === 5 ? 'Distribución óptima' : 'Ajustar distribución') : 'Sin datos'}
          icon={<TrendingUp size={18} />}
          color={inRangeCount >= 4 ? T.success : T.warning}
          bg={inRangeCount >= 4 ? T.successBg : T.warningBg} />
      </div>

      {/* How-it-works banner */}
      <div style={{
        background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
        padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.65 }}>
          <strong style={{ color: '#92400E' }}>¿Cómo se calcula el rango recomendado?</strong>
          {' '}El rango ideal tiene dos motores.
          {' '}<strong>Las categorías bajas (1 y 2)</strong> dependen del resultado combinado empresa + departamento:
          si el contexto general fue difícil, se espera más concentración ahí.
          {' '}<strong>Las categorías altas (4 y 5)</strong> dependen casi exclusivamente del cumplimiento del departamento:
          un equipo que hizo el 20% de sus OKRs tiene muy poco espacio para top performers,
          mientras que uno que llegó al 100% puede justificar hasta 3× más personas en esas categorías.
          {' '}La categoría 3 (desempeño esperado) es el núcleo estable: siempre absorbe el 48–62%.
        </div>
      </div>

      {/* Chart card */}
      <div style={{ ...card, padding: '20px 20px 16px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Departamento</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selectStyle}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Grado</label>
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={selectStyle}>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Manager</label>
            <ManagerSearch value={filterManager} options={managers.filter(m => m !== 'Todos')} onChange={setFilterManager} />
          </div>
          {(filterDept !== 'Todos' || filterGrade !== 'Todos' || filterManager !== 'Todos') && (
            <button onClick={() => { setFilterDept('Todos'); setFilterGrade('Todos'); setFilterManager('Todos') }}
              style={{ fontSize: 11, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline', paddingBottom: 8 }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { color: '#6EE7B7', label: 'Dentro del rango' },
            { color: '#FCD34D', label: 'Bajo el mínimo' },
            { color: '#FCA5A5', label: 'Sobre el máximo' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: T.text2 }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 0, borderTop: '2px dashed #9CA3AF' }} />
            <span style={{ fontSize: 11, color: T.text2 }}>Rango ideal</span>
          </div>
        </div>

        {!actual ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: T.text3, fontSize: 13 }}>
            No hay personas que coincidan con los filtros seleccionados
          </div>
        ) : (
          <DistBarChart counts={counts} total={filtered.length} ideal={ideal} />
        )}
      </div>

      {/* Calibration table */}
      <CalibrationTable employees={employees} filterDept={filterDept} filterGrade={filterGrade} filterManager={filterManager} />

    </div>
  )
}
