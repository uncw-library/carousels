const fs = require('fs')
const path = require('path')

const axios = require('axios')
const R = require('ramda')
const _ = require('lodash')

const sierra = require('./queries')

const CACHE = {}

async function makeCarouselsCached (pageType, reqURL, next) {
  /*
    return early, if this reqURL has a cache and it's less than a day old.
    CACHE is like {reqURL: {'carousels': carousels, 'time': timeLastRun}, etc}.
  */
  if (CACHE[reqURL] && CACHE[reqURL].time && (Date.now() - CACHE[reqURL].time < 86400000)) {
    return CACHE[reqURL].carousles
  }
  const carousels = await makeCarousels(pageType, reqURL, next)
  if (!CACHE[reqURL]) {
    CACHE[reqURL] = {}
  }
  // add item to the cache, if the item is non-empty
  if (Object.entries(carousels).length) {
    CACHE[reqURL].carousles = carousels
    CACHE[reqURL].time = Date.now()
  }
  return carousels
}

async function makeCarousels (pageType, reqURL, next) {
  /*
    Because some pages have 1 carousel row, and others have 2 or 3,
    we we match the incoming pageType (using pageTypeToCarouselRows)
    to find the carousels for that pageType.
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
    newTitles: ['newBooks', 'newVideos', 'newMusic'],
    popularTitles: ['newNew'],
    singleNewBooks: ['newBooks'],
    demopage: ['someData', 'popDVDs'],
    demojson: ['someData', 'popAudiobooks'],
    touchkiosk: ['newBooks', 'newVideos', 'newMusic']
  }
  const carouselRows = pageTypeToCarouselRows[pageType]
  /*
    Run 'makeOneCarousel(rowType)' on each item in carouselRows, using parallel async for speed.
    It waits until every makeOneCarousel() is done before allowing anything to use 'rows'.
  */
  const rows = await Promise.all(carouselRows.map(rowType => makeOneCarousel(rowType, pageType, next)))

  // global setting for this page.  i.e., we want 'touchkiosk' to not show RSS feed, etc.
  const showFindIt = (pageType !== 'ebooks' && pageType !== 'evideos')
  const noPop = (pageType === 'ebooks' || pageType === 'evideos')
  const showCatalogLink = (pageType !== 'uncwAuthors' && pageType !== 'touchkiosk')
  const showSendAsText = true
  const showRSS = (pageType !== 'touchkiosk')

  const carousels = {
    rows,
    pageType,
    showFindIt,
    noPop,
    showCatalogLink,
    showSendAsText,
    showRSS
  }
  return carousels
}

async function makeOneCarousel (rowType, pageType, next) {
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
    },
    someData: {
      query: async () => await sierra.getSomeData(),
      title: 'Title of some data',
      rssFeed: ''
    }
  }

  const choice = rowChoices[rowType]
  const result = await choice.query().catch(next)
  if (!result || !result.rows || !result.rows.length) {
    return [[]]
  }
  const bulkData = result.rows
  const shuffledData = _.shuffle(bulkData)
  const items = await cleanupItems(shuffledData, pageType, next)

  return {
    items: items,
    title: choice.title,
    rssFeed: choice.rssFeed
  }
}

async function cleanupItems (bulkData, pageType, next) {
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

      const isbn = parseISBN(isbnResponse, pageType)
      const upc = parseUPC(upcResponse, pageType)
      const image = await saveImage(isbn, upc)

      return {
        ...item,
        isbn: isbn,
        UPC: upc,
        callNumber: parseCallNumber(bestItem, pageType),
        available: isAvailable(bestItem, pageType),
        resLocation: bestItem.location_name,
        titleFixed: shortenTitle(item),
        authorFixed: shortenAuthor(item),
        image: image
      }
    })
  ).catch(next)

  const chunked = chunkItems(slimData, pageType)
  return chunked
}

/*
  Helper Functions
*/

async function downloadFile (fileUrl, outputPath) {
  const writer = fs.createWriteStream(outputPath)
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream'
  }).then(response => {
    return new Promise((resolve, reject) => {
      response.data.pipe(writer)
      let error = null
      writer.on('error', err => {
        error = err
        writer.close()
        reject(err)
      })
      writer.on('close', () => {
        if (!error) {
          resolve(true)
        }
      })
    })
  })
}

async function saveImage (isbn, upc) {
  // the browser's / path is our container's /app/public/
  // we have to send the browser a displaypath without /app/public/
  let displaypath

  // if file not fetchable, return a default image filepath
  const defaultImages = ['book1.jpg', 'book2.jpg', 'book3.jpg']
  const randomDefault = defaultImages[Math.floor(Math.random() * defaultImages.length)]
  if (!isbn.length && !upc.length) {
    displaypath = path.join('/', 'images', randomDefault)
    return displaypath
  }

  // naming a display path & a local server path based on its isbn or upc
  if (isbn.length) {
    displaypath = path.join('/', 'itemImages', `${isbn}.jpeg`)
  } else if (upc.length) {
    displaypath = path.join('/', 'itemImages', `${upc}.jpeg`)
  }
  const localpath = path.join('app', 'public', displaypath)

  // if file already fetched, return its filepath
  if (fs.existsSync(localpath)) {
    // blank images from syndetics are small.  Replacing them with default image.
    if (fs.statSync(localpath).size < 6211) {
      displaypath = path.join('/', 'images', randomDefault)
      return displaypath
    }
    return displaypath
  }

  // if file not exists, fetch the file
  const fileUrl = `https://www.syndetics.com/index.php?isbn=${isbn}&upc=${upc}/lc.gif&client=uncwh`
  return await downloadFile(fileUrl, localpath)
    .then((res) => {
      // blank images from syndetics are small.  Replacing them with default image.
      if (fs.statSync(localpath).size < 6211) {
        displaypath = path.join('/', 'images', randomDefault)
        return displaypath
      }
      return displaypath
    })
}

function chunkItems (slimData, pageType) {
  let itemsPerSlide
  if (pageType === 'singleNewBooks') {
    itemsPerSlide = 7
  } else {
    itemsPerSlide = 5
  }
  const chunked = _.chunk(slimData, itemsPerSlide)
  return chunked
}

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
  makeCarouselsCached
}
