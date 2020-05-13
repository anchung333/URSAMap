import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import {TOKEN} from '../../config';
import ZipCheck from './zipCodeCheck.jsx';

mapboxgl.accessToken = TOKEN;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -121.2908,
      lat: 37.9577,
      zoom: 6,
    }
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
    container: this.mapContainer,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [this.state.lng, this.state.lat],
    zoom: this.state.zoom
    });
    let m1 = document.createElement('div');
    m1.className = 'marker';

    //get geojson data
    fetch('/api/geojson')
    .then(res => res.json())
    .then(data => {
      this.createMarkers(map, data);
    }).then(() => {
      fetch('/api/zipcodes')
      .then(res => res.json())
      .then(data => {
        data.forEach(county => {
          this.createFillPolygon(map, county.source, county.geojson);
        })
      })
    })
  }

  createMarkers(map, jsonData) {
    jsonData.features.forEach(marker => {
      // for custom icons. if you want custom icons, uncomment below and pass in 'el' into new mapboxgl.Marker(el) like so
      // let el = document.createElement('div');
      // el.className = 'marker';
    
      new mapboxgl.Marker()
        .setLngLat(marker.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
        .addTo(map);
    })
  }

  createFillPolygon(map, source, geojson) {
    map.addSource(source, geojson);
    map.addLayer({
      'id': source,
      'type': 'fill',
      'source': source,
      'layout': {},
      'paint': {
        'fill-color': '#088',
        'fill-opacity': 0.3,
      }
      });
  }

  render() {
    return (
      <div>
        <div ref={el => this.mapContainer = el} className="mapContainer" />
        <ZipCheck />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('map'));