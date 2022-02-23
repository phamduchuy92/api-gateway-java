import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MiscModule } from 'app/misc/misc.module';
import { DataComponent } from './data.component';
import { DataDetailComponent } from './data-detail.component';
import { DataUpdateComponent } from './data-update.component';
import { DataDeleteDialogComponent } from './data-delete-dialog.component';
import { DATA_ROUTES } from './data.route';

@NgModule({
  imports: [MiscModule, RouterModule.forChild(DATA_ROUTES)],
  declarations: [DataComponent, DataDetailComponent, DataUpdateComponent, DataDeleteDialogComponent],
  entryComponents: [DataComponent],
})
export class DataModule {}
