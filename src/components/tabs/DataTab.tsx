import { Plus, Trash2, ChevronDown, Download, Upload, SlidersHorizontal, Scale, CheckCircle2, Circle } from 'lucide-react'
import { useRef, useState, useMemo } from 'react'
import Papa from 'papaparse'
import { useStore } from '../../store/useStore'
import { categoryFromBox } from '../../types'
import type { Objective, PerformanceLevel, PotentialLevel, CategoryId } from '../../types'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#F5F3FF',
  surface:    '#FFFFFF',
  border:     '#E5E7EB',
  borderFocus:'#7C3AED',
  primary:    '#7C3AED',
  primaryBg:  '#EDE9FE',
  primaryMid: '#DDD6FE',
  text1:      '#1E1B4B',
  text2:      '#4B5563',
  text3:      '#9CA3AF',
  success:    '#059669',
  successBg:  '#D1FAE5',
  warning:    '#D97706',
  warningBg:  '#FEF3C7',
  danger:     '#DC2626',
  dangerBg:   '#FEE2E2',
}

const card: React.CSSProperties = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  overflow: 'hidden',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function objectiveCompletion(obj: Objective): number {
  if (!obj.keyResults.length) return 0
  return obj.keyResults.reduce((a, kr) => a + kr.completion, 0) / obj.keyResults.length
}

function pctColor(p: number) {
  return p >= 70 ? T.success : p >= 50 ? T.warning : T.danger
}
function pctBg(p: number) {
  return p >= 70 ? T.successBg : p >= 50 ? T.warningBg : T.dangerBg
}

function boxLabel(performance: PerformanceLevel, potential: PotentialLevel): string {
  const col = performance === 'bajo' ? 'A' : performance === 'medio' ? 'B' : 'C'
  const row = potential === 'alto' ? '1' : potential === 'medio' ? '2' : '3'
  return `${col}${row}`
}

