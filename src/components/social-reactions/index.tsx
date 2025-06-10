import React, { useCallback, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'
import Chip from '@mui/material/Chip'
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'

import {
  CollectionNames,
  ReactionSummary,
  SocialReaction,
  SocialReactionInsertFields,
} from '../../modules/social'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import { handleError } from '../../error-handling'
import useUserId from '../../hooks/useUserId'
import { insertRecord } from '../../data-store'
import ErrorMessage from '../error-message'
import useClickAway from '../../hooks/useClickAway'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import { SupabaseClient } from '@supabase/supabase-js'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  picker: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 100,
  },
  chip: {
    padding: '0',
    margin: '0.25rem 0.25rem 0 0',
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    '&:not($myEmoji)': {
      background: 'none',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  myEmoji: {},
})

const updateMyReaction = async (
  client: SupabaseClient,
  socialPostId: string,
  newEmoji: string,
  myUserId: string
): Promise<void> => {
  try {
    console.debug(`Updating my reaction to ${socialPostId} to ${newEmoji}...`)

    await client
      .from(CollectionNames.SocialReactions)
      .update<Partial<SocialReaction>>({
        emoji: newEmoji,
      })
      .eq('parent', socialPostId)
      .eq('createdby', myUserId)

    console.debug(`Reaction updated successfully`)
  } catch (err) {
    console.error(err)
    handleError(err)
  }
}

const deleteMyReactions = async (
  client: SupabaseClient,
  socialPostId: string,
  myUserId: string
): Promise<void> => {
  try {
    console.debug(`Deleting my reactions to ${socialPostId}...`)

    await client
      .from(CollectionNames.SocialReactions)
      .delete()
      // TODO: Improve type safety
      .eq('parent', socialPostId)
      .eq('createdby', myUserId)

    console.debug(`Reactions deleted successfully`)
  } catch (err) {
    console.error(err)
    handleError(err)
  }
}

const SocialReactions = ({
  socialPostId,
  myReactionEmoji,
  reactionSummaries,
  hydrate,
  small = false,
}: {
  socialPostId: string
  myReactionEmoji?: string
  reactionSummaries: ReactionSummary[]
  hydrate?: () => void
  small?: boolean
}) => {
  const classes = useStyles()
  const isLoggedIn = useIsLoggedIn()
  const [wantsToReact, setWantsToReact] = useState(false)
  const [isWorking, setIsWorking] = useState(false)

  // TODO: Store last error code
  const [isFailed, setIsFailed] = useState(false)
  const myUserId = useUserId()
  const rootRef = useRef<HTMLDivElement>(null)
  const onClickAway = useCallback(() => setWantsToReact(false), [])
  const supabase = useSupabaseClient()

  useClickAway(rootRef, onClickAway)

  if (!myUserId) {
    return null
  }

  const hasAlreadyReacted = !!myReactionEmoji

  const onClickWantsToReact = () => {
    setWantsToReact((currentVal) => !currentVal)
  }

  const onEmojiInteract = async (emoji: string) => {
    setIsWorking(true)
    setIsFailed(false)
    setWantsToReact(false)

    try {
      console.debug(`Selected emoji "${emoji}"`)

      if (myReactionEmoji) {
        console.debug(`Has already reacted`)

        if (emoji === myReactionEmoji) {
          console.debug(
            `Selected emoji is the same what I reacted with, removing...`
          )
          await deleteMyReactions(supabase, socialPostId, myUserId)
        } else {
          console.debug(`Selected emoji is a new one, updating...`)
          await updateMyReaction(supabase, socialPostId, emoji, myUserId)
        }
      } else {
        await insertRecord<SocialReactionInsertFields, SocialReaction>(
          supabase,
          CollectionNames.SocialReactions,
          {
            parent: socialPostId,
            emoji: emoji,
          }
        )
      }

      setIsWorking(false)
      setIsFailed(false)

      if (hydrate) {
        hydrate()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsWorking(false)
      setIsFailed(true)
    }
  }

  const onSelectEmoji = async (event: EmojiClickData) => {
    onEmojiInteract(event.emoji)
  }

  const onClickExistingEmoji = (summary: ReactionSummary) =>
    onEmojiInteract(summary.emoji)

  return (
    <div className={classes.root} ref={rootRef}>
      {isFailed && <ErrorMessage>Failed to save reaction</ErrorMessage>}
      {!small && isLoggedIn && !hasAlreadyReacted && (
        <Chip
          icon={<AddIcon />}
          label={'...'}
          onClick={onClickWantsToReact}
          className={classes.chip}
          size={small ? 'small' : undefined}
        />
      )}
      {reactionSummaries
        .filter((reactionSummaries) => reactionSummaries)
        .map((summary) => (
          <Tooltip
            arrow
            placement="top"
            title={`${summary.usernames.join(', ')}`}
            key={summary.emoji}>
            <Chip
              label={`${summary.emoji} ${summary.count}`}
              onClick={() => onClickExistingEmoji(summary)}
              className={`${classes.chip} ${
                summary.emoji === myReactionEmoji ? classes.myEmoji : ''
              }`}
              size={small ? 'small' : undefined}
            />
          </Tooltip>
        ))}
      {wantsToReact && (
        <div className={classes.picker}>
          <EmojiPicker
            onEmojiClick={onSelectEmoji}
            previewConfig={{ showPreview: false }}
            emojiStyle={EmojiStyle.NATIVE}
          />
        </div>
      )}
    </div>
  )
}

export default SocialReactions
