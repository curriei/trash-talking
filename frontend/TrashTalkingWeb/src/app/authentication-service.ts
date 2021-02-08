import { Injectable, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Router } from "@angular/router";
import User from './user';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
/*
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  SignIn(email, password) {
    
    return this.ngFireAuth.signInWithEmailAndPassword(email,password)
    }
}
*/
export class AuthenticationService {
  userData: any;
  private dbPath = '/users';

  userRef: AngularFirestoreCollection<User> = null;

  constructor(
    private http: HttpClient,
    public ngFireAuth: AngularFireAuth,
    public router: Router,
    private db: AngularFirestore
  ) {
    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
    this.userRef = db.collection(this.dbPath);
  }

  // Login in with email/password
  SignIn(email, password) {
    /*
    this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/login/", JSON.stringify({"email": email, "password": password})).subscribe(data => {
      console.log(data)
    });*/
    return this.ngFireAuth.signInWithEmailAndPassword(email,password)
  }

  // Register user with email/password
  RegisterUser(email, password, fname, lname, date_joined) {
    var user = new User();
    user.Date_Joined = date_joined;
    user.email = email;
    user.First_name = fname;
    user.Last_name = lname;
    this.userRef.add({ ...user });
    return this.ngFireAuth.createUserWithEmailAndPassword(email, password)
  }

}
