import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import moment from 'moment'

import {
  AssetFieldNames,
  AuthorFieldNames,
  GetFullAssetsFieldNames,
  AssetGumroadFields,
  CollectionNames,
  SpeciesFieldNames,
} from '../../hooks/useDatabaseQuery'
import categoryMeta from '../../category-meta'

import AssetThumbnail from '../asset-thumbnail'
import Markdown from '../markdown'
import TagChip from '../tag-chip'
import TutorialSteps from '../tutorial-steps'
import PedestalVideo from '../pedestal-video'
import SketchfabEmbed from '../sketchfab-embed'
import AssetResultsItem from '../asset-results-item'
import AuthorResultsItem from '../author-results-item'
import DiscordServerResultsItem from '../discord-server-results-item'
import { getDateFromString, isUrlAnImage } from '../../utils'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import Message from '../message'
import VrchatAvatars from '../vrchat-avatars'
import { fieldTypes } from '../../generic-forms'
import TextDiff from '../text-diff'
import TagDiff from '../tag-diff'
import Relations from '../relations'
import authorsEditableFields from '../../editable-fields/authors'
import VrcFurySettings from '../vrcfury-settings'
import Attachments from '../attachments'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import ErrorMessage from '../error-message'
import useDataStoreItems from '../../hooks/useDataStoreItems'

const useStyles = makeStyles({
  output: {
    width: '100%',
  },
  cols: {
    display: 'flex',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '200%',
    marginBottom: '1rem',
  },
  thumbnail: {
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '125%',
  },
  field: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      padding: '0.5rem',
    },
    marginBottom: '0.5rem',
    '&:nth-child(odd)': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  },
  controls: {
    textAlign: 'center',
  },
  commentsField: {
    width: '100%',
  },
  pedestalVideo: {
    width: '100%',
  },
  banner: {
    '& img': {
      width: '100%',
    },
  },
  explanation: {
    display: 'flex',
    '& > *': {
      width: '50%',
    },
  },
  files: {
    display: 'flex',
    '& img': {
      maxHeight: '150px',
    },
  },
  noValue: {
    opacity: '0.5',
  },
  linkedAssets: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      marginRight: '0.5rem',
    },
  },
  changed: {
    // outline: '1px solid rgba(255, 255, 0, 0.2)'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

function Label({ children }) {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const getLabelForValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(getLabelForValue).join(', ')
  } else if (value === true) {
    return 'Yes'
  } else if (value === false) {
    return 'No'
  } else if (value === null) {
    return '(nothing)'
  } else if (value instanceof Date) {
    return moment(value).toString()
  } else if (value && typeof value === 'string') {
    return value
  } else if (value && !isNaN(value)) {
    return value.toString()
  } else if (React.isValidElement(value)) {
    return value
  }

  return noValueLabel
}

function Value({ value }) {
  const classes = useStyles()
  const label = getLabelForValue(value)
  return (
    <div className={classes.value}>
      {label === noValueLabel ? <NoValueLabel>{label}</NoValueLabel> : label}
    </div>
  )
}

function NoValueLabel({ children }) {
  const classes = useStyles()
  return <div className={classes.noValue}>{children}</div>
}

function Field({
  label,
  name,
  children,
  extra,
  oldFields,
  newFields,
  hasChanged = false,
}) {
  const classes = useStyles()
  return (
    <div className={`${classes.field} ${hasChanged ? classes.changed : ''}`}>
      <Label>{label}</Label>
      {name === AssetFieldNames.tags ? (
        <TagDiff
          oldTags={oldFields[AssetFieldNames.tags] || []}
          newTags={newFields[AssetFieldNames.tags] || []}
        />
      ) : (
        children || noValueLabel
      )}
      {extra}
    </div>
  )
}

const maxDescriptionLength = 100
const noValueLabel = '(no value)'

