import React, { createContext, useContext } from 'react'
import { makeStyles } from '@mui/styles'

import PhotoIcon from '@mui/icons-material/Photo'
import ClearIcon from '@mui/icons-material/Clear'
import CheckIcon from '@mui/icons-material/Check'
import GavelIcon from '@mui/icons-material/Gavel'
import SyncIcon from '@mui/icons-material/Sync'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import LinkIcon from '@mui/icons-material/Link'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import TextFormatIcon from '@mui/icons-material/TextFormat'
import PetsIcon from '@mui/icons-material/Pets'
import CategoryIcon from '@mui/icons-material/Category'
import PanoramaIcon from '@mui/icons-material/Panorama'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PersonIcon from '@mui/icons-material/Person'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import ControlCameraIcon from '@mui/icons-material/ControlCamera'
import { Tachometer as TachometerIcon } from '@emotion-icons/boxicons-regular/Tachometer'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import { ReactComponent as PatreonIcon } from '../../assets/images/icons/patreon.svg'
import { ReactComponent as VRChatIcon } from '../../assets/images/icons/vrchat.svg'

import * as routes from '../../routes'
import { getCategoryMeta } from '../../category-meta'
import { adultSearchTerms, nsfwRules } from '../../config'
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
import ToggleAdultForm from '../toggle-adult-form'
import ChangeDiscordServerForm from '../change-discord-server-form'
import VrchatAvatarIdsForm from '../vrchat-avatar-ids-form'
import VrchatAvatars from '../vrchat-avatars'
import SketchfabEmbedEditor from '../sketchfab-embed-editor'
import SketchfabEmbed from '../sketchfab-embed'
import AssetShortDescriptionEditor from '../asset-short-description-editor'
import RelationsEditor from '../relations-editor'
import Relations from '../relations'
import LicenseEditor from '../license-editor'
import VrcFurySettings from '../vrcfury-settings'
import VrcFurySettingsEditor from '../vrcfury-settings-editor'
import PublishAssetButton from '../publish-asset-button'
import { getCanAssetBePublished } from '../../utils/assets'
import CategoryItem from '../category-item'
import {
  Asset,
  AssetCategory,
  FullAsset,
  SourceInfo,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'
import TagChip from '../tag-chip'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { VRCArenaTheme } from '../../themes'
import PerformanceEditor from '../performance-editor'
import Tabs from '../tabs'
import WarningMessage from '../warning-message'
import { VRCFury as VrcFuryIcon } from '../../icons'
import InfoMessage from '../info-message'
import useNotices from '../../hooks/useNotices'
import DiscordServerMustJoinNotice from '../discord-server-must-join-notice'
import { Attachment } from '../../modules/attachments'
import Attachments from '../attachments'
import AssetAttachmentsEditor from '../asset-attachments-editor'

// @ts-ignore assets
import { getSyncPlatformNameFromUrl, SyncPlatformName } from '../../syncing'
import ExtraSourcesEditor from '../extra-sources-editor'
import VisitSourceButton from '../visit-source-button'
import ChangeVccUrlForm from '../change-vcc-url-form'
import AddToVccButton from '../add-to-vcc-button'
import { tagVrcFuryReady } from '../../vrcfury'
import VrcFuryToggle from '../vrcfury-ready-toggle'
import Link from '../link'
import Paper from '../paper'
import useIsPatron from '../../hooks/useIsPatron'
import Columns from '../columns'
import Column from '../column'
import FeatureList from '../feature-list'

interface EditorInfo {
  assetId: string | null
  hydrate: () => Promise<void> | void
  isHydrating: boolean
  asset: FullAsset | null
  newFields: Asset | null
  setNewField: (fieldName: string, newVal: any) => void
  setNewFields: (newFields: null | Asset) => void
  isEditingAllowed: boolean
  setIsSyncFormVisible: (newVal: boolean) => void
  // optional
  onPublished?: () => void
  onFieldChanged?: (
    fieldName: Extract<keyof Asset, string>,
    newVal: any
  ) => void
  onAssetChanged?: (newFields: Asset) => void
  // for amendments and uploading images
  originalAssetId?: string
  insertExtraFields?: (extraFields: { [fieldName: string]: any }) => void
}

export const EditorContext = createContext<EditorInfo>({} as any)
export const useEditor = () => useContext(EditorContext)

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  // global
  content: {
    position: 'relative',
  },
  extraControls: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '1rem',
    zIndex: 100,
  },
  fakeLink: {
    color: theme.palette.primary.light,
  },
  noValueMessage: {
    opacity: '0.5',
    fontSize: '110%',
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
  },
  heading: {
    textAlign: 'center',
    padding: '2rem 0',
    fontSize: '150%',
    fontWeight: 'bold',
  },
  hydrating: {
    opacity: 0.5,
  },
  formControls: {
    marginTop: '4rem',
  },
  iconAndText: {
    display: 'flex',
    alignItems: 'center',
  },
  formEditorAreas: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    margin: '1rem 0',
  },
  formEditorArea: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0.5rem',
    marginBottom: '1rem',
    borderRadius: theme.shape.borderRadius,
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  formEditorAreaHeading: {
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // rules
  acceptRulesButton: {
    textAlign: 'center',
    padding: '2rem 0',
  },

  // basics
  authorHeading: {
    fontSize: '50%',
  },
  banner: {
    width: '100%',
    '& img': {
      width: '100%',
    },
  },

  // patreon
  pedestalVideo: {
    width: '300px',
    height: '300px',
  },
  patreonMessage: {
    padding: '1rem',
    fontSize: '150%',
    textAlign: 'center',
    '& img': {
      maxWidth: '50%',
    },
  },

  // publish
  assetPreview: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: theme.shape.borderRadius,
    border: '3px dashed rgba(255, 255, 255, 0.5)',
  },

  sourceUrl: {
    '& svg': {
      fontSize: '100%',
    },
  },

  sectionButton: {
    fontSize: '125%',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '1rem',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
  },
  section: {},
  invalid: {
    borderColor: 'rgba(255, 0, 0, 0.1)',
    '& $sectionButton': {
      background: 'rgba(255, 0, 0, 0.1)',
    },
  },
  semiValid: {
    borderColor: 'rgba(255, 255, 0, 0.1)',
    '& $sectionButton': {
      background: 'rgba(255, 255, 0, 0.1)',
    },
  },
  valid: {
    borderColor: 'rgba(0, 255, 0, 0.1)',
    '& $sectionButton': {
      background: 'rgba(0, 255, 0, 0.1)',
    },
  },
}))

