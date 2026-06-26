import { useState, useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { categoryFromBox } from '../../types'
import type { PerformanceLevel, PotentialLevel, CategoryId, Employee } from '../../types'
import { GripVertical, ChevronDown, ChevronUp, Grid3x3 } from 'lucide-react'
import { ManagerSearch } from '../ManagerSearch'

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  primary:   '#7C3AED',
  primaryBg: '#F5F3FF',
  primaryMid:'#DDD6FE',
  surface:   '#FFFFFF',
  bg:        '#F8F7FF',
  border:    '#E5E7EB',
  text1:     '#111827',
  text2:     '#374151',
  text3:     '#6B7280',
}

// Softer palette: very light backgrounds, subtle tinted borders
const CAT_STYLE: Record<CategoryId, { bg: string; accent: string; text: string; border: string; chip: string; chipText: string }> = {
  critico:    { bg: '#FFF5F5', accent: '#FCA5A5', text: '#B91C1C', border: '#FED7D7', chip: '#FEE2E2', chipText: '#B91C1C' },
  desarrollo: { bg: '#FFFDF0', accent: '#FDE68A', text: '#92400E', border: '#FEF08A', chip: '#FEF9C3', chipText: '#92400E' },
  core:       { bg: '#F0FDF8', accent: '#6EE7B7', text: '#065F46', border: '#BBF7D0', chip: '#D1FAE5', chipText: '#065F46' },
  alto:       { bg: '#F0F7FF', accent: '#93C5FD', text: '#1D4ED8', border: '#BFDBFE', chip: '#DBEAFE', chipText: '#1D4ED8' },
  promesa:    { bg: '#F8F5FF', accent: '#C4B5FD', text: '#5B21B6', border: '#DDD6FE', chip: '#EDE9FE', chipText: '#5B21B6' },
}

const CAT_NUM: Record<CategoryId, number> = {
  critico: 1, desarrollo: 2, core: 3, alto: 4, promesa: 5,
}

// X axis = Rendimiento: left=bajo → right=alto
// Y axis = Potencial:   top=alto → bottom=bajo (visual)
const PERF_COLS: PerformanceLevel[] = ['bajo', 'medio', 'alto']
const POT_ROWS:  PotentialLevel[]   = ['alto', 'medio', 'bajo']

const PERF_LABEL: Record<PerformanceLevel, string> = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }
const POT_LABEL:  Record<PotentialLevel,   string> = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }

const CELL_CODE: Record<string, string> = {
  'bajo-alto': 'A1', 'medio-alto': 'B1', 'alto-alto': 'C1',
  'bajo-medio':'A2', 'medio-medio':'B2', 'alto-medio':'C2',
  'bajo-bajo': 'A3', 'medio-bajo': 'B3', 'alto-bajo': 'C3',
}

// Descriptive subtitle for each cell
const CELL_DESC: Record<string, string> = {
  'bajo-alto':   'alto potencial, bajo rendimiento',
  'medio-alto':  'alto potencial, rendimiento medio',
  'alto-alto':   'alto potencial, alto rendimiento',
  'bajo-medio':  'potencial medio, bajo rendimiento',
  'medio-medio': 'potencial medio, rendimiento medio',
  'alto-medio':  'potencial medio, alto rendimiento',
  'bajo-bajo':   'bajo potencial, bajo rendimiento',
  'medio-bajo':  'bajo potencial, rendimiento medio',
  'alto-bajo':   'bajo potencial, alto rendimiento',
}

const MAX_VISIBLE = 6

