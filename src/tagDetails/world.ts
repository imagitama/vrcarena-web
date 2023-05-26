import { TagDetails } from '../utils/tags'

export const categories = {
  Features: 'Features',
  Layout: 'Layout',
  Games: 'Games'
}

const tagDetails: TagDetails[] = [
  // features
  {
    tag: 'background_music',
    category: categories.Features,
    description: 'Plays background music'
  },
  {
    tag: 'bed',
    category: categories.Features,
    description: 'Has a bed'
  },
  {
    tag: 'invisible_chair',
    category: categories.Features,
    description:
      'Has an "invisible chair" you can pick up to arrange other players'
  },
  {
    tag: 'video_player',
    category: categories.Features,
    description: 'Has a video player'
  },
  {
    tag: 'video_player_playlists',
    category: categories.Features,
    description: 'Has a video player that supports playlists'
  },
  {
    tag: 'mirror',
    category: categories.Features,
    description: 'Has at least one mirror'
  },
  {
    tag: 'wide_mirror',
    category: categories.Features,
    description: 'Has a very wide mirror'
  },
  {
    tag: 'tall_mirror',
    category: categories.Features,
    description: 'Has a very tall mirror'
  },
  {
    tag: 'low_rez_mirror',
    category: categories.Features,
    description: 'Has a low resolution mirror (aka 1K)'
  },
  {
    tag: 'transparent_mirror',
    category: categories.Features,
    description: 'Has a "transparent" mirror where the scenery is hidden'
  },
  {
    tag: 'portable_mirror',
    category: categories.Features,
    description: 'Has a mirror you can pickup and re-position'
  },
  {
    tag: 'pens',
    category: categories.Features,
    description: 'Has pens to draw with'
  },
  {
    tag: 'pens_toggle',
    category: categories.Features,
    description: 'Has a button to toggle pens'
  },
  {
    tag: 'pens_sync_on_load',
    category: categories.Features,
    description: 'Has pens that sync with other players when they join'
  },
  {
    tag: 'post_processing_ui',
    category: categories.Features,
    description: 'Has a UI to change the post processing'
  },
  {
    tag: 'chairs',
    category: categories.Features,
    description: 'Has interactive chairs for you to sit on'
  },
  {
    tag: 'chairs_toggle',
    category: categories.Features,
    description: 'Has a button to toggle interactive chairs'
  },
  {
    tag: 'roomba',
    category: categories.Features,
    description: 'Has a roomba that drives around to clean the floor'
  },
  {
    tag: 'chairs_infront_of_mirror',
    category: categories.Features,
    description: 'Has interactive chairs placed infront of a mirror'
  },
  {
    tag: 'flight_system',
    category: categories.Features,
    description: 'Has a flight system (aka pull the trigger to fly around)'
  },
  {
    tag: 'driving_system',
    category: categories.Features,
    description: 'Has a driving system (aka pull the trigger to accelerate)'
  },
  {
    tag: 'jetpack',
    category: categories.Features,
    description: 'Has a jetpack system (aka pull the trigger to fly around)'
  },
  // layout
  {
    tag: 'islands',
    category: categories.Layout,
    description: 'Has 1 or more islands with surrounding water'
  },
  {
    tag: 'outer_space',
    category: categories.Layout,
    description: 'Is set in space'
  },
  {
    tag: 'underwater',
    category: categories.Layout,
    description: 'Is set underwater'
  },
  {
    tag: 'multiple_floors',
    category: categories.Layout,
    description: 'Has multiple floors in a building'
  },
  {
    tag: 'lobby',
    category: categories.Layout,
    description: 'Has a lobby like a hotel'
  },
  {
    tag: 'outdoors',
    category: categories.Layout,
    description: 'Is set mainly outdoors'
  },
  {
    tag: 'indoors',
    category: categories.Layout,
    description: 'Is set mainly indoors'
  },
  {
    tag: 'dynamic_lighting',
    category: categories.Layout,
    description: 'Has lighting that changes'
  },
  {
    tag: 'kitchen',
    category: categories.Layout,
    description: 'Has a kitchen room'
  },
  {
    tag: 'bedroom',
    category: categories.Layout,
    description: 'Has a bedroom'
  },
  {
    tag: 'loungeroom',
    category: categories.Layout,
    description: 'Has a loungeroom'
  },
  {
    tag: 'hallway',
    category: categories.Layout,
    description: 'Has a hallway'
  },
  // games
  {
    tag: 'pool_table',
    category: categories.Games,
    description: 'Has an interactive pool table'
  },
  {
    tag: 'darts',
    category: categories.Games,
    description: 'Has an interactive dart board'
  },
  {
    tag: 'beer_pong',
    category: categories.Games,
    description: 'Has an interactive beer pong table'
  },
  {
    tag: 'ping_pong',
    category: categories.Games,
    description: 'Has an interactive ping pong table'
  },
  {
    tag: 'horror_game',
    category: categories.Games,
    description: 'The world is a horror game'
  },
  {
    tag: 'shooting_game',
    category: categories.Games,
    description: 'The world is a shooting game'
  },
  {
    tag: 'puzzle_game',
    category: categories.Games,
    description: 'The world is a puzzle game'
  }
]

export default tagDetails
