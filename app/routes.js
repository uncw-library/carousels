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

router.get('/readbox*', async (req, res, next) => {
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

  const {
    rows,
    location,
    showFindIt,
    noPop
  } = await controller.doReadboxPage(req, res, next)

  res.render('readbox', {
    rows,
    location,
    showFindIt,
    noPop,
    locations
  })
})

module.exports = router
