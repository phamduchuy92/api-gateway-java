import { Component, OnInit } from '@angular/core';
// + Formly Support
import { FormlyFieldConfig } from '@ngx-formly/core';
import { filter, map } from 'rxjs/operators';
// + HTTP support
import { HttpClient } from '@angular/common/http';
import { FieldType } from '@ngx-formly/core';
// + look for anything
import * as _ from 'lodash';
import * as jsyaml from 'js-yaml';
// key: example, type: 'remote-form', templateOptions: { src: '/assets/path/remote-form.yaml' }
@Component({
  selector: 'jhi-remote-form-type',
  template: ` <formly-form *ngIf="to.fields" [model]="model" [fields]="to.fields" [options]="options" [form]="form"></formly-form> `,
})
export class RemoteFormTypeComponent extends FieldType implements OnInit {
  formFields: FormlyFieldConfig[] = [];
  constructor(private httpClient: HttpClient) {
    super();
  }

  ngOnInit(): void {
    if (this.to.src) {
      this.loadRemoteForm();
    }
  }

  loadRemoteForm(): void {
    this.httpClient
      .get(this.to.src, { responseType: 'text', observe: 'response' })
      .pipe(
        filter(res => res.ok),
        map(res => jsyaml.load(res.body || ''))
      )
      .subscribe(res => (this.to.fields = _.get(res, 'fields', [])));
  }
}
