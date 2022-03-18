import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'formly-wrapper-fieldset',
  styleUrls: ['./fieldset.wrapper.scss'],
  template: `
    <fieldset>
      <legend>{{ to.label }}</legend>
      <ng-container #fieldComponent></ng-container>
    </fieldset>
  `,
})
export class FieldsetWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef })
  fieldComponent!: ViewContainerRef;
}
