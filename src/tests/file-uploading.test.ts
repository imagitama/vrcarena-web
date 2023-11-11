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
        getFullPathButWithUuidFilename('1.png', 'my/path/inside/1/bucket/1.png')
      ).toBe('my/path/inside/1/bucket/<UUIDV4>.png')
    })
  })
})
