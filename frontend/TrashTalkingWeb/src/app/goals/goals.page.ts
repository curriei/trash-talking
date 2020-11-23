import { Component } from '@angular/core';
import { GarbageService } from '../crud-service2';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'goals.page.html',
  styleUrls: ['goals.page.scss'],
})
export class GoalsPage {
  goals: any = null;
  desc: string;
  duedate: any;
  month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  constructor(private crudservice: GarbageService) {}

  ngOnInit() {
    this.crudservice.getAllGoals().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.goals = data;
    });
  }

  onAddGoal() {
    var newdate = new Date(this.duedate);
    var fulldate = this.month[newdate.getMonth()] + " " + newdate.getDate() + ", " + newdate.getFullYear();
    this.crudservice.createGoal("0", this.desc, fulldate);
    this.crudservice.getAllGoals().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.goals = data;
    });
  }
}
