export const areaNames = {
  laying_down: 'laying_down',
  sitting: 'sitting',
  sleeping: 'sleeping',
  moving: 'moving',
  zero_gravity: 'zero_gravity',
  dancing: 'dancing',
  subtle: 'subtle',
  facial: 'facial'
}

export default {
  [areaNames.laying_down]: {
    namePlural: 'Laying Down',
    tags: ['laying']
  },
  [areaNames.sitting]: {
    namePlural: 'Sitting',
    tags: ['sitting']
  },
  [areaNames.sleeping]: {
    namePlural: 'Sleeping',
    tags: ['sleeping']
  },
  [areaNames.moving]: {
    namePlural: 'Movement',
    tags: ['walking', 'running']
  },
  [areaNames.zero_gravity]: {
    namePlural: 'Zero G',
    tags: ['flying', 'floating', 'falling']
  },
  [areaNames.dancing]: {
    namePlural: 'Dancing',
    tags: ['dance', 'dancing', 'song']
  },
  [areaNames.subtle]: {
    namePlural: 'Subtle Effects',
    tags: [
      'idle',
      'idle_animation',
      'breathing',
      'ear_twitch',
      'tail_twitch',
      'subtle',
      'tail_wag'
    ]
  },
  [areaNames.facial]: {
    namePlural: 'Facial Expressions',
    tags: ['face', 'smile', 'sad', 'frown', 'crying', 'happy']
  }
}
