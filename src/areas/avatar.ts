import type { Areas } from '../areas'

export const areaNames = {
  avatars: 'avatars',
}

const areas: Areas = {
  [areaNames.avatars]: {
    namePlural: 'Avatars',
    tags: [
      'quest_compatible',
      'separate_quest_model',
      'less_than_70k_pollies',
      'custom_animations',
      'custom_idle_animation',
      'custom_emotes',
      'custom_gestures',
      'plantigrade',
      'digigrade',
      'cartoony',
      'very_realistic',
      'fur',
      'scales',
      'feathers',
      'toggle_accessories',
      'customizable_body',
      'clothes_included',
      'hand_colliders',
      'multiple_eye_colors',
    ],
  },
}

export default areas
