const csv = require('csvtojson');
const hullJs = require('hull.js');
const axios = require('axios');
const fs = require('fs');
const config = require('../config');

//if updating the CSV of delivery addresses, run this file script with 'npm run convertzips' to re-match all zip codes with coordinates and write to a new json file

let countyGeojsons = [];

const getzipCodeCoordinates = (zipcodes) => {
  return (Promise.all(zipcodes.map(listing => {
    return (
      axios({
        method: 'get',
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${listing.zipcode}.json?country=US&access_token=${config.TOKEN}`
      })
    )})
  ).then(responseValues => {
    responseValues.forEach((response, i) => {
      let zipCodeGeojson = {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [[]]
          }
        }
      };
      if (response.data.features.length !== 0) {
        let coordinates = response.data.features[0].geometry.coordinates;
        //check to see if current county name matched previous ones; if so push to same geojson object; if not start a new one with new 'source' prop of updated county name
        if (i === 0 || zipcodes[i].name !== zipcodes[i-1].name) {
          countyGeojsons.push({source: zipcodes[i].name, geojson: zipCodeGeojson})
        }
        (countyGeojsons[countyGeojsons.length - 1].geojson).data.geometry.coordinates[0].push(coordinates);
      }
    });
  }).then(() => {
    countyGeojsons.forEach(county => {
      let unsorted = county.geojson.data.geometry.coordinates[0];
      let sorted = hullJs(unsorted, 20);
      county.geojson.data.geometry.coordinates.shift();
      county.geojson.data.geometry.coordinates.push(sorted);
    })
    fs.writeFile('./countyGeojsons.json',JSON.stringify(countyGeojsons), (err) => {
      if (err) {
        throw err;
      }
      console.log('County Geojson File has been saved!');
    });
  }))
}

csv()
.fromFile('./ZipCodes.csv')
.then((result => {
  return getzipCodeCoordinates(result);
}))
