const express = require('express');
const helpers = require('../helpers/formatActualCustomers.js');
const zipCodeGeojsons = require('../countyGeojsons.json');
let app = express();
let port = 3000;

app.use(express.json());
app.use(express.static(__dirname + '/../public/dist'))

app.get('/api/geojson', (req, res) => {
  let geojsonData = helpers.convertToGeojson();
  geojsonData.then(() => {
    console.log(`[SERVER]: COMPLETED CONVERSION + FORMATTING OF ${helpers.geojson.features.length} CUSTOMERS`);
    res.send(helpers.geojson);
  })
})

app.get('/api/zipcodes', (req, res) => {
  console.log(`[SERVER]: SENDING ZIP CODE COORDINATES`);
  res.send(zipCodeGeojsons);
})

app.listen(port, () => console.log(`App is listening on port ${port}`));
