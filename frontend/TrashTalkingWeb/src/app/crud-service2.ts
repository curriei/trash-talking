import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import Garbage from './garbage';

@Injectable({
  providedIn: 'root'
})
export class GarbageService {

  private dbPath = '/data-entries';

  garbageRef: AngularFirestoreCollection<Garbage> = null;

  constructor(private db: AngularFirestore) {
    this.garbageRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<Garbage> {
    return this.garbageRef;
  }

  create(tutorial: Garbage): any {
    return this.garbageRef.add({ ...tutorial });
  }

  update(id: string, data: any): Promise<void> {
    return this.garbageRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.garbageRef.doc(id).delete();
  }
}