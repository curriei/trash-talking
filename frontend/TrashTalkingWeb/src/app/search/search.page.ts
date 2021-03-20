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
  users: any = null;
  entries: any;
  email: string;
  fname: string;
  lname: string;
  query: string;
  sent = false;
  date_joined: string;

  constructor(private crudService: GarbageService) {}

  ngOnInit() {}

  addFriend(userid) {
    this.crudService.sendFriendRequest(userid).subscribe(data => {
      console.log(data);
    });
  }
  searchUsers(){
    this.crudService.searchUsers(this.query).subscribe(data => {
      var users_list = [];
      Object.keys(data).forEach(function(key) {
        var user = data[key];
        user.userid = key;
        users_list.push(user);
     });
    this.users = users_list;
    });
    /*
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
    });*/
  }
}
