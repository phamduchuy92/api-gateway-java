import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { FormGroup } from '@angular/forms';
import { map, tap } from 'rxjs/operators';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { DEBUG_INFO_ENABLED } from 'app/app.constants';
import { AccountService } from 'app/core/auth/account.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'jhi-data-detail',
  templateUrl: './data-detail.component.html',
})
export class DataDetailComponent implements OnInit, AfterContentChecked {
  _ = _;
  // state
  isLoading = false;
  // config
  service = '';
  property = '';
  // formly
  form: FormGroup = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  debug = DEBUG_INFO_ENABLED;

  constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService) {}

  ngOnInit(): void {
    this.isLoading = true;
    combineLatest(
      this.accountService.identity().pipe(tap(account => (this.options.formState.account = account))),
      this.activatedRoute.data.pipe(
        map(({ config, model }) => {
          // get model
          this.model = model;
          // verify service
          this.service = _.get(config, 'config.service', config.service);
          this.property = _.get(config, 'config.property', config.property);
          // formly
          this.fields = _.get(config, 'config.fields', []);
          this.options.formState.mainModel = this.model;
        })
      )
    ).subscribe(() => (this.isLoading = false));
  }

  ngAfterContentChecked(): void {
    this.form.disable({ emitEvent: false });
  }

  previousState(): void {
    window.history.back();
  }
}
