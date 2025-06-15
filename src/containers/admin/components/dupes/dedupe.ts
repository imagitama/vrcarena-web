import {
  Author,
  AuthorMeta,
  CollectionNames as AuthorsCollectionNames,
} from '../../../../modules/authors'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '../../../../modules/assets'
import { AccessStatus } from '../../../../modules/common'
import { updateRecord } from '../../../../data-store'
import { SupabaseClient } from '@supabase/supabase-js'
import { AssetInfo, GetAuthorDupesResult, PlannedField } from './types'

export const dedupe = async (
  client: SupabaseClient,
  dupeInfo: GetAuthorDupesResult,
  fieldInfosToApply: PlannedField[],
  assetsToSwitch: AssetInfo[],
  authorIdsToDelete: string[]
) => {
  const oldestAuthorId = dupeInfo.oldest.id

  if (fieldInfosToApply.length) {
    const fieldsToSave: Partial<Author> = {}

    for (const fieldInfo of fieldInfosToApply) {
      fieldsToSave[fieldInfo.fieldName] = fieldInfo.value
    }

    console.debug('update oldest author...', oldestAuthorId, fieldsToSave)

    const result = await updateRecord<Author>(
      client,
      AuthorsCollectionNames.Authors,
      oldestAuthorId,
      fieldsToSave
    )

    console.debug('update oldest author success', { result })
  } else {
    console.debug('no fields to apply, skipping')
  }

  if (assetsToSwitch.length) {
    console.debug(
      `switching ${assetsToSwitch.length} assets to author ${oldestAuthorId}...`
    )

    for (const assetInfo of assetsToSwitch) {
      const fieldsToSave = {
        author: oldestAuthorId,
      }

      console.debug(`update asset ${assetInfo.id}...`, fieldsToSave)

      const result = await updateRecord<Asset>(
        client,
        AssetsCollectionNames.Assets,
        assetInfo.id,
        fieldsToSave
      )

      console.debug(`update asset ${assetInfo.id} success`, { result })
    }
  } else {
    console.debug('no assets to switch, skipping')
  }

  console.debug(`deleting ${authorIdsToDelete.length} authors...`)

  for (const authorId of authorIdsToDelete) {
    const fieldsToSave = {
      accessstatus: AccessStatus.Deleted,
      editornotes: `Inferior version of ${oldestAuthorId}`,
    }

    console.debug(`delete author ${authorId}...`)

    await updateRecord<AuthorMeta>(
      client,
      AuthorsCollectionNames.AuthorsMeta,
      authorId,
      fieldsToSave
    )

    console.debug(`delete author ${authorId} success`)
  }
}
