import {
  MultiDiffFieldRenderer,
  MultiDiffFieldType,
  MultiDiffFields,
} from '../../components/multi-diff'
import { FullAsset } from '../../modules/assets'
import categoryMeta from '../../category-meta'

const fields: MultiDiffFields<FullAsset> = {
  thumbnailurl: {
    label: '',
    type: MultiDiffFieldType.ImageUrl,
  },
  category: {
    label: 'Category',
    type: MultiDiffFieldType.None,
    getValue: (value) => categoryMeta[value].nameSingular,
  },
  sourceurl: {
    label: 'Source',
    type: MultiDiffFieldType.None,
  },
  author: {
    label: 'Author',
    type: MultiDiffFieldType.Id,
    dataFieldName: 'authorname',
  },
  species: {
    label: 'Species',
    type: MultiDiffFieldType.Ids,
    dataFieldName: 'speciesnames',
    renderer: MultiDiffFieldRenderer.None,
    size: 'small',
  },
  price: {
    label: 'Price',
    type: MultiDiffFieldType.Price,
    currencyFieldName: 'pricecurrency',
  },
  tags: {
    label: 'Tags',
    type: MultiDiffFieldType.Tags,
  },
  attachmentids: {
    label: 'Attachments',
    type: MultiDiffFieldType.Ids,
    dataFieldName: 'attachmentsdata',
    renderer: MultiDiffFieldRenderer.Attachment,
  },
}

export default fields
