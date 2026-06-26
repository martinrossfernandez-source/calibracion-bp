import { useMemo, useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { categoryFromBox } from '../../types'
import type { CategoryId, OKRSet } from '../../types'
import { BarChart3, AlertTriangle, TrendingUp, FileBarChart, Users, Download, ChevronDown } from 'lucide-react'
import { calcOKRScore, idealRange, okrAvg } from '../../utils/okrCalc'

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  primary:   '#7C3AED',
  primaryBg: '#F5F3FF',
  surface:   '#FFFFFF',
  surface2:  '#FAFAFA',
  border:    '#E5E7EB',
  text1:     '#111827',
  text2:     '#374151',
  text3:     '#6B7280',
  warning:   '#D97706',
  success:   '#059669',
}

const CAT_STYLE: Record<CategoryId, { text: string; bg: string; border: string; bar: string }> = {
  critico:    { text: '#B91C1C', bg: '#FEE2E2', border: '#FECACA', bar: '#FCA5A5' },
  desarrollo: { text: '#92400E', bg: '#FEF9C3', border: '#FEF08A', bar: '#FDE68A' },
  core:       { text: '#065F46', bg: '#D1FAE5', border: '#A7F3D0', bar: '#6EE7B7' },
  alto:       { text: '#1D4ED8', bg: '#DBEAFE', border: '#BFDBFE', bar: '#93C5FD' },
  promesa:    { text: '#5B21B6', bg: '#EDE9FE', border: '#DDD6FE', bar: '#C4B5FD' },
}

const CAT_NUM: Record<CategoryId, number> = { critico: 1, desarrollo: 2, core: 3, alto: 4, promesa: 5 }
const CATS: CategoryId[] = ['critico', 'desarrollo', 'core', 'alto', 'promesa']

const th: React.CSSProperties = {
  padding: '0 10px', textAlign: 'center',
  fontSize: 10, fontWeight: 700, color: T.text3,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: `1px solid ${T.border}`,
  background: T.surface2, whiteSpace: 'nowrap',
}

