export interface RatingMeta {
  name: string
  title: string
  description: string
}

export const allowedRatings: RatingMeta[] = [
  {
    name: 'customizability',
    title: 'Customizability',
    description:
      'How easy it is to customize the asset out of the box. eg. with blendshapes, included clothing'
  },
  {
    name: 'easeOfUse',
    title: 'Ease Of Use',
    description:
      'How easy it is to import and use the asset. eg. is there a Unity scene included?'
  },
  {
    name: 'appearance',
    title: 'Appearance',
    description: 'How does the asset look? Does it look good or bad?'
  },
  {
    name: 'performance',
    title: 'Performance',
    description:
      'How well does the asset perform in-game? eg. for an avatar you could use the VRChat performance rating'
  }
]

export const avatarRatings: RatingMeta[] = [
  {
    name: 'rigging',
    title: 'Rigging',
    description:
      'The rigging of the avatar including Full Body Tracking. Does the head clip in weird ways? Does FBT screw up?'
  },
  {
    name: 'gestures',
    title: 'Gestures',
    description:
      'How good are the gestures? Does it come with many? Does each hand have its own gestures? Or only a couple?'
  },
  {
    name: 'animations',
    title: 'Animations',
    description:
      'How good are the animations? Does it come with many? eg. dance animations, toggling clothing, etc.'
  }
]
