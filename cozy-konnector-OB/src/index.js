

// Declaration of constants from 'cozy-konnector-libs' library. Others?
const {
  BaseKonnector,
  requestFactory,
  log
} = require('cozy-konnector-libs')

const request = requestFactory({
  // debug mode to show all details about http requests and responses
  // Very verbose though. Uncomment if needed.
  // debug: true,
  // activates [cheerio](https://cheerio.js.org/) parsing on each page
  cheerio: true,
  // json parsing (activated by default in cozy-konnector-libs but
  // must be deactivated when using cheerio)
  json: false,
  // this allows request-promise to keep cookies between requests
  jar: true
})

const baseUrl = 'https://backpack.openbadges.org'

module.exports = new BaseKonnector(start)

/* DEFINITION OF FUNCTIONS */

// start function run by BaseKonnector instance only when all account
// information has been provided (fields in 
// ../konnector-dev-config.json file)

async function start(fields) {
  log('info', 'Authenticating...')
  await authenticate (fields.login, fields.password)
  log('info', 'Successfully logged in')
  // add actions when successfully logged in

  log('info','fetching web page content')
  const $ = await request(`${baseUrl}`)
  log('info', 'parsing content', typeof($))
  //const badges = await parsePage('./ob_sb.html')
  
  log('info', 'saving data into Cozy')
  // TODO

}




