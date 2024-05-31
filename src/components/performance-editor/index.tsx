import MenuItem from '@material-ui/core/MenuItem'
import { styled } from '@material-ui/styles'
import SaveIcon from '@material-ui/icons/Save'
import React, { useState } from 'react'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows'
import { makeStyles } from '@material-ui/core/styles'

import { trackAction } from '../../analytics'
import {
  getAvatarPcPerformanceRankFromTags,
  getAvatarQuestPerformanceRankFromTags,
  PerformanceRank,
  getPerformanceRankLabel,
} from '../../avatar-performance'
import { handleError } from '../../error-handling'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../modules/assets'
import Button from '../button'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import Select from '../select'
import SuccessMessage from '../success-message'
import { ReactComponent as OculusIcon } from '../../assets/images/icons/oculus.svg'

const useStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
    '&:last-child': {
      marginBottom: 0,
    },
    '& svg': {
      height: '1em',
      fontSize: '100%',
    },
  },
  platformName: {
    fontSize: '125%',
    fontWeight: 'bold',
    textAlign: 'right',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    '& svg': {
      marginRight: '0.5rem',
    },
  },
  quest: {
    '& svg path': {
      fill: '#FFF',
    },
  },
  contents: {
    width: '80%',
    margin: '0 1rem',
    display: 'flex',
    alignItems: 'center',
  },
})

const PerformanceRankIcon = styled('div')(({ color }: { color: string }) => ({
  borderRadius: '100%',
  width: '1rem',
  height: '1rem',
  textAlign: 'center',
  backgroundColor: color,
  marginRight: '0.5rem',
  display: 'inline-block',
}))

const PerformanceRankOutput = ({ rank }: { rank: PerformanceRank | null }) => {
  switch (rank) {
    case PerformanceRank.Excellent:
      return (
        <>
          <PerformanceRankIcon color="rgb(0, 200, 0)" /> Excellent
        </>
      )
    case PerformanceRank.Good:
      return (
        <>
          <PerformanceRankIcon color="rgb(0, 150, 0)" /> Good
        </>
      )
    case PerformanceRank.Medium:
      return (
        <>
          <PerformanceRankIcon color="rgb(175, 175, 0)" /> Medium
        </>
      )
    case PerformanceRank.Poor:
      return (
        <>
          <PerformanceRankIcon color="rgb(175, 0, 0)" /> Poor
        </>
      )
    case PerformanceRank.VeryPoor:
      return (
        <>
          <PerformanceRankIcon color="rgb(200, 0, 0)" /> Very Poor
        </>
      )
    default:
      return <>Unknown</>
  }
}

const PerformanceRankSelector = ({
  currentRank,
  onChange,
}: {
  currentRank: PerformanceRank | null
  onChange: (newRank: PerformanceRank | null) => void
}) => {
  return (
    <Select
      fullWidth
      placeholder="Select a rank"
      value={currentRank === null ? '' : currentRank}
      // onChange={event =>
      //   onChange(
      //     typeof event.target.value === 'number' ? event.target.value : null
      //   )
      // }
      displayEmpty
      renderValue={(value) => (
        <>
          {getPerformanceRankLabel(value as PerformanceRank) || 'Select a rank'}
        </>
      )}>
      {Object.values(PerformanceRank)
        .filter((item) => typeof item === 'number')
        .map((performanceRank) => (
          <MenuItem
            key={performanceRank}
            value={performanceRank as PerformanceRank}
            onClick={() => onChange(performanceRank as PerformanceRank)}>
            {getPerformanceRankLabel(performanceRank as PerformanceRank)}
          </MenuItem>
        ))}
      <MenuItem value={''} onClick={() => onChange(null)}>
        Unknown
      </MenuItem>
    </Select>
  )
}

enum Platform {
  PC,
  Quest,
}

const getTagForPerformanceRank = (
  platform: Platform,
  rank: PerformanceRank
): string =>
  `${PerformanceRank[rank].toLowerCase()}_${Platform[
    platform
  ].toLowerCase()}_rank`

