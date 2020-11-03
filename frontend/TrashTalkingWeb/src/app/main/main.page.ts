import { Component } from '@angular/core';
import { GarbageService } from '../crud-service2';
import { map } from 'rxjs/operators';
import * as CanvasJS from '../canvasjs.min';
import Garbage from '../garbage';

@Component({
  selector: 'app-home',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss'],
})
export class MainPage {
  entries: any;
  email: string;
  password: string;

  constructor(private crudService: GarbageService) {}

  ngOnInit() {
    this.crudService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.entries = data;
      let chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        exportEnabled: true,
        title: {
          text: "Garbage Usage for Jan-March"
        },
        data: [{
          type: "column",
          dataPoints: [
            { y: this.entries[0]["total_garbage"], label: "January" },
            { y: this.entries[1]["total_garbage"], label: "February" },
            { y: this.entries[2]["total_garbage"], label: "March" }
          ]
        }]
      });
      chart.render();
    });
  }

  onGetData() {
    console.log(this.entries);
  }
}
