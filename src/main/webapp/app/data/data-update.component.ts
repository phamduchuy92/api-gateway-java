import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { EntityService } from '../misc/model/entity.service';
import * as _ from 'lodash';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { DEBUG_INFO_ENABLED } from 'app/app.constants';

@Component({
  selector: 'jhi-data-update',
  templateUrl: './data-update.component.html',
})
export class DataUpdateComponent implements OnInit {
  _ = _;
  // state
  isLoading = false;
  isSaving = false;
  // config
  service = '';
  property = '';
  apiEndpoint = '';
  // formly
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  debug = DEBUG_INFO_ENABLED;

  constructor(private entityService: EntityService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.activatedRoute.data
      .pipe(
        map(({ config, model }) => {
          // get model
          this.model = model;
          // verify service
          this.service = _.get(config, 'config.service', config.service);
          this.property = _.get(config, 'config.property', config.property);
          // apiEndpoint
          this.apiEndpoint = _.get(config, 'config.apiEndpoint', config.apiEndpoint);
          // formly
          this.fields = _.get(config, 'config.fields', []);
        })
      )
      .subscribe(() => (this.isLoading = false));
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    if (this.model.id !== undefined || this.model._id !== undefined) {
      this.entityService.update(this.model, this.apiEndpoint).subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError(),
      });
    } else {
      this.entityService.create(this.model, this.apiEndpoint).subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError(),
      });
    }
  }

  private onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  private onSaveError(): void {
    this.isSaving = false;
  }
}
