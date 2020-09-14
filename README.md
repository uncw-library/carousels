# Copied another project's readme to serve as a template


## New Titles

This repo builds an Express app.  Currently it is linked on the drupal7 mainsite frontpage, as well as on a freestanding kiosk.

The app returns an html pages with carousels of recently added books, videos, and music.


### To build a dev box

  - Make a file at "new-bento/.env" with contents:

```
SIERRA_USER=ActualUser
SIERRA_PASS=ActualPass
NODE_ENV=development
```

  - The actual User/Password can be found in the Rancher web interface:

    - External tab in titlebar
    - new-titles item in User Stacks
    - new-titles item in Stack
    - new-titles-new-titles-1 in the "Container" tab
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

  - `docker-compose exec bento npm run test`
  - (none yet)

#### To lint the dev box

  - `docker-compose exec bento npx eslint .`


### To build a prod box

```
docker login libapps-admin.uncw.edu:8000
docker build -t libapps-admin.uncw.edu:8000/randall-dev/new-titles .
docker push libapps-admin.uncw.edu:8000/randall-dev/new-titles
```
