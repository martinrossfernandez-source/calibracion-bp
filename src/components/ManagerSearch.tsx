import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

const T = {
  primary:   '#7C3AED',
  primaryBg: '#F5F3FF',
  surface:   '#FFFFFF',
  border:    '#E5E7EB',
  text1:     '#111827',
  text2:     '#4B5563',
  text3:     '#9CA3AF',
}

interface Props {
  value: string          // current selection ('Todos' = none)
  options: string[]      // full list (without 'Todos')
  onChange: (v: string) => void
  placeholder?: string
}

export function ManagerSearch({ value, options, onChange, placeholder = 'Manager...' }: Props) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const containerRef        = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  const active = value !== 'Todos'

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (name: string) => {
    onChange(name)
    setOpen(false)
    setQuery('')
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('Todos')
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 30) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: `1px solid ${active ? T.primary : T.border}`,
          borderRadius: 8, padding: '5px 8px',
          background: active ? T.primaryBg : T.surface,
          cursor: 'pointer', minWidth: 160,
        }}
      >
        <Search size={13} color={active ? T.primary : T.text3} style={{ flexShrink: 0 }} />
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder={active ? value : placeholder}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 12, color: T.text1, width: 120, minWidth: 0,
            }}
          />
        ) : (
          <span style={{
            fontSize: 12, flex: 1,
            color: active ? T.primary : T.text3,
            fontWeight: active ? 700 : 400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {active ? value : placeholder}
          </span>
        )}
        {active && (
          <X size={12} color={T.primary} onClick={clear} style={{ flexShrink: 0, cursor: 'pointer' }} />
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          minWidth: 200, maxHeight: 220, overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 14px', fontSize: 12, color: T.text3 }}>Sin coincidencias</div>
          ) : (
            filtered.map(name => (
              <div
                key={name}
                onMouseDown={() => select(name)}
                style={{
                  padding: '8px 14px', fontSize: 12, cursor: 'pointer',
                  color: name === value ? T.primary : T.text1,
                  fontWeight: name === value ? 700 : 400,
                  background: name === value ? T.primaryBg : 'transparent',
                  borderBottom: `1px solid ${T.border}`,
                }}
                onMouseEnter={e => { if (name !== value) (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = name === value ? T.primaryBg : 'transparent' }}
              >
                {name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
