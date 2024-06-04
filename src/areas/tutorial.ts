import type { Areas } from '../areas'

export const areaNames = {
  unity: 'unity',
  modelling: 'modelling',
  shaders: 'shaders',
  texturing: 'texturing',
  modding: 'modding',
  vrchat: 'vrchat',
}

const areas: Areas = {
  [areaNames.unity]: {
    namePlural: 'Unity',
    tags: ['unity', 'animating'],
  },
  [areaNames.modelling]: {
    namePlural: 'Modelling',
    tags: ['modelling', 'blender'],
  },
  [areaNames.shaders]: {
    namePlural: 'Shaders',
    tags: ['shaders', 'shader'],
  },
  [areaNames.texturing]: {
    namePlural: 'Texturing',
    tags: ['texturing', 'subtance_painter'],
  },
  [areaNames.modding]: {
    namePlural: 'Modding',
    tags: ['modding', 'mods'],
  },
  [areaNames.vrchat]: {
    namePlural: 'VR Games',
    tags: ['vrchat', 'neosvr', 'chilloutvr', 'beat_saber', 'steamvr'],
  },
}

export default areas
