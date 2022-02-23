import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'jhi-formly-accordion',
  template: `
    <fieldset>
      <legend>{{ to.label }}</legend>
      <ngb-accordion>
        <ngb-panel *ngFor="let field of field.fieldGroup; let i = index" [title]="to.label + ' #' + i">
          <ng-template ngbPanelContent>
            <formly-field [field]="field"></formly-field>
            <div class="my-auto">
              <button class="btn btn-danger btn-sm" type="button" (click)="remove(i)"><fa-icon icon="ban"></fa-icon> Remove</button>
            </div>
          </ng-template>
        </ngb-panel>
      </ngb-accordion>
      <button class="btn btn-primary" type="button" (click)="add()"><fa-icon icon="plus"></fa-icon> {{ to.addText }}</button>
    </fieldset>
  `,
})
export class AccordionTypeComponent extends FieldArrayType {}
