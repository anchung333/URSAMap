import React from 'react';

class ZipCheck extends React.Component {
  constructor(props) {
    super(props);
    this.matchZips = this.matchZips.bind(this);
  }

  matchZips() {
    const zipcode = document.getElementById('zipcode');
    const showZip = document.getElementById('ziphere');
    fetch('/api/sheets')
    .then(res => res.json())
    .then(range => {
      console.log(range);
      if (range.values.length > 0) {
        for (let i = 0; i < range.values.length; i++) {
          var entry = range.values[i][0];
          if (zipcode.value === entry) {
            showZip.innerHTML = 'Nice! We deliver to ' + zipcode.value;
            return;
          }
          if (i === range.values.length - 1 && zipcode.value !== entry) {
            showZip.innerHTML = 'Sorry, we don\'t deliver there yet';
          }
        }
      } else {
        showZip.innerHTML = 'Error getting response from Sheets API';
      }
    }, (error) => {
      showZip.innerHTML = 'Error: ' + error;
    });
  }

  render() {
    return (
      <div className= "zipCheckContainer">
        <input type="text" id="zipcode" size="8"/>
        <button id="submitbutton" onClick={this.matchZips}>Do you guys deliver to me?</button><p id="ziphere"></p>
      </div>
    )
  }
}

export default ZipCheck;