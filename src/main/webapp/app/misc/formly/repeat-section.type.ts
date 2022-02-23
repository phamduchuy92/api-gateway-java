import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'jhi-formly-repeat-section',
  template: `
    <fieldset>
      <legend *ngIf="to.label" [innerHTML]="to.label"></legend>
      <div *ngFor="let field of field.fieldGroup; let i = index" [ngClass]="to.fieldWrapClassName || 'd-flex justify-content-between'">
        <div [ngClass]="to.fieldClassName || 'w-75'">
          <formly-field [field]="field"></formly-field>
        </div>
        <div class="my-auto" *ngIf="to.disabled">
          <button class="btn btn-danger btn-sm" type="button" (click)="remove(i)"><fa-icon icon="ban"></fa-icon>&nbsp; Remove</button>
        </div>
      </div>
      <button *ngIf="to.disabled" class="btn btn-primary" type="button" (click)="add()">
        <fa-icon icon="plus"></fa-icon>&nbsp; {{ to.addText }}
      </button>
    </fieldset>
  `,
})
export class RepeatTypeComponent extends FieldArrayType {}
