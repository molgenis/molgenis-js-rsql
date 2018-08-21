import { encode } from 'mdurl'

/**
 *
 * @param value
 * @returns {boolean}
 */
export function containsRsqlReservedCharacter (value) {
  return /["'();,=!~<> ]/.test(value)
}

/**
 * Escapes an rsql value by putting it between quotes.
 */
export function rsqlEscape (value) {
  const doubleQuotes = (value.match(/["]/g) || []).length
  const singleQuotes = (value.match(/[']/g) || []).length

  const quoteChar = (doubleQuotes >= singleQuotes) ? "'" : '"'
  return quoteChar + value.split(quoteChar).join('\\' + quoteChar) + quoteChar
}

export function toRsqlValue (value) {
  return containsRsqlReservedCharacter(value) ? rsqlEscape(value) : value
}

/**
 * URLEncodes an rsql value, leaving as many rsql-relevant characters as possible unencoded
 */
export function encodeRsqlValue (str) {
  return encode(str, encode.componentChars + "=:,;\"'<>#", false)
}

/**
 * Transforms RSQL constraint tree to RSQL query string
 */
export const transformToRSQL = getRsqlFromConstraint

export function getRsqlFromConstraint (constraint) {
  return constraint.operator ? getRsqlFromComplexConstraint(constraint)
    : getRsqlFromSimpleConstraint(constraint)
}

function getRsqlFromSimpleConstraint (constraint) {
  return toRsqlValue(constraint.selector) + constraint.comparison + toRsqlValue(constraint.arguments)
}

function getRsqlFromComplexConstraint (constraint) {
  const operator = constraint.operator === 'OR' ? ',' : ';'
  const rsqlParts = constraint.operands.map(getRsqlFromConstraint)
  return '(' + rsqlParts.join(operator) + ')'
}
export default {
  transformToRSQL
}
