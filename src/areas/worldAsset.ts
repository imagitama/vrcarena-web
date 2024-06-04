import type { Areas } from '../areas'

export const areaNames = {
  ui: 'ui',
  games: 'games',
  clocks: 'clocks',
  video_player: 'video_player',
  udon_scripts: 'udon_scripts',
  join_and_leave: 'join_and_leave',
}

const areas: Areas = {
  [areaNames.ui]: {
    namePlural: 'UI',
    tags: ['ui', 'button', 'buttons', 'text_input', 'keyboard'],
  },
  [areaNames.clocks]: {
    namePlural: 'Clocks and Time',
    tags: ['clock', 'time', 'timer'],
  },
  [areaNames.games]: {
    namePlural: 'Games',
    tags: ['game', 'pool_table', 'drinking_game', 'musical_instrument'],
  },
  [areaNames.video_player]: {
    namePlural: 'Video Players',
    tags: ['video_player'],
  },
  [areaNames.join_and_leave]: {
    namePlural: 'Join and Leave Effects',
    tags: ['join', 'leave', 'join_and_leave_effect'],
  },
}

export default areas
