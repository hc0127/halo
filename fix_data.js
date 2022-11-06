const Parse = require('parse/node')

const fieldToFix = [
  { old: 'informant_title', new: 'informantTitle' },
  { old: 'informant_firstName', new: 'informantFirstName' },
  { old: 'informant_lastName', new: 'informantLastName' },
  { old: 'informant_gender', new: 'informantGender' },
  { old: 'informant_nationality', new: 'informantNationality' },
  { old: 'informant_street', new: 'informantStreet' },
  { old: 'informant_town', new: 'informantTown' },
  { old: 'informant_county', new: 'informantCounty' },
  { old: 'informant_postcode', new: 'informantPostcode' },
  { old: 'informant_mobile', new: 'informantMobile' },
  { old: 'othernotes', new: 'otherNotes' },
  { old: 'vehiclenotes', new: 'vehicleNotes' },
  { old: 'medicalnotes', new: 'medicalNotes' },
]

function fixCaptureData(captureData) {
  const newCaptureData = { ...captureData }
  for (let i = 0; i < fieldToFix.length; i++) {
    const fix = fieldToFix[i]

    const value = newCaptureData[fix.old]

    if (!value) continue

    newCaptureData[fix.new] = value
    delete newCaptureData[fix.old]
  }

  if (newCaptureData.location && newCaptureData.location.longtitude) {
    newCaptureData.location.longitude = newCaptureData.location.longtitude
    delete newCaptureData.location.longtitude
  }

  return newCaptureData
}

const config = {
  dev: {
    appKey: 'B0Pm4GPA8adinAySrK1X7DPvbLdFJVmVd3sskQMl',
    javascriptKey: 'EexK4kWhctT1fVNEDJg2MQ2ElsYMsmRdLXVJfHQF',
    parseServerURL:
      'https://pg-app-65lh21ycd7lp47i5q9ggh4zjd6dyjl.scalabl.cloud/1/',
  },
  live: {
    appKey: 'KDWVRM7O6SfowE2slQ3zuGoN8zeQdolKP9Q8LXAO',
    javascriptKey: 'yAuvaALUZ5B7q9TEFcZAJaCA8eU7AeKlPOQ6M99L',
    parseServerURL:
      'https://pg-app-f1zdqeex2lhrirdz2chwlqfzsg85yf.scalabl.cloud/1/',
  },
  localDev: {
    appKey: 'myAppId',
    javascriptKey: 'masterKey',
    parseServerURL: 'http://localhost:1337/1/',
  },
}

const parseConfig = config.dev

Parse.initialize(parseConfig.appKey, parseConfig.javascriptKey)
Parse.serverURL = parseConfig.parseServerURL

const query = new Parse.Query('Incident')

query.find().then(
  result => {
    const saveQueries = []

    for (let i = 0; i < result.length; i++) {
      const incident = result[i]
      const captureData = incident.get('captureData')

      const fixedData = fixCaptureData(captureData)

      if (JSON.stringify(fixedData) === JSON.stringify(captureData)) {
        continue
      }
      incident.set('captureData', fixedData)
      saveQueries.push(incident.save())
    }
    if (saveQueries.length > 0) {
      Parse.Promise.all(saveQueries).then(
        saveResults => {
          console.log('DONE', saveResults.length)
        },
        error => console.error(error),
      )
    } else {
      console.log('Nothing to update')
    }
  },
  error => console.error(error),
)
