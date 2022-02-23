import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import * as _ from 'lodash';
@Component({
  selector: 'jhi-formly-field-tags',
  template: `
    <ng-select
      [items]="to.items"
      [bindValue]="to.key"
      [bindLabel]="to.val"
      [placeholder]="to.placeholder"
      [multiple]="true"
      [hideSelected]="to.hideSelected"
      [addTag]="true"
      [formControl]="formControl"
      (change)="onChange($event)"
    >
    </ng-select>
  `,
})
export class TagsTypeComponent extends FieldType {
  defaultOptions = {
    wrappers: ['form-group'],
  };

  // + allow copy and paste comma separated values
  onChange(event: string[]): void {
    this.formControl.setValue(
      _.uniq(
        event
          .join(',')
          .split(',')
          .map((kw: string) => kw.trim())
      )
    );
  }
}
