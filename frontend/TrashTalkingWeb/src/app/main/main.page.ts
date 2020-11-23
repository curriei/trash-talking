import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { GarbageService } from '../crud-service2';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as CanvasJS from '../canvasjs.min';
import Garbage from '../garbage';

@Component({
  selector: 'app-home',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss'],
})
export class MainPage {
  entries: any;
  chartData: any = null;
  email: string;
  password: string;
  chartType: string = 'bar';
  saleData = [
    { name: "Mobiles", value: 105000 },
    { name: "Laptop", value: 55000 },
    { name: "AC", value: 15000 },
    { name: "Headset", value: 150000 },
    { name: "Fridge", value: 20000 }
  ];
  chartData2 = [
    {
      "name": "Nov 15-21",
      "series": [
        {
          "name": "Sunday",
          "value": 5
        },
        {
          "name": "Monday",
          "value": 10
        },
        {
          "name": "Tuesday",
          "value": 8
        },
        {
          "name": "Wednesday",
          "value": 17
        },
        {
          "name": "Thursday",
          "value": 12
        },
        {
          "name": "Friday",
          "value": 9
        },
        {
          "name": "Saturday",
          "value": 10
        }
      ]
    }]

  constructor(private router: Router, private menu: MenuController, private crudService: GarbageService) {}

  ngOnInit() {
    this.crudService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.entries = data;
      this.chartData = [
        {name: "January", value: this.entries[0]["total_garbage"]},
        {name: "February", value: this.entries[1]["total_garbage"]},
        {name: "March", value: this.entries[2]["total_garbage"]}
      ];
    });
  }
  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  onGetData() {
    console.log(this.entries);
  }
}
