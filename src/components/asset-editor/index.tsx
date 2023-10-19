import React, { createContext, useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import PhotoIcon from '@material-ui/icons/Photo'
import ClearIcon from '@material-ui/icons/Clear'
import CheckIcon from '@material-ui/icons/Check'
import GavelIcon from '@material-ui/icons/Gavel'
import SyncIcon from '@material-ui/icons/Sync'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import LinkIcon from '@material-ui/icons/Link'
import LocalOfferIcon from '@material-ui/icons/LocalOffer'
import TextFormatIcon from '@material-ui/icons/TextFormat'
import PetsIcon from '@material-ui/icons/Pets'
import CategoryIcon from '@material-ui/icons/Category'
import PanoramaIcon from '@material-ui/icons/Panorama'
import BugReportIcon from '@material-ui/icons/BugReport'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import PersonIcon from '@material-ui/icons/Person'
import LoyaltyIcon from '@material-ui/icons/Loyalty'
import ControlCameraIcon from '@material-ui/icons/ControlCamera'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered'
import { Tachometer as TachometerIcon } from '@emotion-icons/boxicons-regular/Tachometer'

import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import { ReactComponent as PatreonIcon } from '../../assets/images/icons/patreon.svg'
import { ReactComponent as VRChatIcon } from '../../assets/images/icons/vrchat.svg'

import {
  AssetCategories,
  AssetFieldNames,
  CollectionNames,
  PatreonStatuses
} from '../../hooks/useDatabaseQuery'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import { nsfwRules, WEBSITE_FULL_URL } from '../../config'
import { isGumroadUrl, isBoothUrl } from '../../utils'
import { getDoesAssetNeedPublishing } from '../../utils/assets'
import useUserRecord from '../../hooks/useUserRecord'

import Button from '../button'
import FormControls from '../form-controls'
import NoPermissionMessage from '../no-permission-message'
import Heading from '../heading'
import EditorArea from '../editor-area'
import Message from '../message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'

// editors
import AssetSourceEditor from '../asset-source-editor'
import AssetThumbnail from '../asset-thumbnail'
import AssetThumbnailUploader from '../asset-thumbnail-uploader'
import AssetTitleEditor from '../asset-title-editor'
import Markdown from '../markdown'
import DescriptionEditor from '../description-editor'
import ChangeAuthorForm from '../change-author-form'
import ChangeSpeciesEditor from '../change-species-editor'
import TagChips from '../tag-chips'
import AssetTagsEditor from '../asset-tags-editor'
import ChangeCategoryForm from '../change-category-form'
import AssetBannerEditor from '../asset-banner-editor'
import Price from '../price'
import PriceEditor from '../price-editor'
import AssetFiles from '../asset-files'
import AssetAttachmentUploader from '../asset-attachment-uploader'
import TutorialSteps from '../tutorial-steps'
import TutorialStepsEditor from '../tutorial-steps-editor'
import ToggleAdultForm from '../toggle-adult-form'
import DiscordServerInfo from '../discord-server-info'
import ChangeDiscordServerForm from '../change-discord-server-form'
import VrchatAvatarIdsForm from '../vrchat-avatar-ids-form'
import VrchatAvatars from '../vrchat-avatars'
import SketchfabEmbedEditor from '../sketchfab-embed-editor'
import ChangeVrchatWorldForm from '../change-vrchat-world-form'
import VrchatWorlds from '../vrchat-worlds'
import SketchfabEmbed from '../sketchfab-embed'
import SyncWithGumroadSettings from '../sync-with-gumroad-settings'
import PedestalVideo from '../pedestal-video'
import PedestalUploadForm from '../pedestal-upload-form'
import AssetShortDescriptionEditor from '../asset-short-description-editor'
import SlugEditor from '../slug-editor'
import RelationsEditor from '../relations-editor'
import Relations from '../relations'
import LicenseEditor from '../license-editor'

// @ts-ignore assets
import placeholderPedestalVideoUrl from '../../assets/videos/placeholder-pedestal.webm'
import placeholderPedestalFallbackImageUrl from '../../assets/videos/placeholder-pedestal-fallback.webp'

// publish
import PublishAssetButton from '../publish-asset-button'
import { getCanAssetBePublished } from '../../assets'
import CategoryItem from '../category-item'
import { Asset, FullAsset } from '../../modules/assets'
import { inDevelopment } from '../../environment'
import TagChip from '../tag-chip'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { defaultBorderRadius } from '../../themes'
import PerformanceEditor from '../performance-editor'

interface EditorInfo {
  assetId: string | null
  hydrate: () => Promise<void>
  isHydrating: boolean
  asset: FullAsset | null
  newFields: Asset | null
  setNewField: (fieldName: string, newVal: any) => void
  setNewFields: (newFields: null | Asset) => void
  isEditingAllowed: boolean
  setIsSyncFormVisible: (newVal: boolean) => void
  // optional
  onPublished?: () => void
  onFieldChanged?: (fieldName: string, newVal: any) => void
  onAssetChanged?: (newFields: Asset) => void
  // for amendments and uploading images
  originalAssetId?: string
}

export const EditorContext = createContext<EditorInfo>({} as any)
export const useEditor = () => useContext(EditorContext)

const useStyles = makeStyles(theme => ({
  // global
  content: {
    position: 'relative'
  },
  extraControls: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '1rem',
    zIndex: 100
  },
  fakeLink: {
    color: theme.palette.primary.light
  },
  noValueMessage: {
    opacity: '0.5',
    fontSize: '110%',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center'
  },
  heading: {
    textAlign: 'center',
    padding: '2rem 0',
    fontSize: '150%',
    fontWeight: 'bold'
  },
  hydrating: {
    opacity: 0.5
  },
  formControls: {
    marginTop: '4rem'
  },
  iconAndText: {
    display: 'flex',
    alignItems: 'center'
  },
  formEditorAreas: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    margin: '1rem 0'
  },
  formEditorArea: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0.5rem',
    marginBottom: '1rem',
    borderRadius: defaultBorderRadius,
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    },
    '&:nth-child(1), &:nth-child(4), &:nth-child(5), &:nth-child(7), &:nth-child(9), &:nth-child(12)': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }
  },
  formEditorAreaHeading: {
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
  },

  // rules
  acceptRulesButton: {
    textAlign: 'center',
    padding: '2rem 0'
  },

  // basics
  authorHeading: {
    fontSize: '50%'
  },
  banner: {
    width: '100%',
    '& img': {
      width: '100%'
    }
  },

  // patreon
  pedestalVideo: {
    width: '300px',
    height: '300px'
  },
  patreonMessage: {
    padding: '1rem',
    fontSize: '150%',
    textAlign: 'center',
    '& img': {
      maxWidth: '50%'
    }
  },

  // publish
  assetPreview: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: defaultBorderRadius,
    border: '3px dashed rgba(255, 255, 255, 0.5)'
  },

  sourceUrl: {
    '& svg': {
      fontSize: '100%'
    }
  },

  sectionButton: {
    fontSize: '125%',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '1rem',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)'
    }
  },
  section: {
    borderRadius: defaultBorderRadius,
    border: '0.2rem solid',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: '0.5rem'
  },
  invalid: {
    borderColor: 'rgba(255, 0, 0, 0.1)',
    '& $sectionButton': {
      background: 'rgba(255, 0, 0, 0.1)'
    }
  },
  semiValid: {
    borderColor: 'rgba(255, 255, 0, 0.1)',
    '& $sectionButton': {
      background: 'rgba(255, 255, 0, 0.1)'
    }
  },
  valid: {
    borderColor: 'rgba(0, 255, 0, 0.1)',
    '& $sectionButton': {
      background: 'rgba(0, 255, 0, 0.1)'
    }
  }
}))

