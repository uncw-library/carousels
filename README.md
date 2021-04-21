## Carousels

This repo builds an Express app.  Currently it is linked on the drupal7 mainsite frontpage, as well as on a freestanding kiosk.

The app returns an html pages with carousels of recently added books, videos, and music.

Endpoints:

    https://carousels.libapps.uncw.edu/new-books (new, hoping to use on d7mainsite books page)
    https://carousels.libapps.uncw.edu/new-titles  (was new-titles)
    https://carousels.libapps.uncw.edu/popular-titles (was widgets, used on d7mainsite home page)
    https://carousels.libapps.uncw.edu/readbox (was readbox)
    https://carousels.libapps.uncw.edu/uncw-authors (new, for uncw-authors page)

Merges these app (obsoletes them): new-titles, readbox, widgets, uncw-authors


### To build a dev box

  - Make a file at "new-title/.env" with contents:

```
SIERRA_USER=ActualUser
SIERRA_PASS=ActualPass
NODE_ENV=development
```

  - The actual User/Password can be found in the Rancher web interface:

    - External tab in titlebar
    - carousels item in User Stacks
    - carousels item in Stack
    - carousels-carousels-1 in the "Container" tab
    - "Command" tab, Environment row

#### Starting it

```
docker-compose down
docker-compose up --build
```

#### Interact with it

```
"http://localhost:8009/"
```

#### To run tests on dev box

  - `npm install --only=dev`
  - `npm run test`
  - (none yet)

#### To lint the dev box

  - `npm install --only=dev`
  - `npx eslint app/`

### To build a prod box

```
docker login libapps-admin.uncw.edu:8000
docker build --no-cache -t libapps-admin.uncw.edu:8000/randall-dev/carousels .
docker push libapps-admin.uncw.edu:8000/randall-dev/carousels
```


### To add new pages with new carousels

There are two example endoints.  /demopage and /demojson .  Like their names, one renders an html page and the other a json file.  Tracing the logic from:
  
routes.js -> carousels.js -> queries.js -> carousel.js -> routes.js -> views/demo-page-template.hbs

Each step along the way is modular. For example:

    In routes.js, /demopage endpoing is set as a 'demopage' type, & also as demo-page-template.hbs template.
    In carousels.js, makeCarousels(), 'demopage' type is set to have rows ['someData', 'popDVDs'].
    In carousels.js, makeOneCarousel(), 'someData' row is set to query sierra.getSomeData().
    In sierra.js, getSomeData() is set to some sql query.
   
    That's the skeleton of the app.