const pcLimitsUrl =
  'https://creators.vrchat.com/avatars/avatar-performance-ranking-system/#pc-limits'
const questLimitsUrl =
  'https://creators.vrchat.com/avatars/avatar-performance-ranking-system/#quest-limits'

const PerformanceEditor = ({
  assetId,
  currentTags,
  isEditing = false,
  actionCategory,
  // asset editor fields
  onDone,
  overrideSave,
}: {
  assetId?: string
  currentTags: string[]
  isEditing?: boolean
  actionCategory?: string
  onDone?: () => void
  overrideSave?: (newTags: string[]) => void
}) => {
  const [newTags, setNewTags] = useState<string[]>(currentTags)
  const [isSaving, isSaveSuccess, isSaveError, save, clear] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  if (isSaving) {
    return <LoadingIndicator message="Saving tags..." />
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Tags saved successfully <Button onClick={clear}>Okay</Button>
      </SuccessMessage>
    )
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save tags</ErrorMessage>
  }

  const onSaveClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newTags)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save performance tags button')
      }

      if (!assetId) {
        return
      }

      await save({
        [AssetFieldNames.tags]: newTags,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save performance tags', err)
      handleError(err)
    }
  }

  const currentPcPerformanceRank = getAvatarPcPerformanceRankFromTags(newTags)
  const currentQuestPerformanceRank =
    getAvatarQuestPerformanceRankFromTags(newTags)

  const onChange = (
    platform: Platform,
    oldRank: PerformanceRank | null,
    newRank: PerformanceRank | null
  ) => {
    console.log('ONCHANGE', platform, oldRank, newRank)

    setNewTags((tags) => {
      let tagsToStore = [...tags]

      const oldTag =
        oldRank !== null ? getTagForPerformanceRank(platform, oldRank) : null
      const newTag =
        newRank !== null ? getTagForPerformanceRank(platform, newRank) : null

      if (oldTag !== null) {
        tagsToStore = tagsToStore.filter((tag) => tag !== oldTag)
      }

      if (newTag !== null) {
        tagsToStore = tagsToStore.concat([newTag])
      }

      return tagsToStore
    })

    // if (null)
    //   const newTag = getTagForPerformanceRank(platform, rank)
  }

  return (
    <>
      <div className={classes.row}>
        <div className={classes.platformName}>
          <DesktopWindowsIcon /> PC
        </div>
        <div className={classes.contents}>
          {isEditing ? (
            <PerformanceRankSelector
              currentRank={currentPcPerformanceRank}
              onChange={(newRank) =>
                onChange(Platform.PC, currentPcPerformanceRank, newRank)
              }
            />
          ) : (
            <PerformanceRankOutput rank={currentPcPerformanceRank} />
          )}
        </div>
        <a href={pcLimitsUrl} target="_blank" rel="noopener noreferrer">
          Learn about PC ranks <OpenInNewIcon />
        </a>
      </div>
      <div className={classes.row}>
        <div className={`${classes.platformName} ${classes.quest}`}>
          <OculusIcon /> Quest
        </div>
        <div className={classes.contents}>
          {isEditing ? (
            <PerformanceRankSelector
              currentRank={currentQuestPerformanceRank}
              onChange={(newRank) =>
                onChange(Platform.Quest, currentQuestPerformanceRank, newRank)
              }
            />
          ) : (
            <PerformanceRankOutput rank={currentQuestPerformanceRank} />
          )}
        </div>
        <a href={questLimitsUrl} target="_blank" rel="noopener noreferrer">
          Learn about Quest limits <OpenInNewIcon />
        </a>
      </div>
      {isEditing ? (
        <FormControls>
          <Button onClick={onSaveClick} size="large" icon={<SaveIcon />}>
            Save
          </Button>
        </FormControls>
      ) : null}
    </>
  )
}

export default PerformanceEditor
