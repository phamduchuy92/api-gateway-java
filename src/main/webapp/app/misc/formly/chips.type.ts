import { Component, ViewChild, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';

@Component({
  template: `
    <mat-chip-list #chipList>
      <mat-chip *ngFor="let item of formControl.value" [selectable]="selectable" [removable]="removable" (removed)="remove(item)">
        {{ item }}
        <mat-icon matChipRemove *ngIf="removable">cancel</mat-icon>
      </mat-chip>
      <input
        [placeholder]="to.placeholder!"
        #itemInput
        [formControl]="itemControl"
        [matAutocomplete]="auto"
        [matChipInputFor]="chipList"
        [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
        (matChipInputTokenEnd)="add($event)"
      />
    </mat-chip-list>
    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selected($event)">
      <mat-option *ngFor="let item of filteredItems | async" [value]="item">
        {{ item }}
      </mat-option>
    </mat-autocomplete>
  `,
  styleUrls: ['./chips.type.scss'],
})
export class ChipsTypeComponent extends FieldType {
  defaultOptions = {
    wrappers: ['form-group'],
    defaultValue: [],
  };

  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  itemControl = new FormControl();
  filteredItems: Observable<string[]>;

  @ViewChild('itemInput') itemInput!: ElementRef<HTMLInputElement>;

  constructor() {
    super();
    this.filteredItems = this.itemControl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) => (item ? this._filter(item) : this.to.filterdItems.slice()))
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.formControl.setValue([...this.formControl.value, value]);
    }

    // Clear the input value
    event.input.value = '';

    this.itemControl.setValue(null);
  }

  remove(item: number): void {
    const index = this.formControl.value.indexOf(item);

    if (index > 0) {
      this.formControl.setValue(this.formControl.value.splice(index, 1));
    } else if (index === 0) {
      this.formControl.setValue([]);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.formControl.setValue([...this.formControl.value, event.option.viewValue]);

    this.itemInput.nativeElement.value = '';
    this.itemControl.setValue(null);
  }

  private _filter(value: string): string[] {
    if (!this.to.filterdItems) return [];
    const filterValue = value.toLowerCase();

    return this.to.filterdItems.filter((item: string) => item.toLowerCase().indexOf(filterValue) === 0);
  }
}
