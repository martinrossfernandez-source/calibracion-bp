import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ShieldCheck, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { AppTab } from '../types'

const TABS: { id: AppTab; label: string }[] = [
  { id: 'datos',    label: 'Datos' },
  { id: 'curvas',   label: 'Curvas' },
  { id: 'ninebox',  label: '9-Box' },
  { id: 'peers',    label: 'Peers Lens' },
  { id: 'analisis', label: 'Resultados' },
]

const T = {
  primary:   '#7C3AED',
  primaryBg: '#F5F3FF',
  primaryMid:'#DDD6FE',
  surface:   '#FFFFFF',
  border:    '#E5E7EB',
  text1:     '#111827',
  text2:     '#374151',
  text3:     '#9CA3AF',
}

const STEPS = [
  {
    n: '1',
    title: 'Carga tus datos',
    body: 'En la pestaña Datos, ingresa los OKRs de empresa y de cada departamento. Luego descarga el Template, complétalo en Excel con tu equipo y súbelo con Importar. La herramienta se actualiza al instante.',
  },
  {
    n: '2',
    title: 'Calibra',
    body: 'Tres vistas conectadas entre sí — úsalas en el orden que prefieras:\n• Curvas → ve si tu distribución actual coincide con el ideal según OKRs.\n• 9-Box → haz calibraciones en sesión con managers y mueve personas.\n• Peers Lens → ayuda a managers difíciles a ver el seniority de su equipo en contexto.',
  },
  {
    n: '3',
    title: 'Revisa resultados',
    body: 'En Resultados ves el resumen ejecutivo post-calibración: distribución final, alertas por área y por manager, y el detalle de cada cambio. Descarga el reporte en HTML o PDF, y exporta el CSV final para subirlo a tu HRIS.',
  },
]

export function TopBar() {
  const { activeTab, setTab, clearAll, resetToSample, setTab: goToTab } = useStore()
  const [open, setOpen] = useState(false)
  const [privOpen, setPrivOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const handleStart = () => {
    clearAll()
    setOpen(false)
    goToTab('datos')
  }

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        height: 52,
        gap: 24,
        background: 'var(--island-bg)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src="/logo.png" alt="Calibración BP" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.1 }}>
              Calibración BP
            </div>
            <a
              href="https://www.linkedin.com/in/mart%C3%ADn-ross-fernandez-897605211/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.03em', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Free HR Stack · By Martín Ross
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '6px 16px',
                borderRadius: 7,
                border: 'none',
                fontSize: 13,
                fontWeight: activeTab === t.id ? 600 : 400,
                cursor: 'pointer',
                background: activeTab === t.id ? 'var(--primary-bg)' : 'transparent',
                color: activeTab === t.id ? 'var(--primary)' : 'var(--text2)',
                transition: 'all 0.12s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Reset to sample */}
          <button
            onClick={() => setResetOpen(true)}
            title="Volver a datos de muestra"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32,
              background: 'transparent',
              color: T.text3,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.primary; (e.currentTarget as HTMLElement).style.color = T.primary }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.text3 }}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setPrivOpen(true)}
            title="Seguridad de datos"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent',
              color: T.text3,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.primary; (e.currentTarget as HTMLElement).style.color = T.primary }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.text3 }}
          >
            <ShieldCheck size={13} />
            Seguridad de datos
          </button>
          <button
            onClick={() => setOpen(true)}
            style={{
              background: T.primary,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Instrucciones
          </button>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {resetOpen && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setResetOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(17,24,39,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{
            background: T.surface, borderRadius: 16,
            width: '100%', maxWidth: 420,
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18 }}>⚠️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text1, marginTop: 6 }}>
                  ¿Volver a los datos de muestra?
                </div>
                <div style={{ fontSize: 13, color: T.text2, marginTop: 8, lineHeight: 1.65, maxWidth: 340 }}>
                  Se eliminará toda la información que hayas cargado o modificado — empleados, OKRs y calibraciones — y se volverá a mostrar la información ficticia de muestra.
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginTop: 10 }}>
                  Esta acción no se puede deshacer.
                </div>
              </div>
              <button
                onClick={() => setResetOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.text3, flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setResetOpen(false)}
                style={{
                  background: 'transparent', color: T.text2,
                  border: `1px solid ${T.border}`, borderRadius: 9,
                  padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Volver atrás
              </button>
              <button
                onClick={() => { resetToSample(); setResetOpen(false); goToTab('datos') }}
                style={{
                  background: '#DC2626', color: 'white',
                  border: 'none', borderRadius: 9,
                  padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Sí, restablecer muestra
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Privacy modal */}
      {privOpen && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPrivOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(17,24,39,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{
            background: T.surface,
            borderRadius: 16,
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px 16px',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: '#F0FDF4', border: '1px solid #BBF7D0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <ShieldCheck size={17} color="#15803D" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text1 }}>
                  Tus datos están en tu navegador
                </div>
              </div>
              <button
                onClick={() => setPrivOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.text3, flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, margin: 0 }}>
                Tus datos se almacenan <strong style={{ color: T.text1 }}>únicamente en el localStorage de este navegador</strong>. No se envían a ningún servidor ni son visibles para terceros.
              </p>
              <div style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 12, color: '#78350F', lineHeight: 1.65,
              }}>
                ⚠️ <strong>Ten en cuenta</strong> que no están cifrados en disco: cualquier persona con acceso a tu computadora o perfil de navegador podría leerlos.
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, margin: 0 }}>
                Tratalo como un <strong style={{ color: T.text1 }}>documento de planificación personal</strong> — no como un sistema de registro definitivo. Si estás en una computadora compartida, limpiá el almacenamiento cuando termines.
              </p>
            </div>
            <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPrivOpen(false)}
                style={{
                  background: T.primary, color: 'white',
                  border: 'none', borderRadius: 9,
                  padding: '9px 20px',
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Instructions modal — rendered in body via portal to escape overflow:hidden */}
      {open && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(17,24,39,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{
            background: T.surface,
            borderRadius: 16,
            width: '100%', maxWidth: 560,
            boxShadow: '0 24px 64px rgba(124,58,237,0.18)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px 0',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 22, marginBottom: 4 }}>👋</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>
                  ¡Hola! Bienvenido a Calibración HR
                </div>
                <div style={{ fontSize: 13, color: T.text2, marginTop: 6, lineHeight: 1.6, maxWidth: 440 }}>
                  Esta herramienta te ayuda a estructurar tus sesiones de calibración y justificar
                  evaluaciones en base a los resultados del negocio — tanto si eres de HR como si
                  eres manager.
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.text3, flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Steps */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {STEPS.map(s => (
                <div key={s.n} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: T.primaryBg,
                  border: `1px solid ${T.primaryMid}`,
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: T.primary, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    {s.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text1, marginBottom: 4 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                      {s.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '0 24px 20px',
              borderTop: `1px solid ${T.border}`,
              paddingTop: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 11, color: T.text3, maxWidth: 300 }}>
                Al hacer clic en "Comenzar" se eliminarán los datos de muestra
                y podrás cargar los tuyos.
              </div>
              <button
                onClick={handleStart}
                style={{
                  background: T.primary, color: 'white',
                  border: 'none', borderRadius: 9,
                  padding: '10px 22px',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Comenzar →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
