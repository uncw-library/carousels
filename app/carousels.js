const R = require('ramda')
const _ = require('lodash')

const sierra = require('./queries')

const ITEMS_PER_SLIDE = 5
const CACHE = {}

async function makeCarousels (pageType, reqURL, next) {
  /*
    return early, if there's a cache and it's less than a day old.
    CACHE is like {reqURL: {'bundle': bundle, 'time': timeLastRun}, etc}.
  */
  if (CACHE[reqURL] && CACHE[reqURL].time && (Date.now() - CACHE[reqURL].time < 86400000)) {
    return CACHE[reqURL].bundle
  }

  const showFindIt = (pageType !== 'ebooks' && pageType !== 'evideos')
  const noPop = (pageType === 'ebooks' || pageType === 'evideos')

  /*
    Because some pages have 1 carousel row, and others have 2 or 3,
    we take the incoming request's pageType 
    then we find the carousels for that pageType in 'pageTypeToCarouselRows'.
    After querying & cleaning up the data for each carousel   --using map(x => makeOneCarousel(x))
    we send that processed data back to the frontend template for rendering.
  */
  const pageTypeToCarouselRows = {
    gen: ['newGeneral', 'popGeneral'],
    gov: ['newGov', 'popGov'],
    juv: ['newJuv', 'popJuv'],
    new: ['newNew', 'popNew'],
    cds: ['newCDs', 'popCDs'],
    dvds: ['newDVDs', 'popDVDs'],
    ebooks: ['newEbooks'],
    evideos: ['newEvideos'],
    audiobooks: ['popAudiobooks'],
    uncwAuthors: ['uncwAuthors'],
    newTitles: ['newBooks', 'newVideos', 'newMusic']
  }
  const carouselRows = pageTypeToCarouselRows[pageType]
  /*
    Run 'makeOneCarousel(rowType)' on each item in carouselRows
    uses parallel async for speed.
    It waits until all the makeOneCarousel() is done before allowing anything using 'rows' to run.
  */
  const rows = await Promise.all(carouselRows.map(rowType => makeOneCarousel(rowType, pageType)))

  const bundle = {
    rows,
    pageType,
    showFindIt,
    noPop
  }

  if (!CACHE[reqURL]) {
    CACHE[reqURL] = {}
  }
  CACHE[reqURL].bundle = bundle
  CACHE[reqURL].time = Date.now()
  return bundle
}

async function makeOneCarousel (rowType, pageType) {
  // rowChoices names the details for each carousel row
  // we use rowType to choose one rowChoice, and build one carousel
  const rowChoices = {
    newBooks: {
      query: async () => await sierra.getNewBooks(),
      title: 'Newly Acquired Books',
      rssFeed: 'https://library.uncw.edu/web/collections/new/books/feeds/NewTitles.xml'
    },
    newVideos: {
      query: async () => await sierra.getNewVideos(),
      title: 'Newly Acquired Videos',
      rssFeed: 'https://library.uncw.edu/web/collections/new/videos/feeds/NewVideos.xml'
    },
    newMusic: {
      query: async () => await sierra.getNewMusic(),
      title: 'Newly Acquired Music',
      rssFeed: 'https://library.uncw.edu/web/collections/new/cds/feeds/NewMusic.xml'
    },
    uncwAuthors: {
      query: async () => await sierra.getUNCWAuthors(),
      title: 'UNCW Authors',
      rssFeed: ''
    },
    newGeneral: {
      query: async () => await sierra.getNewGeneral(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    popGeneral: {
      query: async () => await sierra.getPopGeneral(),
      title: 'Most Popular Items',
      rssFeed: ''
    },
    newGov: {
      query: async () => await sierra.getNewGov(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    popGov: {
      query: async () => await sierra.getPopGov(),
      title: 'Most Popular Items',
      rssFeed: ''
    },
    newJuv: {
      query: async () => await sierra.getNewJuv(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    popJuv: {
      query: async () => await sierra.getPopJuv(),
      title: 'Most Popular Items',
      rssFeed: ''
    },
    newNew: {
      query: async () => await sierra.getNewNew(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    popNew: {
      query: async () => await sierra.getPopNew(),
      title: 'Most Popular Items',
      rssFeed: ''
    },
    newCDs: {
      query: async () => await sierra.getNewCDs(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    popCDs: {
      query: async () => await sierra.getPopCDs(),
      title: 'Most Popular Items',
      rssFeed: ''
    },
    newDVDs: {
      query: async () => await sierra.getNewDVDs(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    popDVDs: {
      query: async () => await sierra.getPopDVDs(),
      title: 'Most Popular Items',
      rssFeed: ''
    },
    newEbooks: {
      query: async () => await sierra.getNewEbooks(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    newEvideos: {
      query: async () => await sierra.getNewEvideos(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    },
    popAudiobooks: {
      query: async () => await sierra.getPopAudiobooks(),
      title: 'Newly Acquired Items',
      rssFeed: ''
    }
  }

  const choice = rowChoices[rowType]
  const result = await choice.query()
  const bulkData = result.rows
  if (!bulkData.length) {
    return [[]]
  }
  const items = await cleanupItems(bulkData, pageType)
  return {
    items: items,
    title: choice.title,
    rssFeed: choice.rssFeed
  }
}

async function cleanupItems (bulkData, pageType) {
  /*
  900 queries right here.  3 rows x 100 items/row x 3 queries/item.
  For speed, using parallel async.
  Legibility suffers, but the speed seems worth the complexity
  */
  const slimData = await Promise.all(
    bulkData.map(async (item) => {
      const isbnResponse = await sierra.getISBN(item.recordnum)
      const upcResponse = await sierra.getUPC(item.recordnum)
      const extrasResponse = await sierra.getExtras(item.recordnum)
      const bestItem = findBestItem(item, extrasResponse)

      return {
        ...item,
        isbn: parseISBN(isbnResponse, pageType),
        UPC: parseUPC(upcResponse, pageType),
        callNumber: parseCallNumber(bestItem, pageType),
        available: isAvailable(bestItem, pageType),
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

// Helper Functions

function parseISBN (isbnResponse, pageType) {
  const fieldContent = R.path(['rows', 0, 'field_content'], isbnResponse)
  if (fieldContent && pageType !== 'gov') {
    return fieldContent.match(/([0-9]+[X]?)/gi)[0]
  }
  return ''
}

function parseUPC (upcResponse, pageType) {
  const fieldContent = R.path(['rows', 0, 'field_content'], upcResponse)
  if (fieldContent && pageType !== 'gov') {
    return fieldContent.match(/([0-9]+)/gi)[0]
  }
  return ''
}

function parseCallNumber (bestItem, pageType) {
  // BUG:  none of the queries can return a 'url'
  if (!bestItem.url) {
    return R.path(['call_number'], bestItem)
  }
  if (['ebooks', 'evideos'].includes(pageType)) {
    return bestItem.url.replace(/[|].+/ig, '')
  } else {
    return R.path(['call_number'], bestItem)
  }
}

function isAvailable (bestItem, pageType) {
  if (['ebooks', 'evideos', 'audiobooks'].includes(pageType)) {
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
  // grab the first book that matches location_code and is available,
  for (const clump of extras) {
    if (clump.location_code === item.location_code && clump.is_available_at_library === true) {
      return clump
    }
  }
  // if that fails, grab the first book that is available,
  for (const clump of extras) {
    if (clump.is_available_at_library === true) {
      return clump
    }
  }
  // If all else fails, grab the first item
  return extras[0]
}

module.exports = {
  makeCarousels
}