import { getFullPathButWithUuidFilename } from '../file-uploading'

jest.mock('uuid', () => ({
  v4: () => '<UUIDV4>'
}))
jest.mock('../supabase', () => ({
  client: () => {}
}))

describe('File uploading tests', () => {
  describe('getFullPathButWithUuidFilename', () => {
    it('returns the new path', () => {
      expect(
        getFullPathButWithUuidFilename(
          'image.png',
          'my/path/inside/bucket/image.png'
        )
      ).toBe('my/path/inside/bucket/<UUIDV4>.png')
    })
  })
})
