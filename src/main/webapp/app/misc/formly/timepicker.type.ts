import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'jhi-formly-field-timepicker',
  template: `
    <div class="input-group">
      <ngb-timepicker [formControl]="formControl" [formlyAttributes]="field"></ngb-timepicker>
    </div>
  `,
})
export class TimeTypeComponent extends FieldType {}
