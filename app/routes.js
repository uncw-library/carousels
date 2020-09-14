const express = require('express')

const router = express.Router()
const controller = require('./controller')

/* GET home page. */
router.get('/', async (req, res, next) => {
  const {
    newBooks,
    newVideos,
    newMusic,
    popItems,
    locations,
    location
  } = await controller.spaghetti(req, res, next)

  res.render('home', {
    title: 'Readbox',
    newBooks,
    newVideos,
    newMusic,
    popItems,
    locations,
    location: location || 'new',
    showFindIt: (location !== 'ebooks' && location !== 'evideos'),
    noPop: (location === 'ebooks' || location === 'evideos')
    // noNew: (location === 'audiobooks'),
  })
})

module.exports = router
