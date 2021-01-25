import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import Garbage from './garbage';
import User from './user';
import Goal from './goal';

@Injectable({
  providedIn: 'root'
})
export class GarbageService {

  private dbPath = '/data-entries-old';
  private dbPath2 = '/users';
  private dbpath3 = '/goals'

  garbageRef: AngularFirestoreCollection<Garbage> = null;
  userRef: AngularFirestoreCollection<User> = null
  goalsRef: AngularFirestoreCollection<Goal> = null;

  constructor(private db: AngularFirestore) {
    this.garbageRef = db.collection(this.dbPath);
    this.userRef = db.collection(this.dbPath2);
    this.goalsRef = db.collection(this.dbpath3);
  }

  getAll(): AngularFirestoreCollection<Garbage> {
    console.log(this.garbageRef);
    return this.garbageRef;
  }

  getAllUsers(): AngularFirestoreCollection<User> {
    return this.userRef;
  }

  getAllGoals(): AngularFirestoreCollection<Goal> {
    return this.goalsRef;
  }

  create(tutorial: Garbage): any {
    return this.garbageRef.add({ ...tutorial });
  }

  createGoal(userid, desc, date): any {
    var goal = new Goal();
    goal.user_id = userid;
    goal.goal = desc;
    goal.date = date;
    return this.goalsRef.add({ ...goal });
  }

  update(id: string, data: any): Promise<void> {
    return this.garbageRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.garbageRef.doc(id).delete();
  }
}