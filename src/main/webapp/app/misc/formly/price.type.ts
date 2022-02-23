import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'jhi-formly-field-price',
  template: `
    <input
      class="form-control"
      type="text"
      [formControl]="formControl"
      [formlyAttributes]="field"
      mask="separator"
      thousandSeparator=","
      (change)="convert()"
    />
  `,
})
export class PriceTypeComponent extends FieldType {
  defaultOptions = {
    wrappers: ['form-group'],
  };
  constructor() {
    super();
  }

  convert(): void {
    if (_.isString(this.formControl.value)) {
      this.formControl.setValue(_.toNumber(this.formControl.value.replace(/,/g, '')));
    }
  }
}