function BannerOutput({ fields }) {
  const classes = useStyles()
  return (
    <div>
      {fields[AssetFieldNames.bannerUrl] ? (
        <div className={classes.banner}>
          <a
            href={fields[AssetFieldNames.bannerUrl]}
            target="_blank"
            rel="noopener noreferrer">
            <img src={fields[AssetFieldNames.bannerUrl]} />
          </a>
        </div>
      ) : (
        <NoValueLabel>(no banner)</NoValueLabel>
      )}
    </div>
  )
}

function PedestalVideoValue({ fields }) {
  const classes = useStyles()
  return (
    <div className={classes.pedestalVideo}>
      {fields[AssetFieldNames.pedestalVideoUrl] ? (
        <PedestalVideo videoUrl={fields[AssetFieldNames.pedestalVideoUrl]} />
      ) : (
        <NoValueLabel>(no pedestal video)</NoValueLabel>
      )}
    </div>
  )
}

function PedestalFallbackImageValue({ fields }) {
  const classes = useStyles()
  return (
    <div className={classes.pedestalVideo}>
      {fields[AssetFieldNames.pedestalFallbackImageUrl] ? (
        <PedestalVideo
          fallbackImageUrl={fields[AssetFieldNames.pedestalFallbackImageUrl]}
        />
      ) : (
        <NoValueLabel>(no pedestal fallback image)</NoValueLabel>
      )}
    </div>
  )
}

function ThumbnailValue({ fields }) {
  const classes = useStyles()
  return (
    <div>
      {fields[AssetFieldNames.thumbnailUrl] ? (
        <div className={classes.thumbnail}>
          <AssetThumbnail url={fields[AssetFieldNames.thumbnailUrl]} />
        </div>
      ) : (
        <NoValueLabel>(no thumbnail)</NoValueLabel>
      )}
    </div>
  )
}

function DescriptionOutput({ fields, isDescriptionExpanded }) {
  return (
    <div>
      <Value
        value={
          fields[AssetFieldNames.description] ? (
            <Markdown
              source={
                isDescriptionExpanded
                  ? fields[AssetFieldNames.description]
                  : fields[AssetFieldNames.description].slice(
                      0,
                      maxDescriptionLength
                    )
              }
            />
          ) : (
            noValueLabel
          )
        }
      />
    </div>
  )
}

function TagOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.tags] && fields[AssetFieldNames.tags].length ? (
        fields[AssetFieldNames.tags].map((tag) => (
          <TagChip key={tag} tagName={tag} />
        ))
      ) : (
        <NoValueLabel>(no tags)</NoValueLabel>
      )}
    </div>
  )
}

function GumroadSettings({ settings }) {
  if (!settings) {
    return <NoValueLabel>{noValueLabel}</NoValueLabel>
  }

  return (
    <div>
      Enabled: {settings[AssetGumroadFields.sync] ? 'Yes' : 'No'}
      <br />
      Fields:{' '}
      {settings[AssetGumroadFields.fields]
        ? JSON.stringify(settings[AssetGumroadFields.fields])
        : 'All'}
    </div>
  )
}

const Author = ({ id }) => {
  const [isLoading, isError, author] = useDataStoreItem(
    CollectionNames.Authors,
    id ? id : false,
    'short-asset-diff-author'
  )

  if (isLoading || !author) return 'Loading...'
  if (isError) return `Failed to load author ${id}`

  return <AuthorResultsItem author={author} />
}

function AuthorOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.author] ? (
        <Author id={fields[AssetFieldNames.author]} />
      ) : (
        <NoValueLabel>(no author)</NoValueLabel>
      )}
    </div>
  )
}

const Species = ({ id, idx }) => {
  const [isLoading, isError, species] = useDataStoreItem(
    CollectionNames.Species,
    id ? id : false,
    'short-asset-diff-species'
  )

  if (isLoading || !species) return 'Loading...'
  if (isError) return `Failed to load species ${id}`

  return (
    <>
      {idx !== 0 ? ', ' : ''}
      {species[SpeciesFieldNames.singularName]}
    </>
  )
}

