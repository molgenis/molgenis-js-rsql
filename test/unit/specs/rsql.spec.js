import { transformToRSQL } from '../../../src/rsql'
import { expect } from 'chai'
import { describe, it } from 'mocha'

describe('rsql', () => {
  describe('transformToRSQL', () => {
    it('should transform x==5', () => {
      expect(transformToRSQL({
        selector: 'x',
        comparison: '==',
        arguments: 5
      })).to.equal('x==5')
    })

    it('should transform x==5;y==3', () => {
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
      })).to.equal('x==5;y==3')
    })

    it('should transform empty-string argument: x==\'\'', () => {
      expect(transformToRSQL({
        selector: 'x',
        comparison: '==',
        arguments: ''
      })).to.equal("x==''")
    })

    describe('should add brackets around OR expressions with AND parent', () => {
      it('should not wrap OR with single operand: z==3;w==3', () => {
        expect(transformToRSQL({
          operator: 'AND',
          operands: [
            {
              operator: 'OR',
              operands: [
                {
                  selector: 'z',
                  comparison: '==',
                  arguments: 3
                }
              ]
            },
            {
              selector: 'w',
              comparison: '==',
              arguments: 3
            }]
        })).to.equal('z==3;w==3')
      })

      it('should not transform AND child of OR parent: z==3;y==5,w==3', () => {
        expect(transformToRSQL({
          operator: 'OR',
          operands: [
            {
              operator: 'AND',
              operands: [
                {
                  selector: 'z',
                  comparison: '==',
                  arguments: 3
                },
                {
                  selector: 'y',
                  comparison: '==',
                  arguments: 5
                }
              ]
            },
            {
              selector: 'w',
              comparison: '==',
              arguments: 3
            }]
        })).to.equal('z==3;y==5,w==3')
      })

      it('should wrap OR child of AND parent: (x==5,y==3);w==3', () => {
        expect(transformToRSQL({
          operator: 'AND',
          operands: [
            {
              operator: 'OR',
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
            },
            {
              selector: 'w',
              comparison: '==',
              arguments: 3
            }]
        })).to.equal('(x==5,y==3);w==3')
      })

      it('should skip single operand AND child of AND parent: (x==5,y==3);w==3', () => {
        expect(transformToRSQL({
          operator: 'AND',
          operands: [
            {
              operator: 'AND',
              operands: [{
                operator: 'OR',
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
              }]
            },
            {
              selector: 'w',
              comparison: '==',
              arguments: 3
            }]
        })).to.equal('(x==5,y==3);w==3')
      })

      it('should correctly transform complex query: (x==5;(x==5,y==3,z==3),z==3);w==3', () => {
        expect(transformToRSQL({
          operator: 'AND',
          operands: [
            {
              operator: 'OR',
              operands: [
                {
                  operator: 'AND',
                  operands: [
                    {
                      selector: 'x',
                      comparison: '==',
                      arguments: 5
                    },
                    {
                      operator: 'OR',
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
                        }, {
                          selector: 'z',
                          comparison: '==',
                          arguments: 3
                        }]
                    }]
                },
                {
                  selector: 'z',
                  comparison: '==',
                  arguments: 3
                }]
            },
            {
              selector: 'w',
              comparison: '==',
              arguments: 3
            }]
        })).to.equal('(x==5;(x==5,y==3,z==3),z==3);w==3')
      })

      it('should drill down past single OR child when determining if child should be wrapped: (x==5,y==3);w==3', () => {
        expect(transformToRSQL({
          operator: 'AND',
          operands: [
            {
              operator: 'OR',
              operands: [
                {
                  operator: 'OR',
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
                }]
            },
            {
              selector: 'w',
              comparison: '==',
              arguments: 3
            }]
        })).to.equal('(x==5,y==3);w==3')
      })

      it('need not wrap only OR child of AND operator', () => {
        expect(transformToRSQL({
          operator: 'AND',
          operands: [{
            operator: 'OR',
            operands: [{
              selector: 'x',
              comparison: '==',
              arguments: 5
            }, {
              selector: 'y',
              comparison: '==',
              arguments: 3
            }]
          }]
        })).to.equal('x==5,y==3')
      })
    })

    it('should transform in constraint with array arguments: x=in=(A,B)', () => {
      expect(transformToRSQL({
        selector: 'x',
        comparison: '=in=',
        arguments: ['A', 'B']
      })).to.equal('x=in=(A,B)')
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

      it('should escape array arguments: x=in=(\'Hello!\',\'Good==Bye\')', () => {
        expect(transformToRSQL({
          selector: 'x',
          comparison: '=in=',
          arguments: ['Hello!', 'Good==Bye']
        })).to.equal('x=in=(\'Hello!\',\'Good==Bye\')')
      })
    })
  })
})
