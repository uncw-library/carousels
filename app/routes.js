const express = require('express')

const router = express.Router()
const { makeCarouselsCached } = require('./carousels')

router.get('/new-titles', async (req, res, next) => {
  const pageType = 'newTitles'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.render('just-carousels-template', payload)
})

router.get('/uncw-authors', async (req, res, next) => {
  const pageType = 'uncwAuthors'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.render('uncw-authors-template', payload)
})

router.get('/popular-titles', async (req, res, next) => {
  const pageType = 'popularTitles'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.render('popular-titles-template', payload)
})

router.get('/readbox*', async (req, res, next) => {
  const pageType = req.query.location || 'gen'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.render('readbox-template', payload)
})

router.get('/new-books', async (req, res, next) => {
  const pageType = 'singleNewBooks'
  const reqUrl = req.url
  const carousels = await makeCarouselsCached(pageType, reqUrl, next)
  const payload = {
    carousels
  }
  res.render('just-carousels-template', payload)
})

router.get('/', async (req, res, next) => {
  // nothing at the root right now, so just return an error page by default
  res.render('error-template')
})

module.exports = router
