// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // 以下是自定义eslint规则
    "no-unused-vars": 'off',
    'indent': 'off', // 缩进不检查
    'quotes': [1, "single", "avoid-escape"], // 引号风格,统一单引号
    'object-property-newline': 'off', //关闭强制将对象的属性放在不同的行上
    'brace-style': 'off', // 大括号风格
    'no-multiple-empty-lines': [0, {"max": 20}] // 空行最多不能超过20行
  },
  // 例外全局变量
  globals: {
    '_': true  //并设为只读
  }
};
