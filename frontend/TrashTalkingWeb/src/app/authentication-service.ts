import { Injectable, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Router } from "@angular/router";
import User from './user';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { isNull } from '@angular/compiler/src/output/output_ast';
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
    var body = {"email": email, "password": password};
    return this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/login/", body);
  }

  // Register user with email/password
  RegisterUser(userid, email, password, fname, lname) {
    var body = {"user_id": userid, "email": email, "password": password, "first_name": fname, "last_name": lname};
    console.log(body);
    return this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/new/", body);
    /*
    var user = new User();
    user.Date_Joined = date_joined;
    user.email = email;
    user.First_name = fname;
    user.Last_name = lname;
    this.userRef.add({ ...user });
    return this.ngFireAuth.createUserWithEmailAndPassword(email, password)*/
  }

}
