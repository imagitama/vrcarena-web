import React from 'react'
import { makeStyles } from '@mui/styles'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import moment from 'moment'

import { getCategoryMeta } from '../../category-meta'
import AssetThumbnail from '../asset-thumbnail'
import Markdown from '../markdown'
import TagChip from '../tag-chip'
import SketchfabEmbed from '../sketchfab-embed'
import AuthorResultsItem from '../author-results-item'
import DiscordServerResultsItem from '../discord-server-results-item'
import { getDateFromString } from '../../utils'
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
import VisitSourceButton from '../visit-source-button'
import { Asset, FullAsset, SourceInfo } from '../../modules/assets'
import {
  Author,
  CollectionNames as AuthorsCollectionNames,
} from '../../modules/authors'
import {
  Species,
  CollectionNames as SpeciesCollectionNames,
} from '../../modules/species'
import {
  Attachment,
  CollectionNames as AttachmentsCollectionNames,
} from '../../modules/attachments'

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
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

function Label({ children }: { children: React.ReactNode }) {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const getLabelForValue = (value: any): string | React.ReactElement => {
  if (Array.isArray(value)) {
    return value.map(getLabelForValue).join(', ')
  } else if (value === true) {
    return 'Yes'
  } else if (value === false) {
    return 'No'
  } else if (value === null) {
    return noValueLabel
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

function Value({ value }: { value: any }) {
  const classes = useStyles()
  const label = getLabelForValue(value)
  return (
    <div>
      {label === noValueLabel ? <NoValueLabel>{label}</NoValueLabel> : label}
    </div>
  )
}

function NoValueLabel({ children }: { children: React.ReactNode }) {
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
}: {
  label: string | React.ReactElement
  name: string
  children: React.ReactNode
  extra?: any
  oldFields: any
  newFields: any
  hasChanged?: boolean
}) {
  const classes = useStyles()
  return (
    <div className={`${classes.field} ${hasChanged ? classes.changed : ''}`}>
      <Label>{label}</Label>
      {name === 'tags' ? (
        <TagDiff
          oldTags={oldFields.tags || []}
          newTags={newFields.tags || []}
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

function BannerOutput({ fields }: { fields: Asset }) {
  const classes = useStyles()
  return (
    <div>
      {fields.bannerurl ? (
        <div className={classes.banner}>
          <a href={fields.bannerurl} target="_blank" rel="noopener noreferrer">
            <img src={fields.bannerurl} />
          </a>
        </div>
      ) : (
        <NoValueLabel>(no banner)</NoValueLabel>
      )}
    </div>
  )
}

function ThumbnailValue({ fields }: { fields: Asset }) {
  const classes = useStyles()
  return (
    <div>
      {fields.thumbnailurl ? (
        <div className={classes.thumbnail}>
          <AssetThumbnail url={fields.thumbnailurl} />
        </div>
      ) : (
        <NoValueLabel>(no thumbnail)</NoValueLabel>
      )}
    </div>
  )
}

function DescriptionOutput({
  fields,
  isDescriptionExpanded,
}: {
  fields: Asset
  isDescriptionExpanded?: boolean
}) {
  return (
    <div>
      <Value
        value={
          fields.description ? (
            <Markdown
              source={
                isDescriptionExpanded
                  ? fields.description
                  : fields.description.slice(0, maxDescriptionLength)
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

function TagOutput({ fields }: { fields: Asset }) {
  return (
    <div>
      {fields.tags && fields.tags.length ? (
        fields.tags.map((tag) => <TagChip key={tag} tagName={tag} />)
      ) : (
        <NoValueLabel>(no tags)</NoValueLabel>
      )}
    </div>
  )
}

const AuthorOutputItem = ({ id }: { id: string }) => {
  const [isLoading, lastErrorCode, author] = useDataStoreItem<Author>(
    AuthorsCollectionNames.Authors,
    id ? id : false,
    'short-asset-diff-author'
  )

  if (isLoading || !author) return <>Loading...</>
  if (lastErrorCode !== null)
    return (
      <>
        Failed to load author {id} (code {lastErrorCode})
      </>
    )

  return <AuthorResultsItem author={author} />
}

function AuthorOutput({ fields }: { fields: Asset }) {
  return (
    <div>
      {fields.author ? (
        <AuthorOutputItem id={fields.author} />
      ) : (
        <NoValueLabel>(no author)</NoValueLabel>
      )}
    </div>
  )
}

const SpeciesOutputItem = ({ id, idx }: { id: string; idx: number }) => {
  const [isLoading, lastErrorCode, species] = useDataStoreItem<Species>(
    SpeciesCollectionNames.Species,
    id ? id : false,
    'short-asset-diff-species'
  )

  if (isLoading || !species) return <>Loading...</>
  if (lastErrorCode !== null)
    return (
      <>
        Failed to load species {id} (code {lastErrorCode})
      </>
    )

  return (
    <>
      {idx !== 0 ? ', ' : ''}
      {species.singularname}
    </>
  )
}

function SpeciesOutput({ fields }: { fields: Asset }) {
  return (
    <Value
      value={
        <>
          {fields.species && fields.species.length
            ? fields.species.map((speciesId, idx) => (
                <SpeciesOutputItem key={speciesId} id={speciesId} idx={idx} />
              ))
            : noValueLabel}
        </>
      }
    />
  )
}

function RelationsOutput({ fields }: { fields: Asset }) {
  return (
    <div>
      {fields.relations && fields.relations.length ? (
        <Relations relations={fields.relations} />
      ) : (
        <NoValueLabel>(no relations)</NoValueLabel>
      )}
    </div>
  )
}

function DiscordServerOutput({ fields }: { fields: FullAsset }) {
  return (
    <div>
      {fields.discordserver ? (
        fields.discordserverdata ? (
          <DiscordServerResultsItem
            discordServer={fields.discordserverdata as any}
          />
        ) : (
          fields.discordserver
        )
      ) : (
        <NoValueLabel>(no Discord Server)</NoValueLabel>
      )}
    </div>
  )
}

function SketchfabOutput({ fields }: { fields: Asset }) {
  return (
    <div>
      <Value value={fields.sketchfabembedurl} />
      {fields.sketchfabembedurl && (
        <SketchfabEmbed url={fields.sketchfabembedurl} />
      )}
    </div>
  )
}

function AttachmentsOutput({ fields }: { fields: Asset }) {
  if (!fields.attachmentids) {
    throw new Error('IDs is not even an array')
  }

  const [isLoading, lastErrorCode, attachments] = useDataStoreItems<Attachment>(
    AttachmentsCollectionNames.Attachments,
    fields.attachmentids.length ? fields.attachmentids : false,
    { queryName: 'get-attachments-output' }
  )

  if (!fields.attachmentids.length) {
    return <NoResultsMessage>No attachment IDs</NoResultsMessage>
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading attachments..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load attachments (code {lastErrorCode})
      </ErrorMessage>
    )
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

const ExtraSourcesOutput = ({
  extraSources,
}: {
  extraSources: SourceInfo[]
}) => (
  <>
    {extraSources && extraSources.length ? (
      extraSources.map((sourceInfo) => (
        <div>
          {sourceInfo.url}
          <br />
          <br />
          <VisitSourceButton sourceInfo={sourceInfo} />
          <br />
          <br />
        </div>
      ))
    ) : (
      <NoValueLabel>(no extra sources)</NoValueLabel>
    )}
  </>
)

function VrchatClonableAvatarsOutput({ fields }: { fields: Asset }) {
  return (
    <div>
      {fields.vrchatclonableavatarids &&
      fields.vrchatclonableavatarids.length ? (
        <VrchatAvatars avatarIds={fields.vrchatclonableavatarids} />
      ) : (
        <NoValueLabel>(no clonable avatars)</NoValueLabel>
      )}
    </div>
  )
}

interface FieldConfig {
  label: string
  renderer?: React.ComponentType<{ fields: FullAsset }>
  type?: any
}

// order is loosely based off assetoverview
const RenderersForFields: {
  assets: {
    [fieldName: keyof Asset]: FieldConfig
  }
  authors: {
    [fieldName: keyof Author]: FieldConfig
  }
} = {
  assets: {
    bannerurl: {
      label: 'Banner',
      renderer: ({ fields }) => <BannerOutput fields={fields} />,
    },
    // title stuff
    thumbnailurl: {
      label: 'Thumbnail',
      renderer: ({ fields }) => <ThumbnailValue fields={fields} />,
    },
    title: {
      label: 'Title',
      renderer: ({ fields }) => <Value value={fields.title} />,
    },
    author: {
      label: 'Author',
      renderer: ({ fields }) => <AuthorOutput fields={fields} />,
    },
    category: {
      label: 'Category',
      renderer: ({ fields }) => (
        <Value
          value={
            fields.category && getCategoryMeta(fields.category).nameSingular
          }
        />
      ),
    },
    species: {
      label: 'Species',
      renderer: ({ fields }) => <SpeciesOutput fields={fields} />,
    },
    // sidebar
    price: {
      label: 'Price',
      renderer: ({ fields }) => <Value value={fields.price} />,
    },
    pricecurrency: {
      label: 'Price Currency',
      renderer: ({ fields }) => <Value value={fields.pricecurrency} />,
    },
    sourceurl: {
      label: 'Source URL',
      renderer: ({ fields }) => <Value value={fields.sourceurl} />,
    },
    discordserver: {
      label: 'Discord Server',
      renderer: ({ fields }) => <DiscordServerOutput fields={fields} />,
    },
    tags: {
      label: 'Tags',
      renderer: ({ fields }) => <TagOutput fields={fields} />,
    },
    isadult: {
      label: 'Adult (NSFW)',
      renderer: ({ fields }) => <Value value={fields.isadult} />,
    },
    // tabs
    description: {
      label: 'Description',
      renderer: ({ fields }) => (
        <DescriptionOutput fields={fields} isDescriptionExpanded />
      ),
    },
    vrchatclonableavatarids: {
      label: 'VRChat Clonable Avatar IDs',
      renderer: ({ fields }) => <VrchatClonableAvatarsOutput fields={fields} />,
    },
    // other
    relations: {
      label: 'Relations',
      renderer: ({ fields }) => <RelationsOutput fields={fields} />,
    },
    sketchfabembedurl: {
      label: 'Sketchfab',
      renderer: ({ fields }) => <SketchfabOutput fields={fields} />,
    },
    shortdescription: {
      label: 'Short Description (for featured assets)',
      renderer: ({ fields }) => <Value value={fields.shortdescription} />,
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
    extrasources: {
      label: 'Extra Sources',
      renderer: ({ fields }) => (
        <ExtraSourcesOutput extraSources={fields.extrasources} />
      ),
    },
    vccurl: {
      label: 'VCC URL',
      type: fieldTypes.url,
    },
  },
  // @ts-ignore
  authors: authorsEditableFields,
}

const getRendererByType = (
  type: fieldTypes,
  fieldName: string
): React.ComponentType<{ fields: FullAsset; rendererInfo?: any }> => {
  switch (type) {
    case fieldTypes.text:
      return ({ fields }) => <Value value={fields[fieldName]} />
    case fieldTypes.textMarkdown:
      return ({ fields }) => <Value value={fields[fieldName]} />
    case fieldTypes.multichoice:
      return ({ fields, rendererInfo }) => (
        <Value
          value={
            fields[fieldName]
              ? // @ts-ignore
                fields[fieldName].map((selectedValue) => {
                  const match = rendererInfo.options.find(
                    // @ts-ignore
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
            fields[fieldName]
              ? getDateFromString(fields[fieldName] as string)
              : null
          }
        />
      )
    // case fieldTypes.ref:
    //   return ({ fields }) => <Value value={`{fields[fieldName]}`} />
    case fieldTypes.imageUpload:
      return ({ fields }) => (
        <Value value={<img src={fields[fieldName] as string} />} />
      )
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
                  // @ts-ignore
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
      return ({ fields }) => (
        <Value
          value={
            fields[fieldName] ? (
              `URL: ${fields[fieldName]}`
            ) : (
              <NoValueLabel>(no URL)</NoValueLabel>
            )
          }
        />
      )
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

// TODO: Use correct type
const textDiffFieldNames: string[] = [
  'title',
  'description',
  'sourceurl',
  'name',
  'description',
]

export default ({
  type,
  oldFields = {},
  newFields,
  onlyNewFields,
  extraData = {},
}: {
  type: 'assets' | 'authors'
  oldFields: any
  newFields: any
  onlyNewFields: any
  extraData?: any
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
            // @ts-ignore
            <Field
              name={fieldNameToUse}
              label={rendererInfo.label}
              hasChanged={!!onlyNewFields[fieldNameToUse]}>
              <TextDiff
                oldValue={oldFields[fieldNameThatChanged] || ''}
                newValue={newFields[fieldNameThatChanged] || ''}
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
