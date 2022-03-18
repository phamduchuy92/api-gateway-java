import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
@Component({
  selector: 'jhi-formly-colorpicker',
  template: `
    <div class="input-group">
      <input
        class="form-control"
        [(colorPicker)]="color"
        [style.background]="color"
        [cpPresetColors]="to.preset"
        (colorPickerChange)="onColorSelect($event)"
      />
      <div class="input-group-append">
        <span class="input-group-text" [innerHTML]="formControl.value"></span>
      </div>
    </div>
  `,
})
export class ColorpickerTypeComponent extends FieldType implements OnInit {
  color!: string;
  // Store the value in string when the form update
  ngOnInit() {
    this.formControl.valueChanges.subscribe(() => this.onFormValueChange());
    this.onFormValueChange();
  }

  onColorSelect(color: string) {
    this.formControl.setValue(color);
  }

  onFormValueChange() {
    if (this.formControl.value && typeof this.formControl.value === 'string') {
      this.color = this.formControl.value;
    }
  }

  clear() {
    this.formControl.setValue(null);
  }
}
