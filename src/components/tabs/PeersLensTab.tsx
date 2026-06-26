import { useState, useMemo, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { categoryFromBox } from '../../types'
import type { CategoryId, PerformanceLevel, PotentialLevel, Employee } from '../../types'
import { ChevronDown, AlertTriangle, CheckCircle2, Users, X, Flag, Eye } from 'lucide-react'
import { ManagerSearch } from '../ManagerSearch'

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  primary:    '#7C3AED',
  primaryBg:  '#F5F3FF',
  primaryMid: '#DDD6FE',
  surface:    '#FFFFFF',
  border:     '#E5E7EB',
  text1:      '#111827',
  text2:      '#374151',
  text3:      '#6B7280',
  warning:    '#D97706',
  warningBg:  '#FFFBEB',
  danger:     '#DC2626',
  success:    '#059669',
}

const CAT_STYLE: Record<CategoryId, { bg: string; border: string; text: string; chip: string }> = {
  critico:    { bg: '#FFF5F5', border: '#FED7D7', text: '#B91C1C', chip: '#FEE2E2' },
  desarrollo: { bg: '#FFFDF0', border: '#FEF08A', text: '#92400E', chip: '#FEF9C3' },
  core:       { bg: '#F0FDF8', border: '#BBF7D0', text: '#065F46', chip: '#D1FAE5' },
  alto:       { bg: '#F0F7FF', border: '#BFDBFE', text: '#1D4ED8', chip: '#DBEAFE' },
  promesa:    { bg: '#F8F5FF', border: '#DDD6FE', text: '#5B21B6', chip: '#EDE9FE' },
}

const CAT_NUM: Record<CategoryId, number> = { critico: 1, desarrollo: 2, core: 3, alto: 4, promesa: 5 }
const CAT_LABEL: Record<CategoryId, string> = {
  critico: '1. Desempeño insuficiente', desarrollo: '2. Desarrollo requerido',
  core: '3. Desempeño esperado', alto: '4. Alto desempeño', promesa: '5. Alta promesa',
}

const CATS: CategoryId[] = ['critico', 'desarrollo', 'core', 'alto', 'promesa']

const PERF_OPTS: { value: PerformanceLevel; label: string }[] = [
  { value: 'alto', label: 'Alto' }, { value: 'medio', label: 'Medio' }, { value: 'bajo', label: 'Bajo' },
]

function fmtCLP(n: number): string {
  return '$ ' + Math.round(n / 1_000).toLocaleString('es-CL') + 'K'
}

