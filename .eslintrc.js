module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'adenvt'
  ],
  globals: {
    $: true,
  },
  rules: {
    'unicorn/prevent-abbreviations': ['error',
      {
        checkProperties: false,
        checkShorthandProperties: false,
        whitelist: {
          getErrMsg: true,
        }
      }
    ],
    'vue/html-closing-bracket-newline': ['error', {
      'singleline': 'never',
      'multiline': 'never',
    }],
  },
  overrides: [{
    files: ['pages/**/*.vue', 'layouts/**/*.vue'],
    rules: {
      'unicorn/filename-case': ['error', {
        case: 'kebabCase'
      }]
    },
  }]
}
