import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'jhi-formly-card',
  template: `
    <fieldset>
      <legend>{{ to.label }}</legend>
      <div class="input-group" *ngFor="let field of field.fieldGroup; let i = index">
        <div class="card">
          <div class="card-header">{{ to.label + ' #' + i }}</div>
          <div class="card-body">
            <formly-field [field]="field"></formly-field>
          </div>
        </div>
        <div class="my-auto">
          <button class="btn btn-danger btn-sm" type="button" (click)="remove(i)"><fa-icon icon="ban"></fa-icon> Remove</button>
        </div>
      </div>
      <button class="btn btn-primary" type="button" (click)="add()"><fa-icon icon="plus"></fa-icon> {{ to.addText }}</button>
    </fieldset>
  `,
})
export class CardTypeComponent extends FieldArrayType {}
