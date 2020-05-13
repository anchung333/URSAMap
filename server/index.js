const express = require('express');
const helpers = require('../helpers/formatActualCustomers.js');
const fs = require('fs');
const {google} = require('googleapis');
const config = require('../config');
const zipCodeGeojsons = require('../countyGeojsons.json');
const expressStaticGzip = require('express-static-gzip');
let app = express();
let port = 3000;

app.use(express.json());
// app.use(express.static(__dirname + '/../public/dist'));
app.use('/', expressStaticGzip(__dirname + '/../public/dist'));

app.get('/api/geojson', (req, res) => {
  let geojsonData = helpers.convertToGeojson();
  geojsonData.then(() => {
    console.log(`[SERVER]: COMPLETED CONVERSION + FORMATTING OF ${helpers.geojson.features.length} CUSTOMERS`);
    res.send(helpers.geojson);
  })
})

app.get('/api/zipcodes', (req, res) => {
  console.log('[SERVER]: SENDING ZIP CODE COORDINATES');
  res.send(zipCodeGeojsons);
})

app.get('/api/sheets', (req, res) => {
  const sheets = google.sheets({version: 'v4', auth: config.API_KEY});
  sheets.spreadsheets.values.get({
    spreadsheetId: '12WJ-94lRAxMiVaVAWZIibnkHJAIA6eXUtBWjklxCfn0',
    range: 'Sheet1!B2:B',
  }).then((response) => {
    console.log('[SERVER]: SENDING SPREADSHEET RESULTS');
    res.send(response.data)
  })
})

app.listen(port, () => console.log(`App is listening on port ${port}`));
