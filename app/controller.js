const R = require('ramda')
const _ = require('lodash')

const fs = require('fs')

const queries = require('./queries')
const sierra = require('./sierra')

const ITEMS_PER_SLIDE = 5

async function tempTestOutput (bundle) {
  const {
    newBooks,
    newVideos,
    newMusic,
    popItems,
    locations,
    location
  } = bundle

  // const newBooksText = JSON.stringify(newBooks)
  // fs.writeFile('app/testOutput/newBooksOutput.json', newBooksText, 'utf8', function (err) {
  //   if (err) return console.log(err)
  // })
  // const newVideosText = JSON.stringify(newVideos)
  // fs.writeFile('app/testOutput/newVideosOutput.json', newVideosText, 'utf8', function (err) {
  //   if (err) return console.log(err)
  // })
  // const newMusicText = JSON.stringify(newMusic)
  // fs.writeFile('app/testOutput/newMusicOutput.json', newMusicText, 'utf8', function (err) {
  //   if (err) return console.log(err)
  // })
  // const popItemsText = JSON.stringify(popItems)
  // fs.writeFile('app/testOutput/popItemsOutput.json', popItemsText, 'utf8', function (err) {
  //   if (err) return console.log(err)
  // })
  // const locationsText = JSON.stringify(locations)
  // fs.writeFile('app/testOutput/locationsOutput.json', locationsText, 'utf8', function (err) {
  //   if (err) return console.log(err)
  // })
  // const locationText = JSON.stringify(location)
  // fs.writeFile('app/testOutput/locationOutput.json', locationText, 'utf8', function (err) {
  //   if (err) return console.log(err)
  // })

  const oldNew = {
    'newBooksOutput.json': newBooks,
    'newVideosOutput.json': newVideos,
    'newMusicOutput.json': newMusic,
    'popItemsOutput.json': popItems,
    'locationsOutput.json': locations,
    'locationOutput.json': location
  }
  for (const key in oldNew) {
    const value = oldNew[key]
    if (compareOldNew(key, value) === true) {
      console.log(`${key} matches`)
    } else {
      console.log(`${key} doesn't match!!!!!!`)
    }
  }
}

function compareOldNew (oldOutputFile, newJson) {
  const fullpath = `app/testOutput/${oldOutputFile}`
  const fileText = fs.readFileSync(fullpath, 'utf8')
  const reorderedFiletext = JSON.stringify(JSON.parse(fileText))
  const reorderedQueryResponse = JSON.stringify(newJson)
  if (reorderedFiletext === reorderedQueryResponse) {
    return true
  } else {
    return false
  }
}

