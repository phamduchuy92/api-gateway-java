import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'jhi-formly-field-price',
  template: `
    <input
      class="form-control"
      type="text"
      [mask]="to.mask"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [thousandSeparator]="to.thousandSeparator ?? ','"
      (change)="convert()"
    />
  `,
})
export class MaskTypeComponent extends FieldType {
  formControl!: FormControl;
  defaultOptions = {
    wrappers: ['form-group'],
  };

  constructor() {
    super();
  }

  convert(): void {
    if (this.to.mask === 'separator') {
      this.formControl.setValue(_.toNumber(this.formControl.value.replace(new RegExp(this.to.thousandSeparator ?? ',', 'g'), '')));
    }
  }
}
