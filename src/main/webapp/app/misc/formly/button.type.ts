import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { createRequestOption } from 'app//core/request/request-util';
import { plainToFlattenObject } from '../util/request-util';

import { AlertService } from 'app//core/util/alert.service';

@Component({
  selector: 'jhi-formly-button',
  template: `
    <div class="my-auto">
      <button
        [type]="to.type || 'button'"
        [ngClass]="'btn btn-' + (to.btnType ? to.btnType : 'outline-primary')"
        [disabled]="to.disabled"
        (click)="onClick($event)"
      >
        <fa-icon *ngIf="to.icon" [icon]="to.icon"></fa-icon>
        {{ to.label }}
      </button>
    </div>
  `,
})
export class ButtonTypeComponent extends FieldType {
  constructor(private router: Router, private httpClient: HttpClient, private alertService: AlertService) {
    super();
  }
  onClick($event: any): void {
    if (this.to.onClick) {
      this.to.onClick($event);
    } else if (this.to.apiEndpoint) {
      this.createRequest()
        .pipe(filter(res => res.ok))
        .subscribe(
          res => this.onSuccess(res),
          err => this.onError(err)
        );
    }
  }

  createRequest(): Observable<HttpResponse<any>> {
    const params = createRequestOption(_.omitBy(plainToFlattenObject(this.to.params), _.isNull));
    const body = _.omitBy(this.to.body, _.isNull);
    if (this.to.method) {
      return this.httpClient.request(this.to.method, SERVER_API_URL + _.toString(this.to.apiEndpoint), {
        params,
        body,
        responseType: this.to.responseType ? this.to.responseType : 'json',
        observe: 'response',
      });
    } else if (_.isEmpty(body)) {
      return this.httpClient.get(SERVER_API_URL + _.toString(this.to.apiEndpoint), {
        params,
        responseType: this.to.responseType ? this.to.responseType : 'json',
        observe: 'response',
      });
    } else {
      return this.httpClient.post(SERVER_API_URL + _.toString(this.to.apiEndpoint), body, {
        params,
        responseType: this.to.responseType ? this.to.responseType : 'json',
        observe: 'response',
      });
    }
  }

  private onSuccess(res: any): void {
    this.form.get(_.toString(this.key))?.setValue(res);
  }

  private onError(err: HttpErrorResponse): void {
    this.form.get(_.toString(this.key))?.setValue(err);
  }
}
