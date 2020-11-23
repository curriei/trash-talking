import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GoalsPage } from './goals.page';
import { GoalsPageRoutingModule } from './goals-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoalsPageRoutingModule
  ],
  declarations: [GoalsPage]
})
export class GoalsPageModule {}
