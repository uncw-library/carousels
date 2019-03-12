const express = require('express');
const createError = require('http-errors');
const R = require('ramda');
const _ = require('lodash');
const c = require('../config/constants');

const router = express.Router();
const sierraController = require('../controllers/sierra');
const sierraPool = require('../config/sierra');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // create a client for our connection pool
    const sierraClient = await sierraPool.connect();

    const { location } = req.query || 'new';

    // let's get our new items
    // note that we will need to chunk the array for the purposes of the carousel
    const newItemsBib = R.path(['rows'], await sierraController.getNewlyAcquiredItems(sierraClient, location));
    const newItems = (newItemsBib) ? _.chunk(await Promise.all(newItemsBib.map(async (item) => {
      let isbn = R.path(['rows', 0, 'field_content'], await sierraController.getISBN(sierraClient, item.record_num));
      let UPC = R.path(['rows', 0, 'field_content'], await sierraController.getUPC(sierraClient, item.record_num));
      const addInfo = R.path(['rows'], await sierraController.getAddInfo(sierraClient, item.record_num));
      isbn = (isbn && location !== 'gov') ? isbn.match(/([0-9]+[X]?)/gi)[0] : '';
      UPC = (UPC && location !== 'gov') ? UPC.match(/([0-9]+)/gi)[0] : '';

      // find the first item that matches the location and is available,
      // or just find available item. If all else fails, grab the first item
      let itemMatch = addInfo.filter(matchedItem => (matchedItem.location_code === item.location && matchedItem.item_status_code === '-'));
      itemMatch = (itemMatch.length) ? itemMatch : addInfo.filter(matchedItem => (matchedItem.item_status_code === '-'));
      itemMatch = (itemMatch.length) ? itemMatch[0] : R.path([0], addInfo);

      return {
        ...item,
        isbn,
        UPC,
        callNumber: R.path(['call_number'], itemMatch),
        available: ((R.path(['item_status_code'], itemMatch) === '-')
          || location === 'ebooks'
          || location === 'evideos'
          || location === 'audiobooks'),
        location: R.path(['location'], itemMatch),
        titleFixed: (item.title.length >= 50) ? `${item.title.substring(0, 50)}...` : item.title,
        authorFixed: (item.author.length >= 25) ? `${item.author.substring(0, 25)}...` : item.author,
      };
    })), c.ITEMS_PER_SLIDE) : [[]];

    // let's get our popular items
    const popItemsBib = R.path(['rows'], await sierraController.getPopularItems(sierraClient, location));
    const popItems = (popItemsBib) ? _.chunk(await Promise.all(popItemsBib.map(async (item) => {
      let isbn = R.path(['rows', 0, 'field_content'], await sierraController.getISBN(sierraClient, item.record_num));
      let UPC = R.path(['rows', 0, 'field_content'], await sierraController.getUPC(sierraClient, item.record_num));
      const addInfo = R.path(['rows'], await sierraController.getAddInfo(sierraClient, item.record_num));
      isbn = (isbn && location !== 'gov') ? isbn.match(/([0-9]+[X]?)/gi)[0] : '';
      UPC = (UPC && location !== 'gov') ? UPC.match(/([0-9]+)/gi)[0] : '';

      // find the first item that matches the location and is available,
      // or just find available item. If all else fails, grab the first item
      let itemMatch = addInfo.filter(matchedItem => (matchedItem.location_code === item.location && matchedItem.item_status_code === '-'));
      itemMatch = (itemMatch.length) ? itemMatch : addInfo.filter(matchedItem => (matchedItem.item_status_code === '-'));
      itemMatch = (itemMatch.length) ? itemMatch[0] : R.path([0], addInfo);

      return {
        ...item,
        isbn,
        UPC,
        callNumber: R.path(['call_number'], itemMatch),
        available: ((R.path(['item_status_code'], itemMatch) === '-')
          || location === 'ebooks'
          || location === 'evideos'
          || location === 'audiobooks'),
        location: R.path(['location'], itemMatch),
        titleFixed: (item.title.length >= 50) ? `${item.title.substring(0, 50)}...` : item.title,
        authorFixed: (item.author.length >= 25) ? `${item.author.substring(0, 25)}...` : item.author,
      };
    })), c.ITEMS_PER_SLIDE) : [[]];

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
      { name: 'Audiobooks', value: 'audiobooks' },
    ];

    // release our clients to the pool
    sierraClient.release();

    res.render('home', {
      title: 'Readbox',
      newItems,
      popItems,
      locations,
      location: location || 'new',
      showFindIt: (location === 'gen'),
      noPop: (location === 'ebooks' || location === 'evideos'),
      noNew: (location === 'audiobooks'),
    });
  } catch (e) {
    console.log(e);
    next(createError(500));
  }
});

module.exports = router;
