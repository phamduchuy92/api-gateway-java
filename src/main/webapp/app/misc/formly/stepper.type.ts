import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'jhi-formly-stepper',
  template: `
    <mat-horizontal-stepper>
      <mat-step *ngFor="let step of field.fieldGroup; let index = index; let last = last">
        <ng-template matStepLabel>{{ step.templateOptions?.label }}</ng-template>
        <formly-field [field]="step"></formly-field>

        <div class="btn-group d-flex justify-content-between">
          <button matStepperPrevious [disabled]="index === 0" class="btn btn-secondary" type="button">Back</button>

          <button matStepperNext class="btn btn-primary" type="button" [disabled]="!isValid(step) || last">Next</button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `,
})
export class StepperTypeComponent extends FieldType {
  isValid(field: FormlyFieldConfig): boolean {
    if (field.key) {
      return field.formControl!.disabled ? true : field.formControl!.valid;
    }

    return field.fieldGroup!.every(f => this.isValid(f));
  }
}
