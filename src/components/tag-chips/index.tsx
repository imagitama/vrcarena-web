import React, { useState } from 'react'
import styled from '@emotion/styled'

import TagChip from '@/components/tag-chip'
import { TagStats } from '@/modules/tags'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import { Edit as EditIcon } from '@/icons'
import TagChipsEditor from '../tag-chips-editor'

export const StyledTagChips = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  > * {
    margin: 0 0.25rem 0.25rem 0;
    &:last-child {
      margin: 0;
    }
  }
`

type TagChipsBaseProps = {
  tags: string[]
  shimmer?: boolean
  isFilled?: boolean
  onDelete?: (tag: string) => void
  noLink?: boolean
  counts?: TagStats[]
}

type TagChipsProps =
  | (TagChipsBaseProps & {
      // editor
      assetId: string
      hydrate: () => void
    })
  | (TagChipsBaseProps & {
      assetId?: undefined
      hydrate?: () => void
    })

const TagChips = ({
  tags,
  shimmer = false,
  isFilled = true,
  onDelete,
  noLink = false,
  counts,
  assetId,
  hydrate,
}: TagChipsProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const isLoggedIn = useIsLoggedIn()
  if (isEditing && assetId) {
    return (
      <TagChipsEditor
        currentTags={tags}
        assetId={assetId!}
        onDone={() => {
          hydrate()
          setIsEditing(false)
        }}
      />
    )
  }
  return (
    <StyledTagChips>
      {shimmer ? (
        <>
          {' '}
          <TagChip tagName="abc" isLoading isFilled={isFilled} />
          <TagChip tagName="def" isLoading isFilled={isFilled} />
          <TagChip tagName="ghi" isLoading isFilled={isFilled} />
        </>
      ) : (
        tags
          .sort((a, b) => a.localeCompare(b))
          .map((tagName) => {
            const stats = counts?.find((stats) => stats.tag === tagName)
            return (
              <TagChip
                key={tagName}
                tagName={tagName}
                count={stats?.count}
                isFilled={isFilled}
                onDelete={onDelete ? () => onDelete(tagName) : undefined}
                onClick={onDelete ? () => {} : undefined}
                noLink={noLink}
              />
            )
          })
      )}
      {isLoggedIn && assetId && (
        <TagChip
          icon={<EditIcon />}
          tagName="Edit Tags"
          onClick={() => setIsEditing(true)}
        />
      )}
    </StyledTagChips>
  )
}

export default TagChips
