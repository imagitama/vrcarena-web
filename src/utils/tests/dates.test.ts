import { getRelativeTime } from '../dates'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

const offsetDate = (ms: number): Date => new Date(Date.now() + ms)

describe('Dates', () => {
  describe('getRelativeTime', () => {
    const tests = [
      [offsetDate(1 * DAY), '1 day'],
      [offsetDate(-1 * DAY), '1 day'],
      [offsetDate(2 * MINUTE), '2 minutes'],
      [offsetDate(2 * SECOND), '2 seconds'],
      [offsetDate(-3 * WEEK), '3 weeks'],
      [offsetDate(0), 'a few seconds'],
    ]

    for (var test of tests) {
      it(`maps "${test[0]}" to "${test[1]}"`, () => {
        expect(getRelativeTime(test[0])).toBe(test[1])
      })
    }
  })
})
