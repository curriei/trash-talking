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
  importance: string;
  target: string;
  category: string;
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
    this.crudservice.getGoals().subscribe(data => {
      var goal_list = [];
      Object.keys(data["goals"]).forEach(function(key) {
          var goal = data["goals"][key];
          goal_list.push(goal);
       });
      this.goals = goal_list;
    });
    /*
    this.crudservice.getAllGoals().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.goals = [];
      for (var i =0; i < data.length; i++){
        if (data[i]["user_id"] == "0"){
          this.goals.push(data[i]);
        }
      }
      console.log(this.goals);
    });*/

  }
  
  onAddGoal() {
    var militime = new Date(this.duedate).getTime();
    this.crudservice.createGoal(militime, this.importance, this.target, this.category).subscribe(data => {
      console.log(data);
    });
    /*
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
      this.goals = [];
      for (var i =0; i < data.length; i++){
        if (data[i]["user_id"] == "0"){
          this.goals.push(data[i]);
        }
      }
      console.log(this.goals);
    });
    */
  }
}
