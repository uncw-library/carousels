# Copied another project's readme to serve as a template


## New Bento API server

This repo builds an API server at https://new-bento.libapps.uncw.edu/ used by https://library.uncw.edu/search_randall/

The app accepts POST requests with a searchTerm at:

 - https://new-bento.libapps.uncw.edu/books-ebooks
 - https://new-bento.libapps.uncw.edu/contentdm
 - https://new-bento.libapps.uncw.edu/databases
 - https://new-bento.libapps.uncw.edu/govdocs  
 - https://new-bento.libapps.uncw.edu/journals
 - https://new-bento.libapps.uncw.edu/newsmags
 - https://new-bento.libapps.uncw.edu/scholarly
 - https://new-bento.libapps.uncw.edu/videos-music

The app queries sierra, contentDM, libcat, and browzine for items matching the search term.

It returns a JSON of matches.

#### Example:

  POST a request from the command line with:
  
`curl --data "searchTerm=hi" "https://new-bento.libapps.uncw.edu/journals"`

or

`curl --data "searchTerm=hi" "http://localhost:8010/journals"`

### To build a dev box

  - Make a file at "new-bento/.env" with contents:

```
SIERRA_API_KEY=Password
BROWZINE_API_KEY=Password
SIERRA_API_KEY=Password	
BROWZINE_API_KEY=Password
OCLC__wskey=Password
SUMMON__api_id=Password
SUMMON__api_key=Password
NODE_ENV=development
```

  - The actual Passwords can be found in the Rancher web interface:

    - External tab in titlebar
    - new-bento item in User Stacks
    - bento item in Stack
    - new-bento-bento-1 in the "Container" tab
    - Environment row in the "Command" tab

#### Starting it

```
docker-compose down
docker-compose up --build
```

#### Interact with it

```
curl "http://localhost:8010/"
curl --data "searchTerm=hi" "http://localhost:8010/journals"
```

#### To run tests on dev box

  - `docker-compose exec bento npm run test`

#### To lint the dev box

  - `docker-compose exec bento npx eslint .`


### To build a prod box

```
docker login libapps-admin.uncw.edu:8000
docker build -t libapps-admin.uncw.edu:8000/randall-dev/new-bento .
docker push libapps-admin.uncw.edu:8000/randall-dev/new-bento
```
