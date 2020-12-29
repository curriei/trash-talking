import { Component } from '@angular/core';
import { GarbageService } from '../crud-service2';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage {
  entries: any;
  email: string;
  fname: string;
  lname: string;
  date_joined: string;

  constructor(private crudService: GarbageService) {}

  ngOnInit() {
    this.crudService.getAllUsers().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      var user = data[0];
      this.email = user["email"];
      this.fname = user["First_name"];
      this.lname = user["Last_name"];
      this.date_joined = user["Date_Joined"];
    });
  }
}
