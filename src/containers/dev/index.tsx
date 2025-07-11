import React, { useState } from 'react'
import { Helmet } from 'react-helmet'

import TextInput from '../../components/text-input'
import Button from '../../components/button'
import { parseBase64String } from '../../utils'

// components

import TagInput from '../../components/tag-input'
import FeatureList from '../../components/feature-list'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import NoPermissionMessage from '../../components/no-permission-message'
import WarningMessage from '../../components/warning-message'
import Message from '../../components/message'
import ErrorBoundary from '../../components/error-boundary'
import ImageUploader from '../../components/image-uploader'
import MarkdownEditor from '../../components/markdown-editor'
import LoadingIndicator from '../../components/loading-indicator'
import AssetEditor, { EditorContext } from '../../components/asset-editor'
import TextDiff from '../../components/text-diff'
import SetupProfile from '../../components/setup-profile'
import FileUploader from '../../components/file-uploader'

import { bucketNames } from '../../file-uploading'
import SurveyForm from '../../components/survey-form'
import survey from '../../surveys/creating-asset'
import { Asset, CollectionNames, FullAsset } from '../../modules/assets'
import PerformanceEditor from '../../components/performance-editor'
import SpeciesSelector from '../../components/species-selector'
import DefaultAvatar from '../../components/default-avatar'
import AssetResultsItem from '../../components/asset-results-item'
import AssetResults from '../../components/asset-results'

const ErrorCodeDecoder = () => {
  const [inputString, setInputString] = useState('')
  const [decodedString, setDecodedString] = useState('')
  return (
    <>
      <TextInput
        value={inputString}
        onChange={(e) => setInputString(e.target.value)}
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
  const [lastUrls, setLastUrls] = useState<string[]>([])

  return (
    <>
      {lastUrls.length ? lastUrls.map((url) => <img src={url} />) : null}
      <Button onClick={() => setIsFormVisible((currentVal) => !currentVal)}>
        Upload image
      </Button>
      {isFormVisible ? (
        <ImageUploader
          allowMultiple
          allowCropping={false}
          bucketName="test"
          directoryPath="dev"
          onDone={(urls) => setLastUrls(urls)}
        />
      ) : null}
    </>
  )
}

const MarkdownEditorWrapper = () => {
  const [text, setText] = useState('Here is some *markdown*.')
  return (
    <MarkdownEditor content={text} onChange={(newText) => setText(newText)} />
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
        asset: {},
      }}>
      <AssetEditor />
    </EditorContext.Provider>
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
        onDone={(url) => setUploadedFileUrl(url)}
        onError={console.error}
      />
    </>
  )
}

const PerformanceEditorDemo = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [newTags, setNewTags] = useState<string[]>([])
  return (
    <>
      <Button onClick={() => setIsEditing(!isEditing)}>Toggle Editing</Button>
      <code>{newTags.join(' ')}</code>
      <PerformanceEditor
        assetId={null}
        currentTags={newTags}
        overrideSave={(newTags) => setNewTags(newTags)}
        isEditing={isEditing}
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
        <h2>Asset Results Item</h2>
        <AssetResultsItem />{' '}
        <AssetResultsItem
          isSelected
          asset={
            {
              title: 'My Nice Thing',
              category: 'avatar',
              species: ['', ''],
              speciesnames: [
                'Cat',
                'Dog',
                'Fish',
                'Bird',
                'Elephant',
                'Llama',
                'Cheetah',
                'Rat',
                'Owl',
                'Some Old Lady',
              ],
            } as FullAsset
          }
        />{' '}
        <AssetResultsItem isDimmed />
        <h2>Asset Results</h2>
        <AssetResults
          assets={[
            {
              id: 'abcd',
              title: 'My Nice Thing',
              category: 'avatar',
              species: ['', ''],
              speciesnames: [
                'Cat',
                'Dog',
                'Fish',
                'Bird',
                'Elephant',
                'Llama',
                'Cheetah',
                'Rat',
                'Owl',
                'Some Old Lady',
              ],
            } as FullAsset,
          ]}
          hydrate={() => console.log('Dev hydrate')}
        />
        <h2>Default Avatar</h2>
        <div style={{ width: '300px', height: '300px' }}>
          <DefaultAvatar stringForDecision="HelloWorld" />
        </div>
        <h2>Tag Input</h2>
        <TagInput currentTags={['free', 'paid', 'rigged']} />
        <h2>Species Selector</h2>
        <SpeciesSelector selectedSpeciesIds={['IpItSWT1QpwLB16IPz2e']} />
        <h2>Performance Editor</h2>
        <PerformanceEditorDemo />
        <h2>Survey Form</h2>
        <SurveyForm
          survey={survey}
          parentTable={CollectionNames.Assets}
          parentId="abc"
        />
        <h2>Loading</h2>
        <LoadingIndicator message="Loading items..." />
        <h2>Feature List</h2>
        <FeatureList />
        <h2>Text Diff</h2>
        <TextDiff
          oldValue={loremIpsum}
          newValue={`${loremIpsum.slice(0, 20)}${loremIpsum.slice(25)}`}
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
        <SuccessMessage title="Some Title">
          This is a success message.
        </SuccessMessage>
        <SuccessMessage
          title="Some Title"
          controls={[
            <Button>Click Me</Button>,
            <Button>Another Button</Button>,
          ]}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            eleifend facilisis bibendum. Maecenas pulvinar ante nisi, vitae
            molestie metus feugiat id. Quisque pretium ullamcorper faucibus. Sed
            a metus nisl. Phasellus posuere leo justo, vitae lobortis justo
            scelerisque lobortis. Morbi eget tellus tellus. In faucibus sed ex
            tempus gravida. Maecenas bibendum feugiat mattis. Mauris gravida
            velit sed orci hendrerit, ac congue eros vehicula. In finibus libero
            at velit convallis, id suscipit sem elementum.
          </p>
          <p>
            Ut massa dui, lacinia eu lacinia non, rhoncus ac nisl. Donec dictum
            volutpat augue, rhoncus mollis dolor accumsan venenatis. Donec sit
            amet mi sit amet eros semper commodo. Aliquam erat volutpat. Quisque
            et nisi eu velit tristique gravida. Vestibulum hendrerit dolor sit
            amet nibh facilisis, laoreet malesuada mauris scelerisque. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque,
            massa vel sollicitudin gravida, odio enim laoreet odio, sit amet
            sagittis enim enim nec justo. Praesent ut mi vel augue placerat
            posuere sed sit amet velit. Interdum et malesuada fames ac ante
            ipsum primis in faucibus.
          </p>
        </SuccessMessage>
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
        <h2>File Upload</h2>
        <FileUploaderDemo />
      </div>
    </>
  )
}
