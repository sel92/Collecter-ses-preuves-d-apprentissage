
// Declaration of constants from 'cozy-konnector-libs' library. Others?
const {
  BaseKonnector,
  requestFactory,
  signin,
  scrape,
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

const baseUrl = 'https://openbadges.org'

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
  log('info', 'parsing content', $)

}


function authenticate(email, password) {
  return signin({
    url: `https://backpack.openbadges.org/backpack/login`,
    formSelector: ('section#login', 'form'),
    formData: { email: email, password: password },
    // validate function checks if login was a success
    validate: (statusCode, $, fullResponse) => {
      log('debug', 'status CODE', statusCode)
      log('debug', 'error mESSAGE', $)
      log('debug', 'full response', fullResponse)
      /* 
       * returned statusCode == 200 for both success and failure
       * need to consider which web file (see browser console ->
       * network) is returned : 
       * https://backpack.openbadges.org in case of success => true
       * https://backpack.openbadges.org/backpack/login  for failure
       * => false
       *
       * TODO how to print correctly content of $ and fullResponse ?
       * (if exist ?)
       *
       */
      // sometimes, we can get a http error message ($) ?
      if (statusCode == 200) {
        // TO MODIFY
        return true
			}
  	}
  })
}