const NoValueMessage = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()

  return (
    <div className={classes.noValueMessage}>
      <ClearIcon /> {children || '(no value)'}
    </div>
  )
}

const FormEditorArea = (props: {
  fieldName?: string
  title: string
  description: string
  icon: React.ReactNode
  display?: React.ReactNode
  editor?: React.ReactNode
  displayAndEditor?: React.ReactNode
  analyticsAction?: string
  analyticsCategoryName?: string
  onDone?: () => void
  className?: string
  overrideSave?: () => void
  overrideSaveWithNewFields?: () => void
  isRequired?: boolean
  isEditable?: boolean
  fields?: FullAsset
  newFields?: FullAsset
  // extra
  doWeRender?: boolean
}) => {
  const {
    hydrate,
    isHydrating,
    onFieldChanged,
    onAssetChanged,
    asset,
    newFields,
    isEditingAllowed
  } = useEditor()
  const classes = useStyles()

  if (props.doWeRender === false) {
    return null
  }

  return (
    <EditorArea
      {...props}
      // @ts-ignore
      onDone={hydrate}
      className={`${classes.formEditorArea} ${
        isHydrating ? classes.hydrating : ''
      }`}
      // @ts-ignore
      overrideSave={onFieldChanged}
      // @ts-ignore
      overrideSaveWithNewFields={onAssetChanged}
      fields={asset}
      newFields={newFields}
      isEditable={isEditingAllowed}
    />
  )
}

