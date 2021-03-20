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
    this.authService.SignIn(this.email, this.password).subscribe(data => {
      if (data.action == "Success"){
        localStorage.setItem('userid', data.user_id);
        localStorage.setItem('id_token', data.token);
        this.router.navigate(['/main']);
      } else {
        this.login = "failed"
      }
    })
  }
}
