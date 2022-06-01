## Carousels

This repo builds an Express app.  Currently it is linked on the drupal7 mainsite frontpage, as well as on a freestanding kiosk.
The kiosks are \~1080x1897px.


The app returns html or json; with carousels of recently added books, videos, and music.

The app caches book images at app/public/itemImages/\*.jpeg.  `docker build` will build an image without this cache of images.  (good thing)  However, `docker-compose up` will build a dev box with this cache of images.  (not good)  So, when you want an empty-cache dev box, you must delete the \*.jpeg files from public/itemImages.  Sorry for the complication.

HTML endpoints:

    https://carousels.libapps.uncw.edu/new-books (new, hoping to use on d7mainsite books page)
    https://carousels.libapps.uncw.edu/new-titles  (was new-titles)
    https://carousels.libapps.uncw.edu/popular-titles (was widgets, used on d7mainsite home page)
    https://carousels.libapps.uncw.edu/readbox (was readbox)
    https://carousels.libapps.uncw.edu/uncw-authors (new, for uncw-authors page)

JSON endpoints:

    https://carousels.libapps.uncw.edu/new-books-json
    https://carousels.libapps.uncw.edu/new-titles-json
    https://carousels.libapps.uncw.edu/popular-titles-json
    https://carousels.libapps.uncw.edu/uncw-authors-json

Merges these app (obsoletes them): new-titles, readbox, widgets, uncw-authors


### To build a dev box

  - Make a file at "./carousels/.env" with contents:

```
SIERRA_USER={{your sierra username}}
SIERRA_PASS={{your sierra password}}
NODE_ENV=development
```

  - If you do not have a Sierra user/pass, Jason can give you one.

#### Starting it

```
docker-compose down
docker-compose up --build
```

#### Restart it with cache cleared

```
docker-compose down
# delete the jpeg files in app/public/itemImages/  (keep the .gitignore file there)
docker-compose up --build
```

#### Interact with it

```
"http://localhost:3000"
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
docker build --no-cache --platform linux/x86_64/v8 -t libapps-admin.uncw.edu:8000/randall-dev/carousels .
docker push libapps-admin.uncw.edu:8000/randall-dev/carousels
```


### To add new pages with new carousels

There are two example endpoints.  /demopage and /demojson

One example renders an html page and the other a json file.  

Tracing the logic from:
  
    routes.js--> carousels.js--> queries.js------------------->-| 
    views/demo-page-template.hbs <--routes.js <--carousel.js <--|  
 
Each step along the way is modular. For example:

    In routes.js, /demopage endpoing is set as a 'demopage' type, & also as demo-page-template.hbs template.
    In carousels.js, makeCarousels(), 'demopage' type is set to have rows ['someData', 'popDVDs'].
    In carousels.js, makeOneCarousel(), 'someData' row is set to query sierra.getSomeData().
    In sierra.js, getSomeData() is set to some sql query.
   
    That's the skeleton of the app.