function SpeciesOutput({ fields }) {
  return (
    <Value
      value={
        <>
          {fields[AssetFieldNames.species] &&
          fields[AssetFieldNames.species].length
            ? fields[AssetFieldNames.species].map((speciesId, idx) => (
                <Species key={speciesId} id={speciesId} idx={idx} />
              ))
            : noValueLabel}
        </>
      }
    />
  )
}

const LinkedAssets = ({ ids }) => {
  const classes = useStyles()
  return (
    <div className={classes.linkedAssets}>
      {ids.map((id) => (
        <Asset key={id} id={id} />
      ))}
    </div>
  )
}

const Asset = ({ id }) => {
  const [isLoading, isError, asset] = useDataStoreItem(
    CollectionNames.Assets,
    id,
    'short-asset-diff-asset'
  )

  if (isLoading || !asset) return 'Loading...'
  if (isError) return `Failed to load asset ${id}`

  return <AssetResultsItem asset={asset} />
}

function RelationsOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.relations] &&
      fields[AssetFieldNames.relations].length ? (
        <Relations relations={fields[AssetFieldNames.relations]} />
      ) : (
        <NoValueLabel>(no relations)</NoValueLabel>
      )}
    </div>
  )
}

function DiscordServerOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.discordServer] ? (
        fields[GetFullAssetsFieldNames.discordServerData] ? (
          <DiscordServerResultsItem
            discordServer={fields[GetFullAssetsFieldNames.discordServerData]}
          />
        ) : (
          fields[GetFullAssetsFieldNames.discordServer]
        )
      ) : (
        <NoValueLabel>(no Discord Server)</NoValueLabel>
      )}
    </div>
  )
}

function FilesOutput({ fields }) {
  const classes = useStyles()
  return (
    <div>
      {fields[AssetFieldNames.fileUrls] &&
      fields[AssetFieldNames.fileUrls].length ? (
        <div className={classes.files}>
          {fields[AssetFieldNames.fileUrls].map((url) =>
            isUrlAnImage(url) ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} />
              </a>
            ) : (
              <>{url}</>
            )
          )}
        </div>
      ) : (
        <NoValueLabel>(no files)</NoValueLabel>
      )}
    </div>
  )
}

function TutorialStepsOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.tutorialSteps] &&
      fields[AssetFieldNames.tutorialSteps].length ? (
        <TutorialSteps steps={fields[AssetFieldNames.tutorialSteps]} />
      ) : (
        <NoValueLabel>(no steps)</NoValueLabel>
      )}
    </div>
  )
}

function SketchfabOutput({ fields }) {
  return (
    <div>
      <Value value={fields[AssetFieldNames.sketchfabEmbedUrl]} />
      {fields[AssetFieldNames.sketchfabEmbedUrl] && (
        <SketchfabEmbed url={fields[AssetFieldNames.sketchfabEmbedUrl]} />
      )}
    </div>
  )
}

function AttachmentsOutput({ fields }) {
  if (!fields.attachmentids) {
    throw new Error('IDs is not even an array')
  }

  const [isLoading, isError, attachments] = useDataStoreItems(
    fields.attachmentids.length ? 'attachments' : false,
    fields.attachmentids,
    'get-attachments-output'
  )

  if (!fields.attachmentids.length) {
    return <NoResultsMessage>No attachment IDs</NoResultsMessage>
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading attachments..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load attachments</ErrorMessage>
  }

  if (attachments === null) {
    return null
  }

  const ids = fields.attachmentids

  if (!ids.length) {
    return <NoResultsMessage>No attachments</NoResultsMessage>
  }

  if (ids.length !== attachments.length) {
    return (
      <ErrorMessage>
        ID count mismatch ({ids.length} vs {attachments.length})
      </ErrorMessage>
    )
  }

  return <Attachments ids={ids} attachmentsData={attachments} />
}

function ClonableWorldOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.clonableWorld] ? (
        fields[GetFullAssetsFieldNames.clonableWorldData] ? (
          <AssetResultsItem
            asset={fields[GetFullAssetsFieldNames.clonableWorldData]}
          />
        ) : (
          '(not loaded)'
        )
      ) : (
        <NoValueLabel>(no clonable world)</NoValueLabel>
      )}
    </div>
  )
}

function VrchatClonableWorldsOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.vrchatClonableWorldIds] &&
      fields[AssetFieldNames.vrchatClonableWorldIds].length ? (
        fields[AssetFieldNames.vrchatClonableWorldIds][0]
      ) : (
        <NoValueLabel>(no clonable worlds)</NoValueLabel>
      )}
    </div>
  )
}

function VrchatClonableAvatarsOutput({ fields }) {
  return (
    <div>
      {fields[AssetFieldNames.vrchatClonableAvatarIds] &&
      fields[AssetFieldNames.vrchatClonableAvatarIds].length ? (
        <VrchatAvatars
          avatarIds={fields[AssetFieldNames.vrchatClonableAvatarIds]}
        />
      ) : (
        <NoValueLabel>(no clonable avatars)</NoValueLabel>
      )}
    </div>
  )
}

function CategoryOutput({ categories }) {
  return <div>{categories ? categories.join(', ') : '(none)'}</div>
}

// interface FieldConfig {
//   label: string
//   renderer: React.Component
// }

// RenderersForFields: {
//   assets: {
//     [fieldName: keyof Asset]: FieldConfig,
//   },
//   authors: {
//     [fieldName: keyof Author]: FieldConfig,
//   }
// }

// order is loosely based off assetoverview
const RenderersForFields = {
  assets: {
    [AssetFieldNames.bannerUrl]: {
      label: 'Banner',
      renderer: ({ fields }) => <BannerOutput fields={fields} />,
    },
    [AssetFieldNames.pedestalVideoUrl]: {
      label: 'Pedestal Video',
      renderer: ({ fields }) => <PedestalVideoValue fields={fields} />,
    },
    [AssetFieldNames.pedestalFallbackImageUrl]: {
      label: 'Pedestal Image',
      renderer: ({ fields }) => <PedestalFallbackImageValue fields={fields} />,
    },
    // title stuff
    [AssetFieldNames.thumbnailUrl]: {
      label: 'Thumbnail',
      renderer: ({ fields }) => <ThumbnailValue fields={fields} />,
    },
    [AssetFieldNames.title]: {
      label: 'Title',
      renderer: ({ fields }) => <Value value={fields[AssetFieldNames.title]} />,
    },
    [AssetFieldNames.author]: {
      label: 'Author',
      renderer: ({ fields }) => <AuthorOutput fields={fields} />,
    },
    [AssetFieldNames.category]: {
      label: 'Category',
      renderer: ({ fields }) => (
        <Value
          value={
            fields[AssetFieldNames.category] &&
            categoryMeta[fields[AssetFieldNames.category]].nameSingular
          }
        />
      ),
    },
    [AssetFieldNames.species]: {
      label: 'Species',
      renderer: ({ fields }) => <SpeciesOutput fields={fields} />,
    },
    // sidebar
    [AssetFieldNames.price]: {
      label: 'Price',
      renderer: ({ fields }) => <Value value={fields[AssetFieldNames.price]} />,
    },
    [AssetFieldNames.priceCurrency]: {
      label: 'Price Currency',
      renderer: ({ fields }) => (
        <Value value={fields[AssetFieldNames.priceCurrency]} />
      ),
    },
    [AssetFieldNames.sourceUrl]: {
      label: 'Source URL',
      renderer: ({ fields }) => (
        <Value value={fields[AssetFieldNames.sourceUrl]} />
      ),
    },
    [AssetFieldNames.discordServer]: {
      label: 'Discord Server',
      renderer: ({ fields }) => <DiscordServerOutput fields={fields} />,
    },
    [AssetFieldNames.tags]: {
      label: 'Tags',
      renderer: ({ fields }) => <TagOutput fields={fields} />,
    },
    [AssetFieldNames.isAdult]: {
      label: 'Adult (NSFW)',
      renderer: ({ fields }) => (
        <Value value={fields[AssetFieldNames.isAdult]} />
      ),
    },
    // tabs
    [AssetFieldNames.description]: {
      label: 'Description',
      renderer: ({ fields }) => (
        <DescriptionOutput fields={fields} isDescriptionExpanded />
      ),
    },
    [AssetFieldNames.vrchatClonableWorldIds]: {
      label: 'VRChat Clonable World IDs',
      renderer: ({ fields }) => <VrchatClonableWorldsOutput fields={fields} />,
    },
    [AssetFieldNames.vrchatClonableAvatarIds]: {
      label: 'VRChat Clonable Avatar IDs',
      renderer: ({ fields }) => <VrchatClonableAvatarsOutput fields={fields} />,
    },
    // other
    [AssetFieldNames.relations]: {
      label: 'Relations',
      renderer: ({ fields }) => <RelationsOutput fields={fields} />,
    },
    [AssetFieldNames.fileUrls]: {
      label: 'Files',
      renderer: ({ fields }) => <FilesOutput fields={fields} />,
    },
    [AssetFieldNames.gumroad]: {
      label: 'Gumroad Settings',
      renderer: ({ fields }) => (
        <GumroadSettings settings={fields[AssetFieldNames.gumroad]} />
      ),
    },
    [AssetFieldNames.sketchfabEmbedUrl]: {
      label: 'Sketchfab',
      renderer: ({ fields }) => <SketchfabOutput fields={fields} />,
    },
    [AssetFieldNames.tutorialSteps]: {
      label: 'Tutorial Steps',
      renderer: ({ fields }) => <TutorialStepsOutput fields={fields} />,
    },
    [AssetFieldNames.slug]: {
      label: 'Slug',
      renderer: ({ fields }) => <Value value={fields[AssetFieldNames.slug]} />,
    },
    [AssetFieldNames.clonableWorld]: {
      label: 'Clonable World (Asset)',
      renderer: ({ fields }) => <ClonableWorldOutput fields={fields} />,
    },
    [AssetFieldNames.shortDescription]: {
      label: 'Short Description (for featured assets)',
      renderer: ({ fields }) => (
        <Value value={fields[AssetFieldNames.shortDescription]} />
      ),
    },
    [AssetFieldNames.videoUrl]: {
      label: 'Video',
      renderer: ({ fields }) => <div>{fields[AssetFieldNames.videoUrl]}</div>,
    },
    // TODO: type-safety sometime
    extradata: {
      label: 'Extra Data',
      renderer: ({ fields }) => (
        <div>
          {fields.extradata &&
          fields.extradata.vrcfury &&
          fields.extradata.vrcfury.prefabs &&
          fields.extradata.vrcfury.prefabs.length ? (
            <VrcFurySettings prefabs={fields.extradata.vrcfury.prefabs} />
          ) : (
            <NoValueLabel>{noValueLabel}</NoValueLabel>
          )}
        </div>
      ),
    },
    attachmentids: {
      label: 'Attachments',
      renderer: ({ fields }) => <AttachmentsOutput fields={fields} />,
    },
  },
  authors: authorsEditableFields,
}

