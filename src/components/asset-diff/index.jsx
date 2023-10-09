import React, { createContext, Fragment, useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  AssetFieldNames,
  AuthorFieldNames,
  GetFullAssetsFieldNames,
  AssetGumroadFields
} from '../../hooks/useDatabaseQuery'
import categoryMeta from '../../category-meta'

import AssetThumbnail from '../asset-thumbnail'
import Button from '../button'
import Heading from '../heading'
import Markdown from '../markdown'
import TagChip from '../tag-chip'
import FileResults from '../file-results'
import AssetResults from '../asset-results'
import TutorialSteps from '../tutorial-steps'
import PedestalVideo from '../pedestal-video'
import SketchfabEmbed from '../sketchfab-embed'
import AssetResultsItem from '../asset-results-item'
import AuthorResultsItem from '../author-results-item'
import DiscordServerResultsItem from '../discord-server-results-item'

const DiffContext = createContext({})
const useDiff = () => useContext(DiffContext)

const useStyles = makeStyles({
  output: {
    width: 'calc(100vw - 6rem)'
  },
  cols: {
    display: 'flex',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '200%',
    marginBottom: '1rem'
  },
  thumbnail: {
    textAlign: 'center'
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  field: {
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    opacity: '0.5'
  },
  diff: {
    display: 'flex',
    '& > *': {
      width: '50%'
    }
  },
  changed: {
    border: '2px solid yellow',
    opacity: 1
  },
  controls: {
    textAlign: 'center'
  },
  commentsField: {
    width: '100%'
  },
  pedestalVideo: {
    width: '100%'
  },
  pedestalVideoWrapper: {
    maxWidth: '400px'
  },
  banner: {
    '& img': {
      width: '100%'
    }
  },
  explanation: {
    display: 'flex',
    '& > *': {
      width: '50%'
    }
  }
})

function Label({ children }) {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const getLabelForValue = value => {
  if (Array.isArray(value)) {
    return value.map(getLabelForValue).join(', ')
  } else if (value === true) {
    return 'Yes'
  } else if (value === false) {
    return 'No'
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
  return <div className={classes.value}>{getLabelForValue(value)}</div>
}

function Field({ label, name, children, extra }) {
  const { changedFieldNames } = useDiff()
  const classes = useStyles()
  return (
    <div
      className={`${classes.field} ${
        changedFieldNames.includes(name) ? classes.changed : ''
      }`}>
      <Label>{label}</Label>
      <div className={classes.diff}>{children || noValueLabel}</div>
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
          <img src={fields[AssetFieldNames.bannerUrl]} />
        </div>
      ) : (
        '(none)'
      )}
    </div>
  )
}

function PedestalVideoValue({ fields }) {
  const classes = useStyles()
  return (
    <div className={classes.pedestalVideo}>
      {fields[AssetFieldNames.pedestalVideoUrl] ? (
        <div className={classes.pedestalVideoWrapper}>
          <PedestalVideo
            videoUrl={fields[AssetFieldNames.pedestalVideoUrl]}
            fallbackImageUrl={fields[AssetFieldNames.pedestalFallbackImageUrl]}
          />
          {fields[AssetFieldNames.pedestalFallbackImageUrl] ? (
            <img
              src={fields[AssetFieldNames.pedestalFallbackImageUrl]}
              width="100%"
            />
          ) : (
            '(no fallback image)'
          )}
        </div>
      ) : (
        '(none)'
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
        '(none)'
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
      {fields[AssetFieldNames.tags] && fields[AssetFieldNames.tags].length
        ? fields[AssetFieldNames.tags].map(tag => (
            <TagChip key={tag} tagName={tag} />
          ))
        : '(no tags)'}
    </div>
  )
}

function GumroadSettings({ settings }) {
  if (!settings) {
    return <div>{noValueLabel}</div>
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

export default ({ oldFields, newFields, changedFieldNames = [] }) => {
  const classes = useStyles()
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  return (
    <DiffContext.Provider value={{ changedFieldNames }}>
      <div className={classes.explanation}>
        <Heading variant="h2">Before</Heading>
        <Heading variant="h2">After</Heading>
      </div>
      <div className={classes.output}>
        <Field name={AssetFieldNames.bannerUrl} label="Banner">
          <BannerOutput fields={oldFields} />
          <BannerOutput fields={newFields} />
        </Field>
        <Field name={AssetFieldNames.pedestalVideoUrl} label="Pedestal Video">
          <PedestalVideoValue fields={oldFields} />
          <PedestalVideoValue fields={newFields} />
        </Field>
        <Field name={AssetFieldNames.thumbnailUrl} label="Thumbnail">
          <ThumbnailValue fields={oldFields} />
          <ThumbnailValue fields={newFields} />
        </Field>
        <Field name={AssetFieldNames.title} label="Title">
          <Value value={oldFields[AssetFieldNames.title]} />
          <Value value={newFields[AssetFieldNames.title]} />
        </Field>
        <Field name={AssetFieldNames.sourceUrl} label="Source">
          <Value value={oldFields[AssetFieldNames.sourceUrl]} />
          <Value value={newFields[AssetFieldNames.sourceUrl]} />
        </Field>
        <Field name={AssetFieldNames.price} label="Price">
          <Value value={oldFields[AssetFieldNames.price]} />
          <Value value={newFields[AssetFieldNames.price]} />
        </Field>
        <Field name={AssetFieldNames.priceCurrency} label="Price Currency">
          <Value value={oldFields[AssetFieldNames.priceCurrency]} />
          <Value value={newFields[AssetFieldNames.priceCurrency]} />
        </Field>
        <Field name={AssetFieldNames.gumroad} label="Gumroad Settings">
          <GumroadSettings settings={oldFields[AssetFieldNames.gumroad]} />
          <GumroadSettings settings={newFields[AssetFieldNames.gumroad]} />
        </Field>
        <Field name={AssetFieldNames.author} label="Author">
          <div>
            {oldFields[AssetFieldNames.author] ? (
              <AuthorResultsItem
                author={{
                  ...oldFields[AssetFieldNames.author],
                  [AuthorFieldNames.name]:
                    oldFields[GetFullAssetsFieldNames.authorName]
                }}
              />
            ) : (
              '(none)'
            )}
          </div>
          <div>
            {newFields[AssetFieldNames.author] ? (
              <AuthorResultsItem
                author={{
                  ...newFields[AssetFieldNames.author],
                  [AuthorFieldNames.name]:
                    newFields[GetFullAssetsFieldNames.authorName]
                }}
              />
            ) : (
              '(none)'
            )}
          </div>
        </Field>
        <Field name={AssetFieldNames.species} label="Species">
          <Value
            value={
              oldFields[GetFullAssetsFieldNames.speciesNames] &&
              oldFields[GetFullAssetsFieldNames.speciesNames].length
                ? oldFields[GetFullAssetsFieldNames.speciesNames].join(', ')
                : noValueLabel
            }
          />
          <Value
            value={
              newFields[GetFullAssetsFieldNames.speciesNames] &&
              newFields[GetFullAssetsFieldNames.speciesNames].length
                ? newFields[GetFullAssetsFieldNames.speciesNames].join(', ')
                : noValueLabel
            }
          />
        </Field>
        <Field name={AssetFieldNames.category} label="Category">
          <Value
            value={
              oldFields[AssetFieldNames.category] &&
              categoryMeta[oldFields[AssetFieldNames.category]].nameSingular
            }
          />
          <Value
            value={
              newFields[AssetFieldNames.category] &&
              categoryMeta[newFields[AssetFieldNames.category]].nameSingular
            }
          />
        </Field>
        <Field
          name={AssetFieldNames.description}
          label="Description"
          extra={
            <>
              {' '}
              {(oldFields[AssetFieldNames.description] &&
                oldFields[AssetFieldNames.description].length >
                  maxDescriptionLength) ||
              (newFields[AssetFieldNames.description] &&
                newFields[AssetFieldNames.description].length >
                  maxDescriptionLength) ? (
                <>
                  <br />
                  <Button
                    onClick={() =>
                      setIsDescriptionExpanded(currentVal => !currentVal)
                    }>
                    Toggle Expanded
                  </Button>
                </>
              ) : null}
            </>
          }>
          <DescriptionOutput
            fields={oldFields}
            isDescriptionExpanded={isDescriptionExpanded}
          />
          <DescriptionOutput
            fields={newFields}
            isDescriptionExpanded={isDescriptionExpanded}
          />
        </Field>
        <Field name={AssetFieldNames.tags} label="Tags">
          <TagOutput fields={oldFields} />
          <TagOutput fields={newFields} />
        </Field>
        <Field name={AssetFieldNames.isAdult} label="Is NSFW">
          <Value value={oldFields[AssetFieldNames.isAdult]} />
          <Value value={newFields[AssetFieldNames.isAdult]} />
        </Field>
        <Field name={AssetFieldNames.fileUrls} label="Attachments">
          <div>
            {oldFields[AssetFieldNames.fileUrls] &&
            oldFields[AssetFieldNames.fileUrls].length ? (
              <FileResults
                urls={oldFields[AssetFieldNames.fileUrls]}
                isColumn
              />
            ) : (
              '(no files)'
            )}
          </div>
          <div>
            {newFields[AssetFieldNames.fileUrls] &&
            newFields[AssetFieldNames.fileUrls].length ? (
              <FileResults
                urls={newFields[AssetFieldNames.fileUrls]}
                isColumn
              />
            ) : (
              '(no files)'
            )}
          </div>
        </Field>
        <Field name={AssetFieldNames.children} label="Linked Assets">
          <div>
            {oldFields[AssetFieldNames.children] &&
            oldFields[AssetFieldNames.children].length ? (
              oldFields[GetFullAssetsFieldNames.childrenData] ? (
                <AssetResults
                  assets={oldFields[GetFullAssetsFieldNames.childrenData]}
                />
              ) : (
                '(not loaded)'
              )
            ) : (
              '(no assets)'
            )}
          </div>
          <div>
            {newFields[AssetFieldNames.children] &&
            newFields[AssetFieldNames.children].length ? (
              newFields[GetFullAssetsFieldNames.childrenData] ? (
                <AssetResults
                  assets={newFields[GetFullAssetsFieldNames.childrenData]}
                />
              ) : (
                '(not loaded)'
              )
            ) : (
              '(no assets)'
            )}
          </div>
        </Field>
        <Field name={AssetFieldNames.discordServer} label="Discord Server">
          <div>
            {oldFields[AssetFieldNames.discordServer] ? (
              oldFields[GetFullAssetsFieldNames.discordServerData] ? (
                <DiscordServerResultsItem
                  discordServer={
                    oldFields[GetFullAssetsFieldNames.discordServerData]
                  }
                />
              ) : (
                oldFields[GetFullAssetsFieldNames.discordServer]
              )
            ) : (
              '(none)'
            )}
          </div>
          <div>
            {newFields[AssetFieldNames.discordServer] ? (
              newFields[GetFullAssetsFieldNames.discordServerData] ? (
                <DiscordServerResultsItem
                  discordServer={
                    newFields[GetFullAssetsFieldNames.discordServerData]
                  }
                />
              ) : (
                newFields[GetFullAssetsFieldNames.discordServer]
              )
            ) : (
              '(none)'
            )}
          </div>
        </Field>
        <Field name={AssetFieldNames.tutorialSteps} label="Tutorial Steps">
          <div>
            {oldFields[AssetFieldNames.tutorialSteps] &&
            oldFields[AssetFieldNames.tutorialSteps].length ? (
              <TutorialSteps steps={oldFields[AssetFieldNames.tutorialSteps]} />
            ) : (
              '(none)'
            )}
          </div>
          <div>
            {newFields[AssetFieldNames.tutorialSteps] &&
            newFields[AssetFieldNames.tutorialSteps].length ? (
              <TutorialSteps steps={newFields[AssetFieldNames.tutorialSteps]} />
            ) : (
              '(none)'
            )}
          </div>
        </Field>
        <Field name={AssetFieldNames.sketchfabEmbedUrl} label="Sketchfab Embed">
          <div>
            <Value value={oldFields[AssetFieldNames.sketchfabEmbedUrl]} />
            {oldFields[AssetFieldNames.sketchfabEmbedUrl] && (
              <SketchfabEmbed
                url={oldFields[AssetFieldNames.sketchfabEmbedUrl]}
              />
            )}
          </div>
          <div>
            <Value value={newFields[AssetFieldNames.sketchfabEmbedUrl]} />
            {newFields[AssetFieldNames.sketchfabEmbedUrl] && (
              <SketchfabEmbed
                url={newFields[AssetFieldNames.sketchfabEmbedUrl]}
              />
            )}
          </div>
        </Field>
        <Field name={AssetFieldNames.slug} label="Slug">
          <Value value={oldFields[AssetFieldNames.slug]} />
          <Value value={newFields[AssetFieldNames.slug]} />
        </Field>
        <Field name={AssetFieldNames.clonableWorld} label="Clonable World">
          <div>
            {oldFields[AssetFieldNames.clonableWorld] ? (
              oldFields[GetFullAssetsFieldNames.clonableWorldData] ? (
                <AssetResultsItem
                  asset={oldFields[GetFullAssetsFieldNames.clonableWorldData]}
                />
              ) : (
                '(not loaded)'
              )
            ) : (
              '(none)'
            )}
          </div>
          <div>
            {newFields[AssetFieldNames.clonableWorld] ? (
              newFields[GetFullAssetsFieldNames.clonableWorldData] ? (
                <AssetResultsItem
                  asset={newFields[GetFullAssetsFieldNames.clonableWorldData]}
                />
              ) : (
                '(not loaded)'
              )
            ) : (
              '(none)'
            )}
          </div>
        </Field>
        <Field
          name={AssetFieldNames.vrchatClonableWorldIds}
          label="VRChat Clonable World IDs">
          <div>
            {oldFields[AssetFieldNames.vrchatClonableWorldIds] &&
            oldFields[AssetFieldNames.vrchatClonableWorldIds].length
              ? oldFields[AssetFieldNames.vrchatClonableWorldIds][0]
              : '(none)'}
          </div>
          <div>
            {newFields[AssetFieldNames.vrchatClonableWorldIds] &&
            newFields[AssetFieldNames.vrchatClonableWorldIds].length
              ? newFields[AssetFieldNames.vrchatClonableWorldIds][0]
              : '(none)'}
          </div>
        </Field>
        <Field
          name={AssetFieldNames.vrchatClonableAvatarIds}
          label="VRChat Clonable Avatar IDs">
          <div>
            {oldFields[AssetFieldNames.vrchatClonableAvatarIds] &&
            oldFields[AssetFieldNames.vrchatClonableAvatarIds].length
              ? oldFields[AssetFieldNames.vrchatClonableAvatarIds].map(id => (
                  <Fragment key={id}>
                    {id}
                    <br />
                  </Fragment>
                ))
              : '(none)'}
          </div>
          <div>
            {newFields[AssetFieldNames.vrchatClonableAvatarIds] &&
            newFields[AssetFieldNames.vrchatClonableAvatarIds].length
              ? newFields[AssetFieldNames.vrchatClonableAvatarIds].map(id => (
                  <Fragment key={id}>
                    {id}
                    <br />
                  </Fragment>
                ))
              : '(none)'}
          </div>
        </Field>
        <Field
          name={AssetFieldNames.shortDescription}
          label="Short Description (Featured Assets)">
          <Value value={oldFields[AssetFieldNames.shortDescription]} />
          <Value value={newFields[AssetFieldNames.shortDescription]} />
        </Field>
      </div>
    </DiffContext.Provider>
  )
}
