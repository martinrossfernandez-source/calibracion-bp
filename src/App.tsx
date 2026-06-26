import type { CSSProperties } from 'react'
import { useStore } from './store/useStore'
import { TopBar } from './components/TopBar'
import { DataTab } from './components/tabs/DataTab'
import { CurvasTab } from './components/tabs/CurvasTab'
import { NineBoxTab } from './components/tabs/NineBoxTab'
import { PeersLensTab } from './components/tabs/PeersLensTab'
import { AnalisisTab } from './components/tabs/AnalisisTab'

const GAP = 10
const PADDING = 10
const RADIUS = 18

const island: CSSProperties = {
  borderRadius: RADIUS,
  boxShadow: '0 4px 24px rgba(124,58,237,0.12), 0 1px 4px rgba(124,58,237,0.08)',
  overflow: 'hidden',
  background: 'var(--island-bg)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid var(--island-border)',
}

export default function App() {
  const { activeTab } = useStore()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      padding: PADDING,
      gap: GAP,
      boxSizing: 'border-box',
    }}>
      {/* TopBar */}
      <div style={{ ...island, flexShrink: 0 }}>
        <TopBar />
      </div>

      {/* Main content */}
      <div style={{ ...island, flex: 1, overflow: 'auto', minHeight: 0 }}>
        {activeTab === 'datos'    && <DataTab />}
        {activeTab === 'curvas'   && <CurvasTab />}
        {activeTab === 'ninebox'  && <NineBoxTab />}
        {activeTab === 'peers'    && <PeersLensTab />}
        {activeTab === 'analisis' && <AnalisisTab />}
      </div>
    </div>
  )
}
