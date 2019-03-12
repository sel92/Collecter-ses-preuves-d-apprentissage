

/* ========= LIBRARIES ========= */

const {
  BaseKonnector,
  log,
  mkdirp,
  normalizeFilename, // tool to renormalize filename, notably removing characters that could be an issue : <>:"/\|?*, multiple spaces etc (see doc)
  addData
} = require('cozy-konnector-libs')

var rp = require('request-promise');

var retr = require('./badge_retrieval');
var conv = require('./xapi_conversion');
//var fs = require('fs'); // no need in Cozy

/* ========= PARAMETERS DECLARATION ========= */

const earnerEmail = 'billy.meinke@gmail.com';
//const dataFolder = './OB_badges';

const earnerData = JSON.stringify({
  email: earnerEmail
});

const rq_options1 = {
  uri : 'https://backpack.openbadges.org/displayer/convert/email', 
  method : 'POST',
  body : earnerData,
  headers: {'Content-Type': 'application/json',
	  'Content-Length': Buffer.byteLength(earnerData)
	}
};


module.exports = new BaseKonnector(start)

   /*============MAIN FUNCTION : START()=================*/

async function start() {

  // Getting user id
  log('info', 'getting earner ID from openbadges...')
	const earnerId = await retr.getUserId(rq_options1)
	console.log('Earner ID is '+ earnerId);
	
	log('info', 'creating earner folder')
  var earnerFolder = '/'+earnerId;
  await mkdirp(earnerFolder) // creates folder in Cozy if it does not yet exists
  console.log('Folder created : '+ earnerFolder);
  
  
  // getting badges groups
  log('info', 'Retrieving my badges and writting in folder...', earnerFolder)
  const groupsList = await retr.getGroupsList(earnerId);
  console.debug('liste des groupes json ', groupsList);

  // badges handling
  await Promise.all(groupsList.map(async (group) => {
    // this structure allows multiple asynchronous calls in parallel
    await mkdirp(earnerFolder+'/'+group.name)
    
    
    //////// Ca ne marche plus à partir de là: res2.map is not a function ////////
    
    const res2 = await rp({uri: 'https://backpack.openbadges.org/displayer/'+earnerId+'/group/'+group.groupId, method: 'GET'})
  // res2 contains list of JSON stringified badges
    var groupBadges = [];
    await Promise.all(res2.map(async (badge) => {
      const my_xapi_badge = new conv.xapi_badge(badge, earnerEmail)
      groupBadges.push(my_xapi_badge);
    }))
    addData(groupBadges, 'io.cozy.xrecords'+earnerFolder+'/'+group.name)
    
  }))
  
  log('info', 'saving data into Cozy', 'io.cozy.xrecords'+earnerFolder+'/'+group.name)
  /*addData (docs, doctype)
    - docs : array of objects corresponding to the data you want to save in the Cozy
    - doctype (string) : the doctype where you want to save data ()ex 'io.cozy.bills'
  */
  return addData(documents, 'io.cozy.xrecords')

}



  /*============ADDITIONAL FUNCTIONS=================*/

/*
function filesConversion (folder) {
  //Conversion of files from openbadges specification to xAPI
  fs.readdirSync(folder).forEach((file) => {
    conv.xapi_conversion(folder+'/'+file, earnerEmail);
    console.log('done file '+folder+'/'+file);
  })
}
*/

