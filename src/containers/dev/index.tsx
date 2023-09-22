import React, { useState } from 'react'
import { Helmet } from 'react-helmet'

import TextInput from '../../components/text-input'
import Button from '../../components/button'
import { parseBase64String } from '../../utils'

// components

import TagInput from '../../components/tag-input'
import AssetFeatures from '../../components/asset-features'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import NoPermissionMessage from '../../components/no-permission-message'
import WarningMessage from '../../components/warning-message'
import Message from '../../components/message'
import ErrorBoundary from '../../components/error-boundary'
import { featureMeta } from '../../features'
import ImageUploader from '../../components/image-uploader'
import MarkdownEditor from '../../components/markdown-editor'
import LoadingIndicator from '../../components/loading-indicator'
import AssetEditor, { EditorContext } from '../../components/asset-editor'
import TextDiff from '../../components/text-diff'
import TagDiff from '../../components/tag-diff'
import { tags } from '../../utils/tags'
import SetupProfile from '../../components/setup-profile'
import SpeciesVsSelector from '../../components/species-vs-selector'
import FileUploader from '../../components/file-uploader'

import { bucketNames } from '../../file-uploading'
import ChangeRanksForm from '../../components/change-ranks-form'
import SurveyForm from '../../components/survey-form'
import survey from '../../surveys/creating-asset'
import { CollectionNames } from '../../modules/assets'

const ErrorCodeDecoder = () => {
  const [inputString, setInputString] = useState('')
  const [decodedString, setDecodedString] = useState('')
  return (
    <>
      <TextInput
        value={inputString}
        onChange={e => setInputString(e.target.value)}
      />
      <Button onClick={() => setDecodedString(parseBase64String(inputString))}>
        Decode
      </Button>
      {decodedString}
    </>
  )
}

const MyErrorComponent = () => {
  new Error('Something went wrongggg')
  return null
}

const ErrorBoundaryWrapper = () => {
  return (
    <ErrorBoundary>
      <MyErrorComponent />
    </ErrorBoundary>
  )
}

const ImageUploadTest = () => {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [lastUrl, setLastUrl] = useState('')

  return (
    <>
      {lastUrl ? <img src={lastUrl} /> : null}
      <Button onClick={() => setIsFormVisible(currentVal => !currentVal)}>
        Upload image
      </Button>
      {isFormVisible ? (
        <ImageUploader
          bucketName="test"
          directoryPath="dev"
          onDone={url => setLastUrl(url)}
        />
      ) : null}
    </>
  )
}

const MarkdownEditorWrapper = () => {
  const [text, setText] = useState('Here is some *markdown*.')
  return (
    <MarkdownEditor content={text} onChange={newText => setText(newText)} />
  )
}

const AssetEditorWrapper = () => {
  const [enabled, setEnabled] = useState(false)

  if (!enabled) {
    return <Button onClick={() => setEnabled(true)}>Show</Button>
  }

  return (
    <EditorContext.Provider
      value={{
        // @ts-ignore
        asset: {}
      }}>
      <AssetEditor />
    </EditorContext.Provider>
  )
}

const SpeciesVsSelectorDemo = () => {
  return (
    <SpeciesVsSelector
      horizontalTitles={true}
      selectedSpeciesIds={['37KnSjelJNppCSD8jeyM']}
    />
  )
}

const FileUploaderDemo = () => {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)

  return (
    <>
      URL: {uploadedFileUrl || '(none yet)'}
      <FileUploader
        bucketName={bucketNames.assetThumbnails}
        directoryPath="2598f3fe-c9d3-45c7-bd86-a9ec258e1a7d"
        onDone={url => setUploadedFileUrl(url)}
        onError={console.error}
      />
    </>
  )
}

const loremIpsum =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

export default () => {
  return (
    <>
      <Helmet>
        <title>Development area | VRCArena</title>
        <meta name="description" content="Internal use." />
      </Helmet>
      <div>
        <h1>Components</h1>
        <h2>Survey Form</h2>
        <SurveyForm
          survey={survey}
          parentTable={CollectionNames.Assets}
          parentId="abc"
        />
        <h2>Change Rank Form</h2>
        <ChangeRanksForm />
        <h2>Loading</h2>
        <LoadingIndicator message="Loading items..." />
        <h2>Tag Input</h2>
        <TagInput currentTags={['free', 'paid', 'rigged']} />
        <h2>Asset Features</h2>
        <AssetFeatures
          tags={Object.values(featureMeta).reduce<string[]>(
            (finalTags, { tags }) => finalTags.concat(tags),
            []
          )}
        />
        <h2>Text Diff</h2>
        <TextDiff
          oldValue={loremIpsum}
          newValue={`${loremIpsum.slice(0, 20)}${loremIpsum.slice(25)}`}
        />
        <h2>Tag Diff</h2>
        <TagDiff
          oldTags={tags.map(x => x.tag).slice(0, 20)}
          newTags={tags
            .map(x => x.tag)
            .slice(5, 15)
            .concat(tags.map(x => x.tag).slice(15))}
        />
        <h2>Error Message</h2>
        <ErrorMessage
          onOkay={() => null}
          onRetry={() => null}
          error={new Error('Something went wronggggg')}>
          This is an error message.
        </ErrorMessage>
        <ErrorCodeDecoder />
        <h2>Warning Message</h2>
        <WarningMessage>This is a warning message.</WarningMessage>
        <h2>No Permission Message</h2>
        {/* @ts-ignore */}
        <NoPermissionMessage message="This is a no permission message." />
        <h2>Success Message</h2>
        <SuccessMessage>This is a success message.</SuccessMessage>
        <h2>Message</h2>
        <Message>This is a generic message.</Message>
        <h2>Error Boundary Message</h2>
        <ErrorBoundaryWrapper />
        <h2>Image Uploader</h2>
        <ImageUploadTest />
        <h2>Markdown Editor</h2>
        <MarkdownEditorWrapper />
        <h2>Asset Editor</h2>
        <AssetEditorWrapper />
        <h2>Setup Profile</h2>
        {/* @ts-ignore */}
        <SetupProfile initialStepIdx={2} />
        <h2>Species VS Selector</h2>
        <SpeciesVsSelectorDemo />
        <h2>File Upload</h2>
        <FileUploaderDemo />
      </div>
    </>
  )
}
