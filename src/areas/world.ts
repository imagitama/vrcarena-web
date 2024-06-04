import { Areas } from '../areas'

export const areaNames = {
  chill: 'chill',
  media: 'media',
  game: 'game',
  avatars: 'avatars',
  portals: 'portals',
  promo: 'promo',
  experimental: 'experimental',
  demo: 'demo',
  roleplay: 'roleplay',
}

const areas: Areas = {
  [areaNames.chill]: {
    namePlural: 'Chill',
    tags: ['chill'],
  },
  [areaNames.media]: {
    namePlural: 'Media',
    tags: ['movies', 'music_player', 'music', 'visualizer'],
  },
  [areaNames.game]: {
    namePlural: 'Games',
    tags: ['game'],
  },
  [areaNames.avatars]: {
    namePlural: 'Avatars',
    tags: ['avatar_world'],
  },
  [areaNames.portals]: {
    namePlural: 'World Portals',
    tags: ['portal_world'],
  },
  [areaNames.promo]: {
    namePlural: 'Promotional',
    tags: ['promo'],
  },
  [areaNames.demo]: {
    namePlural: 'Technical Demos',
    tags: ['tech_demo'],
  },
  [areaNames.experimental]: {
    namePlural: 'Experimental',
    tags: ['experiment'],
  },
  [areaNames.roleplay]: {
    namePlural: 'Roleplay',
    tags: ['roleplay'],
  },
}

export default areas
