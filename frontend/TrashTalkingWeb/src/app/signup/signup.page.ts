import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignUpPage {
  email: string;
  uname: string;
  password: string;
  fname: string;
  lname: string;
  status: string = 'success';

  constructor(private authService: AuthenticationService, private router: Router) {}

  onSignUp() {
    console.log(this.email);
    console.log(this.password);
    this.authService.RegisterUser(this.uname, this.email, this.password, this.fname, this.lname).subscribe(data => {
      if (data.action == "Success"){
        this.router.navigate(['/home'])
      } else {
        this.status = "failed"
      }
    })
  }

}
