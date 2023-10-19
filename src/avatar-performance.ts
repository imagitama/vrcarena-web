export enum PerformanceRank {
  Excellent,
  Good,
  Medium,
  Poor,
  VeryPoor
}

interface PerformanceRankRequirements {
  polygonCount: number
  boneCount: number
  materialSlotCount: number
  skinnedMeshCount: number
}

export const performanceRankRequirements: {
  [rank: number]: PerformanceRankRequirements
} = {
  [PerformanceRank.Excellent]: {
    polygonCount: 100,
    boneCount: 100,
    materialSlotCount: 100,
    skinnedMeshCount: 100
  },
  [PerformanceRank.Good]: {
    polygonCount: 100,
    boneCount: 100,
    materialSlotCount: 100,
    skinnedMeshCount: 100
  },
  [PerformanceRank.Medium]: {
    polygonCount: 100,
    boneCount: 100,
    materialSlotCount: 100,
    skinnedMeshCount: 100
  },
  [PerformanceRank.Poor]: {
    polygonCount: 100,
    boneCount: 100,
    materialSlotCount: 100,
    skinnedMeshCount: 100
  },
  [PerformanceRank.VeryPoor]: {
    polygonCount: 100,
    boneCount: 100,
    materialSlotCount: 100,
    skinnedMeshCount: 100
  }
}

const pcRankSuffix = '_pc_rank'
const questRankSuffix = '_quest_rank'

export const getPerformanceRankLabel = (
  value: PerformanceRank
): string | null => {
  switch (value) {
    case PerformanceRank.Excellent:
      return 'Excellent'
    case PerformanceRank.Good:
      return 'Good'
    case PerformanceRank.Medium:
      return 'Medium'
    case PerformanceRank.Poor:
      return 'Poor'
    case PerformanceRank.VeryPoor:
      return 'Very Poor'
    default:
      return null
  }
}

const getPerformanceRankFromValue = (value: any): PerformanceRank | null => {
  switch (value) {
    case 'excellent':
      return PerformanceRank.Excellent
    case 'good':
      return PerformanceRank.Good
    case 'medium':
      return PerformanceRank.Medium
    case 'poor':
      return PerformanceRank.Poor
    case 'verypoor':
      return PerformanceRank.VeryPoor
    default:
      return null
  }
}

export const getAvatarPcPerformanceRankFromTags = (
  tags: string[]
): PerformanceRank | null => {
  for (const tag of tags) {
    if (tag.includes(pcRankSuffix)) {
      return getPerformanceRankFromValue(tag.split(pcRankSuffix).shift())
    }
  }

  return null
}

export const getAvatarQuestPerformanceRankFromTags = (
  tags: string[]
): PerformanceRank | null => {
  for (const tag of tags) {
    if (tag.includes(questRankSuffix)) {
      return getPerformanceRankFromValue(tag.split(questRankSuffix).shift())
    }
  }

  return null
}
