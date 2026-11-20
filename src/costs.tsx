import React from 'react'

export interface Cost {
  id: string
  label: React.ReactElement
  monthlyCost?: number
  yearlyCost?: number
  olderCosts?: React.ReactElement
}

export const costs: Cost[] = [
  {
    id: 'netlify',
    label: (
      <>
        <strong>Deployment and hosting</strong>
        <br />
        Netlify
      </>
    ),
    monthlyCost: 19,
  },
  {
    id: 'supabase',
    label: (
      <>
        <strong>Database</strong>
        <br />
        Supabase
      </>
    ),
    monthlyCost: 60,
  },
  {
    id: 'domain',
    label: (
      <>
        <strong>Domain name and email address</strong>
        <br />
        Namecheap
      </>
    ),
    yearlyCost: 36,
  },
]

export const totalCostPerMonth = costs.reduce(
  (finalCost, { monthlyCost, yearlyCost }) =>
    finalCost + (monthlyCost || (yearlyCost ? yearlyCost / 12 : 0)),
  0
)

export const patreonTax = 0.1 // 10%
