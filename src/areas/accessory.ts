import { Area } from '../areas'

export const areaNames: { [key: string]: string } = {
  hat: 'hat',
  hair: 'hair',
  ears: 'ears',
  face: 'face',
  neck: 'neck',
  top: 'top',
  bottom: 'bottom',
  back: 'back',
  shoe: 'shoe',
  arm: 'arm',
  tools: 'tools',
  pet: 'pet',
  none: 'none'
}

export const nsfwAreaNames: { [key: string]: string } = {
  genitals: 'genitals'
}

export const nsfwAreas: { [key: string]: Area } = {
  [nsfwAreaNames.genitals]: {
    namePlural: 'Genitals',
    tags: ['penis', 'vagina', 'genitals']
  }
}

const areas: { [key: string]: Area } = {
  [areaNames.hat]: {
    namePlural: 'Hats',
    tags: ['hat', 'beanie', 'crown', 'halo', 'antenna', 'antennae', 'horns']
  },
  [areaNames.hair]: {
    namePlural: 'Hair',
    tags: ['hair']
  },
  [areaNames.ears]: {
    namePlural: 'Ears',
    tags: ['ears']
  },
  [areaNames.face]: {
    namePlural: 'Face',
    tags: [
      'face',
      'glasses',
      'sunglasses',
      'whiskers',
      'mask',
      'eyes',
      'headset',
      'vr_headset',
      'monocle',
      'ears',
      'ear',
      'earing',
      'muzzle',
      'piercing'
    ]
  },
  [areaNames.neck]: {
    namePlural: 'Neck',
    tags: [
      'bandana',
      'neck',
      'necklace',
      'chain',
      'neckwear',
      'collar',
      'scarf',
      'bowtie',
      'tie'
    ]
  },
  [areaNames.top]: {
    namePlural: 'Tops',
    tags: [
      'shirt',
      'hoodie',
      'dress',
      'harness',
      'tshirt',
      'cape',
      'suit',
      'jacket',
      'coat',
      'sweater',
      'armor',
      'gym_clothes',
      'tank_top'
    ]
  },
  [areaNames.bottom]: {
    namePlural: 'Bottoms',
    tags: [
      'pants',
      'jeans',
      'underwear',
      'shorts',
      'dress',
      'skirt',
      'apron',
      'swimsuit',
      'bikini',
      'trunks'
    ]
  },
  [areaNames.back]: {
    namePlural: 'Back',
    tags: ['back', 'bag', 'backpack', 'cape', 'tail', 'wings', 'wing']
  },
  [areaNames.shoe]: {
    namePlural: 'Feet',
    tags: ['socks', 'shoes', 'sandals', 'stockings', 'footwear']
  },
  [areaNames.arm]: {
    namePlural: 'Arms',
    tags: [
      'arms',
      'arm',
      'bracelet',
      'armband',
      'watch',
      'gloves',
      'ring',
      'hand',
      'finger',
      'claws'
    ]
  },
  [areaNames.tools]: {
    namePlural: 'Tools',
    tags: [
      'tool',
      'weapon',
      'knife',
      'sword',
      'blade',
      'shield',
      'bow',
      'gun',
      'hammer',
      'leash',
      'lead',
      'camera'
    ]
  },
  [areaNames.pet]: {
    namePlural: 'Companions',
    tags: ['pet', 'companion']
  }
}

export default areas
