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
  fillPercentage = .3;
  results = null; 
  xAxisLabel = null;
  legendTitle = null; 
  yAxisLabel = null;
  legend = false; 
  showXAxisLabel = false;
  showYAxisLabel = false;
  xAxis = false;
  yAxis = false;
  gradient = false;

  constructor(private router: Router, private menu: MenuController, private crudService: GarbageService) {}

  ngOnInit() {
    //This is calling the bins endpoint
    /*
    this.crudService.getBins().subscribe(data => {
      console.log(data);
    });*/
  }
  /*
  

  ngOnInit() {
    console.log(this.crudService.getAll().snapshotChanges());
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
  */

  fillTrash(percentage: any) {   //change to be 0-100
    percentage = (percentage < 0) ? 0 : (percentage > 1) ? 1 : percentage;
    document.getElementById("stop1").setAttribute("offset", percentage);
    document.getElementById("stop2").setAttribute("offset", percentage);
    console.log(document.getElementById("stop1").getAttribute("offset"));
  }

  onStatSelected(val: any) {
    if (val!="today") {
      this.legend = false; 
      this.showXAxisLabel = true;
      this.showYAxisLabel = true;
      this.xAxis = true;
      this.yAxis = true;
      this.xAxisLabel = "Total Garbage (lb)";
    }
    if (val=="day") {
      this.legendTitle = "Daily Statistics";
      this.results = [
        { name: "Mon", value: 1 },               // how do we do this
        { name: "Tues", value: 5 },
        { name: "Wed", value: 7 },
        { name: "Thur", value: 3 },
        { name: "Fri", value: 2 }
      ];
    }

    if (val=="week") {
      this.legendTitle = "Weekly Statistics";
    }

    if (val=="month") {
      this.legendTitle = "Monthly Statistics";
    }

    if (val=="today") {
      this.fillTrash(this.fillPercentage);
    }
  }
}


