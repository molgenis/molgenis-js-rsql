'use strict'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import packageJson from './package.json'
import babel from 'rollup-plugin-babel'

export default [

  // browser-friendly UMD build
  {
    input: 'src/rsql.js',
    output: {
      name: packageJson.name,
      file: packageJson.browser,
      format: 'umd'
    },
    plugins: [
      resolve(), // so Rollup can find `mdurl`
      commonjs(), // so Rollup can convert `mdurl` to an ES module
      babel({
        babelrc: false,
        presets: [['env', { modules: false }]],
        exclude: ['node_modules/**']
      })
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/rsql.js',
    external: ['mdurl'],
    output: [
      { file: packageJson.main, format: 'cjs' },
      { file: packageJson.module, format: 'es' }
    ],
    plugins: [
      babel({
        babelrc: false,
        presets: [['env', { modules: false }]],
        exclude: ['node_modules/**']
      })
    ]
  }
]
