import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { InsightsPage } from './insights.page';
import { InsightsPageRoutingModule } from './insights-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsightsPageRoutingModule
  ],
  declarations: [InsightsPage]
})
export class InsightsPageModule {}
