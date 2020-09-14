const R = require('ramda')
const _ = require('lodash')

const queries = require('./queries')
const sierraPool = require('./sierra')

const ITEMS_PER_SLIDE = 5

async function spaghetti (req, res, next) {
    // create a client for our connection pool
    const sierraClient = await sierraPool.connect()

    const location = req.query.location || 'gen'

    // let's get our new books
    // note that we will need to chunk the array for the purposes of the carousel
    const newBooksBib = R.path(['rows'], await queries.getNewlyAcquiredBooks(sierraClient, location))
    const newBooks = (newBooksBib) ? _.chunk(await Promise.all(newBooksBib.map(async (item) => {
      let isbn = R.path(['rows', 0, 'field_content'], await queries.getISBN(sierraClient, item.record_num))
      let UPC = R.path(['rows', 0, 'field_content'], await queries.getUPC(sierraClient, item.record_num))
      const addInfo = R.path(['rows'], await queries.getAddInfo(sierraClient, item.record_num))
      isbn = (isbn && location !== 'gov') ? isbn.match(/([0-9]+[X]?)/gi)[0] : ''
      UPC = (UPC && location !== 'gov') ? UPC.match(/([0-9]+)/gi)[0] : ''

      // find the first book that matches the location and is available,
      // or just find available book. If all else fails, grab the first item
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

    // let's get our new videos
    // note that we will need to chunk the array for the purposes of the carousel
    const newVideosBib = R.path(['rows'], await queries.getNewlyAcquiredVideos(sierraClient, location))
    const newVideos = (newVideosBib) ? _.chunk(await Promise.all(newVideosBib.map(async (item) => {
      let isbn = R.path(['rows', 0, 'field_content'], await queries.getISBN(sierraClient, item.record_num))
      let UPC = R.path(['rows', 0, 'field_content'], await queries.getUPC(sierraClient, item.record_num))
      const addInfo = R.path(['rows'], await queries.getAddInfo(sierraClient, item.record_num))
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



    // let's get our new music
    // note that we will need to chunk the array for the purposes of the carousel
    const newMusicBib = R.path(['rows'], await queries.getNewlyAcquiredMusic(sierraClient, location))
    const newMusic = (newMusicBib) ? _.chunk(await Promise.all(newMusicBib.map(async (item) => {
      let isbn = R.path(['rows', 0, 'field_content'], await queries.getISBN(sierraClient, item.record_num))
      let UPC = R.path(['rows', 0, 'field_content'], await queries.getUPC(sierraClient, item.record_num))
      const addInfo = R.path(['rows'], await queries.getAddInfo(sierraClient, item.record_num))
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


    // let's get our popular items
    const popItemsBib = R.path(['rows'], await queries.getPopularItems(sierraClient, location))
    const popItems = (popItemsBib) ? _.chunk(await Promise.all(popItemsBib.map(async (item) => {
      let isbn = R.path(['rows', 0, 'field_content'], await queries.getISBN(sierraClient, item.record_num))
      let UPC = R.path(['rows', 0, 'field_content'], await queries.getUPC(sierraClient, item.record_num))
      const addInfo = R.path(['rows'], await queries.getAddInfo(sierraClient, item.record_num))
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

    // define the locations to populate the dropdown
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

    // release our clients to the pool
    sierraClient.release()

    return {
      newBooks,
      newVideos,
      newMusic,
      popItems,
      locations,
      location
  }
}

module.exports = {
  spaghetti
}