import { useDispatch, useSelector } from 'react-redux'
import { BucketNames, Event } from '@/modules/events'
import ImageUploadInput from '../generic-editor/components/image-upload-input'
import { GenericInputProps } from '../generic-editor/types'
import { ImageUploadEditableField } from '@/editable-fields'
import { setPreviewFeaturedEvent } from '@/modules/app'
import { RootState } from '@/modules'

import Button from '@/components/button'
import { fieldTypes } from '@/generic-forms'
import { BANNER_HEIGHT, BANNER_WIDTH } from '@/config'

const EventBannerUploader = (
  props: GenericInputProps<
    Event['bannerurl'],
    Event,
    ImageUploadEditableField<Event>
  >
) => {
  const previewFeaturedEvent = useSelector<RootState, Event | null>(
    (root) => root.app.previewFeaturedEvent
  )
  const dispatch = useDispatch()
  console.debug(
    `EventBannerUploader.render`,
    props.formFields,
    previewFeaturedEvent
  )
  const onClickPreview = () => {
    dispatch(setPreviewFeaturedEvent(props.formFields))
  }
  const onClickClear = () => {
    dispatch(setPreviewFeaturedEvent(null))
  }

  return (
    <>
      <div>
        <Button
          onClick={previewFeaturedEvent ? onClickClear : onClickPreview}
          color="secondary">{`${
          previewFeaturedEvent ? 'Clear' : 'Show'
        } Preview`}</Button>
        <br />
        <br />
      </div>
      <ImageUploadInput
        {...props}
        editableField={{
          name: 'bannerurl',
          type: fieldTypes.imageUpload,
          requiredWidth: BANNER_WIDTH,
          requiredHeight: BANNER_HEIGHT,
          bucketName: BucketNames.EventBanners,
        }}
      />
    </>
  )
}

export default EventBannerUploader
