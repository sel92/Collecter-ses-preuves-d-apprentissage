
/* ====== DESCRIPTION =========

Main konnector file: retrieves user's badges from the Openbadges Backpack platform and stores them in Cozy cloud after conversion into an xAPI format.
User only has to provide his email adress used for his Openbadges Backpack.
For the moment no frontend has been coded so you can t see badges displayed when connecting to your cloud on the navigator. Yet you may visualize file '../data/importedData' and try http requests to your Cozy to retrieve them all.


== STEPS FOR BADGE RETRIEVAL ==

The Openbadges Displayer API allows badge retrieval in 3 steps:
- Step 1: email to ID conversion
Each user is identified with a unique number on Openbadges, which he gets from his email address.
- Step 2: retrieving the list of the user's groups of badges
In Openbadges, a user's badges are organized in groups which allow him to sort them according to personal criteria. Using the user's ID, we get a list a badges, which contains a JSON structure with 3 attributes
  'groupId': the id of the group,
  'name': the name of the group,
  'badges': number of badges in the group
- Step 3: retrieving the badges of a specific group
Using the user id and one of his group id, we may finally get the corresponding badges (stored in this group).


== XAPI CONVERSION ==

See description in file ./xapi_conversion


== STORAGE OF CONVERTED BADGES ==

- Files organisation in the cloud
Only xAPI formatted badges are stored. They are placed in 'io.cozy.xrecords' doctype and organized similarly to what we have on Openbadges.org, with one folder by user so that several openbadges users can coexist. Organisation is illustrated below:

'io.cozy.xrecords' -> folder_user1 -> folder_group1 -> xapi_badge1
                                                    -> xapi_badge2
                                                        ...
                                   -> folder_group2 -> ...
                                   -> ...
                   -> folder_user2 -> folder_group1 -> ...

User folder's name is defined as the user's ID on Openbadges
Badge group folder's name is the group's name on Openbadges

- Duplication check before storing
Openbadges does not allow us to retrieve specific badges from one group. Thus, we can not decide to get only the new ones: in the code, we use Cozy's 'hydrateAndFilter' function to avoid file duplication in the cloud. For this, attributes 'object' and 'timestamp' of the xAPI converted badges are used to determine if the file is already present or not.
- Object is the attribute describing the badge
- Timestamp is the date when the badge was delivered.
As we are in 1 specific earner folder, both attributes being equal should ensure comparison goes well.

*/



/* ========= DEPENDENCIES ========= */

const {
  BaseKonnector,
  log,
  mkdirp,
  normalizeFilename, // tool to renormalize filename, notably removing characters that could be an issue : <>:"/\|?*, multiple spaces etc (see doc)
  addData,
  hydrateAndFilter
} = require('cozy-konnector-libs')

var rp = require('request-promise');

var retr = require('./badge_retrieval');
var conv = require('./xapi_conversion');


module.exports = new BaseKonnector(start)



   /*============MAIN FUNCTION : START()=================*/

async function start(fields) {

	// defining constants for badge retrieval and after
	const earnerEmail = fields.email;
	const earnerData = JSON.stringify({email: earnerEmail});
	const rq_options1 = new make_rq_options (earnerData);
	
  // OB Displayer API Step 1: Getting user id
  log('info', 'getting earner ID from openbadges...')
	const earnerId = await retr.getUserId(rq_options1);
	console.log('Earner ID is '+ earnerId);
	
	// Creating folder in Cozy in which we will store badges by category
	// 'mkdirp' creates the folder in Cozy if it does not yet exist
	log('info', 'creating earner folder')
  var earnerFolder = '/'+earnerId;
  await mkdirp(earnerFolder)
  
  
  // OB Displayer API Step 2: getting the list of badges groups
  log('info', 'Retrieving my badges and writting in folder...', earnerFolder)
  const groupsList = await retr.getGroupsList(earnerId);


  // Handling each badge from each group
  // New folders in the 'earnerFolder' are created to contain each group badges, so that we obtain a similar organisation of badges in our cloud as on Openbadges.org
  // Structure Promise.all allows multiple asynchronous calls in parallel. Here 2 Promise.all are intricated.

  
  // First Promise.all to handle each group (from groupsList):
  await Promise.all(groupsList.map(async (group) => {

    // 1. Creating the folder for the badges group named as the latter
    await mkdirp(earnerFolder+'/'+group.name)
    
    // 2. OB Displayer API Step 3: making the request to retrieve these badges (here 'res2.badges' contains the list of JSON stringified badges)
    const res2 = await rp({uri: 'https://backpack.openbadges.org/displayer/'+earnerId+'/group/'+group.groupId, method: 'GET'})
    const badgesList = JSON.parse(res2).badges;
    console.debug('liste des badges badgesList ', badgesList);
    
    // 3. Initializing 'groupBadges'= list of documents to store in Cozy
    var groupBadges = [];
    
    // 4. Second Promise.all to handle each group's badges (from groupBadges): xAPI conversion + pushing it to groupBadges
    await Promise.all(badgesList.map(async (badge) => {
    
      const my_xapi_badge = new conv.xapi_badge(badge, earnerEmail)
      groupBadges.push(my_xapi_badge);
      
    }))
 
    console.debug('list of the group s converted badges ', groupBadges);
    
    // 5. Storage in Cozy (once each badge has been converted and pushed in groupBadges)
    //'hydrateAndFilter' allows to avoid files duplication in the Cozy using attributes 'object' and 'timestamp' to compare. From initial list 'groupBadges', we obtain list 'filteredDocument' which will be effectively stored in the cloud with addData.
    hydrateAndFilter(groupBadges, 'io.cozy.xrecords'+earnerFolder+'/'+group.name, {
      keys: ['object', 'timestamp']
    })
    .then((filteredDocuments) => {
      console.debug('filteredDocuments = ', filteredDocuments);
      addData(filteredDocuments, 'io.cozy.xrecords'+earnerFolder+'/'+group.name);     
    })

    // filtered badges (ie: new ones) are written in the cloud, but there is no frontend to show it yet. We may try http requests to check they are actually stored in cozy servers.  
        
  }))

}


   /*============ADDITIONAL FUNCTIONS=================*/

// this function allows to create the options object for the POST request promise (OB first step)
function make_rq_options (body) {
	this.uri = 'https://backpack.openbadges.org/displayer/convert/email';
	this.method = 'POST'
	this.body = body;
	this.headers = {'Content-Type': 'application/json',
	  'Content-Length': Buffer.byteLength(body)
	}
}
