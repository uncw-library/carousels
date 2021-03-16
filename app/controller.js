const R = require('ramda')
const _ = require('lodash')

const queries = require('./queries')
const sierra = require('./sierra')

const ITEMS_PER_SLIDE = 5
let FRONTPAGE_CACHE, FRONTPAGE_CACHE_TIME
let AUTHORS_CACHE, AUTHORS_CACHE_TIME

async function doFrontPage (req, res, next) {
  // return early if there's a cache and it's less than a day old.
  if (FRONTPAGE_CACHE && FRONTPAGE_CACHE_TIME && (Date.now() - FRONTPAGE_CACHE_TIME < 86400000)) {
    return FRONTPAGE_CACHE
  }
  const location = req.query.location || 'gen'
  const newBooks = await main('newBooks', location)
  const newVideos = await main('newVideos', location)
  const newMusic = await main('newMusic', location)
  const showFindIt = (location !== 'ebooks' && location !== 'evideos')
  const noPop = (location === 'ebooks' || location === 'evideos')
  const bundle = {
    newBooks,
    newVideos,
    newMusic,
    location,
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
  const location = req.query.location || 'gen'
  const newBooks = await main('uncwAuthors', location)
  const newVideos = [[]]
  const newMusic = [[]]
  // const newVideos = await main('newVideos', location)
  // const newMusic = await main('newMusic', location)
  const showFindIt = (location !== 'ebooks' && location !== 'evideos')
  const noPop = (location === 'ebooks' || location === 'evideos')
  const bundle = {
    newBooks,
    newVideos,
    newMusic,
    location,
    showFindIt,
    noPop
  }
  AUTHORS_CACHE = bundle
  AUTHORS_CACHE_TIME = Date.now()
  return bundle
}


async function main (segment, location) {
  let response
  switch (segment) {
    case 'newBooks':
      response = await queries.getNewBooks(sierra)
      break
    case 'newVideos':
      response = await queries.getNewVideos(sierra)
      break
    case 'newMusic':
      response = await queries.getNewMusic(sierra)
      break
    case 'uncwAuthors':
      response = await queries.getUNCWAuthors(sierra)
      break
    default:
      response = { rows: [] }
      break
  }
  const bulkData = response.rows
  if (!bulkData.length) {
    return [[]]
  }
  // using parallel async for the subqueries
  const slimData = await Promise.all(
    bulkData.map(async (item) => {
      const isbnResponse = await queries.getISBN(sierra, item.record_num)
      const upcResponse = await queries.getUPC(sierra, item.record_num)
      const addInfoResponse = await queries.getAddInfo(sierra, item.record_num)
      const itemMatch = findBestItem(item, addInfoResponse)

      return {
        ...item,
        isbn: parseISBN(isbnResponse, location),
        UPC: parseUPC(upcResponse, location),
        callNumber: parseCallNumber(location, itemMatch),
        available: isAvailable(location, itemMatch),
        location: itemMatch.location,
        titleFixed: shortenTitle(item),
        authorFixed: shortenAuthor(item)
      }
    })
  )
  // the carousel display needs a chunked array
  const chunked = _.chunk(slimData, ITEMS_PER_SLIDE)
  return chunked
}

function parseISBN (isbnResponse, location) {
  const fieldContent = R.path(['rows', 0, 'field_content'], isbnResponse)
  if (fieldContent && location !== 'gov') {
    return fieldContent.match(/([0-9]+[X]?)/gi)[0]
  }
  return ''
}

function parseUPC (upcResponse, location) {
  const fieldContent = R.path(['rows', 0, 'field_content'], upcResponse)
  if (fieldContent && location !== 'gov') {
    return fieldContent.match(/([0-9]+)/gi)[0]
  }
  return ''
}

function parseCallNumber (location, itemMatch) {
  if (['ebooks', 'evideos'].includes(location)) {
    return itemMatch.url.replace(/[|].+/ig, '')
  } else {
    return R.path(['call_number'], itemMatch)
  }
}

function isAvailable (location, itemMatch) {
  if (['ebooks', 'evideos', 'audiobooks'].includes(location)) {
    return true
  }
  if (R.path(['is_available_at_library'], itemMatch) === true) {
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

function findBestItem (item, addInfoResponse) {
  const addInfo = addInfoResponse.rows
  // find the first book that matches the location and is available,
  // or just the first book that is available,
  // If all else fails, grab the first item
  for (const clump in addInfo) {
    if (clump.location_code === item.location && clump.is_available_at_library === true) {
      return clump
    }
  }
  for (const clump in addInfo) {
    if (clump.is_available_at_library === true) {
      return clump
    }
  }
  return addInfo[0]
}

module.exports = {
  doFrontPage,
  doUncwAuthorsPage
}
