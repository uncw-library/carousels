const R = require('ramda')
const _ = require('lodash')

const queries = require('./queries')
const sierra = require('./sierra')

const ITEMS_PER_SLIDE = 5
// let FRONTPAGE_CACHE, FRONTPAGE_CACHE_TIME
// let AUTHORS_CACHE, AUTHORS_CACHE_TIME
// let READBOX_CACHE, READBOX_CACHE_TIME
let CACHE = {}

async function doFrontPage (req, res, next) {
  // return early if there's a cache and it's less than a day old.
  if (FRONTPAGE_CACHE && FRONTPAGE_CACHE_TIME && (Date.now() - FRONTPAGE_CACHE_TIME < 86400000)) {
    return FRONTPAGE_CACHE
  }

  const reqLocation = req.query.location || 'gen'
  const showFindIt = (reqLocation !== 'ebooks' && reqLocation !== 'evideos')
  const noPop = (reqLocation === 'ebooks' || reqLocation === 'evideos')
  const bundle = {
    rows: [
      await prepareRow('newBooks', reqLocation),
      await prepareRow('newVideos', reqLocation),
      await prepareRow('newMusic', reqLocation)
    ],
    reqLocation,
    showFindIt,
    noPop
  }
  FRONTPAGE_CACHE = bundle
  FRONTPAGE_CACHE_TIME = Date.now()
  return bundle
}

async function doUncwAuthorsPage (req, res, next) {
  // return early if there's a cache and it's less than a day old.
  if (AUTHORS_CACHE && AUTHORS_CACHE_TIME && (Date.now() - AUTHORS_CACHE_TIME < 86400000)) {
    return AUTHORS_CACHE
  }

  const reqLocation = req.query.location || 'gen'
  const showFindIt = (reqLocation !== 'ebooks' && reqLocation !== 'evideos')
  const noPop = (reqLocation === 'ebooks' || reqLocation === 'evideos')

  const bundle = {
    rows: [
      await prepareRow('uncwAuthors', reqLocation),
      await prepareRow('newVideos', reqLocation),
      await prepareRow('newMusic', reqLocation)
    ],
    reqLocation,
    showFindIt,
    noPop
  }
  AUTHORS_CACHE = bundle
  AUTHORS_CACHE_TIME = Date.now()
  return bundle
}

async function doReadboxPage (req, res, next) {
  // return early if there's a cache and it's less than a day old.
  // CACHE has a key for each reqURL
  const reqURL = req.url
  if (CACHE[reqURL] && CACHE[reqURL]['time'] && (Date.now() - CACHE[reqURL]['time'] < 86400000)) {
    return CACHE[reqURL]['bundle']
  }

  const reqLocation = req.query.location || 'gen'
  const showFindIt = (reqLocation !== 'ebooks' && reqLocation !== 'evideos')
  const noPop = (reqLocation === 'ebooks' || reqLocation === 'evideos')

  const locationsRows = {
    'gen': ['newGeneral', 'popGeneral'],
    'gov': ['newGov', 'popGov'],
    'juv': ['newJuv', 'popJuv'],
    'new': ['newNew', 'popNew'],
    'cds': ['newCDs', 'popCDs'],
    'dvds': ['newDVDs', 'popDVDs'],
    'ebooks': ['newEbooks'],
    'evideos': ['newEvideos'],
    'audiobooks': ['popAudiobooks']
  }
  /*
    Because some pages have 1 row, and others have 2 or 3,
    we have to listen for which reqLocation is in the request
    then look up which row or rows of carousels from 'locationRows'
    then process the row or rows   --i.e., map(x => prepareRow(x))
    then put the processed rows data into the bundle.
  */
  const carouselRows = locationsRows[reqLocation]
  console.log(carouselRows)
  const rows = await Promise.all(carouselRows.map(x => prepareRow(x, reqLocation)))

  const bundle = {
    rows,
    reqLocation,
    showFindIt,
    noPop
  }

  if (!CACHE[reqURL]) {
    CACHE[reqURL] = {}
  }
  CACHE[reqURL]['bundle'] = bundle
  CACHE[reqURL]['time'] = Date.now()
  return bundle
}

