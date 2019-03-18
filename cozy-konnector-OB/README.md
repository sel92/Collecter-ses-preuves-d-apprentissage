[Cozy][cozy] OPENBADGES KONNECTOR
=======================================

What's Cozy?
------------

![Cozy Logo](https://cdn.rawgit.com/cozy/cozy-guidelines/master/templates/cozy_logo_small.svg)

[Cozy] is a personal data platform that brings all your web services in the same private space. With it, your webapps and your devices can share data easily, providing you with a new experience. You can install Cozy on your own hardware where no one's tracking you.

What is this konnector about ?
------------------------------

This konnector retrieves your badges from your [Openbadges backpack] and stores them in your Cozy after converting them according to [xAPI specification][xAPI spec], which would allow to interact with learning record stores (LRS).
It was developped in the scope of a school project combining issues of e-learning and personal data management.

Further links related to LRSs:
- https://xapi.com/building-a-learning-record-store/
- http://rusticisoftware.github.io/TinCanJS/


Details about the implementation
--------------------------------

Code is visible in folder src, and made of 3 files:
- index.js implements the konnector itself, which successively performs badge retrieval (thanks to the email address indicated in file `konnector-dev-config.json`), xAPI conversion and storage in your Cozy. Storage is done so to avoid data duplication.
- badge_retrieval.js implements some functions used for fetching your badges, using the [Displayer API] of Openbadges.
- xapi_conversion.js defines the function used for the conversion of badges from Openbadges format to [xAPI format][xAPI spec]. As defined in the Openbadges specification, the main components describing a badge are: recipient and badge description including badge issuer. An xAPI statement aims at recording any experience and is writting in the format "actor" "verb" "object", with optional additional elements like "authority". The final format has been chosen as:
  + actor = badge recipient
  + verb = "earned"
  + object = badge description
  + authority = badge issuer

This choice is detailled in this file. The conversion is still very basic as a lot of elements may be lost during the process ('advanced' fiels like the badge verification option proposed by Openbagdes, user identity protection with id hash, ...). We should think about completing the conversion process or even using an other conversion method such as XSLT.


Further remarks for konnector deployement
-----------------------------------------

What should be done before deploying the konnector :
- develop the frontend part, so a user may visualize his badges on mycozy.cloud.


### Open a Pull-Request

If you want to work on this konnector and submit code modifications, feel free to open pull-requests!
</br>See :
* the [contributing guide][contribute] for more information about how to properly open pull-requests.
* the [konnectors development guide](https://docs.cozy.io/en/cozy-konnector-libs/dev/)

### Run and test

1 Clone the git project locally, install node_modules:

```sh
git clone https://github.com/sel92/Collecter-ses-preuves-d-apprentissage
cd cozy-konnector-OB
yarn install # or npm install
```

2 Create a `konnector-dev-config.json` file at the root with your test credentials, ie the email address you use on Openbadges platform :

```javascript
{
  "COZY_URL": "http://cozy.tools:8080",
  "fields": {"email": "zuck.m@rk.fb"}
}
```
Then :

```sh
yarn
yarn standalone
```

or

```sh
npm run standalone
```

For running the konnector connected to a Cozy server and more details see [konnectors documentation](https://docs.cozy.io/en/cozy-konnector-libs/dev/)

### Cozy-konnector-libs

This connector uses [cozy-konnector-libs](https://github.com/cozy/cozy-konnector-libs). It brings a bunch of helpers to interact with the Cozy server and to fetch data from an online service.

### Maintainer

The lead maintainers for this konnector is sel92.


### Get in touch

You can reach the Cozy Community by:

- [konnectors documentation](https://docs.cozy.io/en/cozy-konnector-libs/dev/)
- Chatting with us on IRC [#cozycloud on Freenode][freenode]
- Posting on our [Forum]
- Posting issues on the [Github repos][github]
- Say Hi! on [Twitter]


License
-------

OPENBADGES KONNECTOR is developed by sel92 and distributed under the [AGPL v3 license][agpl-3.0].

[cozy]: https://cozy.io "Cozy Cloud"
[agpl-3.0]: https://www.gnu.org/licenses/agpl-3.0.html
[freenode]: http://webchat.freenode.net/?randomnick=1&channels=%23cozycloud&uio=d4
[forum]: https://forum.cozy.io/
[github]: https://github.com/cozy/
[nodejs]: https://nodejs.org/
[standard]: https://standardjs.com
[twitter]: https://twitter.com/mycozycloud
[webpack]: https://webpack.js.org
[yarn]: https://yarnpkg.com
[travis]: https://travis-ci.org
[contribute]: CONTRIBUTING.md
[Openbadges backpack]: https://backpack.openbadges.org/
[xAPI spec]: https://xapi.com/
[Displayer API]: https://github.com/mozilla/openbadges-backpack/wiki/Using-the-Displayer-API
