const express = require('express')

const router = express.Router()
const controller = require('./controller')

/* GET home page. */
router.get('/', async (req, res, next) => {
  const {
    newBooks,
    newVideos,
    newMusic,
    location,
    showFindIt,
    noPop
  } = await controller.doFrontPage(req, res, next)

  res.render('home', {
    newBooks,
    newVideos,
    newMusic,
    location,
    showFindIt,
    noPop
  })
})

router.get('/uncw-authors', async (req, res, next) => {
  const {
    newBooks,
    newVideos,
    newMusic,
    location,
    showFindIt,
    noPop
  } = await controller.doUncwAuthorsPage(req, res, next)

  res.render('home', {
    newBooks,
    newVideos,
    newMusic,
    location,
    showFindIt,
    noPop    
  })
})

module.exports = router
