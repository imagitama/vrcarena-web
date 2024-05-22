import React, {
  Ref,
  createContext,
  forwardRef,
  useContext,
  useState,
} from 'react'
import FlipMove from 'react-flip-move'
import { makeStyles } from '@material-ui/core/styles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'

import { popularCurrencies } from '../../currency'
import SpeciesResultItem from '../species-result-item'
import TagDiffChips from '../tag-diff-chips'
import { Attachment, AttachmentType } from '../../modules/attachments'
import { isUrlAYoutubeVideo } from '../../utils'
import Link from '../link'
import Button from '../button'
import Price from '../price'
import AssetSearch from '../asset-search'
import useCart from '../../hooks/useCart'
import TagChip from '../tag-chip'
import { colorFree } from '../../themes'

const useStyles = makeStyles((theme) => ({
  items: {
    width: '100%',
    display: 'flex',
    flexWrap: 'nowrap',
    // TODO: Some day get this table layout to work - tried subgrid, tried auto-fill, nothing
    // display: 'grid',
    // gridTemplateColumns:
    //   '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    // gridTemplateColumns: 'repeat(auto-fill, minmax(25%, 1fr))',
    // gap: '0.25rem',
  },
  item: {
    width: '400px',
    height: '100%',
    // display: 'grid',
    // gridTemplateRows:
    //   '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    // gap: '0.25rem',
    '&:nth-child(even)': {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    height: '4rem',
    padding: '0.5rem',
    '&:last-child': {
      height: 'auto !important',
      '& $rendererIdsItem': {
        maxHeight: 'inherit !important',
      },
    },
  },
  medium: { height: '10rem' },
  large: { height: '40rem' },
  metaCell: {},
  sideControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
  },
  sideControlBtn: {
    width: '3rem',
    height: '3rem',
    padding: '0.5rem',
    cursor: 'pointer',
    borderRadius: '100%',
    background: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover:not($disabledControl)': {
      background: theme.palette.action.hover,
    },
  },
  disabledControl: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '125%',
    padding: '1rem',
  },
  labels: {
    width: '150px',
  },
  labelCell: {
    fontSize: '125%',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'right',
    paddingRight: '2rem',
  },
  itemAdd: {
    padding: '2rem 0',
    display: 'flex',
    justifyContent: 'center',
  },
  noResultsLabel: {
    fontStyle: 'italic',
    opacity: 0.75,
  },
  freeChip: {
    backgroundColor: colorFree,
  },
  // renderers
  rendererIds: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rendererIdsItem: {
    maxHeight: '200px',
    padding: '0.5rem',
    '& img': {
      aspectRatio: '1/1',
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
  // quick fix for thumbs
  thumbnail: {
    '& img': {
      height: '100%',
    },
  },
}))

export type Item<T> = { id: string } & T

interface MultiDiffFieldBase {
  type: MultiDiffFieldType
  label: string
  size?: 'small' | 'medium' | 'large'
}

interface MultiDiffFieldNone<TItem> extends MultiDiffFieldBase {
  getValue?: (value: any) => any
}

interface MultiDiffFieldPrice<TItem> extends MultiDiffFieldBase {
  currencyFieldName: keyof TItem
}

interface MultiDiffFieldId<TItem> extends MultiDiffFieldBase {
  dataFieldName: keyof TItem
}

interface MultiDiffFieldIds<TItem> extends MultiDiffFieldBase {
  dataFieldName: keyof TItem
  renderer: MultiDiffFieldRenderer
}

export type MultiDiffField<TItem> =
  | MultiDiffFieldNone<TItem>
  | MultiDiffFieldId<TItem>
  | MultiDiffFieldIds<TItem>
  | MultiDiffFieldPrice<TItem>
  | MultiDiffFieldBase

export type MultiDiffFields<TItem> = Partial<
  Record<keyof TItem, MultiDiffField<TItem>>
>

export enum MultiDiffFieldType {
  ImageUrl,
  Tags,
  Price,
  Id,
  Ids,
  None, // assume its a string and just output it
}

export enum MultiDiffFieldRenderer {
  Species,
  Attachment,
  None, // assume its a string and just output it
}

const AttachmentRenderer = ({
  attachment: { url, type },
}: {
  attachment: Attachment
}) => {
  const classes = useStyles()

  switch (type) {
    case AttachmentType.Image:
      return <img src={url} />
    case AttachmentType.Url:
      if (isUrlAYoutubeVideo(url)) {
        return <div>YouTube Video: {url}</div>
      }
    default:
      console.warn(`Cannot render attachment type ${type}`)
      return null
  }
}

const Renderer = ({
  rendererName,
  value,
}: {
  rendererName: MultiDiffFieldRenderer
  value: any
}) => {
  switch (rendererName) {
    case MultiDiffFieldRenderer.Attachment:
      return <AttachmentRenderer attachment={value} />
    case MultiDiffFieldRenderer.Species:
      return <SpeciesResultItem speciesItem={value} />
    case MultiDiffFieldRenderer.None:
      return <>{value}</>
    default:
      console.warn(`Renderer cannot render by name "${rendererName}"`)
      return null
  }
}

