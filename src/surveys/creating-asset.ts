import { Survey } from './'

const survey: Survey = {
  title: 'Creating an asset',
  allowFinalComments: true,
  questions: [
    {
      question: 'How long did it take for you to create your asset?',
      options: ['Less than 1 min', '1-2 mins', '3-4 mins', '5 mins+'],
      allowComments: false
    },
    {
      question: 'What was the worst part of creating your asset?',
      options: [
        'Syncing with Gumroad/Booth/etc.',
        'Uploading thumbnail',
        'Entering description',
        'Selecting author',
        'Selecting species',
        'Uploading banner',
        'Attaching files',
        'Linking another asset',
        'Adding tags',
        'Other (see comments)'
      ],
      commentsTitle: 'Why?'
    },
    {
      question: 'Are you creating multiple assets at once?',
      options: ['Only 1', '1-2', '3+'],
      commentsTitle:
        'If more than 1, what slows you down with creating multiple assets?'
    },
    {
      question: 'Are you a Patreon supporter?',
      options: ['Yes', 'No'],
      commentsTitle: 'If you answered no, why not?'
    },
    {
      question: "Should assets include any more info that they don't already?"
    },
    {
      question: 'What is your preferred way of selling products?',
      options: [
        'Gumroad',
        'Booth',
        'Itch.io',
        '3D model sites (CGTrader, TurboSquid, Sketchfab, etc.)',
        'Other (see comments)'
      ]
    }
  ]
}

export default survey
