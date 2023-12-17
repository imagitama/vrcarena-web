import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ReactComponent as AwtterLineart } from '../../assets/images/lineart/awtter.svg'
import { ReactComponent as TaidumLineart } from '../../assets/images/lineart/taidum.svg'
import { ReactComponent as RexouiumLineart } from '../../assets/images/lineart/rexouium.svg'
import { ReactComponent as AvaliLineart } from '../../assets/images/lineart/avali.svg'

const options = [AwtterLineart, TaidumLineart, RexouiumLineart, AvaliLineart]

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    padding: '20%',
    background: '#626262',
    overflow: 'hidden',
    '& svg': {
      width: '100%',
      height: '100%',
      display: 'block',
      opacity: 1,
      '& path': {
        stroke: '#FFF !important',
      },
    },
  },
  option_0: {
    '& svg': {
      transform: 'scale(0.8)',
    },
  },
  option_1: {
    '& svg': {
      transform: 'scale(0.9)',
    },
  },
}))

async function generateRandomIndex(
  inputString: string,
  optionsCount: number
): Promise<number> {
  // Convert the input string to an array buffer
  const encoder = new TextEncoder()
  const data = encoder.encode(inputString)

  // Calculate the hash of the input string using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convert the hash buffer to a numeric value
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const numericHash = hashArray.reduce((acc, byte) => (acc << 8) + byte, 0)

  // Use the numeric hash to seed the random number generator
  let randomSeed = numericHash % optionsCount

  randomSeed = randomSeed < 0 ? randomSeed + options.length : randomSeed

  return randomSeed

  // // Use the seeded random number to pick an option
  // const selectedOption = options[randomSeed];

  // return selectedOption;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const DefaultAvatar = ({
  stringForDecision,
}: {
  stringForDecision?: string
}) => {
  const [idx, setIdx] = useState<null | number>(null)

  useEffect(() => {
    ;(async () => {
      const index = stringForDecision
        ? await generateRandomIndex(stringForDecision, options.length)
        : getRandomInt(0, options.length - 1)
      console.debug(`INDEX`, stringForDecision, index)
      setIdx(index)
    })()
  }, [stringForDecision])

  const classes = useStyles()
  return (
    <div
      className={`${classes.root} ${
        // @ts-ignore
        idx !== null ? classes[`option_${idx}`] : ''
      }`}>
      {idx !== null ? React.createElement(options[idx]) : null}
    </div>
  )
}

export default DefaultAvatar