const NoResultsLabel = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.noResultsLabel}>{children}</div>
}

const FieldOutput = <TItem,>({
  fieldName,
  fieldInfo,
  value,
  item,
}: {
  fieldName: keyof TItem
  fieldInfo: MultiDiffField<TItem>
  value: any
  item: TItem
}) => {
  const { mainItem } = useMultiDiff<TItem>()
  const classes = useStyles()

  const originalValue = mainItem[fieldName]

  switch (fieldInfo.type) {
    case MultiDiffFieldType.ImageUrl:
      return <img src={value} />
    case MultiDiffFieldType.Tags:
      return (
        <TagDiffChips
          oldTags={originalValue as unknown as string[]}
          newTags={value}
        />
      )
    case MultiDiffFieldType.Price:
      const currencyFieldName = (fieldInfo as MultiDiffFieldPrice<TItem>)
        .currencyFieldName
      const priceCurrency = item[
        currencyFieldName
      ] as unknown as keyof typeof popularCurrencies

      if (!value) {
        // @ts-ignore
        if (mainItem.tags && mainItem.tags.includes('free')) {
          return <TagChip tagName="FREE" className={classes.freeChip} noLink />
        }

        return <NoResultsLabel>No price set</NoResultsLabel>
      }

      return (
        <>
          <Price price={value} priceCurrency={priceCurrency} />
        </>
      )
    case MultiDiffFieldType.Id:
      const sourceFieldName = (fieldInfo as MultiDiffFieldId<TItem>)
        .dataFieldName
      const sourceFieldValue = item[sourceFieldName] as unknown as string
      return <>{sourceFieldValue}</>
    case MultiDiffFieldType.Ids:
      const idsSourceFieldName = (fieldInfo as MultiDiffFieldIds<TItem>)
        .dataFieldName
      const rendererName = (fieldInfo as MultiDiffFieldIds<TItem>).renderer
      const sourceFieldValues = item[idsSourceFieldName] as unknown as any[]
      return (
        <div className={classes.rendererIds}>
          {sourceFieldValues.map((sourceItem) => (
            <div className={classes.rendererIdsItem}>
              <Renderer rendererName={rendererName} value={sourceItem} />
            </div>
          ))}
        </div>
      )
    case MultiDiffFieldType.None:
    default:
      const getValue = (fieldInfo as MultiDiffFieldNone<TItem>).getValue
      if (getValue) {
        return getValue(value)
      }
      return value
  }
}

const Labels = <TItem,>() => {
  const classes = useStyles()
  const { mainItem, otherItems, fields, replaceOtherIds } =
    useMultiDiff<TItem>()
  const { ids: cartIds } = useCart()

  return (
    <div className={`${classes.item} ${classes.labels}`}>
      <div className={classes.cell}>
        <div>
          <Button
            size="small"
            color="default"
            isDisabled={otherItems.length === 0}
            onClick={() => replaceOtherIds([])}>
            Reset
          </Button>{' '}
          <Button
            size="small"
            color="default"
            isDisabled={otherItems.length > 0 || cartIds.length === 0}
            onClick={() => replaceOtherIds(cartIds)}
            title="Ensure no other items first">
            Use Cart
          </Button>
        </div>
      </div>
      {(Object.keys(mainItem) as (keyof TItem)[])
        .filter((fieldName) => fieldName in fields)
        .sort((fieldNameA, fieldNameB) => {
          const indexA = Object.keys(fields).indexOf(fieldNameA as string)
          const indexB = Object.keys(fields).indexOf(fieldNameB as string)
          return indexA - indexB
        })
        .map((fieldName) => {
          const fieldInfo = fields[fieldName]!!
          const size = getCellSizeForField(fieldInfo)
          return (
            <div
              key={fieldName as string}
              className={`${classes.cell} ${classes.labelCell} ${
                size ? classes[size] : ''
              }`}>
              {fieldInfo.label}
            </div>
          )
        })}
    </div>
  )
}

const getCellSizeForField = (
  field: MultiDiffField<any>
): keyof ReturnType<typeof useStyles> | undefined => {
  if (field.size) {
    return field.size as any
  }

  switch (field.type) {
    case MultiDiffFieldType.ImageUrl:
      return 'large'
    case MultiDiffFieldType.Tags:
      return 'large'
    case MultiDiffFieldType.Ids:
      return 'large'
  }
}

