export const SERVER = {
  env: process.env.REACT_APP_ENV_NAME || 'sandbox',
  appKey:
    process.env.REACT_APP_KEY || 'qqbC44zvVnWFH2yW1ZZg3MehH6XSmOOIQA3NKVpI',
  javascriptKey:
    process.env.REACT_APP_JS_KEY || '0jQ9GHXBey7s1ndlY7IlLoYXIRIOgXmUnOp3VSQA',
  parseServerURL:
    process.env.REACT_APP_PARSE_SERVER ||
    'https://pg-app-p0l40qbzw3gj9ec4ydg1yyyjxcp5a0.scalabl.cloud/1/',
}

const ENV = {
  DEV: 'http://api.dev.halosolutions.com/api/v1',
  UAT: 'https://api.uat.halosolutions.com/api/v1',
  PROD: 'https://api.halosolutions.com/api/v1',
}

export const NEW_SERVER = {
  env: process.env.REACT_APP_SERVER || ENV.DEV,
}
