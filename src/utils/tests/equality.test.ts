import { deepEqual } from "../equality"

describe('deepEqual', () => {
  it('strings', () => {
    const fields = [
      ['my_string', 'another_string', false],
      ['my_string', 'my_string', true]
    ]
    for (const [valA, valB, expectedResult] of fields) {
      expect(deepEqual(valA, valB)).toBe(expectedResult)
    }
  })

  it('bools', () => {
    const fields = [
      [true, false, false],
      [true, true, true]
    ]
    for (const [valA, valB, expectedResult] of fields) {
      expect(deepEqual(valA, valB)).toBe(expectedResult)
    }
  })

  it('null', () => {
    const fields = [
      ['my_string', null, false],
      [null, null, true]
    ]
    for (const [valA, valB, expectedResult] of fields) {
      expect(deepEqual(valA, valB)).toBe(expectedResult)
    }
  })

  it('arrays', () => {
    const fields = [
      [
        ['a', 'b', 'c'],
        ['a', 'b', 'c'],
        true
      ],
      [
        ['a', 'b', 'c'],
        ['a', 'b', 'c', 'd'],
        false
      ],
    ]
    for (const [valA, valB, expectedResult] of fields) {
      expect(deepEqual(valA, valB)).toBe(expectedResult)
    }
  })

  it('objects', () => {
    const fields = [
      [
        { a: 'a', b: 'b', c: 'c' },
        { a: 'a', b: 'b', c: 'c' },
        true
      ],
      [
        { a: 'a', b: 'b', c: 'c' },
        { c: 'c', b: 'b', a: 'a' }, // reversed
        true
      ],
      [
        { a: 'a', b: 'b', c: 'c' },
        { a: 'a', b: 'b', c: 'c', d: 'd' },
        false
      ],
    ]
    for (const [valA, valB, expectedResult] of fields) {
      expect(deepEqual(valA, valB)).toBe(expectedResult)
    }
  })
})