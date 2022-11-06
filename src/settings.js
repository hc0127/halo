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
  GR: 'https://api.uat.halosolutions.com/api/v1',
  DEV_TKT_RPT_SCAN: 'https://tktrptapi.dev.halosolutions.com',
  UAT_TKT_RPT_SCAN: 'https://tktrptapi.uat.halosolutions.com',
  PROD_TKT_RPT_SCAN: 'https://tktrptapi.halosolutions.com',
  V2_DEV: 'https://apiv2.dev.halosolutions.com',
  V2_UAT: 'https://apiv2.uat.halosolutions.com',
  V2_PROD: 'https://apiv2.halosolutions.com',
  SQS_DEV: 'https://sqsapi.dev.halosolutions.com',
  SQS_UAT: 'https://sqsapi.uat.halosolutions.com',
  SQS_PROD: 'https://sqsapi.halosolutions.com',
  DEV_BEACON_SERVER: 'https://beaconsapi.dev.halosolutions.com',
  DOCUMENTS: 'https://doclibapi.dev.halosolutions.com',
  DOCUMENT_API_KEY: '92tZzUi4bjfonmyP4RGR5',
  DEV_COUNTS: 'https://counts.dev.halosolutions.com',
  UAT_COUNTS: 'https://counts.uat.halosolutions.com',
  PROD_COUNTS: 'https://counts.halosolutions.com',
  TASKS_DEV: 'https://tasksapi.dev.halosolutions.com',
}

export const NEW_SERVER = {
  env: process.env.REACT_APP_SERVER || ENV.DEV,
}

export const TKT_RPT_SCAN_SERVER = {
  env: process.env.REACT_APP_TKT_RPT_SCAN || ENV.DEV_TKT_RPT_SCAN,
}

export const APIV2_SERVER = {
  env: process.env.REACT_APP_APIV2_SERVER || ENV.V2_DEV,
}

export const SQS_SERVER = {
  env: process.env.REACT_APP_SQS || ENV.SQS_DEV,
}

export const BEACONS_SERVER = {
  env: process.env.REACT_BEACONS_SERVER || ENV.DEV_BEACON_SERVER,
}
export const TASKS_SERVER = {
  env: process.env.REACT_APP_TASKS || ENV.TASKS_DEV,
}
export const DOCUMENTS_SERVER = {
  env: process.env.DOCUMENTS || ENV.DOCUMENTS,
}

export const DOCUMENT_API_KEY = {
  env: process.env.DOCUMENT_API_KEY || ENV.DOCUMENT_API_KEY,
}

export const COUNTS_SERVER = {
  env: process.env.REACT_APP_COUNTS || ENV.DEV_COUNTS,
}
