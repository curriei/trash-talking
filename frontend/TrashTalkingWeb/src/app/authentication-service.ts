import { Injectable, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Router } from "@angular/router";
import User from './User';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userData: any;
  private dbPath = '/users';

  userRef: AngularFirestoreCollection<User> = null;

  constructor(
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