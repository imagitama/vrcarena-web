import {
  extendQueryFromUserInput,
  getOperationsFromUserInput,
  Operation,
  Operator
} from '../'
import {
  AssetFieldNames,
  AssetMetaFieldNames
} from '../../../hooks/useDatabaseQuery'

jest.mock('../../../supabase', () => {})

describe('Query view', () => {
  describe('getOperationsFromUserInput', () => {
    it('returns the correct operations', () => {
      const chunks = [
        '~or_tag',
        '~or_another_tag',
        '-not_tag',
        'wildc*rd',
        'user:my_user_name_or_id',
        'author:my_author_name_or_id',
        'category:avatar',
        'species:my_species_or_id',
        'source:gumroad',
        'approved:my_user_name_or_id',
        'parent:my_asset_id',
        'sort:created:asc',
        'sort:created:desc'
      ]
      const userInput = chunks.join(' ')

      const result: Operation[] = getOperationsFromUserInput(userInput)

      expect(result).toEqual([
        {
          fieldName: AssetFieldNames.tags,
          operator: Operator.MINUS,
          value: 'not_tag'
        },
        {
          fieldName: AssetFieldNames.tags,
          operator: Operator.WILDCARD,
          value: 'wildc*rd'
        },
        {
          fieldName: AssetFieldNames.createdBy,
          operator: Operator.FILTER,
          value: 'my_user_name_or_id'
        },
        {
          fieldName: AssetFieldNames.author,
          operator: Operator.FILTER,
          value: 'my_author_name_or_id'
        },
        {
          fieldName: AssetFieldNames.category,
          operator: Operator.FILTER,
          value: 'avatar'
        },
        {
          fieldName: AssetFieldNames.species,
          operator: Operator.FILTER,
          value: 'my_species_or_id'
        },
        {
          fieldName: AssetFieldNames.sourceUrl,
          operator: Operator.FILTER,
          value: 'gumroad'
        },
        {
          fieldName: AssetMetaFieldNames.approvedBy,
          operator: Operator.FILTER,
          value: 'my_user_name_or_id'
        },
        {
          fieldName: 'relations',
          operator: Operator.FILTER,
          value: 'my_asset_id'
        },
        {
          fieldName: 'createdat',
          operator: Operator.SORT,
          value: 'asc'
        },
        {
          fieldName: 'createdat',
          operator: Operator.SORT,
          value: 'desc'
        },
        {
          fieldName: AssetFieldNames.tags,
          operator: Operator.OR,
          value: ['or_tag', 'or_another_tag']
        }
      ])
    })
  })

  describe('extendQueryFromUserInput', () => {
    it('returns the correct query', () => {
      const chunks = [
        '~or_tag',
        '~or_another_tag',
        '-not_tag',
        'wildc*rd',
        'user:my_user_name_or_id',
        'author:my_author_name_or_id',
        'category:avatar',
        'species:my_species_or_id',
        'source:gumroad',
        'approved:my_user_name_or_id',
        'parent:my_asset_id',
        'sort:created:asc',
        'sort:created:desc'
      ]
      const userInput = chunks.join(' ')

      const mockQuery = jest.fn(() => {
        // const thisQuery = mockQuery
        const thisQuery: any = {
          not: jest.fn(() => thisQuery),
          or: jest.fn(() => thisQuery),
          eq: jest.fn(() => thisQuery),
          neq: jest.fn(() => thisQuery),
          gt: jest.fn(() => thisQuery),
          gte: jest.fn(() => thisQuery),
          lt: jest.fn(() => thisQuery),
          lte: jest.fn(() => thisQuery),
          like: jest.fn(() => thisQuery),
          ilike: jest.fn(() => thisQuery),
          is: jest.fn(() => thisQuery),
          in: jest.fn(() => thisQuery),
          contains: jest.fn(() => thisQuery),
          cs: jest.fn(() => thisQuery),
          containedBy: jest.fn(() => thisQuery),
          cd: jest.fn(() => thisQuery),
          rangeLt: jest.fn(() => thisQuery),
          sl: jest.fn(() => thisQuery),
          rangeGt: jest.fn(() => thisQuery),
          sr: jest.fn(() => thisQuery),
          rangeGte: jest.fn(() => thisQuery),
          nxl: jest.fn(() => thisQuery),
          rangeLte: jest.fn(() => thisQuery),
          nxr: jest.fn(() => thisQuery),
          rangeAdjacent: jest.fn(() => thisQuery),
          adj: jest.fn(() => thisQuery),
          overlaps: jest.fn(() => thisQuery),
          ov: jest.fn(() => thisQuery),
          textSearch: jest.fn(() => thisQuery),
          fts: jest.fn(() => thisQuery),
          plfts: jest.fn(() => thisQuery),
          phfts: jest.fn(() => thisQuery),
          wfts: jest.fn(() => thisQuery),
          filter: jest.fn(() => thisQuery),
          match: jest.fn(() => thisQuery),
          // transform
          order: jest.fn(() => thisQuery)
        }

        return thisQuery
      })

      const operations: Operation[] = [
        {
          fieldName: 'tags',
          operator: Operator.MINUS,
          value: 'not_tag'
        },
        {
          fieldName: 'tags',
          operator: Operator.WILDCARD,
          value: 'wildc*rd'
        },
        {
          fieldName: 'createdby',
          operator: Operator.FILTER,
          value: 'my_user_name_or_id'
        },
        {
          fieldName: 'author',
          operator: Operator.FILTER,
          value: 'my_author_name_or_id'
        },
        {
          fieldName: 'category',
          operator: Operator.FILTER,
          value: 'avatar'
        },
        {
          fieldName: 'species',
          operator: Operator.FILTER,
          value: 'my_species_or_id'
        },
        {
          fieldName: 'sourceurl',
          operator: Operator.FILTER,
          value: 'gumroad'
        },
        {
          fieldName: 'approvedby',
          operator: Operator.FILTER,
          value: 'my_user_name_or_id'
        },
        {
          fieldName: 'relations',
          operator: Operator.FILTER,
          value: 'my_asset_id'
        },
        {
          fieldName: 'createdat',
          operator: Operator.SORT,
          value: 'asc'
        },
        {
          fieldName: 'createdat',
          operator: Operator.SORT,
          value: 'desc'
        },
        {
          fieldName: 'tags',
          operator: Operator.OR,
          value: ['or_tag', 'or_another_tag']
        }
      ]

      const query = extendQueryFromUserInput(mockQuery(), operations)

      expect(true).toBe(false)
    })
  })
})