async function findNewBooks (location) {
  const newBooksBib = (await queries.getNewBooks(sierra, location)).rows
  if (!newBooksBib.length) {
    return [[]]
  }
  const newBooksData = await Promise.all(
    newBooksBib.map(async (item) => {
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
  // chunk the array for carousel display
  const newBooks = _.chunk(newBooksData, ITEMS_PER_SLIDE)
  return newBooks
}

async function findNewVideos (location) {
  // let's get our new videos
  // note that we will need to chunk the array for the purposes of the carousel
  const newVideosBib = R.path(['rows'], await queries.getNewVideos(sierra, location))
  const newVideos = (newVideosBib) ? _.chunk(await Promise.all(newVideosBib.map(async (item) => {
    let isbn = R.path(['rows', 0, 'field_content'], await queries.getISBN(sierra, item.record_num))
    let UPC = R.path(['rows', 0, 'field_content'], await queries.getUPC(sierra, item.record_num))
    const addInfo = R.path(['rows'], await queries.getAddInfo(sierra, item.record_num))
    isbn = (isbn && location !== 'gov') ? isbn.match(/([0-9]+[X]?)/gi)[0] : ''
    UPC = (UPC && location !== 'gov') ? UPC.match(/([0-9]+)/gi)[0] : ''

    // find the first item that matches the location and is available,
    // or just find available item. If all else fails, grab the first item
    let itemMatch = addInfo.filter(matchedItem => (matchedItem.location_code === item.location && matchedItem.is_available_at_library === true))
    itemMatch = (itemMatch.length) ? itemMatch : addInfo.filter(matchedItem => (matchedItem.is_available_at_library === true))
    itemMatch = (itemMatch.length) ? itemMatch[0] : R.path([0], addInfo)

    return {
      ...item,
      isbn,
      UPC,
      callNumber: (!(location === 'ebooks' || location === 'evideos'))
        ? R.path(['call_number'], itemMatch) : (item.url.replace(/[|].+/ig, '')),
      available: ((R.path(['is_available_at_library'], itemMatch) === true) ||
        location === 'ebooks' ||
        location === 'evideos' ||
        location === 'audiobooks'),
      location: R.path(['location'], itemMatch),
      titleFixed: (item.title.length >= 50) ? `${item.title.substring(0, 50)}...` : item.title,
      authorFixed: (item.author.length >= 25) ? `${item.author.substring(0, 25)}...` : item.author
    }
  })), ITEMS_PER_SLIDE) : [[]]
  return newVideos
}

async function findNewMusic (location) {
  // let's get our new music
  // note that we will need to chunk the array for the purposes of the carousel
  const newMusicBib = R.path(['rows'], await queries.getNewMusic(sierra, location))
  const newMusic = (newMusicBib) ? _.chunk(await Promise.all(newMusicBib.map(async (item) => {
    let isbn = R.path(['rows', 0, 'field_content'], await queries.getISBN(sierra, item.record_num))
    let UPC = R.path(['rows', 0, 'field_content'], await queries.getUPC(sierra, item.record_num))
    const addInfo = R.path(['rows'], await queries.getAddInfo(sierra, item.record_num))
    isbn = (isbn && location !== 'gov') ? isbn.match(/([0-9]+[X]?)/gi)[0] : ''
    UPC = (UPC && location !== 'gov') ? UPC.match(/([0-9]+)/gi)[0] : ''

    // find the first item that matches the location and is available,
    // or just find available item. If all else fails, grab the first item
    let itemMatch = addInfo.filter(matchedItem => (matchedItem.location_code === item.location && matchedItem.is_available_at_library === true))
    itemMatch = (itemMatch.length) ? itemMatch : addInfo.filter(matchedItem => (matchedItem.is_available_at_library === true))
    itemMatch = (itemMatch.length) ? itemMatch[0] : R.path([0], addInfo)

    return {
      ...item,
      isbn,
      UPC,
      callNumber: (!(location === 'ebooks' || location === 'evideos'))
        ? R.path(['call_number'], itemMatch) : (item.url.replace(/[|].+/ig, '')),
      available: ((R.path(['is_available_at_library'], itemMatch) === true) ||
        location === 'ebooks' ||
        location === 'evideos' ||
        location === 'audiobooks'),
      location: R.path(['location'], itemMatch),
      titleFixed: (item.title.length >= 50) ? `${item.title.substring(0, 50)}...` : item.title,
      authorFixed: (item.author.length >= 25) ? `${item.author.substring(0, 25)}...` : item.author
    }
  })), ITEMS_PER_SLIDE) : [[]]
  return newMusic
}

async function findPopItems (location) {
  // let's get our popular items
  const popItemsBib = R.path(['rows'], await queries.getPopularItems(sierra, location))
  const popItems = (popItemsBib) ? _.chunk(await Promise.all(popItemsBib.map(async (item) => {
    let isbn = R.path(['rows', 0, 'field_content'], await queries.getISBN(sierra, item.record_num))
    let UPC = R.path(['rows', 0, 'field_content'], await queries.getUPC(sierra, item.record_num))
    const addInfo = R.path(['rows'], await queries.getAddInfo(sierra, item.record_num))
    isbn = (isbn && location !== 'gov') ? isbn.match(/([0-9]+[X]?)/gi)[0] : ''
    UPC = (UPC && location !== 'gov') ? UPC.match(/([0-9]+)/gi)[0] : ''

    // find the first item that matches the location and is available,
    // or just find available item. If all else fails, grab the first item
    let itemMatch = addInfo.filter(matchedItem => (matchedItem.location_code === item.location && matchedItem.is_available_at_library === true))
    itemMatch = (itemMatch.length) ? itemMatch : addInfo.filter(matchedItem => (matchedItem.is_available_at_library === true))
    itemMatch = (itemMatch.length) ? itemMatch[0] : R.path([0], addInfo)

    return {
      ...item,
      isbn,
      UPC,
      callNumber: R.path(['call_number'], itemMatch),
      available: ((R.path(['is_available_at_library'], itemMatch) === true) ||
        location === 'ebooks' ||
        location === 'evideos' ||
        location === 'audiobooks'),
      location: R.path(['location'], itemMatch),
      titleFixed: (item.title.length >= 50) ? `${item.title.substring(0, 50)}...` : item.title,
      authorFixed: (item.author.length >= 25) ? `${item.author.substring(0, 25)}...` : item.author
    }
  })), ITEMS_PER_SLIDE) : [[]]
  return popItems
}

async function processNewBook (item, location) {
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
    return item.url.replace(/[|].+/ig, '')
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
}

function shortenTitle (item) {
  if (item.title.length >= 50) {
    return `${item.title.substring(0, 50)}...`
  }
  return item.title
}

function shortenAuthor (item) {
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
  for (let clump in addInfo) {
    if (clump.location_code === item.location && clump.is_available_at_library === true) {
      return clump
    }
  }
  for (let clump in addInfo) {
    if (clump.is_available_at_library === true) {
      return clump
    }
  }
  return addInfo[0]
}

async function doFrontPage (req, res, next) {
  const location = req.query.location || 'gen'

  const newBooks = await findNewBooks(location)
  const newVideos = await findNewVideos(location)
  const newMusic = await findNewMusic(location)
  const popItems = await findPopItems(location)

  const locations = [
    { name: 'General Collection', value: 'gen' },
    { name: 'Government Resources', value: 'gov' },
    { name: 'Juvenile Collection', value: 'juv' },
    { name: 'New and Popular Collection', value: 'new' },
    { name: 'CDs', value: 'cds' },
    { name: 'DVDs', value: 'dvds' },
    { name: 'Ebooks', value: 'ebooks' },
    { name: 'Streaming Videos', value: 'evideos' },
    { name: 'Audiobooks', value: 'audiobooks' }
  ]

  const bundle = {
    newBooks,
    newVideos,
    newMusic,
    popItems,
    locations,
    location
  }

  tempTestOutput(bundle)

  return bundle
}

module.exports = {
  doFrontPage
}
