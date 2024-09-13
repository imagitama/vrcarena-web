import { getTagsFromUserInput } from '../tags'

describe('Tags', () => {
  describe('getTagsFromUserInput', () => {
    it('works correctly', () => {
      expect(
        getTagsFromUserInput('some tags like-this are_good $yes%')
      ).toEqual(['some', 'tags', 'like_this', 'are_good', 'yes'])
    })
  })
})
