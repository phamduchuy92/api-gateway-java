import { Component, OnInit } from '@angular/core';
import { FieldArrayType, FieldType } from '@ngx-formly/core';
// + HttpClient
import { HttpClient } from '@angular/common/http';

import { filter, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { SafePipe } from '../util/safe.pipe';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'jhi-formly-file-gridfs',
  template: `
    <input
      type="file"
      (change)="addFile($event)"
      class="custom-input"
      [disabled]="to.disabled"
      [hidden]="to.hidden == true ? true : false"
      multiple
    />
    <ng-template *ngFor="let value of formControl.value">
      <a
        [href]="getFileSrc(value)"
        [ngClass]="to.className ? to.className : ''"
        target="_blank"
        *ngIf="to.hidden == true"
        [innerHTML]="value"
      ></a>
    </ng-template>
    <ng-template *ngFor="let value of formControl.value">
      <div class="file-viewer" *ngIf="to.template" [innerHtml]="getTemplate(value)"></div>
    </ng-template>
    <div class="row" *ngIf="!to.template && formControl.value && to.hidden != true">
      <div class="col-md-3 mb-3" *ngFor="let value of formControl.value; let i = index">
        <a [href]="getFileSrc(value)" [ngClass]="to.className ? to.className : ''" target="_blank" *ngIf="!isImage(value)">{{ value }}</a>
        <a
          [href]="getFileSrc(value)"
          class="img-thumbnail w-100"
          [ngClass]="to.className ? to.className : ''"
          target="_blank"
          *ngIf="isImage(value)"
        >
          <img
            [src]="getFileSrc(value)"
            class="img-thumbnail w-100"
            [ngClass]="to.className ? to.className : ''"
            style="height: 200px; object-fit: cover;"
          />
        </a>
        <button
          (click)="removeFile(i)"
          class="btn btn-danger btn-block ml-1"
          [disabled]="to.disabled"
          [hidden]="to.hidden == true ? true : false"
        >
          <fa-icon icon="times"></fa-icon>&nbsp; Remove
        </button>
      </div>
    </div>
  `,
  providers: [SafePipe],
})
export class FileGridfsTypeComponent extends FieldType {
  files: any[] = [];
  bucketName = '';
  defaultOptions = {
    wrappers: ['form-group'],
  };
  constructor(
    private pipe: SafePipe,
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService
  ) {
    super();
    const id = this.localStorageService.retrieve('id') ?? this.sessionStorageService.retrieve('id') ?? '';
    const login = this.localStorageService.retrieve('login') ?? this.sessionStorageService.retrieve('login') ?? '';
    this.bucketName = `${login}-${id}`;
  }

  // API Endpoint for Retrieve File
  getFileSrc(val: string): string {
    return _.isFunction(this.to.getFileSrc)
      ? this.to.getFileSrc()
      : this.to.fileSrc
      ? this.to.fileSrc.replace('${fileName}', this.bucketName != '' ? `/${this.bucketName}/${val}` : val)
      : SERVER_API_URL + _.get(this.to, 'apiEndpoint', 'api/upload') + `${this.bucketName != '' ? '/' + this.bucketName : ''}` + `/${val}`;
  }

  removeFile(idx: number): void {
    this.httpClient
      .delete(
        SERVER_API_URL +
          _.get(this.to, 'apiEndpoint', 'api/upload') +
          `${this.bucketName != '' ? '/' + this.bucketName : ''}` +
          `/${this.formControl.value[idx]}`
      )
      .subscribe(
        () => this.formControl.setValue(this.formControl.value.length > 1 ? this.formControl.value.splice(idx, 1) : null),
        () => this.formControl.setValue(this.formControl.value.length > 1 ? this.formControl.value.splice(idx, 1) : null)
      );
  }

  // Upload a file to server, return the URL
  addFile(event: any): void {
    if (this.to.allowedExt && !this.validateExtension(event.target.value, this.to.allowedExt)) {
      alert('Invalid file extension.');
      return;
    }
    this.files = event.target.files;
    this.uploadFile();
  }

  validateExtension(path: string, ext: any): boolean {
    const extensions = _.isString(ext) ? ext.split(' ') : ext;
    return _.isArray(extensions) ? extensions.some(i => path.endsWith(i)) : false;
  }

  // API Endpoint for Upload File
  uploadFile(): void {
    const formData = new FormData();
    for (var i = 0; i < this.files.length; i++) {
      formData.append('files', this.files[i], this.files[i].name);
    }
    this.httpClient
      .post(
        SERVER_API_URL + _.get(this.to, 'apiEndpoint', 'api/upload') + `${this.bucketName != '' ? '/' + this.bucketName : ''}`,
        formData,
        { observe: 'response' }
      )
      .pipe(
        filter(res => res.ok),
        map(res => res.body),
        map(res => this.postProcess(res))
      )
      .subscribe(res => {
        this.formControl.setValue(this.formControl.value ? this.formControl.value.concat(res) : res);
      });
  }

  getTemplate(val: string): any {
    return this.pipe.transform(this.to.template.replace('${fileName}', val));
  }

  // postProcess extract the file ID from the key
  postProcess(filesInfo: any): string[] {
    if (filesInfo.every(e => _.isString(e))) {
      return filesInfo;
    }
    if (this.to.key && _.isString(this.to.key) && filesInfo.every(e => _.isString(e[this.to.key]))) {
      return _.map(filesInfo, this.to.key);
    }
    if (this.to.map) {
      if (_.isString(this.to.map)) {
        return _.map(filesInfo, e => _.template(this.to.map)(e));
      } else if (_.isFunction(this.to.map)) {
        return _.map(filesInfo, e => this.to.map(e));
      }
    }
    return [];
  }

  isImage(val: string): boolean {
    return val.match(/(.jpg|.jpeg|.gif|.png)$/) ? true : false;
  }
}
