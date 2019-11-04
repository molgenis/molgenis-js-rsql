import { Parser, ParserOptions } from 'pegjs'

export enum Operator {
  And = 'AND',
  Or = 'OR'
}

export enum ComparisonOperator {
  Equals = '==',
  Search = '=q=',
  Like = '=like=',
  In = '=in=',
  NotEquals = '!=',
  NotLike = '=notlike=',
  LesserThan = '=lt=',
  LesserThanOrEqualTo = '=le=',
  GreaterThan = '=gt=',
  GreaterThanOrEqualTo = '=ge=',
  RangeFromTo = '=rng='
}

export type Value = string | number | boolean | null

export type Comparison = {
  selector: string
  comparison: ComparisonOperator
  arguments: Value | Value[]
}

export type Constraint = Group | Comparison

export type Group = {
  operator: Operator
  operands: Constraint[]
}

export interface RsqlParser extends Parser {
  parse: ParseFun
}

export type ParseFun = (input: string, options?: ParserOptions) => Constraint