// ── Employee chip ─────────────────────────────────────────────────────────────
function EmployeeChip({
  employee,
  onDragStart,
  catId,
}: {
  employee: Employee
  onDragStart: (id: string) => void
  catId: CategoryId
}) {
  const [hovered, setHovered] = useState(false)
  const [tooltipUp, setTooltipUp] = useState(true)
  const cs = CAT_STYLE[catId]

  return (
    <div
      draggable
      onDragStart={() => onDragStart(employee.id)}
      onMouseEnter={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setTooltipUp(rect.top > 160)
        setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: cs.chip, border: `1px solid ${cs.border}`,
        borderRadius: 6, padding: '4px 8px',
        fontSize: 11, fontWeight: 600, color: cs.chipText,
        cursor: 'grab', userSelect: 'none',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        maxWidth: '100%',
        transition: 'opacity 120ms',
      }}>
        <GripVertical size={10} style={{ opacity: 0.4, flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {employee.name || 'Sin nombre'}
        </span>
        {employee.grade && (
          <span style={{ opacity: 0.55, fontSize: 10, flexShrink: 0 }}>{employee.grade}</span>
        )}
      </div>

      {hovered && (
        <div style={{
          position: 'absolute',
          ...(tooltipUp ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
          left: 0, zIndex: 200,
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: '8px 10px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          minWidth: 170, pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text1, marginBottom: 4 }}>
            {employee.name}
          </div>
          <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.6 }}>
            {employee.role && <div>{employee.role}</div>}
            {employee.area && <div>{employee.area}</div>}
            {employee.grade && <div>Grado: {employee.grade}</div>}
          </div>
          <div style={{
            marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 18, height: 18, borderRadius: 4,
              background: cs.chip, color: cs.text, fontSize: 10, fontWeight: 700,
              border: `1px solid ${cs.border}`,
            }}>{CAT_NUM[catId]}</span>
            <span style={{ fontSize: 10, color: cs.text, fontWeight: 600 }}>
              {catId.charAt(0).toUpperCase() + catId.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 9-box cell ────────────────────────────────────────────────────────────────
function NineBoxCell({
  performance, potential, employees, categoryNames,
  onDragStart, onDrop, onDragOver, isDragOver,
}: {
  performance: PerformanceLevel
  potential: PotentialLevel
  employees: Employee[]
  categoryNames: Record<CategoryId, string>
  onDragStart: (id: string) => void
  onDrop: (p: PerformanceLevel, pot: PotentialLevel) => void
  onDragOver: (e: React.DragEvent) => void
  isDragOver: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const catId = categoryFromBox(performance, potential)
  const cs    = CAT_STYLE[catId]
  const code  = CELL_CODE[`${performance}-${potential}`]
  const desc  = CELL_DESC[`${performance}-${potential}`]
  const num   = CAT_NUM[catId]

  const visible  = expanded ? employees : employees.slice(0, MAX_VISIBLE)
  const hiddenN  = employees.length - MAX_VISIBLE

  return (
    <div
      onDrop={() => onDrop(performance, potential)}
      onDragOver={onDragOver}
      style={{
        background: isDragOver ? cs.accent + '33' : cs.bg,
        border: `1.5px solid ${isDragOver ? cs.accent : cs.border}`,
        borderRadius: 12,
        padding: '10px 10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        transition: 'all 140ms',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 1 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: cs.text, lineHeight: 1.3 }}>
            {categoryNames[catId]}
          </div>
          <div style={{ fontSize: 9, color: cs.text, opacity: 0.55, marginTop: 2, lineHeight: 1.3 }}>
            {desc}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0, marginLeft: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: 5,
            background: cs.text, color: '#fff',
            fontSize: 10, fontWeight: 800,
          }}>{num}</span>
          <span style={{ fontSize: 9, color: cs.text, opacity: 0.45, fontWeight: 700 }}>{code}</span>
        </div>
      </div>

      {/* Thin divider */}
      <div style={{ height: 1, background: cs.accent, opacity: 0.5, marginBottom: 2 }} />

      {/* Employee list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {employees.length === 0 ? (
          <div style={{ fontSize: 10, color: cs.text, opacity: 0.3, fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
            Arrastrá personas aquí
          </div>
        ) : (
          <>
            {visible.map((e) => (
              <EmployeeChip key={e.id} employee={e} onDragStart={onDragStart}
                catId={categoryFromBox(e.calibratedPerformance ?? e.performance, e.calibratedPotential ?? e.potential)} />
            ))}

            {/* Expand / collapse */}
            {hiddenN > 0 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  fontSize: 10, fontWeight: 700, color: cs.text,
                  background: cs.chip, border: `1px solid ${cs.border}`,
                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                <ChevronDown size={11} />
                ver {hiddenN} más
              </button>
            )}
            {expanded && employees.length > MAX_VISIBLE && (
              <button
                onClick={() => setExpanded(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  fontSize: 10, fontWeight: 700, color: cs.text,
                  background: cs.chip, border: `1px solid ${cs.border}`,
                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                <ChevronUp size={11} />
                ver menos
              </button>
            )}
          </>
        )}
      </div>

      {/* Count badge top-right */}
      {employees.length > 0 && (
        <div style={{
          position: 'absolute', top: 9, right: 34,
          fontSize: 10, color: cs.text, fontWeight: 700, opacity: 0.5,
        }}>
          {employees.length}
        </div>
      )}
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export function NineBoxTab() {
  const {
    employees, updateCalibration, categoryNames,
    nineBoxFilterDept, nineBoxFilterGrade, nineBoxFilterRole, nineBoxFilterManager, setNineBoxFilter,
  } = useStore()
  const [draggingId,   setDraggingId]   = useState<string | null>(null)
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)

  const filterDept    = nineBoxFilterDept
  const filterGrade   = nineBoxFilterGrade
  const filterRole    = nineBoxFilterRole
  const filterManager = nineBoxFilterManager
  const setFilterDept    = (v: string) => setNineBoxFilter('dept',    v)
  const setFilterGrade   = (v: string) => setNineBoxFilter('grade',   v)
  const setFilterRole    = (v: string) => setNineBoxFilter('role',    v)
  const setFilterManager = (v: string) => setNineBoxFilter('manager', v)

  const depts = useMemo(() => {
    const s = new Set(employees.map(e => e.area).filter(Boolean))
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  const grades = useMemo(() => {
    const s = new Set(employees.map(e => e.grade).filter(Boolean) as string[])
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  const roles = useMemo(() => {
    const s = new Set(employees.map(e => e.role).filter(Boolean))
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  const managers = useMemo(() => {
    const s = new Set(employees.map(e => e.managerName).filter(Boolean) as string[])
    return ['Todos', ...Array.from(s).sort()]
  }, [employees])

  const filtered = useMemo(() =>
    employees.filter(e => {
      if (filterDept    !== 'Todos' && e.area        !== filterDept)    return false
      if (filterGrade   !== 'Todos' && e.grade       !== filterGrade)   return false
      if (filterRole    !== 'Todos' && e.role        !== filterRole)    return false
      if (filterManager !== 'Todos' && e.managerName !== filterManager) return false
      return true
    }),
    [employees, filterDept, filterGrade, filterRole, filterManager])

  const handleDrop = (performance: PerformanceLevel, potential: PotentialLevel) => {
    if (draggingId) {
      updateCalibration(draggingId, performance, potential)
      setDraggingId(null)
      setDragOverCell(null)
    }
  }

  // Use effective (calibrated) values for placement
  const effPerf = (e: typeof employees[0]) => e.calibratedPerformance ?? e.performance
  const effPot  = (e: typeof employees[0]) => e.calibratedPotential   ?? e.potential

  const cellEmps = (perf: PerformanceLevel, pot: PotentialLevel) =>
    filtered.filter(e => effPerf(e) === perf && effPot(e) === pot)

  const catCounts = useMemo(() => {
    const c: Record<CategoryId, number> = { critico: 0, desarrollo: 0, core: 0, alto: 0, promesa: 0 }
    filtered.forEach(e => c[categoryFromBox(effPerf(e), effPot(e))]++)
    return c
  }, [filtered])

  const total = filtered.length

  if (employees.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: T.text3 }}>
        <GripVertical size={32} style={{ opacity: 0.3 }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>El 9-box está vacío</div>
        <div style={{ fontSize: 13 }}>Cargá personas en la pestaña Datos para comenzar</div>
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
          <Grid3x3 size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 3 }}>El 9-Box refleja tu propia visión del equipo</div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
            Los ejes de <strong style={{ color: T.text1 }}>Potencial</strong> y <strong style={{ color: T.text1 }}>Rendimiento</strong> significan lo que tu empresa defina. Algunas organizaciones vinculan Potencial a valores y cultura, y Rendimiento a OKRs o KPIs. Otras lo definen distinto. <strong style={{ color: T.text1 }}>La definición es tuya</strong> — lo importante es que el equipo la comparta y la aplique de forma consistente.
          </div>
        </div>
      </div>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '10px 16px', flexWrap: 'wrap',
      }}>
        {/* Filters — left */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {([
            { label: 'Departamento', value: filterDept,   set: setFilterDept,   opts: depts  },
            { label: 'Grado',        value: filterGrade,  set: setFilterGrade,  opts: grades },
            { label: 'Rol',          value: filterRole,   set: setFilterRole,   opts: roles  },
          ] as const).map(f => (
            <div key={f.label} style={{ position: 'relative' }}>
              <select
                value={f.value}
                onChange={e => f.set(e.target.value)}
                style={{
                  appearance: 'none', border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: '5px 26px 5px 10px',
                  fontSize: 12, color: f.value !== 'Todos' ? T.primary : T.text2,
                  fontWeight: f.value !== 'Todos' ? 700 : 500,
                  background: f.value !== 'Todos' ? T.primaryBg : T.surface,
                  cursor: 'pointer',
                }}
              >
                <option value="Todos">{f.label}</option>
                {f.opts.filter(o => o !== 'Todos').map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.text3 }} />
            </div>
          ))}
          <ManagerSearch value={filterManager} options={managers.filter(m => m !== 'Todos')} onChange={setFilterManager} />
          <div style={{ fontSize: 11, color: T.text3 }}>
            {total} persona{total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Distribution pills — right */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
          {(Object.entries(catCounts) as [CategoryId, number][]).map(([id, count]) => {
            const cs  = CAT_STYLE[id]
            const pct = total ? Math.round(count / total * 100) : 0
            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: cs.chip, border: `1px solid ${cs.border}`,
                borderRadius: 20, padding: '3px 10px 3px 6px',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 16, height: 16, borderRadius: 4,
                  background: cs.text, color: '#fff', fontSize: 9, fontWeight: 800,
                }}>{CAT_NUM[id]}</span>
                <span style={{ fontSize: 11, color: cs.text, fontWeight: 700 }}>{count}</span>
                <span style={{ fontSize: 10, color: cs.text, opacity: 0.65 }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Grid area ── */}
      <div style={{ flex: 1, display: 'flex', gap: 10, minHeight: 0, overflow: 'hidden' }}>

        {/* Y-axis label + row labels */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {/* "Potencial" rotated */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontSize: 10, fontWeight: 700, color: T.text3,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            paddingBottom: 40,
          }}>
            Potencial
          </div>
          {/* Row level labels */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingBottom: 40 }}>
            {POT_ROWS.map(pot => (
              <div key={pot} style={{
                fontSize: 10, fontWeight: 700, color: T.text3,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                display: 'flex', alignItems: 'center',
              }}>
                {POT_LABEL[pot]}
              </div>
            ))}
          </div>
        </div>

        {/* Grid + X axis */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>

          {/* 3×3 scrollable grid */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', paddingRight: 4 }}>
            {POT_ROWS.map(pot => (
              <div key={pot} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {PERF_COLS.map(perf => {
                  const key = `${perf}-${pot}`
                  return (
                    <NineBoxCell
                      key={key}
                      performance={perf}
                      potential={pot}
                      employees={cellEmps(perf, pot)}
                      categoryNames={categoryNames}
                      onDragStart={setDraggingId}
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragOverCell(key) }}
                      isDragOver={dragOverCell === key}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* X axis column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, flexShrink: 0 }}>
            {PERF_COLS.map(perf => (
              <div key={perf} style={{
                textAlign: 'center', fontSize: 10, fontWeight: 700,
                color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0',
              }}>
                {PERF_LABEL[perf]}
              </div>
            ))}
          </div>

          {/* X axis label */}
          <div style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
          }}>
            Rendimiento
          </div>
        </div>
      </div>
    </div>
  )
}