const LicenseOutput = ({ tags = [] }: { tags: string[] }) => {
  const classes = useStyles()

  const hasBannedPublicAvatars = tags.includes('public_avatars_banned')

  if (!tags.length || !hasBannedPublicAvatars) {
    return <NoValueMessage>No licensing set</NoValueMessage>
  }

  return (
    <>
      {tags.includes('public_avatars_banned') ? (
        <div className={classes.iconAndText}>
          <ClearIcon /> Public avatars are banned
        </div>
      ) : null}
    </>
  )
}

const BecomePatronMessage = () => (
  <Message>
    Want access to these features? Become a <strong>$1</strong> Patreon
    supporter and connect your VRCArena account with Patreon and follow the
    steps!
    <br />
    <br />
    <Button
      size="large"
      url={routes.myAccountWithTabNameVar.replace(':tabName', 'patreon')}
      icon={<PatreonIcon />}>
      Go To "Link With Patreon" Page
    </Button>
  </Message>
)

export const sourceTypes = {
  Gumroad: 'gumroad',
  Booth: 'booth',
  GitHub: 'github',
  Unknown: 'unknown'
}

export const getSourceTypeFromUrl = (url: string): string => {
  if (isGumroadUrl(url)) {
    return sourceTypes.Gumroad
  }
  if (isBoothUrl(url)) {
    return sourceTypes.Booth
  }
  return sourceTypes.Unknown
}

const getLabelForSyncButton = (sourceType: string): string => {
  switch (sourceType) {
    case sourceTypes.Gumroad:
      return 'Sync With Gumroad'
    case sourceTypes.Booth:
      return 'Sync With Booth'
    default:
      return ''
  }
}

const PatreonOnlyMessage = () => (
  <NoPermissionMessage message="You must be a Patreon supporter to use this feature" />
)

const SyncButton = ({
  sourceType,
  onSync
}: {
  sourceType: string
  onSync: () => void
}) => {
  const label = getLabelForSyncButton(sourceType)

  if (!label) {
    return null
  }

  return (
    <FormControls>
      <Button icon={<SyncIcon />} onClick={onSync}>
        {label}
      </Button>
    </FormControls>
  )
}

const AssetSource = ({ url }: { url: string }) => {
  const { setIsSyncFormVisible } = useEditor()
  const classes = useStyles()

  if (!url) {
    return <NoValueMessage>No URL set</NoValueMessage>
  }

  const sourceType = getSourceTypeFromUrl(url)

  const onSync = () => setIsSyncFormVisible(true)

  return (
    <div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.sourceUrl}>
        {url} <OpenInNewIcon />
      </a>
      <SyncButton sourceType={sourceType} onSync={onSync} />
    </div>
  )
}

const SourceDisplay = ({ value }: { value: string }) => (
  <AssetSource url={value} />
)

const ThumbnailDisplay = ({ value }: { value: string }) => (
  <AssetThumbnail url={value} />
)