const NoValueMessage = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()

  return (
    <div className={classes.noValueMessage}>
      <ClearIcon /> {children || '(no value)'}
    </div>
  )
}

const FormEditorArea = <TRecord,>(props: {
  fieldName?: keyof TRecord
  title: string
  description?: string
  icon: React.ReactNode
  display?:
    | React.ReactNode
    | React.ComponentType<{ value: any; fields: FullAsset }>
  editor?: React.ReactNode
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
    insertExtraFields,
    asset,
    newFields,
    isEditingAllowed,
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
      insertExtraFields={insertExtraFields}
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

const ShouldBeAdultWarning = ({ asset }: { asset: Asset }) => {
  const result = adultSearchTerms.find(
    (adultSearchTerm) => asset.title && asset.title.includes(adultSearchTerm)
  )
  return result ? (
    <WarningMessage leftAlign noTopMargin>
      Your asset should probably be marked as NSFW as the title includes the
      phrase "{result}"
    </WarningMessage>
  ) : null
}

const getFriendlySyncPlatformName = (
  syncPlatformName: SyncPlatformName
): string => {
  switch (syncPlatformName) {
    case SyncPlatformName.Gumroad:
      return 'Gumroad'
    case SyncPlatformName.Booth:
      return 'Booth'
    case SyncPlatformName.Itch:
      return 'Itch.io'
    case SyncPlatformName.Jinxxy:
      return 'Jinxxy'
    default:
      console.warn(`Could not get label for platform ${syncPlatformName}`)
      return syncPlatformName
  }
}

const PatreonOnlyMessage = () => (
  <NoPermissionMessage message="You must be a Patreon supporter to use this feature" />
)

const SyncButton = ({
  syncPlatformName,
  onSync,
}: {
  syncPlatformName: SyncPlatformName
  onSync: () => void
}) => {
  const label = getFriendlySyncPlatformName(syncPlatformName)

  return (
    <FormControls>
      <Button icon={<SyncIcon />} onClick={onSync}>
        Sync with {label}
      </Button>
    </FormControls>
  )
}

const AssetSource = ({
  sourceInfo,
  showSyncButton = true,
}: {
  sourceInfo: SourceInfo | null
  showSyncButton?: boolean
}) => {
  const { setIsSyncFormVisible } = useEditor()

  if (!sourceInfo) {
    return <NoValueMessage>No URL set</NoValueMessage>
  }

  const syncPlatformName = getSyncPlatformNameFromUrl(sourceInfo.url)

  const onSync = () => setIsSyncFormVisible(true)

  return (
    <>
      <Heading noTopMargin variant="h3">
        Current URL:
      </Heading>
      <a href={sourceInfo.url} target="_blank" rel="noopener noreferrer">
        {sourceInfo.url} <OpenInNewIcon />
      </a>
      <Heading variant="h3">Preview:</Heading>
      <VisitSourceButton sourceInfo={sourceInfo} />
      {showSyncButton && syncPlatformName !== undefined ? (
        <SyncButton syncPlatformName={syncPlatformName} onSync={onSync} />
      ) : null}
    </>
  )
}

const SourceDisplay = ({ value }: { value: string }) => (
  <AssetSource
    sourceInfo={{ url: value, price: null, pricecurrency: null, comments: '' }}
  />
)

const ExtraSourcesDisplay = ({ value }: { value: SourceInfo[] }) =>
  value && value.length ? (
    <>
      {value.map((sourceInfo) => (
        <Paper margin key={sourceInfo.url}>
          <AssetSource sourceInfo={sourceInfo} showSyncButton={false} />
        </Paper>
      ))}
    </>
  ) : (
    <>No extra sources set</>
  )

const ThumbnailDisplay = ({ value }: { value: string }) => (
  <AssetThumbnail url={value} />
)

const TitleDisplay = ({ value }: { value: string }) => (
  <Heading variant="h1" fakeLink noMargin>
    {value}
  </Heading>
)

const AttachmentsDisplay = ({ fields }: { fields: FullAsset }) => (
  <Attachments
    ids={fields.attachmentids}
    attachmentsData={fields.attachmentsdata || []}
    includeMeta
    includeParents={false}
  />
)

const AuthorDisplay = ({
  value,
  fields,
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
        by{' '}
        <Link to={routes.viewAuthorWithVar.replace(':authorId', value)}>
          {fields.authorname}
        </Link>
      </span>
    </Heading>
  )
}

const CategoryDisplay = ({ value }: { value: string }) => (
  <div>
    {value ? (
      <CategoryItem category={getCategoryMeta(value as AssetCategory)} />
    ) : (
      <NoValueMessage>No category set</NoValueMessage>
    )}
  </div>
)

const SpeciesDisplay = ({
  value,
  fields,
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
        .map((speciesName) => (
          <TagChip key={speciesName} tagName={speciesName} isDisabled />
        ))
    ) : (
      <NoValueMessage>No species set</NoValueMessage>
    )}
  </>
)

const DescriptionDisplay = ({ value }: { value: string }) =>
  value ? (
    <Markdown source={value} replaceImagesWithButtons />
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

const TagsDisplay = ({
  value,
  fields,
}: {
  value: string[]
  fields: FullAsset
}) => (
  <>
    {value && value.length ? (
      <Columns>
        <Column>
          <TagChips tags={value} />
        </Column>
        <Column>
          <Heading variant="h4" noTopMargin>
            Features:
          </Heading>
          <FeatureList tags={value} existingTagsData={fields.tagsdata} />
        </Column>
      </Columns>
    ) : (
      <NoValueMessage>No tags set</NoValueMessage>
    )}
  </>
)

const PriceDisplay = ({
  value,
  fields,
}: {
  value: number | null
  fields: Asset
}) =>
  value !== null ? (
    <Price price={value} priceCurrency={fields.pricecurrency} />
  ) : (
    <NoValueMessage>No price set</NoValueMessage>
  )

const RelationsDisplay = ({
  value,
  fields,
}: {
  value: string[]
  fields: FullAsset
}) => (
  <>
    {fields.relations && Array.isArray(fields.relations) ? (
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
  fields,
}: {
  value: string
  fields: FullAsset
}) => (
  <>
    {value ? (
      <>
        <strong>Preview:</strong>
        <br />
        <DiscordServerMustJoinNotice
          discordServerId={fields.discordserver || ''}
          discordServerData={fields.discordserverdata || undefined}
        />
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

const ShortDescriptionDisplay = ({ value }: { value: string }) =>
  value ? (
    <Markdown source={value} />
  ) : (
    <NoValueMessage>No short description set</NoValueMessage>
  )

const AttachmentsEditor = ({
  assetId,
  attachmentIds,
  attachmentsData,
  overrideSave,
  onDone,
  insertExtraFields,
}: {
  assetId: string // dont need but helpful later
  attachmentIds: string[]
  attachmentsData: Attachment[]
  overrideSave?: (ids: string[]) => void
  onDone?: () => void
  insertExtraFields?: (extraFields: { [fieldName: string]: any }) => void
}) => {
  const { originalAssetId } = useEditor()

  return (
    <>
      <InfoMessage>
        The first three images and/or YouTube videos will be displayed at the
        top of the page
      </InfoMessage>
      <AssetAttachmentsEditor
        assetId={originalAssetId || assetId}
        ids={attachmentIds}
        attachmentsData={attachmentsData}
        overrideSave={
          overrideSave
            ? (ids, extraFields) => {
                overrideSave(ids)

                if (insertExtraFields) {
                  insertExtraFields(extraFields)
                }
              }
            : undefined
        }
        onDone={() => {
          if (onDone) {
            onDone()
          }
        }}
      />
    </>
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

const vrcFuryInfoNoticeId = 'asset-editor-vrcfury-info'

const Editor = () => {
  const { asset, assetId, onFieldChanged, hydrate, originalAssetId } =
    useEditor()
  const [hiddenNotices, hideNotice] = useNotices()
  const isPatron = useIsPatron()

  // NOTE: Could be asset and no ID (for amendments)

  if (!asset) {
    return <>No asset</>
  }

  return (
    <>
      <MainControls />
      <Tabs
        urlWithTabNameVar={
          assetId
            ? routes.editAssetWithVarAndTabNameVar.replace(':assetId', assetId)
            : undefined
        }
        items={[
          {
            name: 'category',
            label: 'Category',
            contents: (
              <>
                <FormEditorArea
                  fieldName="category"
                  isRequired
                  title="Category"
                  description="Which category the asset falls into."
                  icon={<CategoryIcon />}
                  display={CategoryDisplay}
                  editor={
                    <ChangeCategoryForm
                      assetId={assetId}
                      existingCategory={asset.category}
                    />
                  }
                />
                {asset.category === AssetCategory.Accessory ? (
                  <FormEditorArea
                    fieldName="relations"
                    title="Parent"
                    description="Accessories usually have a parent that is required for it to function. Set it here (if needed)."
                    icon={<LinkIcon />}
                    display={RelationsDisplay}
                    editor={
                      <RelationsEditor
                        assetId={assetId || null}
                        currentRelations={asset.relations || []}
                        assetsData={asset.relationsdata}
                        overrideSave={
                          onFieldChanged
                            ? (newRelations) =>
                                onFieldChanged('relations', newRelations)
                            : undefined
                        }
                      />
                    }
                  />
                ) : null}
              </>
            ),
          },
          {
            name: 'source',
            label: 'Source',
            contents: (
              <>
                <FormEditorArea
                  fieldName="sourceurl"
                  isRequired
                  title="Primary Source URL"
                  description={
                    'The recommended place to purchase or download this asset. Some URLs can be used to "sync" data like Gumroad, Booth, Itch.io and Jinxxy.'
                  }
                  icon={<PhotoIcon />}
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
                              onFieldChanged('sourceurl', newVal)
                          : undefined
                      }
                    />
                  }
                />
                <FormEditorArea
                  title="Price"
                  description="The price when visiting the primary source. Extra sources can have their own prices."
                  icon={<AttachMoneyIcon />}
                  display={() => (
                    <PriceDisplay value={asset.price} fields={asset} />
                  )}
                  editor={
                    <PriceEditor
                      assetId={assetId}
                      currentPrice={asset.price}
                      currentPriceCurrency={asset.pricecurrency}
                      overrideSave={
                        onFieldChanged
                          ? (newPrice, newPriceCurrency) => {
                              onFieldChanged('price', newPrice)
                              onFieldChanged('pricecurrency', newPriceCurrency)
                            }
                          : undefined
                      }
                    />
                  }
                />
                <FormEditorArea
                  fieldName="extrasources"
                  title="Extra Sources"
                  description="Any other places people can get this asset."
                  icon={<PhotoIcon />}
                  display={ExtraSourcesDisplay}
                  editor={
                    <ExtraSourcesEditor
                      extraSources={asset.extrasources}
                      assetId={assetId}
                      overrideSave={
                        onFieldChanged
                          ? (newExtraSources: SourceInfo[]) =>
                              onFieldChanged('extrasources', newExtraSources)
                          : undefined
                      }
                      onDone={() => hydrate()}
                    />
                  }
                />
              </>
            ),
          },
          {
            name: 'basics',
            label: 'Basics',
            contents: (
              <>
                <FormEditorArea
                  fieldName="thumbnailurl"
                  isRequired
                  title="Thumbnail"
                  description="A square image used in search results."
                  icon={<PhotoIcon />}
                  display={ThumbnailDisplay}
                  editor={
                    <AssetThumbnailUploader
                      assetId={assetId || null}
                      assetIdForBucket={originalAssetId}
                      overrideSave={
                        onFieldChanged
                          ? (url) => onFieldChanged('thumbnailurl', url)
                          : undefined
                      }
                    />
                  }
                />
                <FormEditorArea
                  fieldName="title"
                  isRequired
                  title="Title"
                  description="A short but descriptive name for your asset. Keep it short and sweet."
                  icon={<TextFormatIcon />}
                  display={TitleDisplay}
                  editor={
                    <AssetTitleEditor assetId={assetId} title={asset.title} />
                  }
                />
                <FormEditorArea
                  fieldName="description"
                  isRequired
                  title="Description"
                  description="Explain what the asset is for. Supports Markdown."
                  icon={<TextFormatIcon />}
                  display={DescriptionDisplay}
                  editor={
                    <DescriptionEditor
                      assetId={assetId}
                      description={asset.description}
                    />
                  }
                />
                <FormEditorArea
                  fieldName="author"
                  isRequired
                  title="Author"
                  description="The original creator of the asset."
                  icon={<PersonIcon />}
                  display={AuthorDisplay}
                  editor={
                    <ChangeAuthorForm
                      collectionName={AssetsCollectionNames.Assets}
                      id={assetId!!}
                    />
                  }
                />
                <FormEditorArea
                  fieldName="isadult"
                  isRequired
                  title="Toggle Adult"
                  description="Adult content is not visible to the public by default."
                  icon={<LoyaltyIcon />}
                  display={({ value }: { value: any }) => (
                    <>
                      {asset ? <ShouldBeAdultWarning asset={asset} /> : null}
                      <IsAdultDisplay value={value} />
                    </>
                  )}
                  editor={
                    <>
                      <Markdown source={nsfwRules} />
                      {asset ? <ShouldBeAdultWarning asset={asset} /> : null}
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
                {asset.category === AssetCategory.Avatar ? (
                  <FormEditorArea
                    fieldName="species"
                    title="Species"
                    description="Help people find your asset by grouping it into its species (if applicable)."
                    icon={<PetsIcon />}
                    display={SpeciesDisplay}
                    editor={
                      <ChangeSpeciesEditor
                        assetId={assetId || null}
                        activeSpeciesIds={asset.species || []}
                      />
                    }
                  />
                ) : null}
                <FormEditorArea
                  fieldName="bannerurl"
                  title="Banner"
                  description="A wide and short image displayed behind the header to make your asset look pretty."
                  icon={<PanoramaIcon />}
                  display={BannerDisplay}
                  editor={
                    <AssetBannerEditor
                      assetId={assetId || null}
                      assetIdForBucket={originalAssetId}
                      overrideSave={
                        onFieldChanged
                          ? (url) => onFieldChanged('bannerurl', url)
                          : undefined
                      }
                    />
                  }
                />
              </>
            ),
          },
          {
            name: 'attachments',
            label: 'Attachments',
            contents: (
              <>
                <FormEditorArea<Asset>
                  // TODO: Type safe this var
                  fieldName="attachmentids"
                  title="Attachments"
                  description="Upload images, add YouTube videos, link to files and more."
                  display={AttachmentsDisplay}
                  editor={
                    <AttachmentsEditor
                      assetId={asset.id}
                      attachmentIds={asset.attachmentids}
                      attachmentsData={asset.attachmentsdata || []}
                      overrideSave={
                        onFieldChanged
                          ? (newIds: string[]) => {
                              onFieldChanged('attachmentids', newIds)
                            }
                          : undefined
                      }
                    />
                  }
                  icon={<AttachFileIcon />}
                />
              </>
            ),
          },
          {
            name: 'tags',
            label: 'Tags',
            contents: (
              <>
                <FormEditorArea
                  fieldName="tags"
                  isRequired
                  title="Tags"
                  description="Correct tags are very helpful for finding the right asset."
                  icon={<LocalOfferIcon />}
                  display={TagsDisplay}
                  editor={
                    <AssetTagsEditor
                      assetId={assetId}
                      tags={asset.tags || []}
                      // @ts-ignore
                      categoryName={asset.category}
                      asset={asset}
                    />
                  }
                />
              </>
            ),
          },
          {
            name: 'relations',
            label: 'Relations',
            contents: (
              <>
                <FormEditorArea
                  fieldName="relations"
                  title="Relations"
                  description={`To help people find an asset your one depends on or is related to, you can "link" it here.`}
                  icon={<LinkIcon />}
                  display={RelationsDisplay}
                  editor={
                    <RelationsEditor
                      assetId={assetId || null}
                      currentRelations={asset.relations || []}
                      assetsData={asset.relationsdata}
                      overrideSave={
                        onFieldChanged
                          ? (newRelations) =>
                              onFieldChanged('relations', newRelations)
                          : undefined
                      }
                    />
                  }
                />
              </>
            ),
          },
          {
            name: 'vrcfury',
            label: 'VRCFury',
            contents: (
              <>
                {!hiddenNotices.includes(vrcFuryInfoNoticeId) && (
                  <InfoMessage
                    onOkay={() => hideNotice(vrcFuryInfoNoticeId)}
                    title={
                      <>
                        We recommend{' '}
                        <a
                          href="https://vrcfury.com"
                          target="_blank"
                          rel="noopener noreferrer">
                          VRCFury
                        </a>{' '}
                        when adding accessories to avatars
                      </>
                    }>
                    <ul>
                      <li>free</li>
                      <li>non-destructive</li>
                    </ul>
                    <p>
                      Accessory creators can create a Unity prefab with a
                      VRCFury component to make adding accessories really easy.
                    </p>
                    <p>
                      Avatar creators can include VRCFury components in their
                      avatar prefabs to help people use their avatar.
                    </p>
                    <p>
                      <strong>
                        VRCArena has no affiliation with VRCFury at all. We just
                        love the tool!
                      </strong>
                    </p>
                  </InfoMessage>
                )}
                <FormEditorArea
                  title="VRCFury Ready"
                  icon={<VrcFuryIcon />}
                  display={() =>
                    asset.tags.includes(tagVrcFuryReady) ? (
                      <VrcFurySettings isVrcFuryReady />
                    ) : (
                      <NoValueMessage>
                        No indication that it is VRCFury ready
                      </NoValueMessage>
                    )
                  }
                  editor={
                    <VrcFuryToggle
                      assetId={asset.id}
                      existingTags={asset.tags}
                      overrideSave={
                        onFieldChanged
                          ? (newTags) => onFieldChanged('tags', newTags)
                          : undefined
                      }
                    />
                  }
                />
                <FormEditorArea
                  title="VRCFury Prefabs"
                  description={`Link third-party prefabs people have created for this avatar or accessory.`}
                  icon={<VrcFuryIcon />}
                  display={() =>
                    asset.extradata &&
                    asset.extradata.vrcfury &&
                    asset.extradata.vrcfury.prefabs ? (
                      <VrcFurySettings
                        prefabs={asset.extradata.vrcfury.prefabs}
                      />
                    ) : (
                      <NoValueMessage>
                        No VRCFury settings have been set
                      </NoValueMessage>
                    )
                  }
                  editor={
                    <VrcFurySettingsEditor
                      assetId={assetId || null}
                      currentExtraData={
                        asset && asset.extradata ? asset.extradata : undefined
                      }
                      overrideSave={
                        onFieldChanged
                          ? (newExtraData) =>
                              onFieldChanged('extradata', newExtraData)
                          : undefined
                      }
                    />
                  }
                />
              </>
            ),
          },
          {
            name: 'avatars',
            label: 'Avatars',
            contents: (
              <>
                <FormEditorArea
                  title="Performance"
                  description="Help people find avatars that match their performance requirements."
                  icon={<TachometerIcon />}
                  doWeRender={asset.category === AssetCategory.Avatar}
                  display={() => (
                    <PerformanceEditor
                      assetId={assetId || null}
                      currentTags={asset.tags || []}
                    />
                  )}
                  editor={
                    <PerformanceEditor
                      assetId={assetId || null}
                      currentTags={asset.tags || []}
                      isEditing
                    />
                  }
                />
                <FormEditorArea
                  fieldName="vrchatclonableavatarids"
                  title="VRChat Avatars"
                  description="If users can clone an avatar in VRChat to test the asset you can set that here. Note: We only grab its info once."
                  icon={<VRChatIcon />}
                  display={VrchatAvatarsDisplay}
                  editor={
                    <VrchatAvatarIdsForm
                      assetId={assetId}
                      avatarIds={asset.vrchatclonableavatarids}
                    />
                  }
                />
              </>
            ),
          },
          {
            name: 'patreon',
            label: 'Patreon',
            contents: (
              <>
                {isPatron ? (
                  <SuccessMessage>
                    Thank you for being a Patreon supporter!
                  </SuccessMessage>
                ) : (
                  <BecomePatronMessage />
                )}
                <FormEditorArea
                  fieldName="shortdescription"
                  title="Featured Asset Description"
                  description="This description is used instead of the normal one whenever the asset is featured on the homepage."
                  icon={<TextFormatIcon />}
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
              </>
            ),
          },
          {
            name: 'extra',
            label: 'Extra',
            contents: (
              <>
                <FormEditorArea
                  title="Price"
                  description="The price of the asset."
                  icon={<AttachMoneyIcon />}
                  display={() => (
                    <PriceDisplay value={asset.price} fields={asset} />
                  )}
                  editor={
                    <PriceEditor
                      assetId={assetId}
                      currentPrice={asset.price}
                      currentPriceCurrency={asset.pricecurrency}
                      overrideSave={
                        onFieldChanged
                          ? (newPrice, newPriceCurrency) => {
                              console.debug('Here it is')
                              onFieldChanged('price', newPrice)
                              onFieldChanged('pricecurrency', newPriceCurrency)
                            }
                          : undefined
                      }
                    />
                  }
                />
                <FormEditorArea
                  fieldName="discordserver"
                  title="Discord Server"
                  description="If you need to join a Discord server to download this asset you can set that here."
                  icon={<DiscordIcon />}
                  display={DiscordServerDisplay}
                  editor={
                    <ChangeDiscordServerForm
                      collectionName={AssetsCollectionNames.Assets}
                      id={assetId || undefined}
                      existingDiscordServerId={asset.discordserver}
                      existingDiscordServerData={
                        asset.discordserverdata || undefined
                      }
                    />
                  }
                />
                <FormEditorArea
                  fieldName="sketchfabembedurl"
                  title="Sketchfab"
                  description="We can embed a 3D preview from the Sketchfab website here."
                  icon={<ControlCameraIcon />}
                  display={SketchfabDisplay}
                  // @ts-ignore
                  editor={<SketchfabEmbedEditor assetId={assetId} />}
                />
                <FormEditorArea
                  fieldName="tags"
                  title="License"
                  description="What is the license for this asset?"
                  icon={<GavelIcon />}
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
                <FormEditorArea<Asset>
                  fieldName="vccurl"
                  title="VCC"
                  description="Display a button to add to the VRChat Creator Companion."
                  icon={<VRChatIcon />}
                  display={({ value }: { value: Asset['vccurl'] }) =>
                    value ? (
                      <AddToVccButton vccUrl={value} />
                    ) : (
                      <NoValueMessage>No VCC URL set</NoValueMessage>
                    )
                  }
                  editor={
                    <ChangeVccUrlForm
                      assetId={assetId || null}
                      existingVccUrl={asset.vccurl}
                      onDone={hydrate}
                    />
                  }
                />
              </>
            ),
          },
        ]}
      />
      <MainControls />
    </>
  )
}

const AssetEditor = () => {
  const { assetId, asset, isHydrating } = useEditor()
  const classes = useStyles()

  return (
    <div>
      <div className={classes.content}>
        <div className={classes.extraControls}>
          {assetId && (
            <Button
              color="secondary"
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

export default AssetEditor
