import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl } from '@angular/forms';
import { DATE_FORMAT } from 'app//config/input.constants';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'jhi-formly-datepicker',
  template: `
    <div class="input-group">
      <div class="input-group-prepend" *ngIf="!to.required">
        <button class="btn btn-sm btn-outline-light" (click)="clear()" type="button" [disabled]="!date.value || to.disabled">
          <fa-icon icon="times"></fa-icon>&nbsp;
        </button>
      </div>
      <input
        class="form-control"
        [formControl]="date"
        [formlyAttributes]="field"
        ngbDatepicker
        #d="ngbDatepicker"
        (dateSelect)="onDateSelect()"
      />
      <div class="input-group-append">
        <button class="btn btn-outline-light calendar" (click)="d.toggle()" type="button" [disabled]="to.disabled">
          <fa-icon icon="calendar-alt"></fa-icon>&nbsp;
        </button>
      </div>
    </div>
  `,
})
export class DateTypeComponent extends FieldType implements OnInit {
  defaultOptions = {
    wrappers: ['form-group'],
  };
  date = new FormControl();
  // Store the value in string when the form update
  ngOnInit(): void {
    this.formControl.valueChanges.subscribe(() => this.onFormValueChange());
    this.onFormValueChange();
  }
  onDateSelect(): void {
    this.formControl.setValue(moment(this.date.value).format(this.to.inputFormat || DATE_FORMAT));
  }
  onFormValueChange(): void {
    if (this.formControl.value && _.isString(this.formControl.value)) {
      this.date.setValue(moment(this.formControl.value, this.to.inputFormat || DATE_FORMAT));
    }
  }
  clear(): void {
    this.formControl.setValue(null);
    this.date.setValue(null);
  }
}