const TitleDisplay = ({ value }: { value: string }) => (
  <Heading variant="h1" fakeLink noMargin>
    {value}
  </Heading>
)

const AuthorDisplay = ({
  value,
  fields
}: {
  value: string
  fields: FullAsset
}) => {
  const classes = useStyles()

  if (!value) {
    return <NoValueMessage>No author set</NoValueMessage>
  }

  return (
    <Heading variant="h1" noMargin>
      <span className={classes.authorHeading}>
        by <span className={classes.fakeLink}>{fields.authorname}</span>
      </span>
    </Heading>
  )
}

const CategoryDisplay = ({ value }: { value: string }) => (
  <div>
    {value ? (
      <CategoryItem category={categoryMeta[value]} />
    ) : (
      <NoValueMessage>No category set</NoValueMessage>
    )}
  </div>
)

const SpeciesDisplay = ({
  value,
  fields
}: {
  value: string
  fields: FullAsset
}) => (
  <>
    {value &&
    value.length &&
    // amendments do not populate this
    fields.speciesnames &&
    fields.speciesnames.length ? (
      fields.speciesnames
        .filter(
          (speciesName, idx) => fields.speciesnames.indexOf(speciesName) === idx
        )
        .map(speciesName => (
          <TagChip key={speciesName} tagName={speciesName} isDisabled />
        ))
    ) : (
      <NoValueMessage>No species set</NoValueMessage>
    )}
  </>
)

const DescriptionDisplay = ({ value }: { value: string }) =>
  value ? (
    <Markdown source={value} />
  ) : (
    <NoValueMessage>No description set</NoValueMessage>
  )

const LicenseDisplay = ({ value }: { value: string[] }) => (
  <LicenseOutput tags={value} />
)

const BannerDisplay = ({ value }: { value: string }) => {
  const classes = useStyles()

  return value ? (
    <div className={classes.banner}>
      <img src={value} alt="Banner" />
    </div>
  ) : (
    <NoValueMessage>No banner set</NoValueMessage>
  )
}

const TagsDisplay = ({ value }: { value: string[] }) => (
  <>
    {value && value.length ? (
      <TagChips tags={value} />
    ) : (
      <NoValueMessage>No tags set</NoValueMessage>
    )}
  </>
)

const PriceDisplay = ({ value, fields }: { value: number; fields: Asset }) =>
  value ? (
    <Price price={value} priceCurrency={fields.pricecurrency} />
  ) : (
    <NoValueMessage>No price set</NoValueMessage>
  )

const FilesDisplay = ({ value }: { value: string[] }) =>
  value && value.length ? (
    <AssetFiles assetId={''} fileUrls={value} />
  ) : (
    <NoValueMessage>No files set</NoValueMessage>
  )

const TutorialStepsDisplay = ({ value }: { value: string }) =>
  value && value.length ? (
    <TutorialSteps steps={value} />
  ) : (
    <NoValueMessage>No tutorial steps have been defined</NoValueMessage>
  )

const RelationsDisplay = ({
  value,
  fields
}: {
  value: string[]
  fields: FullAsset
}) => (
  <>
    {value && value.length ? (
      <Relations relations={fields.relations} />
    ) : (
      <NoValueMessage>No relations set</NoValueMessage>
    )}
  </>
)

const VrchatAvatarsDisplay = ({ value }: { value: string[] }) => (
  <>
    {value && value.length ? (
      <VrchatAvatars avatarIds={value} />
    ) : (
      <NoValueMessage>No VRChat avatars set</NoValueMessage>
    )}
  </>
)

const VrchatWorldsDisplay = ({ value }: { value: string[] }) => (
  <>
    {value && value.length ? (
      <VrchatWorlds worldIds={value} />
    ) : (
      <NoValueMessage>No VRChat worlds set</NoValueMessage>
    )}
  </>
)

const IsAdultDisplay = ({ value }: { value: boolean }) => {
  const classes = useStyles()
  return (
    <div>
      {value === true ? (
        <div
          className={classes.iconAndText}
          style={{ color: 'pink', fontWeight: 'bold' }}>
          <CheckIcon /> NSFW
        </div>
      ) : (
        <div
          className={classes.iconAndText}
          style={{ color: 'lightgreen', fontWeight: 'bold' }}>
          <ClearIcon /> Not NSFW
        </div>
      )}
    </div>
  )
}

