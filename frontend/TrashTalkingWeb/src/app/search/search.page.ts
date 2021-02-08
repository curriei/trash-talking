import { Component } from '@angular/core';
import { GarbageService } from '../crud-service2';
import { filter, map } from 'rxjs/operators';
import Friend from '../friend';

@Component({
  selector: 'app-home',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
})
export class SearchPage {
  entries: any;
  email: string;
  fname: string;
  lname: string;
  query: string;
  sent = false;
  date_joined: string;

  constructor(private crudService: GarbageService) {}

  ngOnInit() {}

  addFriend() {
    this.sent = true;
    var new_friend = new Friend();
    new_friend.status = 1;
    new_friend.user1 = "sampleemail@gmail.com";
    new_friend.user1_fname = "Alexie";
    new_friend.user1_lname = "McDonald";
    new_friend.user2 = "fakeemail123@gmail.com";
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
      /*
      var user = filteredData[0];
      this.email = user["email"];
      this.fname = user["First_name"];
      this.lname = user["Last_name"];
      this.date_joined = user["Date_Joined"];*/
    });
  }
}
