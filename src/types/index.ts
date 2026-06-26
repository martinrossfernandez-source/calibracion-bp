export type PerformanceLevel = 'alto' | 'medio' | 'bajo'
export type PotentialLevel = 'alto' | 'medio' | 'bajo'

export type CategoryId =
  | 'critico'      // A3
  | 'desarrollo'   // A1, A2, B3, C3
  | 'core'         // B2
  | 'alto'         // B1, C2
  | 'promesa'      // C1

export type BoxPosition = {
  performance: PerformanceLevel
  potential: PotentialLevel
}

export const CATEGORY_FROM_BOX: Record<string, CategoryId> = {
  'bajo-bajo':  'critico',
  'bajo-medio': 'desarrollo',
  'bajo-alto':  'desarrollo',
  'medio-bajo': 'desarrollo',
  'medio-medio':'core',
  'medio-alto': 'alto',
  'alto-bajo':  'desarrollo',
  'alto-medio': 'alto',
  'alto-alto':  'promesa',
}

export function boxKey(performance: PerformanceLevel, potential: PotentialLevel) {
  return `${performance}-${potential}`
}

export function categoryFromBox(performance: PerformanceLevel, potential: PotentialLevel): CategoryId {
  return CATEGORY_FROM_BOX[boxKey(performance, potential)] ?? 'core'
}

export type Employee = {
  id: string
  name: string
  email?: string
  area: string
  role: string
  managerName?: string
  managerEmail?: string
  performance: PerformanceLevel
  potential: PotentialLevel
  prevPerformance?: PerformanceLevel
  prevPotential?: PotentialLevel
  prevRole?: string
  grade?: string
  country?: string
  gender?: string
  salary?: number
  hireDate?: string
  notes?: string
  // Calibration overrides (set during calibration session)
  calibratedPerformance?: PerformanceLevel
  calibratedPotential?: PotentialLevel
}

export type KeyResult = {
  id: string
  text: string
  completion: number // 0–100
}

export type Objective = {
  id: string
  text: string
  weight?: number // 0–100, only used when OKRSet.enableWeights is true
  keyResults: KeyResult[]
}

export type OKRSet = {
  objectives: Objective[]
  enableWeights: boolean
}

export type CategoryNames = Record<CategoryId, string>

export const DEFAULT_CATEGORY_NAMES: CategoryNames = {
  critico:    '1. Desempeño insuficiente',
  desarrollo: '2. Desarrollo requerido',
  core:       '3. Desempeño esperado',
  alto:       '4. Alto desempeño',
  promesa:    '5. Alta promesa',
}

export const CATEGORY_DISTRIBUTION: Record<CategoryId, { min: number; max: number }> = {
  critico:    { min: 3,  max: 7  },
  desarrollo: { min: 18, max: 25 },
  core:       { min: 50, max: 60 },
  alto:       { min: 12, max: 17 },
  promesa:    { min: 5,  max: 8  },
}

export type AppTab = 'datos' | 'curvas' | 'ninebox' | 'peers' | 'analisis'
