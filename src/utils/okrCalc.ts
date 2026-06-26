import type { OKRSet, CategoryId } from '../types'

export function okrAvg(okrs: OKRSet): number {
  if (!okrs.objectives.length) return 50
  const avgs = okrs.objectives.map((o) =>
    o.keyResults.length ? o.keyResults.reduce((s, kr) => s + kr.completion, 0) / o.keyResults.length : 50
  )
  return avgs.reduce((a, b) => a + b, 0) / avgs.length
}

export function calcOKRScore(companyOKRs: OKRSet, deptOKRs: OKRSet): number {
  return Math.max(0, Math.min(100, okrAvg(companyOKRs) * 0.4 + okrAvg(deptOKRs) * 0.6))
}

// combinedScore: company(40%) + dept(60%) — sets context for lower cats
// deptScore: dept OKR only — drives how much room there is for top performers
export function idealRange(combinedScore: number, deptScore: number): Record<CategoryId, { min: number; max: number }> {
  const p  = combinedScore / 100
  const dp = deptScore / 100
  return {
    // Cats 1+2: the worse the overall context, the more people are expected here
    critico:    { min: Math.max(2, Math.round(8  * (1 - p * 0.7))), max: Math.round(12 * (1 - p * 0.5)) },
    desarrollo: { min: Math.max(5, Math.round(20 * (1 - p * 0.5))), max: Math.round(28 * (1 - p * 0.4)) },
    // Cat 3: stable backbone regardless of OKRs
    core:       { min: 48, max: 62 },
    // Cats 4+5: directly driven by dept OKR — low dept OKR = very little room for top performers
    alto:       { min: Math.round(3  + 10 * dp), max: Math.round(6  + 18 * dp) },
    promesa:    { min: Math.round(1  + 4  * dp), max: Math.round(2  + 7  * dp) },
  }
}
