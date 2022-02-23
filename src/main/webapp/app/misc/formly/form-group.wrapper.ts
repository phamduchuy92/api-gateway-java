import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'jhi-form-group-wrapper',
  template: `
    <div class="form-group" [class.has-error]="showError">
      <label *ngIf="!to.hideLabel && (to.label || to.jhiTranslate)" [attr.for]="id">
        <span *ngIf="to.jhiTranslate" [jhiTranslate]="to.jhiTranslate"></span>
        <span *ngIf="!to.jhiTranslate" [innerHtml]="to.label"></span>
        <span *ngIf="to.required && to.hideRequiredMarker !== true"> *</span>
      </label>
      <ng-template #fieldComponent></ng-template>
      <div *ngIf="showError" class="invalid-feedback" [style.display]="'block'">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
      <small *ngIf="to.description" class="form-text text-muted">{{ to.description }}</small>
    </div>
  `,
})
export class FormGroupWrapperComponent extends FieldWrapper {}
