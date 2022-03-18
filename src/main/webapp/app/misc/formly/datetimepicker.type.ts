import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { DATE_FORMAT, DATE_TIME_FORMAT } from 'app//config/input.constants';
import moment from 'moment';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateDayjsAdapter } from 'app//config/datepicker-adapter';

@Component({
  selector: 'jhi-formly-datetimepicker',
  template: `
    <div class="input-group">
      <button class="btn btn-sm btn-outline-light" (click)="clear()" type="button" [disabled]="!date.value">
        <fa-icon icon="times"></fa-icon>&nbsp;
      </button>
      <input *ngIf="!to.displayFormat" class="form-control" [formControl]="formControl" [formlyAttributes]="field" />
      <span class="form-control" *ngIf="to.displayFormat" type="text" [innerHtml]="to.displayInput"></span>
      <div class="input-group-append">
        <button class="btn btn-outline-light" [ngbPopover]="calendarContent" autoClose="outside" type="button" #p="ngbPopover">
          <fa-icon [icon]="'calendar-alt'"></fa-icon>&nbsp;
        </button>
      </div>
    </div>
    <ng-template #calendarContent>
      <div>
        <div *ngIf="!showTimePickerToggle">
          <ngb-datepicker #dp name="datepicker" [formControl]="date" (select)="onDateSelect()"> </ngb-datepicker>
          <button class="btn btn-block btn-outline-light" type="button" (click)="toggleDateTimeState($event)">
            <fa-icon [icon]="'clock'"></fa-icon>&nbsp;
          </button>
        </div>
        <div *ngIf="showTimePickerToggle">
          <button class="btn btn-block btn-outline-light" type="button" (click)="toggleDateTimeState($event)">
            <fa-icon [icon]="'calendar-alt'"></fa-icon>&nbsp;
          </button>
          <div class="mt-auto">
            <ngb-timepicker [formControl]="time"></ngb-timepicker>
          </div>
          <button class="btn btn-block btn-primary" type="button" (click)="onDateTimeSelected(); p.close()" [disabled]="!time.value">
            <fa-icon icon="save"></fa-icon>&nbsp;
          </button>
        </div>
      </div>
    </ng-template>
  `,
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateDayjsAdapter }],
})
export class DatetimeTypeComponent extends FieldType implements OnInit {
  formControl!: FormControl;
  defaultOptions = {
    wrappers: ['form-group'],
  };
  showTimePickerToggle = false;
  date: FormControl = new FormControl();
  time: FormControl = new FormControl();

  ngOnInit(): void {
    this.date.setValue(this.formControl.value ? moment(this.formControl.value) : moment());
    this.time.setValue((this.formControl.value ? moment(this.formControl.value) : moment()).format('HH:mm:00'));
    if (this.to.displayFormat) {
      this.to.displayInput = (this.formControl.value ? moment(this.formControl.value) : moment()).format(this.to.displayFormat);
    }
  }

  toggleDateTimeState($event: any): void {
    this.showTimePickerToggle = !this.showTimePickerToggle;
    $event.stopPropagation();
  }

  onDateSelect(): void {
    this.formControl.setValue(moment(this.date.value).format(this.to.format || DATE_FORMAT));
    this.showTimePickerToggle = !this.showTimePickerToggle;
  }

  onDateTimeSelected(): void {
    const tmp = moment(this.time.value, 'HH:mm');
    const dt = moment(this.date.value).hour(tmp.hour()).minute(tmp.minute()).second(0);
    this.formControl.setValue(dt.format(this.to.format || DATE_TIME_FORMAT));
    if (this.to.displayFormat) {
      this.to.displayInput = moment(this.formControl.value).format(this.to.displayFormat);
    }
  }
  clear(): void {
    this.formControl.setValue(null);
    if (this.to.displayFormat) {
      this.to.displayInput = moment().local().format(this.to.displayFormat);
    }
    this.date.setValue(moment());
    this.time.setValue(moment().format('HH:mm:00'));
  }
}
