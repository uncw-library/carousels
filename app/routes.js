const express = require('express')

const router = express.Router()
const { makeCarouselsCached } = require('./carousels')

router.get('/demopage', async (req, res, next) => {
  const pageType = 'demopage'
  const reqUrl = req.url
  const carousels = await makeCarouselsCached(pageType, reqUrl, next)
  const payload = {
    carousels
  }
  res.render('demo-page-template', payload)
})

router.get('/demojson', async (req, res, next) => {
  const pageType = 'demojson'
  const reqUrl = req.url
  const carousels = await makeCarouselsCached(pageType, reqUrl, next)
  const payload = {
    something: "Here's something generic",
    carousels
  }
  res.json(payload)
})

router.get('/new-books', async (req, res, next) => {
  const pageType = 'singleNewBooks'
  const reqUrl = req.url
  const carousels = await makeCarouselsCached(pageType, reqUrl, next)
  const payload = {
    carousels
  }
  res.render('no-modal-template', payload)
})

router.get('/new-books-json', async (req, res, next) => {
  const pageType = 'singleNewBooks'
  const reqUrl = req.url
  const carousels = await makeCarouselsCached(pageType, reqUrl, next)
  const payload = {
    carousels
  }
  res.json(payload)
})

router.get('/new-titles', async (req, res, next) => {
  const pageType = 'newTitles'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.render('just-carousels-template', payload)
})

router.get('/new-titles-json', async (req, res, next) => {
  const pageType = 'newTitles'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.json(payload)
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

router.get('/popular-titles-json', async (req, res, next) => {
  const pageType = 'popularTitles'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.json(payload)
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

router.get('/touchkiosk', async (req, res, next) => {
  const pageType = 'newTitles'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.render('touchkiosk-template', payload)
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

router.get('/uncw-authors-json', async (req, res, next) => {
  const pageType = 'uncwAuthors'
  const reqURL = req.url
  const carousels = await makeCarouselsCached(pageType, reqURL, next)
  const payload = {
    carousels
  }
  res.json(payload)
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

router.get('/', async (req, res, next) => {
  // app root is just a placeholder, not used by anything
  res.render('approot-template')
})

module.exports = router
