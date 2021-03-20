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
  requests: any = null;
  friends: any = null;
  entries: any = null;
  current: any = null;

  constructor(private crudService: GarbageService) {}

  fetchInfo() {
    this.crudService.getIncomingFriendRequests().subscribe(data => {
      var request_list = [];
      Object.keys(data).forEach(function(key) {
        var request = data[key];
        request.request_id = key;
        request.request_time = new Date(request.request_time);
        request_list.push(request);
     });
    this.requests = request_list;
    });
    this.crudService.getFriends().subscribe(data => {
      var friends_list = [];
      Object.keys(data).forEach(function(key) {
        var friend = data[key];
        friend.request_id = key;
        friend.friends_since = new Date(friend.friends_since);
        friends_list.push(friend);
     });
    this.friends = friends_list;
    });
  }
  ngOnInit() {
    this.fetchInfo();
  }

  confirmFriend(request_id) {
    this.crudService.acceptFriendRequest(request_id).subscribe(data => {
      console.log(data);
    });
    this.fetchInfo();
  }
  
  denyFriend(request_id){
    this.crudService.denyFriendRequest(request_id).subscribe(data => {
      console.log(data);
    });
    this.fetchInfo();
  }
}
