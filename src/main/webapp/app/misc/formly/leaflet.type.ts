import { Component, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import * as L from 'leaflet';
import { FormControl } from '@angular/forms';

// Display a map using leaflet js
// templateOptions:
//    lat: 4.5693754
//    lng: 102.2656823
//    zoom: 6
//    geojson: /assets/geojson.json
@Component({
  selector: 'jhi-formly-leaftlet-type',
  template: `
    <div id="map" style="height: 600px; width: 1200px;"></div>
    <input type="hidden" [formControl]="formControl" />
  `,
})
export class LeafletTypeComponent extends FieldType implements AfterViewInit {
  formControl!: FormControl;
  map: any;
  geojson: any;
  info: any;
  marker: any;
  constructor(private httpClient: HttpClient) {
    super();
  }

  // Store the value in string when the form update
  ngAfterViewInit() {
    this.setupLeaflet();
    this.marker = L.marker([this.to.lat, this.to.lng]).addTo(this.map);
    console.log(this.marker.toGeoJSON());
    if (this.formControl.value) {
      this.marker.setLatLng(this.formControl.value);
    }
  }

  onMapClick(e: { latlng: any }) {
    // alert('You clicked the map at ' + e.latlng);
    // console.log('You clicked the map at ', e);
    this.formControl.setValue(e.latlng);
    console.log(this.marker.toGeoJSON());
    if (this.formControl.value) {
      this.marker.setLatLng(this.formControl.value);
    }
  }

  setupLeaflet() {
    this.map = L.map('map').setView([this.to.lat, this.to.lng], this.to.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
    this.map.on('click', (e: any) => this.onMapClick(e));

    // Add highlightFeature
    if (this.to.geojson) {
      // view-source:https://leafletjs.com/examples/map-panes/example.html
      this.map.createPane('labels');
      // This pane is above overlay but below shadow
      this.map.getPane('labels').style.zIndex = 450;

      // Layers in this pane are non-interactive and do not obscure mouse/touch events
      this.map.getPane('labels').style.pointerEvents = 'none';
      this.httpClient.get(this.to.geojson).subscribe((json: any) => {
        this.geojson = L.geoJSON(json, {
          style: {
            pane: this.map.getPane('labels'),
          },
          onEachFeature: (feature, layer) => {
            layer.on({
              mouseover: e => {
                const layer = e.target;
                layer.setStyle({
                  weight: 5,
                  color: '#666',
                  dashArray: '',
                  fillOpacity: 0.2,
                });

                if (!L.Browser.ie && !L.Browser.edge) {
                  layer.bringToFront();
                }
              },
              mouseout: e => {
                this.geojson.resetStyle(e.target);
                // info.update();
              },
              click: e => this.map.fitBounds(e.target.getBounds()),
            });
          },
        }).addTo(this.map);
      });
    }
  }
}