const DiscordServerDisplay = ({
  value,
  fields
}: {
  value: string
  fields: FullAsset
}) => (
  <>
    {value ? (
      <>
        <strong>Preview:</strong>
        <br />
        <DiscordServerInfo discordServer={fields.discordserverdata} />
      </>
    ) : (
      <NoValueMessage>No Discord server set</NoValueMessage>
    )}
  </>
)

const SketchfabDisplay = ({ value }: { value: string }) => (
  <>
    {value ? (
      <SketchfabEmbed url={value} />
    ) : (
      <NoValueMessage>No Sketchfab set</NoValueMessage>
    )}
  </>
)

const PedestalDisplay = ({ fields }: { fields: FullAsset }) => {
  const classes = useStyles()
  return (
    <div className={classes.pedestalVideo}>
      <PedestalVideo
        videoUrl={fields.pedestalvideourl || placeholderPedestalVideoUrl}
        fallbackImageUrl={
          fields.pedestalfallbackimageurl || placeholderPedestalFallbackImageUrl
        }
      />
    </div>
  )
}

const ShortDescriptionDisplay = ({ value }: { value: string }) =>
  value ? (
    <Markdown source={value} />
  ) : (
    <NoValueMessage>No short description set</NoValueMessage>
  )

const SlugDisplay = ({ value }: { value: string }) => (
  <>
    {value ? (
      `${WEBSITE_FULL_URL}${routes.viewAssetWithVar.replace(':assetId', value)}`
    ) : (
      <NoValueMessage>No slug set</NoValueMessage>
    )}
  </>
)

const GumroadSettingsDisplay = ({ fields }: { fields: FullAsset }) => {
  const classes = useStyles()

  const isSyncWithGumroadEnabled =
    fields.gumroad && fields.gumroad.sync === true

  return (
    <div className={classes.iconAndText}>
      {isSyncWithGumroadEnabled ? (
        <>
          <CheckIcon /> Sync with Gumroad enabled
        </>
      ) : (
        <>
          <ClearIcon /> Not syncing with Gumroad
        </>
      )}
    </div>
  )
}

const MainControls = () => {
  const { assetId, asset } = useEditor()

  if (
    !assetId ||
    !asset ||
    !getCanAssetBePublished(asset) ||
    !getDoesAssetNeedPublishing(asset)
  ) {
    return null
  }

  return (
    <FormControls>
      <PublishAssetButton assetId={assetId} asset={asset} />
    </FormControls>
  )
}

// @ts-ignore
const SectionsContext = createContext<{
  toggleSection: (sectionName: string) => void
  expandedSectionName: string | null
}>()
const useSections = () => useContext(SectionsContext)

const Section = ({
  name,
  title,
  children
}: {
  name: string
  title: string
  children: any
}) => {
  const classes = useStyles()
  const { toggleSection, expandedSectionName } = useSections()

  const isExpanded = expandedSectionName === name

  return (
    <div className={classes.section}>
      <div
        className={classes.sectionButton}
        onClick={() => toggleSection(name)}>
        {title}
      </div>
      {isExpanded ? <div>{children}</div> : null}
    </div>
  )
}