// ── Mini vertical bar chart ───────────────────────────────────────────────────
function MiniBarChart({ pcts }: { pcts: Record<CategoryId, number> }) {
  const BAR_H = 52

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: BAR_H + 14, paddingBottom: 14, position: 'relative' }}>
      {CATS.map(cat => {
        const pct = pcts[cat] ?? 0
        const h   = Math.max(pct > 0 ? 3 : 0, Math.round((pct / 100) * BAR_H))
        const cs  = CAT_STYLE[cat]
        return (
          <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
            {pct > 0 && (
              <div style={{
                fontSize: 8, fontWeight: 700, color: cs.text,
                position: 'absolute', bottom: h + 2, whiteSpace: 'nowrap',
              }}>
                {Math.round(pct)}%
              </div>
            )}
            <div style={{
              width: 18, height: h,
              background: cs.bar, borderRadius: '3px 3px 0 0',
              transition: 'height 300ms',
            }} />
            {/* Category number at bottom */}
            <div style={{
              position: 'absolute', bottom: -13,
              width: 14, height: 14, borderRadius: 3,
              background: cs.text, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 800,
            }}>
              {CAT_NUM[cat]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

type Range = { min: number; max: number }

// ── Final cell ────────────────────────────────────────────────────────────────
function FinalCell({ count, total, range }: { count: number; total: number; range: Range }) {
  const pct   = total ? Math.round(count / total * 100) : 0
  const inRange = pct >= range.min && pct <= range.max
  const color   = count === 0 ? T.text3 : inRange ? T.success : '#DC2626'

  if (count === 0) return (
    <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: `1px solid ${T.border}` }}>
      <span style={{ color: T.text3, fontSize: 11 }}>—</span>
    </td>
  )

  return (
    <td style={{ padding: '7px 6px', textAlign: 'center', borderRight: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</div>
      <div style={{ fontSize: 10, color, opacity: 0.7, marginTop: 1 }}>{count}p</div>
    </td>
  )
}

// ── Target cell ───────────────────────────────────────────────────────────────
function TargetCell({ range }: { range: Range }) {
  return (
    <td style={{
      padding: '7px 6px', textAlign: 'center',
      borderRight: `1px dashed ${T.border}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.text2 }}>
        {range.min}–{range.max}%
      </div>
    </td>
  )
}

const EMPTY_OKR: OKRSet = { enableWeights: false, objectives: [] }

// ── Main tab ──────────────────────────────────────────────────────────────────
export function AnalisisTab() {
  const { employees, categoryNames, companyOKRs, deptOKRs } = useStore()

  const effCat = (e: typeof employees[0]): CategoryId =>
    categoryFromBox(e.calibratedPerformance ?? e.performance, e.calibratedPotential ?? e.potential)

  const areas = useMemo(() =>
    [...new Set(employees.map(e => e.area || 'Sin área'))].sort(),
    [employees])

  const areaRanges = useMemo(() =>
    Object.fromEntries(areas.map(area => {
      const dept  = deptOKRs[area] ?? EMPTY_OKR
      const score = calcOKRScore(companyOKRs, dept)
      const dept2 = okrAvg(dept)
      return [area, idealRange(score, dept2)]
    })),
    [areas, companyOKRs, deptOKRs]
  )

  // Global range for "Total empresa" — average OKR score across all areas
  const globalRange = useMemo(() => {
    if (!areas.length) return idealRange(50, 50)
    const avgCombined = areas.reduce((s, a) =>
      s + calcOKRScore(companyOKRs, deptOKRs[a] ?? EMPTY_OKR), 0) / areas.length
    const avgDept = areas.reduce((s, a) =>
      s + okrAvg(deptOKRs[a] ?? EMPTY_OKR), 0) / areas.length
    return idealRange(avgCombined, avgDept)
  }, [areas, companyOKRs, deptOKRs])

  const rows = useMemo(() => areas.map(area => {
    const emps  = employees.filter(e => (e.area || 'Sin área') === area)
    const total = emps.length
    const calibrated = emps.filter(e => e.calibratedPerformance !== undefined || e.calibratedPotential !== undefined).length
    const counts = CATS.reduce((acc, cat) => {
      acc[cat] = emps.filter(e => effCat(e) === cat).length
      return acc
    }, {} as Record<CategoryId, number>)
    const pcts = CATS.reduce((acc, cat) => {
      acc[cat] = total ? counts[cat] / total * 100 : 0
      return acc
    }, {} as Record<CategoryId, number>)
    return { area, total, calibrated, counts, pcts }
  }), [employees, areas])

  const totalCalibrated = useMemo(() =>
    employees.filter(e => e.calibratedPerformance !== undefined || e.calibratedPotential !== undefined).length,
    [employees]
  )

  // Calibrated persons list for bottom table
  const calibratedPersons = useMemo(() =>
    employees
      .filter(e => e.calibratedPerformance !== undefined || e.calibratedPotential !== undefined)
      .map(e => ({
        id: e.id,
        name: e.name,
        role: e.role || '—',
        area: e.area || 'Sin área',
        perfBefore: e.performance,
        potBefore:  e.potential,
        perfAfter:  e.calibratedPerformance ?? e.performance,
        potAfter:   e.calibratedPotential  ?? e.potential,
        before: categoryFromBox(e.performance, e.potential),
        after:  effCat(e),
      }))
      .sort((a, b) => a.area.localeCompare(b.area)),
    [employees]
  )

  // Manager rows
  const managerRows = useMemo(() => {
    const map = new Map<string, typeof employees>()
    for (const e of employees) {
      const mgr = e.managerName || 'Sin manager'
      if (!map.has(mgr)) map.set(mgr, [])
      map.get(mgr)!.push(e)
    }
    return [...map.entries()]
      .map(([manager, emps]) => {
        const total = emps.length
        const counts = CATS.reduce((acc, cat) => {
          acc[cat] = emps.filter(e => effCat(e) === cat).length
          return acc
        }, {} as Record<CategoryId, number>)
        const pcts = CATS.reduce((acc, cat) => {
          acc[cat] = total ? counts[cat] / total * 100 : 0
          return acc
        }, {} as Record<CategoryId, number>)
        const topPct = total ? (counts.alto + counts.promesa) / total * 100 : 0
        const warn = total >= 3 && topPct > 40
        const calibrated = emps
          .filter(e => e.calibratedPerformance !== undefined || e.calibratedPotential !== undefined)
          .map(e => ({
            name: e.name,
            before: CAT_NUM[categoryFromBox(e.performance, e.potential)],
            after:  CAT_NUM[effCat(e)],
          }))
        return { manager, total, counts, pcts, topPct, warn, calibrated }
      })
      .sort((a, b) => b.total - a.total)
  }, [employees])

  // Totals row
  const totals = useMemo(() => {
    const total = employees.length
    const counts = CATS.reduce((acc, cat) => {
      acc[cat] = employees.filter(e => effCat(e) === cat).length
      return acc
    }, {} as Record<CategoryId, number>)
    const pcts = CATS.reduce((acc, cat) => {
      acc[cat] = total ? counts[cat] / total * 100 : 0
      return acc
    }, {} as Record<CategoryId, number>)
    return { total, counts, pcts }
  }, [employees])

  // Anomalies
  const anomalies = rows.filter(r => {
    const topPct = (r.counts.alto + r.counts.promesa) / r.total * 100
    return topPct >= 40 && r.total >= 3
  })

  // Download menu state
  const [dlOpen, setDlOpen] = useState(false)
  const dlRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) setDlOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const CAP: Record<string, string> = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }

  const buildHTML = (openPrint = false) => {
    const catLabel: Record<string, string> = {
      critico: '1. Desempeño insuficiente', desarrollo: '2. Desarrollo requerido',
      core: '3. Desempeño esperado', alto: '4. Alto desempeño', promesa: '5. Alta promesa',
    }
    const catColor: Record<string, string> = {
      critico: '#B91C1C', desarrollo: '#92400E', core: '#065F46', alto: '#1D4ED8', promesa: '#5B21B6',
    }
    const catBg: Record<string, string> = {
      critico: '#FEE2E2', desarrollo: '#FEF9C3', core: '#D1FAE5', alto: '#DBEAFE', promesa: '#EDE9FE',
    }

    const distRows = rows.map(r => `
      <tr>
        <td style="padding:8px 12px;font-weight:600">${r.area}</td>
        <td style="padding:8px 8px;text-align:center">${r.total}</td>
        <td style="padding:8px 8px;text-align:center;color:#7C3AED;font-weight:700">${r.calibrated > 0 ? r.calibrated : '—'}</td>
        ${CATS.map(cat => {
          const pct = r.total ? Math.round(r.counts[cat] / r.total * 100) : 0
          return `<td style="padding:8px 8px;text-align:center;color:${catColor[cat]};font-weight:${pct > 0 ? 700 : 400}">${pct > 0 ? pct + '%' : '—'}</td>`
        }).join('')}
      </tr>`).join('')

    const calRows = calibratedPersons.map(p => `
      <tr>
        <td style="padding:8px 12px;font-weight:600">${p.name}</td>
        <td style="padding:8px 12px">${p.area}</td>
        <td style="padding:8px 12px">${p.role}</td>
        <td style="padding:8px 12px">
          <span style="background:${catBg[p.before]};color:${catColor[p.before]};padding:3px 8px;border-radius:5px;font-size:12px;font-weight:700">${categoryNames[p.before]}</span>
          <div style="font-size:11px;color:#6B7280;margin-top:3px">Rend. ${CAP[p.perfBefore]} · Pot. ${CAP[p.potBefore]}</div>
        </td>
        <td style="padding:8px 12px">
          <span style="background:${catBg[p.after]};color:${catColor[p.after]};padding:3px 8px;border-radius:5px;font-size:12px;font-weight:700">${categoryNames[p.after]}</span>
          <div style="font-size:11px;color:#6B7280;margin-top:3px">Rend. ${CAP[p.perfAfter]} · Pot. ${CAP[p.potAfter]}</div>
        </td>
      </tr>`).join('')

    const mgrRows = managerRows.map(r => `
      <tr style="background:${r.warn ? '#FFFBEB' : 'white'}">
        <td style="padding:8px 12px;font-weight:600">${r.manager}</td>
        <td style="padding:8px 8px;text-align:center">${r.total}</td>
        ${CATS.map(cat => {
          const pct = r.total ? Math.round(r.counts[cat] / r.total * 100) : 0
          return `<td style="padding:8px 8px;text-align:center;color:${catColor[cat]};font-weight:${pct > 0 ? 700 : 400}">${pct > 0 ? pct + '%' : '—'}</td>`
        }).join('')}
        <td style="padding:8px 12px;color:#78350F;font-size:12px">${r.warn ? `⚠️ ${Math.round(r.topPct)}% en cat. 4+5 — posible sesgo alto` : '—'}</td>
        <td style="padding:8px 12px;font-size:12px">${r.calibrated.length ? r.calibrated.map(c => `<div><b>${c.name}</b> ${c.before} → ${c.after}</div>`).join('') : '—'}</td>
      </tr>`).join('')

    const summaryCards = CATS.map(cat => {
      const cs = CAT_STYLE[cat]
      const pct = Math.round(totals.pcts[cat])
      const range = globalRange[cat]
      return `<div style="border:1.5px solid ${cs.border};border-top:3px solid ${cs.text};border-radius:10px;padding:14px;flex:1">
        <div style="font-size:11px;font-weight:700;color:${cs.text};margin-bottom:6px">${catLabel[cat]}</div>
        <div style="font-size:28px;font-weight:800;color:${cs.text}">${pct}%</div>
        <div style="font-size:11px;color:#6B7280">${totals.counts[cat]} personas</div>
        <div style="font-size:10px;margin-top:4px;color:#6B7280">Rango: ${range.min}–${range.max}%</div>
      </div>`
    }).join('')

    const thStyle = 'padding:8px 10px;text-align:left;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #E5E7EB;background:#FAFAFA'
    const catThCells = CATS.map(cat => `<th style="${thStyle};color:${catColor[cat]}">${CAT_NUM[cat]}</th>`).join('')

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Resultados de Calibración HR</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F5F3FF; color: #111827; padding: 32px }
  h2 { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px }
  table { width: 100%; border-collapse: collapse; font-size: 13px }
  tr:nth-child(even) { background: #FAFAFA }
  .card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; margin-bottom: 24px }
  .card-header { padding: 12px 16px; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; display: flex; align-items: center; gap: 8px }
  @media print { body { background: white; padding: 16px } }
</style>
</head>
<body>
<div style="max-width:1100px;margin:0 auto">

  <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;background:white;border:1px solid #DDD6FE;border-radius:14px;padding:20px 24px">
    <div style="width:44px;height:44px;border-radius:11px;background:#7C3AED;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    </div>
    <div>
      <div style="font-size:20px;font-weight:800;color:#1E1B4B">Resultados de Calibración HR</div>
      <div style="font-size:13px;color:#6B7280;margin-top:3px">Exportado el ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <div style="display:flex;gap:12px;margin-bottom:24px">${summaryCards}</div>

  <div class="card">
    <div class="card-header"><b>Distribución por área</b></div>
    <table>
      <thead><tr>
        <th style="${thStyle}">Área</th>
        <th style="${thStyle};text-align:center">HC</th>
        <th style="${thStyle};text-align:center">Calibrados</th>
        ${CATS.map(cat => `<th style="${thStyle};color:${catColor[cat]};text-align:center">${CAT_NUM[cat]} ${catLabel[cat].split('.')[1]?.trim()}</th>`).join('')}
      </tr></thead>
      <tbody>${distRows}</tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-header"><b>Personas calibradas</b> <span style="background:#F5F3FF;color:#7C3AED;font-size:11px;font-weight:700;border-radius:20px;padding:2px 8px">${calibratedPersons.length}</span></div>
    ${calibratedPersons.length === 0
      ? '<div style="padding:20px 16px;color:#9CA3AF;text-align:center">Sin calibraciones registradas</div>'
      : `<table>
        <thead><tr>
          <th style="${thStyle}">Nombre</th>
          <th style="${thStyle}">Departamento</th>
          <th style="${thStyle}">Rol</th>
          <th style="${thStyle}">PRE CALIBRACIÓN</th>
          <th style="${thStyle}">POST CALIBRACIÓN</th>
        </tr></thead>
        <tbody>${calRows}</tbody>
      </table>`}
  </div>

  <div class="card">
    <div class="card-header"><b>Evaluación por manager</b></div>
    <table>
      <thead><tr>
        <th style="${thStyle}">Líder</th>
        <th style="${thStyle};text-align:center">Reportes</th>
        ${catThCells}
        <th style="${thStyle}">Alertas</th>
        <th style="${thStyle}">Registro de cambios</th>
      </tr></thead>
      <tbody>${mgrRows}</tbody>
    </table>
  </div>

</div>
${openPrint ? '<script>window.onload=function(){window.print()}<\/script>' : ''}
</body>
</html>`
  }

  const downloadHTML = () => {
    const html = buildHTML(false)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `calibracion-resultados-${new Date().toISOString().slice(0, 10)}.html`
    a.click()
    setDlOpen(false)
  }

  const openPDF = () => {
    const html = buildHTML(true)
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
    setDlOpen(false)
  }

  const exportCSV = () => {
    const headers = ['Nombre', 'Correo', 'Área', 'Rol', 'Manager', 'Correo Manager', 'Rendimiento', 'Potencial', 'Grado', 'País', 'Género', 'Salario', 'Fecha ingreso', 'Rendimiento anterior', 'Potencial anterior']
    const dataRows = employees.map(e => [
      e.name ?? '',
      e.email ?? '',
      e.area ?? '',
      e.role ?? '',
      e.managerName ?? '',
      e.managerEmail ?? '',
      e.calibratedPerformance ?? e.performance,
      e.calibratedPotential ?? e.potential,
      e.grade ?? '',
      e.country ?? '',
      e.gender ?? '',
      e.salary != null ? String(e.salary) : '',
      e.hireDate ?? '',
      e.prevPerformance ?? '',
      e.prevPotential ?? '',
    ])
    const csv = [headers, ...dataRows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `calibracion-resultados-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    setDlOpen(false)
  }

  if (employees.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: T.text3 }}>
        <BarChart3 size={32} strokeWidth={1.5} style={{ opacity: 0.4 }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: T.text2 }}>Sin datos aún</div>
        <div style={{ fontSize: 13 }}>Cargá personas en la pestaña Datos para ver el análisis</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto', height: '100%', boxSizing: 'border-box' }}>

      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primaryBg} 0%, #fff 60%)`,
        border: `1px solid #DDD6FE`, borderRadius: 12, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileBarChart size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 3 }}>Executive Summary</div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
            Aquí encuentras los <strong style={{ color: T.text1 }}>resultados finales</strong> de tu calibración. Hay tablas comparativas de lo que se espera vs. lo que resultó, y el detalle de todas las personas a quienes hiciste cambios.
          </div>
        </div>
        {/* Download dropdown */}
        <div ref={dlRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setDlOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: T.primary, color: 'white', border: 'none',
              borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <Download size={14} />
            Descargar resultados
            <ChevronDown size={13} style={{ opacity: 0.8 }} />
          </button>
          {dlOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 300,
              background: 'white', border: `1px solid ${T.border}`,
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 200, overflow: 'hidden',
            }}>
              {[
                { label: 'Descargar HTML', sub: 'Archivo completo con estilos', fn: downloadHTML },
                { label: 'Abrir como PDF', sub: 'Nueva pestaña → Imprimir → PDF', fn: openPDF },
                { label: 'Exportar cambios CSV', sub: 'Mismo formato que el template, valores finales', fn: exportCSV },
              ].map(opt => (
                <div
                  key={opt.label}
                  onMouseDown={opt.fn}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: `1px solid ${T.border}`,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.primaryBg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{opt.sub}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary cards (top) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
        {CATS.map(cat => {
          const cs    = CAT_STYLE[cat]
          const count = totals.counts[cat]
          const pct   = Math.round(totals.pcts[cat])
          const range = globalRange[cat]
          const status = pct > range.max ? 'over' : pct < range.min ? 'under' : 'ok'
          return (
            <div key={cat} style={{
              background: T.surface, border: `1.5px solid ${cs.border}`,
              borderRadius: 12, padding: '12px 14px',
              borderTop: `3px solid ${cs.text}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4, background: cs.text, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                }}>{CAT_NUM[cat]}</span>
                <span style={{ fontSize: 11, color: cs.text, fontWeight: 600, lineHeight: 1.2 }}>
                  {categoryNames[cat]}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: cs.text, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{count} personas</div>
              <div style={{
                fontSize: 10, marginTop: 6, fontWeight: 700,
                color: status === 'over' ? '#DC2626' : status === 'under' ? '#2563EB' : T.success,
              }}>
                {status === 'over'  ? `↑ sobre rango (${range.min}–${range.max}%)` :
                 status === 'under' ? `↓ bajo rango  (${range.min}–${range.max}%)` :
                                      `✓ en rango   (${range.min}–${range.max}%)`}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Anomaly banner ── */}
      {anomalies.length > 0 && (
        <div style={{
          background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 10,
          padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0,
        }}>
          <AlertTriangle size={15} color={T.warning} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
              {anomalies.length === 1 ? '1 área' : `${anomalies.length} áreas`} con concentración alta de top performers
            </div>
            {anomalies.map(r => {
              const topPct = Math.round((r.counts.alto + r.counts.promesa) / r.total * 100)
              const deptOKR = deptOKRs[r.area] ?? EMPTY_OKR
              const deptPct = Math.round(okrAvg(deptOKR))
              const hasDeptOKR = deptOKR.objectives.length > 0
              return (
                <div key={r.area} style={{ fontSize: 11, color: '#78350F', marginBottom: 2 }}>
                  <strong>{r.area}</strong>: {topPct}% en categorías 4+5 ({r.counts.alto + r.counts.promesa} de {r.total} personas) — revisar justificación.
                  {hasDeptOKR && (
                    <span style={{ color: '#92400E', fontWeight: 400 }}>
                      {' '}Cuenta con <strong>{deptPct}%</strong> de cumplimiento de sus metas.
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main table ── */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12, overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Table header */}
        <div style={{
          padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 8, background: T.surface2,
        }}>
          <TrendingUp size={14} color={T.primary} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text1 }}>Distribución por área</span>
          <span style={{ fontSize: 11, color: T.text3, marginLeft: 4 }}>
            Target = rango ideal · Final = resultado calibrado
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              {/* Row 1: merged category headers */}
              <tr>
                <th rowSpan={2} style={{ ...th, textAlign: 'left', padding: '0 14px', borderRight: `1px solid ${T.border}`, minWidth: 120 }}>
                  Área
                </th>
                <th rowSpan={2} style={{ ...th, borderRight: `1px solid ${T.border}`, minWidth: 44 }}>
                  HC
                </th>
                <th rowSpan={2} style={{ ...th, borderRight: `1px solid ${T.border}`, minWidth: 60 }}>
                  Calibrados
                </th>
                {CATS.map(cat => {
                  const cs = CAT_STYLE[cat]
                  return (
                    <th key={cat} colSpan={2} style={{
                      ...th, padding: '6px 10px',
                      borderRight: `1px solid ${T.border}`,
                      borderBottom: `1px solid ${cs.border}`,
                      color: cs.text,
                      background: cs.bg,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: 3, background: cs.text, color: '#fff',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800,
                        }}>{CAT_NUM[cat]}</span>
                        {categoryNames[cat]}
                      </div>
                    </th>
                  )
                })}
                <th rowSpan={2} style={{ ...th, minWidth: 120, borderLeft: `1px solid ${T.border}` }}>
                  Distribución
                </th>
              </tr>
              {/* Row 2: Target / Final sub-headers */}
              <tr>
                {CATS.map(cat => {
                  const cs = CAT_STYLE[cat]
                  return [
                    <th key={`${cat}-t`} style={{
                      ...th, padding: '4px 6px', fontSize: 9,
                      background: cs.bg, color: cs.text, opacity: 0.8,
                      borderRight: `1px dashed ${T.border}`,
                    }}>
                      Target
                    </th>,
                    <th key={`${cat}-f`} style={{
                      ...th, padding: '4px 6px', fontSize: 9,
                      background: cs.bg, color: cs.text,
                      borderRight: `1px solid ${T.border}`,
                    }}>
                      Final
                    </th>,
                  ]
                })}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={row.area} style={{
                  borderBottom: `1px solid ${T.border}`,
                  background: i % 2 === 0 ? T.surface : T.surface2,
                }}>
                  <td style={{ padding: '8px 14px', fontWeight: 600, color: T.text1, borderRight: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
                    {row.area}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: T.text2, borderRight: `1px solid ${T.border}` }}>
                    {row.total}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: `1px solid ${T.border}` }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: row.calibrated > 0 ? T.primary : T.text3,
                    }}>
                      {row.calibrated > 0 ? row.calibrated : '—'}
                    </span>
                  </td>
                  {CATS.map(cat => [
                    <TargetCell key={`${cat}-t`} range={(areaRanges[row.area] ?? globalRange)[cat]} />,
                    <FinalCell  key={`${cat}-f`} count={row.counts[cat]} total={row.total} range={(areaRanges[row.area] ?? globalRange)[cat]} />,
                  ])}
                  <td style={{ padding: '6px 12px', borderLeft: `1px solid ${T.border}` }}>
                    <MiniBarChart pcts={row.pcts} />
                  </td>
                </tr>
              ))}

              {/* Totals row */}
              <tr style={{ background: T.primaryBg, borderTop: `2px solid ${T.border}` }}>
                <td style={{ padding: '8px 14px', fontWeight: 700, color: T.primary, borderRight: `1px solid ${T.border}`, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total empresa
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 800, color: T.primary, borderRight: `1px solid ${T.border}` }}>
                  {totals.total}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 800, color: T.primary, borderRight: `1px solid ${T.border}` }}>
                  {totalCalibrated > 0 ? totalCalibrated : '—'}
                </td>
                {CATS.map(cat => [
                  <TargetCell key={`tot-${cat}-t`} range={globalRange[cat]} />,
                  <FinalCell  key={`tot-${cat}-f`} count={totals.counts[cat]} total={totals.total} range={globalRange[cat]} />,
                ])}
                <td style={{ padding: '6px 12px', borderLeft: `1px solid ${T.border}` }}>
                  <MiniBarChart pcts={totals.pcts} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Calibrated persons table ── */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12, overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{
          padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 8, background: T.surface2,
        }}>
          <TrendingUp size={14} color={T.primary} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text1 }}>Personas calibradas</span>
          <span style={{
            marginLeft: 4, background: T.primaryBg, color: T.primary,
            fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '1px 8px',
          }}>
            {calibratedPersons.length}
          </span>
        </div>

        {calibratedPersons.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: T.text3, fontSize: 13 }}>
            Aún no hay calibraciones registradas
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {[
                    { label: 'Nombre',            left: true  },
                    { label: 'Departamento',       left: true  },
                    { label: 'Rol',                left: true  },
                    { label: 'PRE CALIBRACIÓN',    left: true  },
                    { label: 'POST CALIBRACIÓN',   left: true  },
                  ].map(h => (
                    <th key={h.label} style={{ ...th, textAlign: 'left', padding: '8px 14px' }}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calibratedPersons.map((p, i) => {
                  const bcs = CAT_STYLE[p.before]
                  const acs = CAT_STYLE[p.after]
                  const catChanged  = p.before !== p.after
                  const perfChanged = p.perfBefore !== p.perfAfter
                  const potChanged  = p.potBefore  !== p.potAfter
                  const posChanged  = perfChanged || potChanged
                  const CAP: Record<string, string> = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }
                  return (
                    <tr key={p.id} style={{
                      borderBottom: `1px solid ${T.border}`,
                      background: i % 2 === 0 ? T.surface : T.surface2,
                    }}>
                      <td style={{ padding: '9px 14px', fontWeight: 600, color: T.text1, verticalAlign: 'top' }}>
                        {p.name || '—'}
                      </td>
                      <td style={{ padding: '9px 14px', verticalAlign: 'top' }}>
                        <span style={{
                          background: T.primaryBg, color: T.primary,
                          fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 7px',
                        }}>
                          {p.area}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px', color: T.text2, verticalAlign: 'top' }}>
                        {p.role}
                      </td>
                      <td style={{ padding: '9px 14px', verticalAlign: 'top', textAlign: 'left' }}>
                        <span style={{
                          background: bcs.bg, color: bcs.text, border: `1px solid ${bcs.border}`,
                          fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 9px',
                          display: 'inline-block',
                        }}>
                          {categoryNames[p.before]}
                        </span>
                        <div style={{ fontSize: 10, color: T.text3, marginTop: 4, lineHeight: 1.5 }}>
                          Rend. {CAP[p.perfBefore]} · Pot. {CAP[p.potBefore]}
                        </div>
                      </td>
                      <td style={{ padding: '9px 14px', verticalAlign: 'top', textAlign: 'left' }}>
                        <span style={{
                          background: acs.bg, color: acs.text,
                          border: catChanged ? `1.5px solid ${acs.text}` : `1px solid ${acs.border}`,
                          fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 9px',
                          display: 'inline-block',
                        }}>
                          {categoryNames[p.after]}
                        </span>
                        {posChanged ? (
                          <div style={{ fontSize: 10, color: T.text3, marginTop: 4, lineHeight: 1.5 }}>
                            {perfChanged && (
                              <span>Rend. {CAP[p.perfBefore]} <span style={{ color: T.primary }}>→</span> {CAP[p.perfAfter]}</span>
                            )}
                            {perfChanged && potChanged && ' · '}
                            {potChanged && (
                              <span>Pot. {CAP[p.potBefore]} <span style={{ color: T.primary }}>→</span> {CAP[p.potAfter]}</span>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>sin cambio</div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Manager evaluation table ── */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12, overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{
          padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 8, background: T.surface2,
        }}>
          <Users size={14} color={T.primary} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text1 }}>Evaluación por manager</span>
          <span style={{ fontSize: 11, color: T.text3, marginLeft: 4 }}>distribución de categorías por líder</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ ...th, textAlign: 'left', padding: '0 14px', borderRight: `1px solid ${T.border}`, minWidth: 160 }}>
                  Líder
                </th>
                <th rowSpan={2} style={{ ...th, borderRight: `1px solid ${T.border}`, minWidth: 44 }}>
                  Reportes
                </th>
                {CATS.map(cat => {
                  const cs = CAT_STYLE[cat]
                  return (
                    <th key={cat} style={{
                      ...th, padding: '6px 10px',
                      borderRight: `1px solid ${T.border}`,
                      borderBottom: `1px solid ${cs.border}`,
                      color: cs.text, background: cs.bg,
                    }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 3, background: cs.text, color: '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 800,
                      }}>{CAT_NUM[cat]}</span>
                    </th>
                  )
                })}
                <th rowSpan={2} style={{ ...th, minWidth: 110, borderLeft: `1px solid ${T.border}` }}>
                  Distribución
                </th>
                <th rowSpan={2} style={{ ...th, minWidth: 200, borderLeft: `1px solid ${T.border}`, textAlign: 'left', padding: '0 12px' }}>
                  Alertas
                </th>
                <th rowSpan={2} style={{ ...th, minWidth: 200, borderLeft: `1px solid ${T.border}`, textAlign: 'left', padding: '0 12px' }}>
                  Registro de cambios
                </th>
              </tr>
              <tr>
                {CATS.map(cat => {
                  const cs = CAT_STYLE[cat]
                  return (
                    <th key={cat} style={{
                      ...th, padding: '4px 6px', fontSize: 9,
                      background: cs.bg, color: cs.text,
                      borderRight: `1px solid ${T.border}`,
                    }}>
                      Final
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {managerRows.map((row, i) => (
                <tr key={row.manager} style={{
                  borderBottom: `1px solid ${T.border}`,
                  background: row.warn
                    ? '#FFFBEB'
                    : i % 2 === 0 ? T.surface : T.surface2,
                }}>
                  <td style={{ padding: '8px 14px', fontWeight: 600, color: T.text1, borderRight: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
                    {row.manager}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: T.text2, borderRight: `1px solid ${T.border}` }}>
                    {row.total}
                  </td>
                  {CATS.map(cat => {
                    const cs  = CAT_STYLE[cat]
                    const cnt = row.counts[cat]
                    const pct = row.total ? Math.round(cnt / row.total * 100) : 0
                    return (
                      <td key={cat} style={{ padding: '7px 6px', textAlign: 'center', borderRight: `1px solid ${T.border}` }}>
                        {cnt > 0 ? (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 700, color: cs.text, lineHeight: 1 }}>{pct}%</div>
                            <div style={{ fontSize: 10, color: cs.text, opacity: 0.7, marginTop: 1 }}>{cnt}p</div>
                          </>
                        ) : (
                          <span style={{ color: T.text3, fontSize: 11 }}>—</span>
                        )}
                      </td>
                    )
                  })}
                  <td style={{ padding: '6px 12px', borderLeft: `1px solid ${T.border}`, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <MiniBarChart pcts={row.pcts} />
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', borderLeft: `1px solid ${T.border}` }}>
                    {row.warn ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <AlertTriangle size={13} color={T.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div style={{ fontSize: 11, color: '#78350F', lineHeight: 1.4 }}>
                          <strong>{Math.round(row.topPct)}%</strong> en categorías 4+5
                          <div style={{ fontWeight: 400, color: '#92400E', marginTop: 2 }}>
                            Revisar calibración — posible sesgo alto.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: T.text3 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 12px', borderLeft: `1px solid ${T.border}`, verticalAlign: 'top' }}>
                    {row.calibrated.length === 0 ? (
                      <span style={{ fontSize: 11, color: T.text3 }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {row.calibrated.map((c, idx) => (
                          <div key={idx} style={{ fontSize: 11, color: T.text1, whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                            <span style={{ color: T.text3 }}> {c.before}</span>
                            <span style={{ color: T.primary, fontWeight: 700 }}> → </span>
                            <span style={{ color: T.text1, fontWeight: 700 }}>{c.after}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
