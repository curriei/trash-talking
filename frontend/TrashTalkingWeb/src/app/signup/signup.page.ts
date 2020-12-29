import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication-service';

@Component({
  selector: 'app-home',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignUpPage {
  email: string;
  password: string;
  fname: string;
  lname: string;

  constructor(private authService: AuthenticationService) {}

  onSignUp() {
    console.log(this.email);
    console.log(this.password);
    this.authService.RegisterUser(this.email, this.password, this.fname, this.lname, "November 23rd, 2020")
  }

}
