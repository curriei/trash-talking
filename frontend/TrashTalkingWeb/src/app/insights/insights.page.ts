import { Component } from '@angular/core';
import { GarbageService } from '../crud-service2';
import { filter, map } from 'rxjs/operators';
import Friend from '../friend';

@Component({
  selector: 'app-home',
  templateUrl: 'insights.page.html',
  styleUrls: ['insights.page.scss'],
})
export class InsightsPage {
  entries: any = null;

  constructor(private crudService: GarbageService) {}

  ngOnInit() {
    this.crudService.getAllInsights().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.entries = data;
      console.log(this.entries)
    });
  }
 /*
  addFriend() {
    var new_friend = new Friend();
    new_friend.status = 1;
    new_friend.user1 = "sampleemail@gmail.com"
    new_friend.user2 = "testemail123@gmail.com"
    this.crudService.addFriend(new_friend);
  }
  searchUsers(){
    this.crudService.getAllUsers().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      var filteredData = [];
      for (var i = 0; i < data.length; i++) {
        if (data[i]["email"] == this.query){
          filteredData.push(data[i])
        }
      }
      this.entries = filteredData;
      console.log(this.entries);
      */
      /*
      var user = filteredData[0];
      this.email = user["email"];
      this.fname = user["First_name"];
      this.lname = user["Last_name"];
      this.date_joined = user["Date_Joined"];*/
      /*
    });
  }*/
}
