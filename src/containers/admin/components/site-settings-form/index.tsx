import GenericEditor from '@/components/generic-editor'
import Heading from '@/components/heading'
import {
  amendmentAutoApprovalEditableFields,
  assetAutoApprovalEditableFields,
  CollectionNames,
  SiteSettingsId,
} from '@/modules/sitesettings'

const SiteSettingsForm = () => {
  return (
    <>
      <Heading variant="h1">Site Settings</Heading>
      <GenericEditor
        collectionName={CollectionNames.SiteSettings}
        id={SiteSettingsId.AssetAutoApproval}
        fields={assetAutoApprovalEditableFields}
      />
      <GenericEditor
        collectionName={CollectionNames.SiteSettings}
        id={SiteSettingsId.AmendmentAutoApproval}
        fields={amendmentAutoApprovalEditableFields}
      />
    </>
  )
}

export default SiteSettingsForm
