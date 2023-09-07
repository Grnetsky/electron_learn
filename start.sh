#!/bin/sh
mocker ./api.js --host localhost --port 8000 &
npm run start:dev