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
    this.crudService.getProfile().subscribe(data => {
      this.email = data.email;
      this.fname = data.first_name;
      this.lname = data.last_name;
      var date_joined = new Date(data.joined);
      this.date_joined = date_joined.toDateString();
    });
    /*
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
    });*/

  }
}

/*
try {
          data.user_id;
          this.router.navigate(['/home']);
        } catch(error) {
          this.status = 'failed';
      }
    }
    */