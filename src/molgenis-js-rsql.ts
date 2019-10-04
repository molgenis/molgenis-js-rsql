import { encode } from 'mdurl'
import { Constraint, Value, Comparison, Group, Operator } from './types/types'

export function containsRsqlReservedCharacter(value: string): boolean {
  return /["'();,=!~<> ]/.test(value)
}

export function rsqlEscape(value: string): string {
  const doubleQuotes = (value.match(/["]/g) || []).length
  const singleQuotes = (value.match(/[']/g) || []).length

  const quoteChar = doubleQuotes >= singleQuotes ? "'" : '"'
  return quoteChar + value.split(quoteChar).join('\\' + quoteChar) + quoteChar
}

export function toRsqlValue(value: Value | Value[]): string {
  if (Array.isArray(value)) {
    return `(${value.map(toRsqlValue).join()})`
  }

  // On the serverside no empty string does not exists and gets parsed as 'null'
  if (value === null || value === '') {
    return "''"
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString()
  }

  return containsRsqlReservedCharacter(value) ? rsqlEscape(value) : value
}

export function encodeRsqlValue(value: string): string {
  return encode(value, encode.componentChars + '=:,;"\'<>#', false)
}

export const transformToRSQL = getRsqlFromConstraint

export function getRsqlFromConstraint(constraint: Constraint): string {
  return (constraint as Group).operator
    ? getRsqlFromComplexConstraint(constraint as Group)
    : getRsqlFromSimpleConstraint(constraint as Comparison)
}

function getRsqlFromSimpleConstraint(comparison: Comparison): string {
  return (
    toRsqlValue(comparison.selector) + comparison.comparison + toRsqlValue(comparison.arguments)
  )
}

function getRsqlFromComplexConstraint({ operator, operands }: Group): string {
  return operands
    .map(child => getChildRsql(operator === Operator.And && operands.length > 1, child))
    .join(operator === Operator.Or ? ',' : ';')
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
 * @param perhapsWrap The child constraint may need to be wrapped
 * @param constraint the child constraint to transform to rsql
 * @returns {string}
 */
function getChildRsql(perhapsWrap: boolean, constraint: Constraint): string {
  const rsql = getRsqlFromConstraint(constraint)
  if ((constraint as Group).operands && (constraint as Group).operands.length === 1) {
    // Skip this node, render the only child node
    return getChildRsql(perhapsWrap, (constraint as Group).operands[0])
  }
  if (perhapsWrap && (constraint as Group).operator === 'OR') {
    if ((constraint as Group).operands.length > 1) {
      return `(${rsql})`
    }
  }
  return rsql
}
