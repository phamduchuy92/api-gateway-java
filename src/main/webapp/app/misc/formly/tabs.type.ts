import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'jhi-formly-tabs',
  template: `
    <mat-tab-group>
      <mat-tab
        *ngFor="let tab of field.fieldGroup; let i = index; let last = last"
        [label]="tab.templateOptions?.label || ''"
        [disabled]="i !== 0 && !isValid(field.fieldGroup![i - 1])"
      >
        <formly-field [field]="tab"></formly-field>
      </mat-tab>
    </mat-tab-group>
  `,
})
export class TabsTypeComponent extends FieldType {
  isValid(field: FormlyFieldConfig): boolean {
    if (field.key) {
      return field.formControl!.disabled ? true : field.formControl!.valid;
    }

    return field.fieldGroup!.every(f => this.isValid(f));
  }
}
