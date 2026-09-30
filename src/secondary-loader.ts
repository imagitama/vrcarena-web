export const loadSecondary = () => import('./secondary')

export type Secondary = Awaited<ReturnType<typeof loadSecondary>>