const getRendererByType = (type, fieldName) => {
  switch (type) {
    case fieldTypes.text:
      return ({ fields }) => <Value value={fields[fieldName]} />
    case fieldTypes.textMarkdown:
      return ({ fields }) => <Value value={`${fields[fieldName]}`} />
    case fieldTypes.multichoice:
      return ({ fields, rendererInfo }) => (
        <Value
          value={
            fields[fieldName]
              ? fields[fieldName].map((selectedValue) => {
                  const match = rendererInfo.options.find(
                    ({ value }) => value === selectedValue
                  )
                  if (match) {
                    return match.label
                  } else {
                    console.warn(
                      `No match for field ${fieldName} with ${selectedValue}`
                    )
                    return '(no label found)'
                  }
                })
              : '(no options)'
          }
        />
      )
    case fieldTypes.checkbox:
      return ({ fields }) => (
        <Value value={`${fields[fieldName] ? 'True' : 'False'}`} />
      )
    case fieldTypes.date:
      return ({ fields }) => (
        <Value
          value={
            fields[fieldName] ? getDateFromString(fields[fieldName]) : null
          }
        />
      )
    // case fieldTypes.ref:
    //   return ({ fields }) => <Value value={`{fields[fieldName]}`} />
    case fieldTypes.imageUpload:
      return ({ fields }) => <Value value={<img src={fields[fieldName]} />} />
    // case fieldTypes.hidden:
    //   return ({ fields }) => <Value value={`{fields[fieldName]}`} />
    // case fieldTypes.searchable:
    //   return ({ fields }) => <Value value={`{fields[fieldName]}`} />
    case fieldTypes.singlechoice:
      return ({ fields, rendererInfo }) => (
        <Value
          value={
            fields[fieldName] && rendererInfo.options
              ? rendererInfo.options.find(
                  ({ value }) => value === fields[fieldName]
                ).label
              : null
          }
        />
      )
    // case fieldTypes.assets:
    //   return ({ fields }) => <Value value={`{fields[fieldName]}`} />
    // case fieldTypes.custom:
    //   return ({ fields }) => <Value value={`{fields[fieldName]}`} />
    // case fieldTypes.tags:
    //   return ({ fields }) => <Value value={`{fields[fieldName]}`} />
    case fieldTypes.url:
      return ({ fields }) => <Value value={`URL: ${fields[fieldName]}`} />
    case fieldTypes.email:
      return ({ fields }) => <Value value={`Email: ${fields[fieldName]}`} />
    case fieldTypes.item:
      return ({ fields }) => <Value value={`ID: ${fields[fieldName]}`} />
    default:
      throw new Error(`Cannot get renderer by type "${type}" - unsupported`)
  }
}