async function prepareRow (rowType, reqLocation) {
  const rowChoices = {
    'newBooks': {
      lookup: async () => await queries.getNewBooks(sierra),
      title: 'Newly Acquired Books',
      rssFeed: 'https://library.uncw.edu/web/collections/new/books/feeds/NewTitles.xml',
    },
    'newVideos': {
      lookup: async () => await queries.getNewVideos(sierra),
      title: 'Newly Acquired Videos',
      rssFeed: 'https://library.uncw.edu/web/collections/new/videos/feeds/NewVideos.xml',
    },
    'newMusic': {
      lookup: async () => await queries.getNewMusic(sierra),
      title: 'Newly Acquired Music',
      rssFeed: 'https://library.uncw.edu/web/collections/new/cds/feeds/NewMusic.xml',
    },
    'uncwAuthors': {
      lookup: async () => await queries.getUNCWAuthors(sierra),
      title: 'UNCW Authors',
      rssFeed: 'https://library.uncw.edu/web/collections/new/cds/feeds/UNCWAuthors.xml',
    },
    'newGeneral': {
      lookup: async () => await queries.getNewGeneral(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popGeneral': {
      lookup: async () => await queries.getPopGeneral(sierra),
      title: 'Most Popular Items',
      rssFeed: '',
    },
    'newGeneral': {
      lookup: async () => await queries.getNewGeneral(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popGeneral': {
      lookup: async () => await queries.getPopGeneral(sierra),
      title: 'Most Popular Items',
      rssFeed: '',
    },
    'newGov': {
      lookup: async () => await queries.getNewGov(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popGov': {
      lookup: async () => await queries.getPopGov(sierra),
      title: 'Most Popular Items',
      rssFeed: '',
    },
    'newJuv': {
      lookup: async () => await queries.getNewJuv(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popJuv': {
      lookup: async () => await queries.getPopJuv(sierra),
      title: 'Most Popular Items',
      rssFeed: '',
    },
    'newNew': {
      lookup: async () => await queries.getNewNew(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popNew': {
      lookup: async () => await queries.getPopNew(sierra),
      title: 'Most Popular Items',
      rssFeed: '',
    },
    'newCDs': {
      lookup: async () => await queries.getNewCDs(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popCDs': {
      lookup: async () => await queries.getPopCDs(sierra),
      title: 'Most Popular Items',
      rssFeed: '',
    },
    'newDVDs': {
      lookup: async () => await queries.getNewDVDs(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popDVDs': {
      lookup: async () => await queries.getPopDVDs(sierra),
      title: 'Most Popular Items',
      rssFeed: '',
    },
    'newEbooks': {
      lookup: async () => await queries.getNewEbooks(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'newEvideos': {
      lookup: async () => await queries.getNewEvideos(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
    'popAudiobooks': {
      lookup: async () => await queries.getPopAudiobooks(sierra),
      title: 'Newly Acquired Items',
      rssFeed: '',
    },
  }

  const choice = rowChoices[rowType]
  const response = await choice.lookup()
  const bulkData = response.rows
  if (!bulkData.length) {
    return [[]]
  }
  const items = await cleanupItems(bulkData, reqLocation)
  return {
    items: items,
    title: choice.title,
    rssFeed: choice.rssFeed
  }
}

async function cleanupItems (bulkData, reqLocation) {
  /*
  900 queries right here.  3 rows x 100 items/row x 3 queries/item.
  For speed, using parallel async.
  Legibility suffers, but the speed seems worth the complexity
  */
  const slimData = await Promise.all(
    bulkData.map(async (item) => {
      const isbnResponse = await queries.getISBN(sierra, item.recordnum)
      const upcResponse = await queries.getUPC(sierra, item.recordnum)
      const extrasResponse = await queries.getExtras(sierra, item.recordnum)
      const bestItem = findBestItem(item, extrasResponse)

      return {
        ...item,
        isbn: parseISBN(isbnResponse, reqLocation),
        UPC: parseUPC(upcResponse, reqLocation),
        callNumber: parseCallNumber(bestItem, reqLocation),
        available: isAvailable(bestItem, reqLocation),
        resLocation: bestItem.location_name,
        titleFixed: shortenTitle(item),
        authorFixed: shortenAuthor(item)
      }
    })
  )
  // the carousel display needs a chunked array
  const chunked = _.chunk(slimData, ITEMS_PER_SLIDE)
  return chunked
}

function parseISBN (isbnResponse, reqLocation) {
  const fieldContent = R.path(['rows', 0, 'field_content'], isbnResponse)
  if (fieldContent && reqLocation !== 'gov') {
    return fieldContent.match(/([0-9]+[X]?)/gi)[0]
  }
  return ''
}

function parseUPC (upcResponse, reqLocation) {
  const fieldContent = R.path(['rows', 0, 'field_content'], upcResponse)
  if (fieldContent && reqLocation !== 'gov') {
    return fieldContent.match(/([0-9]+)/gi)[0]
  }
  return ''
}

function parseCallNumber (bestItem, reqLocation) {
  // BUG:  none of the queries can return a 'url'
  if (!bestItem.url) {
    return R.path(['call_number'], bestItem)
  }
  if (['ebooks', 'evideos'].includes(reqLocation)) {
    return bestItem.url.replace(/[|].+/ig, '')
  } else {
    return R.path(['call_number'], bestItem)
  }
}

function isAvailable (bestItem, reqLocation) {
  if (['ebooks', 'evideos', 'audiobooks'].includes(reqLocation)) {
    return true
  }
  if (R.path(['is_available_at_library'], bestItem) === true) {
    return true
  }
  return false
}

function shortenTitle (item) {
  if (item.title.length >= 50) {
    return `${item.title.substring(0, 50)}...`
  }
  return item.title
}

function shortenAuthor (item) {
  if (!item.author) {
    return ''
  }
  if (item.author.length >= 25) {
    return `${item.author.substring(0, 25)}...`
  }
  return item.author
}

function findBestItem (item, extrasResponse) {
  const extras = extrasResponse.rows
  // find the first book that matches the location and is available,
  // or just the first book that is available,
  // If all else fails, grab the first item
  for (const clump of extras) {
    if (clump.location_code === item.location_code && clump.is_available_at_library === true) {
      return clump
    }
  }
  for (const clump of extras) {
    if (clump.is_available_at_library === true) {
      return clump
    }
  }
  return extras[0]
}

module.exports = {
  doFrontPage,
  doUncwAuthorsPage,
  doReadboxPage
}
