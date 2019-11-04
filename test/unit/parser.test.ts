// @ts-ignore
import { parse } from '../../src/parser'
import { ComparisonOperator, Operator } from '../../src/types'

describe.only('parser', () => {
  describe('parse', () => {
    it('should parse x==5', () => {
      expect(parse('x==5')).toEqual({
        selector: 'x',
        comparison: ComparisonOperator.Equals,
        arguments: '5'
      })
    })
  })
})
