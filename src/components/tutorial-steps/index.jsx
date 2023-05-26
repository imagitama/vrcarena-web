import React from 'react'
import Markdown from '../markdown'
import { makeStyles } from '@material-ui/core/styles'

import Paper from '../paper'
import ImageGallery from '../image-gallery'
import { TutorialStepFieldNames } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  step: {
    marginTop: '1rem'
  },
  number: {
    fontSize: '150%'
  },
  title: {
    fontWeight: 'bold',
    fontSize: '125%'
  },
  description: {
    marginTop: '0.5rem'
  }
})

function Step({ step, number }) {
  const classes = useStyles()
  return (
    <Paper className={classes.step}>
      <div className={classes.title}>
        <span className={classes.number}>{number}.</span>{' '}
        {step[TutorialStepFieldNames.title]}
      </div>
      <div className={classes.description}>
        <Markdown source={step[TutorialStepFieldNames.description]} />
      </div>
      {step[TutorialStepFieldNames.imageUrls] && (
        <ImageGallery urls={[step[TutorialStepFieldNames.imageUrls]]} />
      )}
    </Paper>
  )
}

export default ({ steps }) => (
  <div>
    {steps.map((step, idx) => (
      <Step
        key={step[TutorialStepFieldNames.title]}
        step={step}
        number={idx + 1}
      />
    ))}
  </div>
)
