import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  email: string;
  password: string;
  login: string = "success";

  constructor(private authService: AuthenticationService, private router: Router) {}

  onLogin() {
    console.log(this.email);
    console.log(this.password);
    this.authService.SignIn(this.email, this.password).then(() => {
      this.router.navigate(['/main'])
    }).catch(() => this.login = "fail");
  }

}