const Divider = () => {
  const classes = useStyles()
  return (
    <div className={classes.divider}>
      <ChevronRightIcon />
    </div>
  )
}

const textDiffFieldNames = [
  AssetFieldNames.title,
  AssetFieldNames.description,
  AssetFieldNames.sourceUrl,
  AuthorFieldNames.name,
  AuthorFieldNames.description,
]

export default ({
  type,
  oldFields = {},
  newFields,
  onlyNewFields,
  extraData = {},
}) => {
  const classes = useStyles()

  const keys = Object.keys(newFields)

  if (!keys.length) {
    return <Message>This diff contains no fields</Message>
  }

  const renderers = RenderersForFields[type]

  if (!renderers) {
    throw new Error(`Cannot use type "${type}" for renderers - not supported`)
  }

  return (
    <div className={classes.output}>
      {keys.map((fieldNameThatChanged) => {
        const fieldNameToUse = fieldNameThatChanged.toLowerCase()
        const rendererInfo = Array.isArray(renderers)
          ? renderers.find((renderer) => renderer.name === fieldNameToUse)
          : renderers[fieldNameToUse]

        if (fieldNameThatChanged === 'id') {
          throw new Error('Cannot show diff for ID')
        }

        if (!rendererInfo) {
          console.warn(`No renderer found for "${fieldNameThatChanged}"`)
          return null
        }

        const renderer =
          rendererInfo.renderer ||
          getRendererByType(rendererInfo.type, fieldNameToUse)

        if (textDiffFieldNames.includes(fieldNameThatChanged)) {
          return (
            <Field
              name={fieldNameToUse}
              label={rendererInfo.label}
              hasChanged={!!onlyNewFields[fieldNameToUse]}>
              <TextDiff
                oldValue={oldFields[fieldNameThatChanged]}
                newValue={newFields[fieldNameThatChanged]}
              />
            </Field>
          )
        }

        return (
          <Field
            name={fieldNameToUse}
            label={rendererInfo.label}
            oldFields={oldFields}
            newFields={newFields}
            hasChanged={!!onlyNewFields[fieldNameToUse]}>
            {React.cloneElement(
              renderer({
                fields: { ...oldFields },
                rendererInfo,
              })
            )}
            <Divider />
            {React.cloneElement(
              renderer({
                fields: { ...newFields, ...extraData },
                rendererInfo,
              })
            )}
          </Field>
        )
      })}
    </div>
  )
}
