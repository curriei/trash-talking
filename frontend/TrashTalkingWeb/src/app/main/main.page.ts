import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { GarbageService } from '../crud-service2';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as CanvasJS from '../canvasjs.min';
import Garbage from '../garbage';
import { ObjectUnsubscribedError } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss'],
})

export class MainPage {
  fillPercentage = 0;
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
  bin_id = null;
  bins: any = [];

  constructor(private router: Router, private menu: MenuController, private crudService: GarbageService) {}

  fetchBins() {
    var bins = [];
    this.crudService.getBins().subscribe(data => {
      Object.keys(data).forEach(function(key) {
        if (key=="num_bins") {
          var num_bins = data[key]
        }
        else {
          var count = 1;
          Object.keys(data[key]).forEach(function(currBin) {
            var bin = data[key][currBin];
            bin.name = "Bin " + String(count);
            bin.id = currBin;
            bins.push(bin);
            count+=1;
          });
        }
      });
    this.bins = bins;
    });
  };
  
  ngOnInit() {
    this.fetchBins();
  }
  
  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  fillTrash(percentage: any) {   
    percentage = (percentage < 0) ? 0 : (percentage > 1) ? 1 : percentage;
    console.log(percentage);
    document.getElementById("stop1").setAttribute("offset", percentage);
    document.getElementById("stop2").setAttribute("offset", percentage);
    console.log(document.getElementById("stop1").getAttribute("offset"));
  }

  onBinSelected(val: any) {
    console.log(val.id);
    this.bin_id = val.id

    this.crudService.getCurrentFill(this.bin_id).subscribe(data => {
      console.log("d", data);
      this.fillPercentage = Math.round(parseFloat(data.percent_fill) * 100) / 100;
      console.log("fp", this.fillPercentage);
    });
    console.log("t", typeof(this.fillPercentage))
    console.log("tn", typeof(0.86))
    this.fillTrash(this.fillPercentage);
    if (this.fillPercentage == 0.86) {
      console.log("equal");
    }
  }

  onStatSelected(val: any) {
    console.log(this.bins);
    if (val!="today") {
      this.legend = false; 
      this.showXAxisLabel = true;
      this.showYAxisLabel = true;
      this.xAxis = true;
      this.yAxis = true;
      this.xAxisLabel = "Total Garbage (lb)";
    }
    if (val=="week") {
      var today = new Date;
      var last_week = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);
      var ts = last_week.getTime()/1000; 
      var te = Date.now();
      console.log(ts, te);
      this.crudService.getGarbage(ts, te,"week", this.bin_id).subscribe(data => {
        console.log(data);
      })
      this.legendTitle = "Daily Statistics";
      this.results = [
        { name: "Mon", value: 1 },               
        { name: "Tues", value: 5 },
        { name: "Wed", value: 7 },
        { name: "Thur", value: 3 },
        { name: "Fri", value: 2 }
      ];
    }

    if (val=="month") {
      this.legendTitle = "Monthly Statistics";
    }

    if (val=="year") {
      this.legendTitle = "Yearly Statistics";
    }
  }
}