// ── Dept multi-select dropdown ────────────────────────────────────────────────
function DeptSelector({
  allDepts, selected, onChange,
}: {
  allDepts: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const allSelected = selected.length === 0
  const label = allSelected ? 'Todos los depts.' : selected.length === 1 ? selected[0] : `${selected.length} departamentos`

  const toggle = (dept: string) => {
    onChange(selected.includes(dept) ? selected.filter(d => d !== dept) : [...selected, dept])
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: `1px solid ${!allSelected ? T.primary : T.border}`,
          borderRadius: 8, padding: '5px 10px',
          fontSize: 12, fontWeight: !allSelected ? 700 : 500,
          color: !allSelected ? T.primary : T.text2,
          background: !allSelected ? T.primaryBg : T.surface,
          cursor: 'pointer',
        }}
      >
        <Users size={13} />
        {label}
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '6px 0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 200,
        }}>
          {/* Select all */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
            cursor: 'pointer', fontSize: 12, fontWeight: 600, color: T.text2,
            borderBottom: `1px solid ${T.border}`,
          }}>
            <input type="checkbox" checked={allSelected}
              onChange={() => onChange([])}
              style={{ accentColor: T.primary, width: 14, height: 14, flexShrink: 0, margin: 0 }} />
            Todos los departamentos
          </label>
          {allDepts.map(dept => (
            <label key={dept} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
              cursor: 'pointer', fontSize: 12, color: T.text2,
            }}>
              <input type="checkbox" checked={selected.includes(dept)}
                onChange={() => toggle(dept)}
                style={{ accentColor: T.primary, width: 14, height: 14, flexShrink: 0, margin: 0 }} />
              {dept}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Person card ───────────────────────────────────────────────────────────────
function PersonCard({
  employee, isOutlier, isChallenged, onSelect,
}: {
  employee: Employee
  isOutlier: boolean
  isChallenged: boolean
  onSelect: (emp: Employee) => void
}) {
  const effPerf = employee.calibratedPerformance ?? employee.performance
  const effPot  = employee.calibratedPotential   ?? employee.potential
  const catId   = categoryFromBox(effPerf, effPot)

  const prevCatId = (employee.prevPerformance && employee.prevPotential)
    ? categoryFromBox(employee.prevPerformance, employee.prevPotential)
    : null
  const delta = prevCatId ? CAT_NUM[catId] - CAT_NUM[prevCatId] : 0

  return (
    <div
      onClick={() => onSelect(employee)}
      style={{
        background: isOutlier ? '#FFFBEB' : T.surface,
        border: `1.5px solid ${isOutlier ? '#FCD34D' : T.border}`,
        borderRadius: 10, padding: '10px 12px',
        cursor: 'pointer', transition: 'all 140ms',
        position: 'relative',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Outlier indicator */}
      {isOutlier && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <AlertTriangle size={13} color={T.warning} />
        </div>
      )}
      {isChallenged && (
        <div style={{ position: 'absolute', top: 8, right: isOutlier ? 26 : 8 }}>
          <Flag size={12} color={T.primary} fill={T.primary} />
        </div>
      )}

      {/* Name */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.text1, marginBottom: 2, paddingRight: 20 }}>
        {employee.name}
      </div>

      {/* Role */}
      <div style={{ fontSize: 11, color: T.text3, marginBottom: 6 }}>{employee.role}</div>

      {/* Dept chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 600, color: T.primary,
          background: T.primaryBg, borderRadius: 4, padding: '1px 6px',
        }}>
          {employee.area}
        </span>
        {employee.grade && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: T.text3,
            background: '#F3F4F6', borderRadius: 4, padding: '1px 6px',
          }}>
            {employee.grade}
          </span>
        )}
      </div>

      {/* Bottom row: salary + delta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {employee.salary ? (
          <span style={{ fontSize: 11, fontWeight: 600, color: T.text2 }}>
            {fmtCLP(employee.salary)}
          </span>
        ) : <span />}

        {delta !== 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: delta > 0 ? T.success : T.danger,
          }}>
            {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`} vs prev
          </span>
        )}
      </div>
    </div>
  )
}

// ── Re-evaluation panel (right drawer) ───────────────────────────────────────
function RevalPanel({
  employee, cohort, onClose,
}: {
  employee: Employee
  cohort: Employee[]
  onClose: () => void
}) {
  const { updateCalibration, toggleChallenge, challengedIds } = useStore()

  const effPerf = employee.calibratedPerformance ?? employee.performance
  const effPot  = employee.calibratedPotential   ?? employee.potential
  const catId   = categoryFromBox(effPerf, effPot)
  const cs      = CAT_STYLE[catId]

  const [newPerf, setNewPerf] = useState<PerformanceLevel>(effPerf)
  const [newPot,  setNewPot]  = useState<PotentialLevel>(effPot)

  const newCatId = categoryFromBox(newPerf, newPot)
  const newCs    = CAT_STYLE[newCatId]
  const changed  = newPerf !== effPerf || newPot !== effPot

  // Cohort distribution
  const cohortDist = useMemo(() => {
    const m: Record<CategoryId, number> = { critico: 0, desarrollo: 0, core: 0, alto: 0, promesa: 0 }
    cohort.forEach(e => {
      const ep = e.calibratedPerformance ?? e.performance
      const ept = e.calibratedPotential ?? e.potential
      m[categoryFromBox(ep, ept)]++
    })
    return m
  }, [cohort])

  const isChallenged = challengedIds.includes(employee.id)

  const handleSave = () => {
    updateCalibration(employee.id, newPerf, newPot)
    if (changed && !isChallenged) toggleChallenge(employee.id)
    onClose()
  }

  return (
    <div style={{
      width: 320, flexShrink: 0,
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: '18px 18px 14px',
      display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{employee.name}</div>
          <div style={{ fontSize: 12, color: T.text3 }}>{employee.role} · {employee.area}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text3, padding: 2 }}>
          <X size={16} />
        </button>
      </div>

      {/* Current rating */}
      <div style={{ background: cs.chip, border: `1px solid ${cs.border}`, borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: cs.text, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Rating actual
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 22, height: 22, borderRadius: 6, background: cs.text, color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800,
          }}>{CAT_NUM[catId]}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: cs.text }}>{CAT_LABEL[catId]}</span>
        </div>
      </div>

      {/* Cohort distribution */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Distribución del grupo ({cohort.length} personas)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CATS.map(cid => {
            const count = cohortDist[cid]
            const pct   = cohort.length ? Math.round(count / cohort.length * 100) : 0
            const ccs   = CAT_STYLE[cid]
            return (
              <div key={cid} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, background: ccs.text, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, flexShrink: 0,
                }}>{CAT_NUM[cid]}</span>
                <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: ccs.border, borderRadius: 3, transition: 'width 300ms' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.text2, minWidth: 24 }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Re-evaluation dropdowns */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Nueva evaluación
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            { label: 'Rendimiento', val: newPerf, set: setNewPerf },
            { label: 'Potencial',   val: newPot,  set: setNewPot  },
          ] as const).map(f => (
            <div key={f.label} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: T.text3, marginBottom: 4 }}>{f.label}</div>
              <div style={{ position: 'relative' }}>
                <select
                  value={f.val}
                  onChange={e => f.set(e.target.value as PerformanceLevel)}
                  style={{
                    width: '100%', appearance: 'none',
                    border: `1px solid ${T.border}`, borderRadius: 7,
                    padding: '6px 24px 6px 8px', fontSize: 12,
                    color: T.text1, background: T.surface, cursor: 'pointer',
                  }}
                >
                  {PERF_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.text3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Preview new rating */}
        {changed && (
          <div style={{ marginTop: 8, background: newCs.chip, border: `1px solid ${newCs.border}`, borderRadius: 7, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{
              width: 18, height: 18, borderRadius: 4, background: newCs.text, color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800,
            }}>{CAT_NUM[newCatId]}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: newCs.text }}>{CAT_LABEL[newCatId]}</span>
          </div>
        )}
      </div>

      {/* Salary context */}
      {employee.salary && (
        <div style={{ background: '#F9FAFB', border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: T.text3, marginBottom: 2 }}>Salario mensual</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{fmtCLP(employee.salary)}</div>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!changed}
        style={{
          padding: '9px 0', borderRadius: 9, border: 'none',
          background: changed ? T.primary : '#E5E7EB',
          color: changed ? '#fff' : T.text3,
          fontSize: 13, fontWeight: 700, cursor: changed ? 'pointer' : 'default',
          transition: 'all 140ms',
        }}
      >
        {changed ? 'Guardar y challengear' : 'Sin cambios'}
      </button>
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export function PeersLensTab() {
  const {
    employees, challengedIds,
    peersFilterGrade, peersFilterDepts, peersFilterManager,
    setPeersFilterGrade, setPeersFilterDepts, setPeersFilterManager,
  } = useStore()

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null)
  const [consistencyDismissed, setConsistencyDismissed] = useState<Record<string, boolean>>({})

  const allDepts = useMemo(() => {
    const s = new Set(employees.map(e => e.area).filter(Boolean))
    return Array.from(s).sort()
  }, [employees])

  const allManagers = useMemo(() => {
    const s = new Set(employees.map(e => e.managerName).filter(Boolean) as string[])
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  // All grades from actual data, sorted — must be declared before cohort
  const allGrades = useMemo(() => {
    const s = new Set(employees.map(e => e.grade).filter(Boolean) as string[])
    return Array.from(s).sort()
  }, [employees])

  // Auto-select first grade when current selection is not in data
  const effectiveGrade = allGrades.includes(peersFilterGrade) ? peersFilterGrade : (allGrades[0] ?? '')

  // Grade counts — filtered by selected depts
  const gradeCounts = useMemo(() => {
    const m: Record<string, number> = {}
    employees
      .filter(e => peersFilterDepts.length === 0 || peersFilterDepts.includes(e.area))
      .forEach(e => { if (e.grade) m[e.grade] = (m[e.grade] ?? 0) + 1 })
    return m
  }, [employees, peersFilterDepts])

  // Cohort: same grade, filtered depts & manager
  const cohort = useMemo(() => employees.filter(e => {
    if (e.grade !== effectiveGrade) return false
    if (peersFilterDepts.length > 0 && !peersFilterDepts.includes(e.area)) return false
    if (peersFilterManager !== 'Todos' && e.managerName !== peersFilterManager) return false
    return true
  }), [employees, effectiveGrade, peersFilterDepts, peersFilterManager])

  // Effective category per employee
  const effCat = (e: Employee): CategoryId =>
    categoryFromBox(e.calibratedPerformance ?? e.performance, e.calibratedPotential ?? e.potential)

  // Group by category
  const byCategory = useMemo(() => {
    const m: Record<CategoryId, Employee[]> = { critico: [], desarrollo: [], core: [], alto: [], promesa: [] }
    cohort.forEach(e => m[effCat(e)].push(e))
    return m
  }, [cohort])

  // Outlier detection: median category, outlier = ≥2 levels away
  const medianCatNum = useMemo(() => {
    if (!cohort.length) return 3
    const nums = cohort.map(e => CAT_NUM[effCat(e)]).sort((a, b) => a - b)
    return nums[Math.floor(nums.length / 2)]
  }, [cohort])

  const isOutlier = (e: Employee) => Math.abs(CAT_NUM[effCat(e)] - medianCatNum) >= 2

  const outlierCount = cohort.filter(isOutlier).length
  const dismissed = consistencyDismissed[effectiveGrade]

  if (employees.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text3 }}>
        <div style={{ textAlign: 'center' }}>
          <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div style={{ fontSize: 14 }}>Sin datos. Cargá personas en la pestaña Datos.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px 20px', gap: 14, overflow: 'hidden' }}>

      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primaryBg} 0%, #fff 60%)`,
        border: `1px solid ${T.primaryMid}`, borderRadius: 12, padding: '14px 18px',
        display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0,
      }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Eye size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 3 }}>Una forma de asegurarte de que los resultados te hagan sentido</div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
            El ojo humano agudiza cuando <strong style={{ color: T.text1 }}>compara entre pares</strong>. Aquí ves de golpe a todas las personas del mismo grado de seniority y responsabilidad. La invitación es a que tengas bien definido qué se espera de cada grado en tu organización — de eso se trata la calibración.
          </div>
        </div>
      </div>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '10px 16px', flexWrap: 'wrap',
      }}>
        {/* Title */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text1 }}>Peers Lens</div>
          <div style={{ fontSize: 10, color: T.text3 }}>Consistencia dentro de la misma cohorte de grado</div>
        </div>

        <div style={{ width: 1, height: 28, background: T.border, flexShrink: 0 }} />

        {/* Grade pills — derived from actual employee data */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {allGrades.length === 0 ? (
            <span style={{ fontSize: 12, color: T.text3, fontStyle: 'italic' }}>
              Sin grados cargados — agrega la columna Grado en el CSV
            </span>
          ) : allGrades.map(g => {
            const count = gradeCounts[g] ?? 0
            const active = effectiveGrade === g
            return (
              <button key={g} onClick={() => setPeersFilterGrade(g)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 20, border: `1px solid ${active ? T.primary : T.border}`,
                background: active ? T.primaryBg : 'transparent',
                color: active ? T.primary : T.text3,
                fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer',
              }}>
                {g}
                {count > 0 && (
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        <div style={{ width: 1, height: 28, background: T.border, flexShrink: 0 }} />

        {/* Dept multi-select */}
        <DeptSelector allDepts={allDepts} selected={peersFilterDepts} onChange={setPeersFilterDepts} />

        {/* Manager filter */}
        <ManagerSearch value={peersFilterManager} options={allManagers.filter(m => m !== 'Todos')} onChange={setPeersFilterManager} />

        {/* Cohort size */}
        <div style={{ fontSize: 11, color: T.text3, marginLeft: 'auto' }}>
          <span style={{ fontWeight: 700, color: T.text1 }}>{cohort.length}</span> personas en {effectiveGrade}
        </div>
      </div>

      {/* ── Consistency banner ── */}
      {outlierCount > 0 && !dismissed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          background: T.warningBg, border: `1px solid #FCD34D`,
          borderRadius: 10, padding: '10px 16px',
        }}>
          <AlertTriangle size={16} color={T.warning} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
              {outlierCount} persona{outlierCount !== 1 ? 's' : ''} parecen inconsistentes en {effectiveGrade}
            </span>
            <span style={{ fontSize: 12, color: '#92400E', opacity: 0.8, marginLeft: 6 }}>
              — su rating difiere 2+ niveles del resto del grupo. Hacé click sobre las tarjetas marcadas para revisar.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setConsistencyDismissed(d => ({ ...d, [effectiveGrade]: true }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 7, border: `1px solid #FCD34D`,
                background: '#FEF3C7', color: '#92400E',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={13} />
              Sí, es consistente
            </button>
          </div>
        </div>
      )}

      {/* ── Main content: 5-column kanban + optional panel ── */}
      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>

        {/* Kanban: 5 rating columns */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, minWidth: 0, overflow: 'auto' }}>
          {CATS.map(catId => {
            const cs    = CAT_STYLE[catId]
            const cards = byCategory[catId]
            const pct   = cohort.length ? Math.round(cards.length / cohort.length * 100) : 0

            return (
              <div key={catId} style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                background: cs.bg, border: `1.5px solid ${cs.border}`,
                borderRadius: 12, padding: '10px 10px 12px', minHeight: 200,
              }}>
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 5, background: cs.text, color: '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800,
                      }}>{CAT_NUM[catId]}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: cs.text }}>{cards.length}</span>
                      <span style={{ fontSize: 11, color: cs.text, opacity: 0.65 }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: cs.text, lineHeight: 1.3, minHeight: 28, display: 'flex', alignItems: 'flex-end' }}>
                      {CAT_LABEL[catId]}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: cs.border, marginBottom: 2 }} />

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto' }}>
                  {cards.length === 0 ? (
                    <div style={{ fontSize: 11, color: cs.text, opacity: 0.35, textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
                      Nadie en esta categoría
                    </div>
                  ) : (
                    cards.map(emp => (
                      <PersonCard
                        key={emp.id}
                        employee={emp}
                        isOutlier={isOutlier(emp)}
                        isChallenged={challengedIds.includes(emp.id)}
                        onSelect={setSelectedEmp}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Re-evaluation panel */}
        {selectedEmp && (
          <RevalPanel
            employee={selectedEmp}
            cohort={cohort}
            onClose={() => setSelectedEmp(null)}
          />
        )}
      </div>
    </div>
  )
}
