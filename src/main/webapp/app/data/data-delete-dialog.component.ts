import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EntityService } from '../misc/model/entity.service';
import * as _ from 'lodash';
import { AlertService } from 'app/core/util/alert.service';

@Component({
  templateUrl: './data-delete-dialog.component.html',
})
export class DataDeleteDialogComponent {
  _ = _;
  model: any;
  apiEndpoint!: string;

  constructor(private entityService: EntityService, private activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string | number, apiEndpoint: string): void {
    this.entityService.delete(id, apiEndpoint).subscribe(() => {
      this.activeModal.close();
    });
  }
}
