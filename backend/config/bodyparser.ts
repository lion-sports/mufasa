import { defineConfig } from "@adonisjs/core/bodyparser";

export const bodyParserConfig = defineConfig({
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  json: {
    encoding: 'utf-8',
    limit: '1mb',
    strict: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },
  form: {
    encoding: 'utf-8',
    limit: '1mb',
    queryString: {},
    convertEmptyStringsToNull: true,
    types: ['application/x-www-form-urlencoded'],
  },
  raw: {
    encoding: 'utf-8',
    limit: '1mb',
    types: ['text/*'],
  },
  multipart: {
    autoProcess: true,
    processManually: [],
    encoding: 'utf-8',
    convertEmptyStringsToNull: true,
    maxFields: 1000,
    limit: '200mb',
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig
