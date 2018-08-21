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
  if (Array.isArray(value)) {
    return `(${value.map(toRsqlValue).join()})`
  }
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

/**
 * Transforms a constraint to rsql, and wraps it in brackets if needed.
 *
 * Brackets are needed if the precedence of the operator in the subtree has lower precedence than the operator of the parent.
 * The rsql comparison operators all have higher precedence than the AND and OR operators so a simple constraint never
 * needs to be wrapped.
 * The OR operator has lower precedence than the AND operator so an OR constraint with more than one operand and an
 * AND parent needs to be wrapped.
 *
 * @param parentOperator operator of the parent constraint
 * @param constraint the child constraint to transform to rsql
 * @returns {string}
 */
function getChildRsql (parentOperator, constraint) {
  const rsql = getRsqlFromConstraint(constraint)
  return parentOperator === 'AND' && constraint.operator === 'OR' && constraint.operands.length > 1 ? `(${rsql})` : rsql
}

function getRsqlFromComplexConstraint (constraint) {
  const operator = constraint.operator === 'OR' ? ',' : ';'
  const rsqlParts = constraint.operands.map(child => getChildRsql(constraint.operator, child))
  return rsqlParts.join(operator)
}
