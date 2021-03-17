const express = require('express')

const router = express.Router()
const controller = require('./controller')

router.get('/', async (req, res, next) => {
  const {
    rows,
    location,
    showFindIt,
    noPop
  } = await controller.doFrontPage(req, res, next)

  res.render('home', {
    rows,
    location,
    showFindIt,
    noPop
  })
})

router.get('/uncw-authors', async (req, res, next) => {
  const {
    rows,
    location,
    showFindIt,
    noPop
  } = await controller.doUncwAuthorsPage(req, res, next)

  res.render('home', {
    rows,
    location,
    showFindIt,
    noPop
  })
})

module.exports = router