const Editor = () => {
  const {
    asset,
    assetId,
    onFieldChanged,
    hydrate,
    originalAssetId
  } = useEditor()
  const [, , user] = useUserRecord()
  const classes = useStyles()
  const [expandedSectionName, setExpandedSectionName] = useState<string | null>(
    'basics'
  )

  const toggleSection = (sectionName: string) => {
    setExpandedSectionName(
      expandedSectionName === sectionName ? null : sectionName
    )
  }

  if (!asset) {
    return null
  }

  const isPatron =
    (user && user.patreonstatus === PatreonStatuses.Patron) || inDevelopment()

  const isSyncWithGumroadEnabled = asset.gumroad && asset.gumroad.sync === true

  return (
    <SectionsContext.Provider
      value={{
        toggleSection,
        expandedSectionName
      }}>
      <MainControls />
      <Section name="basics" title="Basics">
        <FormEditorArea
          fieldName={AssetFieldNames.sourceUrl}
          isRequired
          title="Source URL"
          description="Where can I get this asset? Enter a Gumroad or Booth URL and we can automatically get info for it."
          icon={() => <PhotoIcon />}
          display={SourceDisplay}
          editor={
            <AssetSourceEditor
              assetId={assetId}
              // @ts-ignore
              sourceUrl={asset.sourceurl}
              // @ts-ignore
              overrideSave={
                onFieldChanged
                  ? (newVal: string) =>
                      onFieldChanged(AssetFieldNames.sourceUrl, newVal)
                  : undefined
              }
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.thumbnailUrl}
          isRequired
          title="Thumbnail"
          description="A square image used in search results."
          icon={() => <PhotoIcon />}
          display={ThumbnailDisplay}
          editor={
            <AssetThumbnailUploader
              assetId={assetId || undefined}
              assetIdForBucket={originalAssetId}
              overrideSave={
                onFieldChanged
                  ? url => onFieldChanged(AssetFieldNames.thumbnailUrl, url)
                  : undefined
              }
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.title}
          isRequired
          title="Title"
          description="A short but descriptive name for your asset. Keep it short and sweet."
          icon={() => <TextFormatIcon />}
          display={TitleDisplay}
          editor={
            <AssetTitleEditor
              assetId={assetId}
              // @ts-ignore
              title={asset.title}
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.description}
          isRequired
          title="Description"
          description="Explain what the asset is for. Supports Markdown."
          icon={() => <TextFormatIcon />}
          display={DescriptionDisplay}
          editor={
            // @ts-ignore
            <DescriptionEditor
              assetId={assetId}
              description={asset.description}
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.author}
          isRequired
          title="Author"
          description="The original creator of the asset."
          icon={() => <PersonIcon />}
          display={AuthorDisplay}
          editor={
            // @ts-ignore
            <ChangeAuthorForm
              collectionName={CollectionNames.Assets}
              id={assetId}
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.category}
          isRequired
          title="Category"
          description="Which category the asset falls into."
          icon={() => <CategoryIcon />}
          display={CategoryDisplay}
          editor={
            // @ts-ignore
            <ChangeCategoryForm
              assetId={assetId}
              existingCategory={asset.category}
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.isAdult}
          isRequired
          title="Toggle Adult"
          description="Adult content is not visible to the public by default."
          icon={() => <LoyaltyIcon />}
          display={({ value }: { value: any }) => (
            <>
              <IsAdultDisplay value={value} />
            </>
          )}
          editor={
            <>
              <Markdown source={nsfwRules} />
              {assetId ? (
                <ToggleAdultForm
                  assetId={assetId}
                  isAdult={asset.isadult === true}
                  onDone={() => hydrate()}
                />
              ) : (
                'Need asset ID'
              )}
            </>
          }
        />
        {asset.category === AssetCategories.avatar ? (
          <FormEditorArea
            fieldName={AssetFieldNames.species}
            title="Species"
            description="Help people find your asset by grouping it into its species (if applicable)."
            icon={() => <PetsIcon />}
            display={SpeciesDisplay}
            editor={
              <ChangeSpeciesEditor
                assetId={assetId ? assetId : undefined}
                activeSpeciesIds={asset.species || []}
              />
            }
          />
        ) : null}
        <FormEditorArea
          fieldName={AssetFieldNames.bannerUrl}
          title="Banner"
          description="A wide and short image displayed behind the header to make your asset look pretty."
          icon={() => <PanoramaIcon />}
          display={BannerDisplay}
          editor={
            <AssetBannerEditor
              assetId={assetId ? assetId : undefined}
              assetIdForBucket={originalAssetId}
              overrideSave={
                onFieldChanged
                  ? url => onFieldChanged(AssetFieldNames.bannerUrl, url)
                  : undefined
              }
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.fileUrls}
          title="Files"
          description="Attach screenshots and videos here. Please use another hosting service for the actual asset (like Google Drive)."
          icon={() => <AttachFileIcon />}
          display={FilesDisplay}
          editor={
            <AssetAttachmentUploader
              assetId={assetId || undefined}
              existingFileUrls={asset.fileurls || []}
            />
          }
        />
      </Section>
      {asset.category === AssetCategories.tutorial ? (
        <Section name="tutorialSteps" title="Tutorial Steps">
          <FormEditorArea
            fieldName={AssetFieldNames.tutorialSteps}
            title="Tutorial Steps"
            description="The steps to complete the tutorial."
            icon={() => <FormatListNumberedIcon />}
            display={TutorialStepsDisplay}
            editor={
              // @ts-ignore
              <TutorialStepsEditor
                assetId={assetId}
                existingSteps={asset.tutorialsteps || []}
              />
            }
          />
        </Section>
      ) : null}
      <Section name="tags" title="Tags">
        <FormEditorArea
          fieldName={AssetFieldNames.tags}
          isRequired
          title="Tags"
          description="Correct tags are very helpful for finding the right asset. the site also uses them to display your asset in different ways."
          icon={() => <LocalOfferIcon />}
          display={TagsDisplay}
          editor={
            <AssetTagsEditor
              assetId={assetId}
              tags={asset.tags || []}
              // @ts-ignore
              categoryName={asset.category}
            />
          }
        />
      </Section>
      <Section name="Relationships" title="Relationships">
        <FormEditorArea
          fieldName={AssetFieldNames.relations}
          title="Relations"
          description="Define a parent, children, siblings and recommended assets."
          icon={() => <LinkIcon />}
          display={RelationsDisplay}
          editor={
            <RelationsEditor
              assetId={assetId || undefined}
              currentRelations={asset.relations || []}
              overrideSave={
                onFieldChanged
                  ? newRelations =>
                      onFieldChanged(AssetFieldNames.relations, newRelations)
                  : undefined
              }
            />
          }
        />
      </Section>
      <Section name="vrchat" title="VRChat">
        <FormEditorArea
          title="Performance"
          description="Help people find avatars that match their performance requirements."
          icon={() => <TachometerIcon />}
          doWeRender={asset.category === AssetCategories.avatar}
          display={() => (
            <PerformanceEditor
              assetId={assetId || undefined}
              currentTags={asset.tags || []}
            />
          )}
          editor={
            <PerformanceEditor
              assetId={assetId || undefined}
              currentTags={asset.tags || []}
              isEditing
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.vrchatClonableWorldIds}
          title="VRChat World"
          description="The VRChat world for this asset. NeosVR and ChilloutVR coming soon."
          icon={() => <VRChatIcon />}
          doWeRender={asset.category === AssetCategories.world}
          display={VrchatWorldsDisplay}
          editor={
            assetId ? (
              <ChangeVrchatWorldForm
                assetId={assetId}
                worldIds={asset.vrchatclonableworldids || []}
              />
            ) : null
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.vrchatClonableAvatarIds}
          title="VRChat Avatars"
          description="If users can clone an avatar in VRChat to test the asset you can set that here. Note: We only grab its info once."
          icon={() => <VRChatIcon />}
          display={VrchatAvatarsDisplay}
          editor={
            // @ts-ignore
            <VrchatAvatarIdsForm
              assetId={assetId}
              avatarIds={asset.vrchatclonableavatarids}
            />
          }
        />
      </Section>
      <Section name="requirements" title="Requirements">
        <FormEditorArea
          fieldName={AssetFieldNames.tags}
          title="License"
          description="What is the license for this asset?"
          icon={() => <GavelIcon />}
          display={LicenseDisplay}
          editor={
            <LicenseEditor
              // @ts-ignore
              assetId={assetId}
              tags={asset.tags || []}
              // @ts-ignore
              onDone={hydrate}
            />
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.price}
          title="Price"
          description="The price of the asset."
          icon={() => <AttachMoneyIcon />}
          display={PriceDisplay}
          editor={
            assetId ? (
              <PriceEditor
                assetId={assetId}
                currentPrice={asset.price}
                currentPriceCurrency={asset.pricecurrency}
              />
            ) : (
              <>Waiting</>
            )
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.discordServer}
          title="Discord Server"
          description="If you need to join a Discord server to download this asset you can set that here."
          icon={() => <DiscordIcon />}
          display={DiscordServerDisplay}
          editor={
            <ChangeDiscordServerForm
              collectionName={CollectionNames.Assets}
              id={assetId}
              existingDiscordServerId={asset.discordserver}
              existingDiscordServerData={asset.discordserverdata}
            />
          }
        />
      </Section>
      <Section name="patreon" title="Patreon Supporters Only">
        {isPatron ? (
          <SuccessMessage>
            Thank you for being a Patreon supporter!
          </SuccessMessage>
        ) : (
          <BecomePatronMessage />
        )}
        <FormEditorArea
          title="Pedestal"
          description="A pedestal is a 10 second, 360 degree rotating video of your 3D model. It is used on the asset page, on the homepage (if featured) and in various other places."
          icon={() => <ControlCameraIcon />}
          display={PedestalDisplay}
          editor={
            isPatron ? (
              <PedestalUploadForm
                assetId={assetId}
                // @ts-ignore
                overrideSave={
                  onFieldChanged
                    ? (newVideoUrl: string, newFallbackImageUrl: string) => {
                        onFieldChanged(
                          AssetFieldNames.pedestalVideoUrl,
                          newVideoUrl
                        )
                        onFieldChanged(
                          AssetFieldNames.pedestalFallbackImageUrl,
                          newFallbackImageUrl
                        )
                      }
                    : undefined
                }
              />
            ) : (
              <PatreonOnlyMessage />
            )
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.shortDescription}
          title="Featured Asset Description"
          description="This description is used instead of the normal one whenever the asset is featured on the homepage."
          icon={() => <TextFormatIcon />}
          display={ShortDescriptionDisplay}
          editor={
            isPatron ? (
              // @ts-ignore
              <AssetShortDescriptionEditor
                assetId={assetId}
                description={asset.shortdescription}
              />
            ) : (
              <PatreonOnlyMessage />
            )
          }
        />
        <FormEditorArea
          fieldName={AssetFieldNames.slug}
          title="Slug"
          description="A slug is a user-friendly name for the asset shown in the URL instead of the ID. Keep it very short (like 5-10 characters)."
          icon={() => <BugReportIcon />}
          display={SlugDisplay}
          editor={
            // @ts-ignore
            isPatron ? <SlugEditor assetId={assetId} /> : <PatreonOnlyMessage />
          }
        />
      </Section>
      <Section name="other" title="Other">
        <FormEditorArea
          fieldName={AssetFieldNames.sketchfabEmbedUrl}
          title="Sketchfab"
          description="We can embed a 3D preview from the Sketchfab website here."
          icon={() => <ControlCameraIcon />}
          display={SketchfabDisplay}
          // @ts-ignore
          editor={<SketchfabEmbedEditor assetId={assetId} />}
        />
        <FormEditorArea
          fieldName={AssetFieldNames.gumroad}
          title="Auto Sync"
          description="Automatically sync with Gumroad once per day. Experimental."
          icon={() => <SyncIcon />}
          display={GumroadSettingsDisplay}
          editor={
            <SyncWithGumroadSettings
              assetId={assetId}
              isEnabled={isSyncWithGumroadEnabled}
              // @ts-ignore
              settings={asset.gumroad}
            />
          }
        />
      </Section>
      <MainControls />
    </SectionsContext.Provider>
  )
}

export default () => {
  const { assetId, asset, isHydrating } = useEditor()
  const classes = useStyles()

  return (
    <div>
      <div className={classes.content}>
        <div className={classes.extraControls}>
          {assetId && (
            <Button
              color="default"
              url={routes.viewAssetWithVar.replace(
                ':assetId',
                asset && asset.slug ? asset.slug : assetId
              )}>
              View Asset
            </Button>
          )}
          {isHydrating && (
            <div>
              <LoadingIndicator />
            </div>
          )}
        </div>
        <Editor />
      </div>
    </div>
  )
}
