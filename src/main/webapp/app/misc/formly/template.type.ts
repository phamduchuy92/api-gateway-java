import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

import { createRequestOption } from 'app//core/request/request-util';
import { plainToFlattenObject } from 'app//misc/util/request-util';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Component({
  selector: 'jhi-formly-field-template',
  template: ` <div [innerHTML]="to.innerHTML" [ngClass]="to.className"></div> `,
})
export class TemplateTypeComponent extends FieldType implements OnInit {
  defaultOptions = {
    wrappers: ['form-group'],
  };

  constructor(protected httpClient: HttpClient) {
    super();
  }

  ngOnInit(): void {
    if (this.to.apiEndpoint) {
      this.loadRemote().subscribe(res => {
        if (this.to.htmlFunc) {
          if (_.isFunction(this.to.htmlFunc)) {
            this.to.innerHTML = this.to.htmlFunc(res);
          } else if (_.isString(this.to.htmlFunc)) {
            this.to.innerHTML = _.template(this.to.htmlFunc)(res);
          }
        } else {
          this.to.innerHTML = res;
        }
        if (this.to.store) {
          this.options.formState[this.to.store] = res;
        }
      });
    }
  }

  loadRemote(): Observable<any> {
    return !this.to.isText
      ? this.loadRemoteApi().pipe(
          filter(res => res.ok),
          map(res => res.body)
        )
      : this.loadRemoteText().pipe(
          filter(res => res.ok),
          map(res => res.body)
        );
  }

  loadRemoteText(): Observable<HttpResponse<any>> {
    const query = _.assign({}, this.to.params);
    const body = _.assign({}, this.to.body);
    if (_.isEmpty(body)) {
      return this.httpClient.get(SERVER_API_URL + this.to.apiEndpoint, {
        params: createRequestOption(_.omitBy(plainToFlattenObject(query), _.isNull)),
        observe: 'response',
        responseType: 'text',
      });
    } else {
      return this.httpClient.post(SERVER_API_URL + this.to.apiEndpoint, _.omitBy(plainToFlattenObject(body), _.isNull), {
        params: createRequestOption(_.omitBy(plainToFlattenObject(query), _.isNull)),
        observe: 'response',
        responseType: 'text',
      });
    }
  }

  loadRemoteApi(): Observable<HttpResponse<any>> {
    const query = _.assign({}, this.to.params);
    const body = _.assign({}, this.to.body);
    if (_.isEmpty(body)) {
      return this.httpClient.get<HttpResponse<any>>(SERVER_API_URL + this.to.apiEndpoint, {
        params: createRequestOption(_.omitBy(plainToFlattenObject(query), _.isNull)),
        observe: 'response',
      });
    } else {
      return this.httpClient.post<HttpResponse<any>>(SERVER_API_URL + this.to.apiEndpoint, _.omitBy(plainToFlattenObject(body), _.isNull), {
        params: createRequestOption(_.omitBy(plainToFlattenObject(query), _.isNull)),
        observe: 'response',
      });
    }
  }
}
