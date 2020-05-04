const csv = require('csvtojson');
const axios = require('axios');
const fs = require('fs');
const config = require('../config');
let geojson = {
  type: 'FeatureCollection', 
  features: [],
};

/* ***********Customers/Address Helpers**************** */

const fillFeatureCollection = (coordinatesArray) => {
  geojson.features = [];
  coordinatesArray.forEach(customer => {
    geojson.features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: customer.coordinates,
      },
      properties: {
        title: customer.customerName,
        description: customer.address,
      }
    })
  })
}

const getCoordinates = (addressArray) => {
  let addressCoordinates = [];
  return (Promise.all(addressArray.map(address => {
    //address is an object with props ship_street, ship_city, ship_state, ship_postal code
    let addressStr = `${address.ship_street} ${address.ship_city} ${address.ship_state} ${address.ship_postcode}`;
    let addressQuery = addressStr.split(' ').join('%20');
    //get request returns feature collection obj that has a features prop array
    //each feature has geometry prop which has coordinates prop which will have array of coords
    return (
      axios({
        method: 'get',
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${addressQuery}.json?country=US&access_token=${config.TOKEN}`
      })
    )})
  ).then(responseValues => {
    responseValues.forEach((response, i) => {
      //an array of the long and lat
      let coordinates = response.data.features[0].geometry.coordinates;
      let fullAddress = `${addressArray[i]['ship_street']}, ${addressArray[i]['ship_city']}, ${addressArray[i]['ship_state']} ${addressArray[i]['ship_postcode']}`
      addressCoordinates.push({
        customerName: addressArray[i]['Actual Customers'],
        address: fullAddress,
        coordinates
      });
    })
    fillFeatureCollection(addressCoordinates);
  }))
}

const convertToGeojson = () => {
  return (
    csv() 
    .fromFile('./DeliveryCustomers.csv')
    .then((result => {
      if (result.length > geojson.features.length || result.length < geojson.features.length) {
        console.log('GETTING COORDINATES OF CUSTOMERS...')
        return getCoordinates(result);
      } else {
        return;
      }
    }))
  )
}

module.exports.convertToGeojson = convertToGeojson;
module.exports.geojson = geojson;