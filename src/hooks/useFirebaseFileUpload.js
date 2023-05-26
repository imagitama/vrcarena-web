import { useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/storage'
import { handleError } from '../error-handling'
import { usingEmulator } from '../environment'
import defaultAvatarUrl from '../assets/images/default-avatar.png'

const getDevelopmentDownloadUrlForMimeType = mimeType => {
  if (mimeType.includes('video')) {
    // this needs to point to a real video inside our Bucket so that our functions (who depend on real files) can do it in test
    // Firebase is getting a storage emulator very soon which will mean this isnt needed: https://github.com/firebase/firebase-tools/issues/1738#issuecomment-843256335
    return 'https://firebasestorage.googleapis.com/v0/b/shiba-world.appspot.com/o/pedestal.webm?alt=media&token=bed8d937-47c2-42c9-845c-ad18d30a4c31'
  }

  if (mimeType.includes('image')) {
    // actually a PNG but lazy
    return defaultAvatarUrl
  }

  throw new Error(`Cannot get dev download url for mime type "${mimeType}"`)
}

export default (skipEmulator = false) => {
  const [isUploading, setIsUploading] = useState(null)
  const [percentageDone, setPercentageDone] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const [, setIsErrored] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')

  const upload = async (file, uploadFullPath) => {
    if (usingEmulator() && skipEmulator !== true) {
      console.debug('using emulator so skipping upload...')

      setIsSuccess(false)
      setIsErrored(false)
      setIsUploading(true)

      await new Promise(resolve => setTimeout(resolve, 1000))

      setPercentageDone(50)

      await new Promise(resolve => setTimeout(resolve, 1000))

      setPercentageDone(100)

      const url = getDevelopmentDownloadUrlForMimeType(file.type)

      setIsUploading(false)
      setIsSuccess(true)
      setIsErrored(false)
      setDownloadUrl(url)

      return url
    }

    return new Promise((resolve, reject) => {
      setIsSuccess(false)
      setIsErrored(false)

      var storageRef = firebase.storage().ref()

      let uploadTask = storageRef.child(uploadFullPath)

      if (typeof file === 'string') {
        uploadTask = uploadTask.putString(file, 'data_url')
      } else {
        uploadTask = uploadTask.put(file)
      }

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        function(snapshot) {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100

          setPercentageDone(progress)

          if (snapshot.state === firebase.storage.TaskState.RUNNING) {
            setIsUploading(true)
          }
        },
        function(err) {
          console.error('Failed to upload file', err.code, err) // https://firebase.google.com/docs/storage/web/handle-errors
          handleError(err)

          setIsUploading(false)
          setIsSuccess(false)
          setIsErrored(true)

          reject(err)
        },
        async () => {
          try {
            const url = await uploadTask.snapshot.ref.getDownloadURL()

            setIsUploading(false)
            setIsSuccess(true)
            setIsErrored(false)
            setDownloadUrl(url)
            resolve(url)
          } catch (err) {
            reject(err)
          }
        }
      )
    })
  }

  return [isUploading, percentageDone, downloadUrl, isSuccess === true, upload]
}
