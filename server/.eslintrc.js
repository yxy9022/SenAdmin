// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: 'eslint:recommended',
  env: {
    node: true,
  },
  rules: {
    'no-console': 'off',
    'indent': ['error', 2],
    'quotes': [1, "single", "avoid-escape"], // 引号风格,统一单引号
    'semi': [2, "always"] // 强制分号结尾
  },
  "globals": {
    "_": false,
    "$fs": false,
    "$path": false
  }
}
