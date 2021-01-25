import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FriendsPage } from './friends.page';
import { FriendsPageRoutingModule } from './friends-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FriendsPageRoutingModule
  ],
  declarations: [FriendsPage]
})
export class FriendsPageModule {}
