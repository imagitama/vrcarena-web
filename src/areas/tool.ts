import type { Areas } from '../areas'

const areaNames = {
  mods: 'mods',
  avatar_creation: 'avatar_creation',
  scripts: 'scripts',
  worlds: 'worlds',
  converter: 'converter',
}

const areas: Areas = {
  [areaNames.mods]: {
    namePlural: 'Mods',
    tags: ['mod', 'steamvr'],
  },
  [areaNames.avatar_creation]: {
    namePlural: 'Avatar Creation',
    tags: ['avatars', 'avatar_creation'],
  },
  [areaNames.worlds]: {
    namePlural: 'Worlds',
    tags: ['world_creation', 'world_script'],
  },
  [areaNames.converter]: {
    namePlural: 'Converters',
    tags: ['converter'],
  },
  [areaNames.scripts]: {
    namePlural: 'Scripts',
    tags: ['script'],
  },
}

export default areas
