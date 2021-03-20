import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import Garbage from './garbage';
import User from './user';
import Goal from './goal';
import Friend from './friend';
import Insight from './insights';
import { R3TargetBinder } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class GarbageService {

  private dbPath = '/data-entries-old';
  private dbPath2 = '/users';
  private dbpath3 = '/goals'
  private dbpath4 = '/friendships';
  private dbpath5 = '/insights';

  garbageRef: AngularFirestoreCollection<Garbage> = null;
  userRef: AngularFirestoreCollection<User> = null
  goalsRef: AngularFirestoreCollection<Goal> = null;
  friendsRef: AngularFirestoreCollection<Friend> = null;
  insightsRef: AngularFirestoreCollection<Insight> = null;

  constructor(private db: AngularFirestore, private http: HttpClient) {
    this.garbageRef = db.collection(this.dbPath);
    this.userRef = db.collection(this.dbPath2);
    this.goalsRef = db.collection(this.dbpath3);
    this.friendsRef = db.collection(this.dbpath4);
    this.insightsRef = db.collection(this.dbpath5);
  }

  addFriend(friend: Friend): any {
    return this.friendsRef.add({ ...friend })
  }

  sendFriendRequest(userid) {
    var token = localStorage.getItem('id_token');
    var body = {'user': userid}
    var headers = {'token': token}
    return this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/friends/request ", body, { headers });
  }

  getIncomingFriendRequests() {
    var token = localStorage.getItem('id_token');
    var headers = {'token': token};
    return this.http.get<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/friends/requests ", { headers });
  }

  acceptFriendRequest(request_id){
    var token = localStorage.getItem('id_token');
    var headers = {'token': token};
    var body = {'request_id': request_id};
    return this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/friends/accept ", body, { headers });
  }

  denyFriendRequest(request_id){
    var token = localStorage.getItem('id_token');
    var headers = {'token': token};
    var body = {'request_id': request_id};
    return this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/friends/deny ", body, { headers });
  }

  getInsights() {
    var token = localStorage.getItem('id_token');
    var headers = {'token': token};
    return this.http.get<any>("https://trash-talking-mksvgldida-uc.a.run.app/goals/insights ", { headers });
  }

  getFriends(){
    var token = localStorage.getItem('id_token');
    var headers = {'token': token};
    return this.http.get<any>("https://trash-talking-mksvgldida-uc.a.run.app/users/friends ", { headers });
  }

  getAllInsights(): AngularFirestoreCollection<Insight> {
    return this.insightsRef;
  }

  getAllFriends(): AngularFirestoreCollection<Friend> {
    return this.friendsRef;
  }

  getUser(id: string): any {
    return this.userRef.doc()
  }

  getProfile(): any {
    var userid = localStorage.getItem('userid');
    var token = localStorage.getItem('id_token');
    var url = "https://trash-talking-mksvgldida-uc.a.run.app/users/profile/?user_id=" + userid;
    console.log(userid);
    console.log(token);
    const headers = {'token': token };
    return this.http.get<any>(url, { headers })
  }

  getBins(): any {
    var token = localStorage.getItem('id_token');
    var url = "https://trash-talking-mksvgldida-uc.a.run.app/users/bins/";
    console.log(token);
    const headers = {'token': token };
    return this.http.get<any>(url, { headers })
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

  createGoal(time_due, importance, target, category){
    var token = localStorage.getItem('id_token');
    let headers = {"token": token};
    var body = {"time_due": time_due, "importance": importance, "target": target, "category": category};
    console.log(headers);
    console.log(body);
    return this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/goals/new", body, { headers });
  }

  getGoals(): any {
    var token = localStorage.getItem('id_token');
    var url = "https://trash-talking-mksvgldida-uc.a.run.app/goals/"
    const headers = {'token': token };
    return this.http.get<any>(url, { headers });
  }

  /*
  createGoal(userid, desc, date): any {
    var goal = new Goal();
    goal.user_id = userid;
    goal.goal = desc;
    goal.date = date;
    return this.goalsRef.add({ ...goal });
  }*/

  searchUsers(query){
    var token = localStorage.getItem('id_token');
    var url = "https://trash-talking-mksvgldida-uc.a.run.app/users/search?query=" + query;
    const headers = {'token': token };
    return this.http.get<any>(url, { headers });
  }

  update(id: string, data: any): Promise<void> {
    return this.garbageRef.doc(id).update(data);
  }

  updateFriend(id: string, data: any): Promise<void> {
    return this.friendsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.garbageRef.doc(id).delete();
  }

  registerBin(bin_id: string){
    var token = localStorage.getItem('id_token');
    let headers = {"token": token};
    var body = {"bin_id": bin_id};
    console.log(headers);
    console.log(body);
    return this.http.post<any>("https://trash-talking-mksvgldida-uc.a.run.app/bins/register", body, { headers });
  }
}