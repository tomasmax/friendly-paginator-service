# Friendly paginator
## Problem

There's this legacy API that contains info gathered across decades of existence.

The problem is that this specific endpoint returns millions of items, paginated at 100 per page.

The idea is to build a frontend for this legacy API that will allow a user defined value for the number of items per page.

Info about the legacy API:

- The legacy API is at http://sf-legacy-api.now.sh
- A simple `GET /items` will return the first 100 items.
- To go to a specific page you use `GET /items?page=20` for instance.

## Solution

[Demo](https://friendly-paginator-service.herokuapp.com/api/v1/items?page=1&perPage=40)

NodeJS service to gather data from an old endpoint and provide it in a more configurable pagination way

I added a basic in memory cache to cache legacy pagination responses and improve performance.

 **Rest API endpoints:**
 [Deployed base url](https://friendly-paginator-service.herokuapp.com)

 ```
 GET   /api/v1/items?page=1&perPage=100
  Gets items with page and perPage query params, default {page: 1, perPage: 100} max perPage: 200
 ```

**To run it locally:**
  - Install dependencies `npm install`
  - Run without watching `npm run start`
  - Run for dev (watches for any files changes) `npm run start:dev`

**To run tests**
  - After dependencies are installed
  - Run test `npm run test`
  - Run test watching for changes `npm run test:watch`
