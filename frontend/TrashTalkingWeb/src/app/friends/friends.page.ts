import { Component } from '@angular/core';
import { GarbageService } from '../crud-service2';
import { filter, map } from 'rxjs/operators';
import Friend from '../friend';

@Component({
  selector: 'app-home',
  templateUrl: 'friends.page.html',
  styleUrls: ['friends.page.scss'],
})
export class FriendsPage {
  entries: any = null;
  current: any = null;

  constructor(private crudService: GarbageService) {}

  ngOnInit() {
    this.crudService.getAllFriends().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      var filteredData = [];
      var filteredData2 = [];
      for (var i = 0; i < data.length; i++){
        if (data[i]["user2"] == "fakeemail123@gmail.com" && data[i]["status"] == 1){
          filteredData.push(data[i]);
        }
        if (data[i]["user2"] == "fakeemail123@gmail.com" && data[i]["status"] == 2){
          filteredData2.push(data[i]);
        }
      }
      this.entries = filteredData;
      this.current = filteredData2
    });
  }

  confirmFriend(entry: any) {
    entry.status = 2;
    this.crudService.updateFriend(entry.id, entry).then(res => console.log("It worked!")).catch(error => console.log("It didn't work"));
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
