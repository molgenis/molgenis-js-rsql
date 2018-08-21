import {transformToRSQL} from '../../../src/rsql'
import { expect } from 'chai'

describe('rsql', () => {
  describe('transformToRSQL', () => {
    it('should transform x==5', () => {
      expect(transformToRSQL({
        selector: 'x',
        comparison: '==',
        arguments: 5
      })).to.equal('x==5')
    })

    it('should transform (x==5;y==3)', () => {
      expect(transformToRSQL({
        operator: 'AND',
        operands: [
          {
            selector: 'x',
            comparison: '==',
            arguments: 5
          },
          {
            selector: 'y',
            comparison: '==',
            arguments: 3
          }]
      })).to.equal('(x==5;y==3)')
    })

    it('should transform in constraint with string argument: x==A', () => {
      expect(transformToRSQL({
        selector: 'x',
        comparison: '==',
        arguments: 'A'
      })).to.equal('x==A')
    })

    describe('should escape rsql values', () => {
      it('should escape single quote: x=q="It\'s complicated"', () => {
        expect(transformToRSQL({
          selector: 'x',
          comparison: '=q=',
          arguments: 'It\'s complicated'
        })).to.equal('x=q="It\'s complicated"')
      })

      it('should escape special characters: x==\'x==5\'', () => {
        expect(transformToRSQL({
          selector: 'x',
          comparison: '==',
          arguments: 'x==5'
        })).to.equal('x==\'x==5\'')
      })

      it('should escape special characters: x=q=\'Hello!\'', () => {
        expect(transformToRSQL({
          selector: 'x',
          comparison: '=q=',
          arguments: 'Hello!'
        })).to.equal('x=q=\'Hello!\'')
      })
    })
  })
})