const CAT_STYLE: Record<CategoryId, { bg: string; color: string }> = {
  critico:    { bg: '#FEE2E2', color: '#B91C1C' },
  desarrollo: { bg: '#DBEAFE', color: '#1D4ED8' },
  core:       { bg: '#F3F4F6', color: '#374151' },
  alto:       { bg: '#D1FAE5', color: '#065F46' },
  promesa:    { bg: '#EDE9FE', color: '#5B21B6' },
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, right }: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div style={{
      padding: '14px 18px',
      borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: T.primaryBg, color: T.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}

// ── OKR Card ──────────────────────────────────────────────────────────────────

function OKRCard({ which, title, icon }: {
  which: 'company' | 'dept'
  title: string
  icon: React.ReactNode
}) {
  const {
    companyOKRs, deptOKRs, activeDept, toggleWeights,
    addObjective, removeObjective, updateObjective, updateObjectiveWeight,
    addKeyResult, removeKeyResult, updateKeyResult,
  } = useStore()
  const okrs = which === 'company' ? companyOKRs : (deptOKRs[activeDept] ?? { enableWeights: false, objectives: [] })
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }))

  const totalWeight = okrs.objectives.reduce((a, o) => a + (o.weight ?? 0), 0)
  const weightError = okrs.enableWeights && Math.abs(totalWeight - 100) > 1

  const sectionPct = () => {
    if (!okrs.objectives.length) return 0
    if (okrs.enableWeights)
      return okrs.objectives.reduce((a, o) => a + objectiveCompletion(o) * ((o.weight ?? 0) / 100), 0)
    return okrs.objectives.reduce((a, o) => a + objectiveCompletion(o), 0) / okrs.objectives.length
  }
  const pct = Math.round(sectionPct())

  return (
    <div style={card}>
      <SectionHeader
        icon={icon}
        title={title}
        subtitle={`${okrs.objectives.length} objetivos`}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => toggleWeights(which)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
                border: `1px solid ${okrs.enableWeights ? T.primary : T.border}`,
                background: okrs.enableWeights ? T.primaryBg : 'transparent',
                color: okrs.enableWeights ? T.primary : T.text3,
                cursor: 'pointer', transition: 'all 150ms ease',
              }}
            >
              <Scale size={11} /> Weights
            </button>
            <span style={{
              fontSize: 13, fontWeight: 700,
              background: pctBg(pct), color: pctColor(pct),
              padding: '4px 10px', borderRadius: 6,
            }}>
              {pct}%
            </span>
          </div>
        }
      />

      {weightError && (
        <div style={{ padding: '6px 18px', background: T.warningBg, fontSize: 12, color: T.warning, borderBottom: `1px solid #FDE68A` }}>
          ⚠ Los pesos suman {totalWeight}% — deben sumar 100%
        </div>
      )}

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {okrs.objectives.length === 0 && (
          <div style={{ padding: '20px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: T.text3, marginBottom: 12 }}>
              Todavía no hay OKRs cargados para la empresa
            </div>
            <button onClick={() => addObjective(which)} style={{
              fontSize: 13, fontWeight: 500, color: T.primary, background: T.primaryBg,
              border: `1px solid ${T.primaryMid}`, borderRadius: 7, padding: '6px 16px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Plus size={13} /> Agregar primer objetivo
            </button>
          </div>
        )}
        {okrs.objectives.map((obj, oi) => {
          const objPct = Math.round(objectiveCompletion(obj))
          const isOpen = !!open[obj.id]
          return (
            <div key={obj.id} style={{ borderRadius: 8, border: `1px solid ${isOpen ? T.primaryMid : T.border}`, overflow: 'hidden', transition: 'border-color 150ms' }}>
              {/* Objective row */}
              <div
                onClick={() => toggle(obj.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                  background: isOpen ? '#FAFAFF' : T.surface,
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: isOpen ? T.primary : T.primaryBg,
                  color: isOpen ? '#fff' : T.primary,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 150ms',
                }}>
                  O{oi + 1}
                </span>
                <input
                  value={obj.text}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateObjective(which, obj.id, e.target.value)}
                  placeholder={`Objetivo ${oi + 1}...`}
                  style={{
                    flex: 1, fontSize: 13, fontWeight: 500, border: 'none',
                    background: 'transparent', padding: 0, color: T.text1,
                    outline: 'none', cursor: 'text',
                  }}
                />
                {okrs.enableWeights && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number" min={0} max={100} step={1} value={obj.weight ?? 0}
                      onChange={(e) => updateObjectiveWeight(which, obj.id, Number(e.target.value))}
                      style={{ width: 44, textAlign: 'center', fontSize: 12, fontWeight: 600, color: T.primary, border: `1px solid ${T.primaryMid}`, borderRadius: 4, padding: '2px 0' }}
                    />
                    <span style={{ fontSize: 11, color: T.text3 }}>%</span>
                  </div>
                )}
                <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(objPct), minWidth: 34, textAlign: 'right' }}>{objPct}%</span>
                {okrs.objectives.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeObjective(which, obj.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.text3, display: 'flex', borderRadius: 4 }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <span style={{ color: T.text3, display: 'flex', transition: 'transform 150ms', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  <ChevronDown size={14} />
                </span>
              </div>

              {/* Key Results */}
              {isOpen && (
                <div style={{
                  padding: '8px 12px 10px 42px',
                  background: '#FAFAFF',
                  borderTop: `1px solid ${T.primaryMid}`,
                  display: 'flex', flexDirection: 'column', gap: 5,
                }}>
                  {obj.keyResults.map((kr, ki) => (
                    <div key={kr.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: T.primary,
                        background: T.primaryBg, borderRadius: 4, padding: '1px 5px', flexShrink: 0,
                      }}>KR{ki + 1}</span>
                      <input
                        value={kr.text}
                        onChange={(e) => updateKeyResult(which, obj.id, kr.id, { text: e.target.value })}
                        placeholder={`Key Result ${ki + 1}...`}
                        style={{ flex: 1, fontSize: 12, color: T.text1, border: `1px solid ${T.border}`, borderRadius: 4, padding: '4px 8px', background: T.surface }}
                      />
                      <input
                        type="number" min={0} max={100} step={1}
                        value={kr.completion}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateKeyResult(which, obj.id, kr.id, { completion: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        style={{
                          width: 56, textAlign: 'center', fontSize: 12, fontWeight: 700,
                          color: pctColor(kr.completion),
                          border: `1px solid ${T.border}`, borderRadius: 4, padding: '4px 0',
                          background: pctBg(kr.completion),
                        }}
                      />
                      <span style={{ fontSize: 11, color: T.text3 }}>%</span>
                      {obj.keyResults.length > 1 && (
                        <button
                          onClick={() => removeKeyResult(which, obj.id, kr.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.text3, display: 'flex' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addKeyResult(which, obj.id)}
                    style={{
                      alignSelf: 'flex-start', marginTop: 3,
                      fontSize: 11, fontWeight: 500, color: T.primary,
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                    }}
                  >
                    <Plus size={11} /> Agregar KR
                  </button>
                </div>
              )}
            </div>
          )
        })}
        <button
          onClick={() => addObjective(which)}
          style={{
            alignSelf: 'flex-start', marginTop: 2,
            fontSize: 12, fontWeight: 500, color: T.primary,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0',
          }}
        >
          <Plus size={12} /> Agregar objetivo
        </button>
      </div>
    </div>
  )
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

const VALID_LEVELS = ['alto', 'medio', 'bajo']

function exportTemplate() {
  const rows = [
    ['Nombre', 'Correo', 'Área', 'Rol', 'Manager', 'Correo Manager', 'Rendimiento', 'Potencial', 'Grado', 'País', 'Género', 'Salario', 'Fecha ingreso', 'Rendimiento anterior', 'Potencial anterior'],
    ['María García', 'maria.garcia@empresa.com', 'Engineering', 'Senior Engineer', 'Juan Pérez', 'juan.perez@empresa.com', 'alto', 'alto', 'L4', 'Argentina', 'F', '80000', '2022-03-15', '', ''],
  ]
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'calibracion_template.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ── Optional columns ──────────────────────────────────────────────────────────

type OptCol = 'grade' | 'country' | 'gender' | 'salary' | 'hireDate' | 'prevCycle'
const OPT_LABELS: Record<OptCol, string> = {
  grade: 'Grado', country: 'País', gender: 'Género',
  salary: 'Salario', hireDate: 'Fecha ingreso', prevCycle: 'Ciclo anterior',
}

// ── Employee Table ────────────────────────────────────────────────────────────

function EmployeeTable() {
  const { employees, addEmployee, removeEmployee, updateEmployee, hasPrevCycle, setHasPrevCycle, categoryNames } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [activeCols, setActiveCols] = useState<Set<OptCol>>(new Set())
  const [showCols, setShowCols] = useState(false)

  const toggleCol = (col: OptCol) => {
    if (col === 'prevCycle') { setHasPrevCycle(!hasPrevCycle); return }
    setActiveCols((p) => { const n = new Set(p); n.has(col) ? n.delete(col) : n.add(col); return n })
  }

  const handleImport = (file: File) => {
    setImportError(null)
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const errors: string[] = []
        rows.forEach((row, i) => {
          const nombre  = (row['Nombre'] ?? '').trim()
          const correo  = (row['Correo'] ?? '').trim()
          const manager = (row['Manager'] ?? '').trim()
          const correoMgr = (row['Correo Manager'] ?? '').trim()
          if (!nombre)    { errors.push(`Fila ${i + 2}: columna "Nombre" vacía`); return }
          if (!correo)    { errors.push(`Fila ${i + 2}: columna "Correo" vacía`); return }
          if (!manager)   { errors.push(`Fila ${i + 2}: columna "Manager" vacía — asegúrate de que la columna se llama exactamente "Manager" y tiene un valor (ej: "Juan Pérez")`); return }
          if (!correoMgr) { errors.push(`Fila ${i + 2}: columna "Correo Manager" vacía — debe tener el email del líder (ej: "juan.perez@empresa.com")`); return }
          const perf = (row['Rendimiento'] ?? '').toLowerCase().trim()
          const pot  = (row['Potencial'] ?? '').toLowerCase().trim()
          if (!VALID_LEVELS.includes(perf)) { errors.push(`Fila ${i + 2}: "Rendimiento" tiene valor "${row['Rendimiento'] ?? ''}" — debe ser "alto", "medio" o "bajo"`); return }
          if (!VALID_LEVELS.includes(pot))  { errors.push(`Fila ${i + 2}: "Potencial" tiene valor "${row['Potencial'] ?? ''}" — debe ser "alto", "medio" o "bajo"`); return }
          const prevPerf = (row['Rendimiento anterior'] ?? '').toLowerCase().trim()
          const prevPot  = (row['Potencial anterior'] ?? '').toLowerCase().trim()
          useStore.getState().addEmployee()
          const emps = useStore.getState().employees
          useStore.getState().updateEmployee(emps[emps.length - 1].id, {
            name: nombre, email: correo,
            area: row['Área'] ?? row['Area'] ?? '',
            role: row['Rol'] ?? '',
            managerName: manager, managerEmail: correoMgr,
            performance: perf as PerformanceLevel, potential: pot as PotentialLevel,
            grade: row['Grado'] || undefined, country: row['País'] || undefined,
            gender: row['Género'] || undefined, salary: row['Salario'] ? Number(row['Salario']) : undefined,
            hireDate: row['Fecha ingreso'] || undefined,
            prevPerformance: VALID_LEVELS.includes(prevPerf) ? prevPerf as PerformanceLevel : undefined,
            prevPotential:   VALID_LEVELS.includes(prevPot)  ? prevPot  as PotentialLevel   : undefined,
          })
        })
        if (errors.length) setImportError(errors.slice(0, 3).join('\n'))
      },
      error: () => setImportError('No se pudo leer el archivo CSV.'),
    })
  }

  const PERF_OPTS = [{ value: 'alto', label: 'Alto' }, { value: 'medio', label: 'Medio' }, { value: 'bajo', label: 'Bajo' }]
  const showGrade = activeCols.has('grade'), showCountry = activeCols.has('country')
  const showGender = activeCols.has('gender'), showSalary = activeCols.has('salary')
  const showHireDate = activeCols.has('hireDate')

  const ghostBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
    padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
    border: `1px solid ${T.border}`, background: 'transparent', color: T.text2,
    transition: 'all 150ms',
  }

  return (
    <div style={card}>
      <SectionHeader
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        title="Resultados de performance"
        subtitle={`${employees.length} personas`}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={ghostBtn} onClick={exportTemplate}><Download size={13} /> Template</button>
            <button style={ghostBtn} onClick={() => fileRef.current?.click()}><Upload size={13} /> Importar</button>
            <div style={{ position: 'relative' }}>
              <button
                style={{ ...ghostBtn, borderColor: showCols ? T.primary : T.border, color: showCols ? T.primary : T.text2, background: showCols ? T.primaryBg : 'transparent' }}
                onClick={() => setShowCols((p) => !p)}
              >
                <SlidersHorizontal size={13} /> Columnas
              </button>
              {showCols && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
                  background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: '10px 14px', minWidth: 190, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Columnas opcionales
                  </div>
                  {(Object.entries(OPT_LABELS) as [OptCol, string][]).map(([col, label]) => {
                    const checked = col === 'prevCycle' ? hasPrevCycle : activeCols.has(col)
                    return (
                      <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text1, cursor: 'pointer' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCol(col)}
                          style={{ accentColor: T.primary, width: 14, height: 14 }} />
                        {label}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = '' }} />
          </div>
        }
      />

      {importError && (
        <div style={{ padding: '10px 18px', background: T.dangerBg, fontSize: 12, color: T.danger, borderBottom: `1px solid #FCA5A5`, lineHeight: 1.7 }}>
          {importError.split('\n').map((line, i) => (
            <div key={i}>⚠ {line}</div>
          ))}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              {['Nombre', 'Líder', 'Área', 'Rol',
                ...(showGrade    ? ['Grado']         : []),
                ...(showCountry  ? ['País']           : []),
                ...(showGender   ? ['Género']         : []),
                ...(showSalary   ? ['Salario']        : []),
                ...(showHireDate ? ['Fecha ingreso']  : []),
                'Rendimiento', 'Potencial', '9-Box',
                ...(hasPrevCycle ? ['Rend. ant.', 'Pot. ant.'] : []),
                '',
              ].map((h) => (
                <th key={h} style={{
                  padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700,
                  color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr><td colSpan={20} style={{ padding: '40px 16px', textAlign: 'center', color: T.text3, fontSize: 13 }}>
                Agregá tu primera persona o importá un CSV para comenzar
              </td></tr>
            )}
            {employees.map((emp, i) => {
              const catId = categoryFromBox(emp.performance, emp.potential)
              const box   = boxLabel(emp.performance, emp.potential)
              const cs    = CAT_STYLE[catId]
              return (
                <tr key={emp.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : '#FAFAFA' }}>
                  <td style={{ padding: '6px 12px' }}>
                    <input value={emp.name} onChange={(e) => updateEmployee(emp.id, { name: e.target.value })} placeholder="Nombre" style={{ minWidth: 140, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', color: T.text1 }} />
                  </td>
                  <td style={{ padding: '6px 12px', color: T.text2, fontSize: 12 }}>
                    {emp.managerName || '—'}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <input value={emp.area} onChange={(e) => updateEmployee(emp.id, { area: e.target.value })} placeholder="Área" style={{ minWidth: 90, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', color: T.text1 }} />
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <input value={emp.role} onChange={(e) => updateEmployee(emp.id, { role: e.target.value })} placeholder="Cargo" style={{ minWidth: 110, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', color: T.text1 }} />
                  </td>
                  {showGrade && <td style={{ padding: '6px 12px' }}><input value={emp.grade ?? ''} onChange={(e) => updateEmployee(emp.id, { grade: e.target.value || undefined })} placeholder="L3" style={{ width: 50, fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }} /></td>}
                  {showCountry && <td style={{ padding: '6px 12px' }}><input value={emp.country ?? ''} onChange={(e) => updateEmployee(emp.id, { country: e.target.value || undefined })} placeholder="País" style={{ width: 80, fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }} /></td>}
                  {showGender && (
                    <td style={{ padding: '6px 12px' }}>
                      <select value={emp.gender ?? ''} onChange={(e) => updateEmployee(emp.id, { gender: e.target.value || undefined })} style={{ fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }}>
                        <option value="">—</option><option value="F">F</option><option value="M">M</option><option value="NB">NB</option>
                      </select>
                    </td>
                  )}
                  {showSalary && <td style={{ padding: '6px 12px' }}><input type="number" value={emp.salary ?? ''} onChange={(e) => updateEmployee(emp.id, { salary: e.target.value ? Number(e.target.value) : undefined })} placeholder="0" style={{ width: 90, fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }} /></td>}
                  {showHireDate && <td style={{ padding: '6px 12px' }}><input type="date" value={emp.hireDate ?? ''} onChange={(e) => updateEmployee(emp.id, { hireDate: e.target.value || undefined })} style={{ fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }} /></td>}
                  <td style={{ padding: '6px 12px' }}>
                    <select value={emp.performance} onChange={(e) => updateEmployee(emp.id, { performance: e.target.value as PerformanceLevel })} style={{ fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }}>
                      {PERF_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <select value={emp.potential} onChange={(e) => updateEmployee(emp.id, { potential: e.target.value as PotentialLevel })} style={{ fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }}>
                      {PERF_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, fontWeight: 700, fontSize: 11, background: cs.bg, color: cs.color }}>{box}</span>
                      <span style={{ fontSize: 11, color: T.text3, whiteSpace: 'nowrap' }}>{categoryNames[catId]}</span>
                    </div>
                  </td>
                  {hasPrevCycle && (
                    <>
                      <td style={{ padding: '6px 12px' }}>
                        <select value={emp.prevPerformance ?? ''} onChange={(e) => updateEmployee(emp.id, { prevPerformance: e.target.value as PerformanceLevel || undefined })} style={{ fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }}>
                          <option value="">—</option>{PERF_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <select value={emp.prevPotential ?? ''} onChange={(e) => updateEmployee(emp.id, { prevPotential: e.target.value as PotentialLevel || undefined })} style={{ fontSize: 12, border: `1px solid ${T.border}`, borderRadius: 4, padding: '3px 6px' }}>
                          <option value="">—</option>{PERF_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                    </>
                  )}
                  <td style={{ padding: '6px 8px' }}>
                    <button onClick={() => removeEmployee(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.text3, display: 'flex', borderRadius: 4 }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={() => addEmployee()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500,
            color: T.primary, background: T.primaryBg,
            border: `1px solid ${T.primaryMid}`, borderRadius: 7,
            padding: '6px 14px', cursor: 'pointer', transition: 'all 150ms',
          }}
        >
          <Plus size={14} /> Agregar persona
        </button>
      </div>
    </div>
  )
}

// ── Dept OKR section with dept selector ──────────────────────────────────────

function DeptOKRSection() {
  const { employees, deptOKRs, activeDept, setActiveDept } = useStore()

  const areas = useMemo(() => {
    const s = new Set(employees.map(e => e.area).filter(Boolean))
    return Array.from(s).sort()
  }, [employees])

  const hasOKRs = (area: string) => (deptOKRs[area]?.objectives?.length ?? 0) > 0

  return (
    <div style={card}>
      <SectionHeader
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}
        title="OKRs del departamento"
        subtitle="Resultados clave por área"
      />
      {/* Dept selector strip */}
      <div style={{
        padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        background: '#FAFAFA',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>
          Departamento
        </span>
        {areas.map(area => {
          const active = area === activeDept
          const loaded = hasOKRs(area)
          return (
            <button key={area} onClick={() => setActiveDept(area)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: active ? 600 : 400,
              padding: '4px 10px', borderRadius: 20,
              border: active ? `1.5px solid ${T.primary}` : `1px solid ${T.border}`,
              background: active ? T.primaryBg : T.surface,
              color: active ? T.primary : T.text2,
              cursor: 'pointer', transition: 'all 120ms',
              whiteSpace: 'nowrap',
            }}>
              {loaded
                ? <CheckCircle2 size={12} color={active ? T.primary : T.success} />
                : <Circle size={12} color={T.text3} />
              }
              {area}
            </button>
          )
        })}
      </div>

      {/* OKR content for active dept */}
      <div style={{ padding: '0' }}>
        <OKRCardInner />
      </div>
    </div>
  )
}

function OKRCardInner() {
  const {
    deptOKRs, activeDept, toggleWeights,
    addObjective, removeObjective, updateObjective, updateObjectiveWeight,
    addKeyResult, removeKeyResult, updateKeyResult,
  } = useStore()
  const okrs = deptOKRs[activeDept] ?? { enableWeights: false, objectives: [] }
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }))

  const totalWeight = okrs.objectives.reduce((a, o) => a + (o.weight ?? 0), 0)
  const weightError = okrs.enableWeights && Math.abs(totalWeight - 100) > 1

  const sectionPct = () => {
    if (!okrs.objectives.length) return 0
    if (okrs.enableWeights)
      return okrs.objectives.reduce((a, o) => a + objectiveCompletion(o) * ((o.weight ?? 0) / 100), 0)
    return okrs.objectives.reduce((a, o) => a + objectiveCompletion(o), 0) / okrs.objectives.length
  }
  const pct = Math.round(sectionPct())

  if (okrs.objectives.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: T.text3, marginBottom: 12, lineHeight: 1.6 }}>
          Antes de agregar objetivos de departamento, te recomendamos{' '}
          <strong style={{ color: T.text1 }}>importar el CSV con tus empleados</strong>{' '}
          para detectar los departamentos automáticamente.
        </div>
        <button onClick={() => addObjective('dept')} style={{
          fontSize: 13, fontWeight: 500, color: T.primary, background: T.primaryBg,
          border: `1px solid ${T.primaryMid}`, borderRadius: 7, padding: '6px 16px', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={13} /> Agregar primer objetivo
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Sub-header */}
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: T.text3 }}>{okrs.objectives.length} objetivos</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => toggleWeights('dept')} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
            border: `1px solid ${okrs.enableWeights ? T.primary : T.border}`,
            background: okrs.enableWeights ? T.primaryBg : 'transparent',
            color: okrs.enableWeights ? T.primary : T.text3, cursor: 'pointer',
          }}>
            <Scale size={11} /> Weights
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, background: pctBg(pct), color: pctColor(pct), padding: '4px 10px', borderRadius: 6 }}>
            {pct}%
          </span>
        </div>
      </div>

      {weightError && (
        <div style={{ padding: '6px 18px', background: T.warningBg, fontSize: 12, color: T.warning, borderBottom: `1px solid #FDE68A` }}>
          ⚠ Los pesos suman {totalWeight}% — deben sumar 100%
        </div>
      )}

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {okrs.objectives.length === 0 && (
          <div style={{ padding: '20px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: T.text3, marginBottom: 12 }}>
              Todavía no hay OKRs cargados para la empresa
            </div>
            <button onClick={() => addObjective('dept')} style={{
              fontSize: 13, fontWeight: 500, color: T.primary, background: T.primaryBg,
              border: `1px solid ${T.primaryMid}`, borderRadius: 7, padding: '6px 16px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Plus size={13} /> Agregar primer objetivo
            </button>
          </div>
        )}
        {okrs.objectives.map((obj, oi) => {
          const objPct = Math.round(objectiveCompletion(obj))
          const isOpen = !!open[obj.id]
          return (
            <div key={obj.id} style={{ borderRadius: 8, border: `1px solid ${isOpen ? T.primaryMid : T.border}`, overflow: 'hidden', transition: 'border-color 150ms' }}>
              <div onClick={() => toggle(obj.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: isOpen ? '#FAFAFF' : T.surface, cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: isOpen ? T.primary : T.primaryBg, color: isOpen ? '#fff' : T.primary, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>O{oi + 1}</span>
                <input value={obj.text} onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateObjective('dept', obj.id, e.target.value)}
                  placeholder={`Objetivo ${oi + 1}...`}
                  style={{ flex: 1, fontSize: 13, fontWeight: 500, border: 'none', background: 'transparent', padding: 0, color: T.text1, outline: 'none', cursor: 'text' }} />
                {okrs.enableWeights && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <input type="number" min={0} max={100} step={1} value={obj.weight ?? 0}
                      onChange={(e) => updateObjectiveWeight('dept', obj.id, Number(e.target.value))}
                      style={{ width: 44, textAlign: 'center', fontSize: 12, fontWeight: 600, color: T.primary, border: `1px solid ${T.primaryMid}`, borderRadius: 4, padding: '2px 0' }} />
                    <span style={{ fontSize: 11, color: T.text3 }}>%</span>
                  </div>
                )}
                <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(objPct), minWidth: 34, textAlign: 'right' }}>{objPct}%</span>
                {okrs.objectives.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); removeObjective('dept', obj.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.text3, display: 'flex', borderRadius: 4 }}>
                    <Trash2 size={12} />
                  </button>
                )}
                <span style={{ color: T.text3, display: 'flex', transition: 'transform 150ms', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  <ChevronDown size={14} />
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: '8px 12px 10px 42px', background: '#FAFAFF', borderTop: `1px solid ${T.primaryMid}`, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {obj.keyResults.map((kr, ki) => (
                    <div key={kr.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: T.primary, background: T.primaryBg, borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>KR{ki + 1}</span>
                      <input value={kr.text} onChange={(e) => updateKeyResult('dept', obj.id, kr.id, { text: e.target.value })}
                        placeholder={`Key Result ${ki + 1}...`}
                        style={{ flex: 1, fontSize: 12, color: T.text1, border: `1px solid ${T.border}`, borderRadius: 4, padding: '4px 8px', background: T.surface }} />
                      <input type="number" min={0} max={100} step={1} value={kr.completion}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateKeyResult('dept', obj.id, kr.id, { completion: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        style={{ width: 56, textAlign: 'center', fontSize: 12, fontWeight: 700, color: pctColor(kr.completion), border: `1px solid ${T.border}`, borderRadius: 4, padding: '4px 0', background: pctBg(kr.completion) }} />
                      <span style={{ fontSize: 11, color: T.text3 }}>%</span>
                      {obj.keyResults.length > 1 && (
                        <button onClick={() => removeKeyResult('dept', obj.id, kr.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.text3, display: 'flex' }}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addKeyResult('dept', obj.id)} style={{ alignSelf: 'flex-start', marginTop: 3, fontSize: 11, fontWeight: 500, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                    <Plus size={11} /> Agregar KR
                  </button>
                </div>
              )}
            </div>
          )
        })}
        <button onClick={() => addObjective('dept')} style={{ alignSelf: 'flex-start', marginTop: 2, fontSize: 12, fontWeight: 500, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}>
          <Plus size={12} /> Agregar objetivo
        </button>
      </div>
    </div>
  )
}

// ── Main DataTab ──────────────────────────────────────────────────────────────

export function DataTab() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: T.bg, minHeight: '100%' }}>

      {/* Welcome */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primaryBg} 0%, #fff 60%)`,
        border: `1px solid ${T.primaryMid}`,
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 4 }}>¡Bienvenido a Calibración HR!</div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
            Para comenzar, ingresá los resultados de negocio de la empresa y del departamento.
            La curva recomendada se ajustará según el nivel de cumplimiento de los OKRs.
          </div>
        </div>
      </div>

      {/* OKRs — company left, dept right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <OKRCard which="company" title="OKRs de la empresa" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        } />
        <DeptOKRSection />
      </div>

      {/* Performance table */}
      <EmployeeTable />

    </div>
  )
}
