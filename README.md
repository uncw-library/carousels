## Carousels

This repo builds an Express app.  Currently it is linked on the drupal7 mainsite frontpage, as well as on a freestanding kiosk.

The app returns an html pages with carousels of recently added books, videos, and music.

Endpoints:

https://carousels.libapps.uncw.edu/new-books
https://carousels.libapps.uncw.edu/new-titles
https://carousels.libapps.uncw.edu/popular-titles
https://carousels.libapps.uncw.edu/readbox
https://carousels.libapps.uncw.edu/uncw-authors

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