const ItemOutput = forwardRef(
  <TItem,>(
    {
      item,
      isFirst,
      isLast,
      isMain = false,
      showMultiControls,
    }: {
      item: Item<TItem>
      isFirst?: boolean
      isLast?: boolean
      isMain?: boolean
      showMultiControls?: boolean
    },
    ref: Ref<HTMLDivElement>
  ) => {
    const classes = useStyles()
    const { fields, titleField, moveIdLeft, moveIdRight, getUrl, removeId } =
      useMultiDiff<TItem>()
    return (
      <div ref={ref} className={classes.item}>
        <div className={`${classes.cell} ${classes.metaCell}`}>
          {!isMain && showMultiControls && (
            <div className={classes.sideControl}>
              <div
                className={`${classes.sideControlBtn} ${
                  isFirst ? classes.disabledControl : ''
                }`}
                onClick={() => moveIdLeft(item.id)}>
                <ChevronLeftIcon />
              </div>
            </div>
          )}
          <div className={classes.title}>
            {item[titleField] ? (
              <Link to={getUrl(item)}>{item[titleField]}</Link>
            ) : (
              'Loading...'
            )}
          </div>
          {!isMain && (
            <div className={classes.sideControl}>
              <div
                className={classes.sideControlBtn}
                onClick={() => removeId(item.id)}>
                <DeleteIcon />
              </div>
            </div>
          )}
          {!isMain && showMultiControls && (
            <div className={classes.sideControl}>
              <div
                className={`${classes.sideControlBtn} ${
                  isLast ? classes.disabledControl : ''
                }`}
                onClick={() => moveIdRight(item.id)}>
                <ChevronRightIcon />
              </div>
            </div>
          )}
        </div>
        {(Object.keys(item) as (keyof TItem)[])
          .filter((fieldName) => fieldName in fields)
          .sort((fieldNameA, fieldNameB) => {
            const indexA = Object.keys(fields).indexOf(fieldNameA as string)
            const indexB = Object.keys(fields).indexOf(fieldNameB as string)
            return indexA - indexB
          })
          .map((fieldName) => {
            const fieldInfo = fields[fieldName]!!
            const size = getCellSizeForField(fieldInfo)
            return (
              <div
                key={fieldName as string}
                className={`${classes.cell} ${size ? classes[size] : ''} ${
                  // quick fix for thumbnails
                  fieldName === 'thumbnailurl' ? classes.thumbnail : ''
                }`}>
                <FieldOutput<TItem>
                  item={item}
                  fieldName={fieldName}
                  fieldInfo={fieldInfo}
                  value={item[fieldName]}
                />
              </div>
            )
          })}
      </div>
    )
  }
)

const AddForm = ({ onAddId }: { onAddId: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { otherItems } = useMultiDiff()

  if (!isOpen) {
    return (
      <Button size="large" icon={<AddIcon />} onClick={() => setIsOpen(true)}>
        Add {otherItems.length ? 'Another' : 'Something To Compare'}
      </Button>
    )
  }

  return (
    <AssetSearch
      onSelect={(asset) => {
        setIsOpen(false)
        onAddId(asset.id)
      }}
    />
  )
}

interface MultiDiffContextType<TItem> {
  mainItem: TItem
  otherItems: TItem[]
  titleField: keyof TItem
  fields: MultiDiffFields<TItem>
  moveIdLeft: (id: string) => void
  moveIdRight: (id: string) => void
  getUrl: (item: TItem) => string
  removeId: (id: string) => void
  replaceOtherIds: (ids: string[]) => void
}

// @ts-ignore
const MultiDiffContext = createContext<MultiDiffContextType<any>>(undefined)
const useMultiDiff = <TItem,>() =>
  useContext(MultiDiffContext as React.Context<MultiDiffContextType<TItem>>)

const MultiDiff = <TItem,>({
  mainItem,
  otherItems,
  fields,
  titleField,
  moveIdLeft,
  moveIdRight,
  getUrl,
  onRemoveId,
  onAddId,
  replaceOtherIds,
}: {
  mainItem: Item<TItem>
  otherItems: Item<TItem>[]
  fields: MultiDiffFields<TItem>
  titleField: keyof TItem
  moveIdLeft: (id: string) => void
  moveIdRight: (id: string) => void
  getUrl: (item: TItem) => string
  onRemoveId: (id: string) => void
  onAddId: (id: string) => void
  replaceOtherIds: (ids: string[]) => void
}) => {
  const classes = useStyles()

  return (
    <MultiDiffContext.Provider
      value={{
        mainItem,
        otherItems,
        fields,
        titleField,
        moveIdLeft,
        moveIdRight,
        getUrl,
        removeId: onRemoveId,
        replaceOtherIds,
      }}>
      <FlipMove className={classes.items}>
        <Labels />
        <ItemOutput item={mainItem} isMain />
        {otherItems.map((item, idx) => (
          <ItemOutput
            key={item.id}
            showMultiControls={otherItems.length > 1}
            isFirst={idx === 0}
            isLast={idx === otherItems.length - 1}
            item={item}
          />
        ))}
        <div className={`${classes.item} ${classes.itemAdd}`}>
          <div>
            <AddForm onAddId={onAddId} />
          </div>
        </div>
      </FlipMove>
    </MultiDiffContext.Provider>
  )
}

export default MultiDiff
