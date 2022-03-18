import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
// + HttpClient
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { SafePipe } from '../util/safe.pipe';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'jhi-formly-field-library',
  template: `
    <pre>{{ formControl.value | json }}</pre>
    <button type="button" class="btn btn-primary" (click)="upload()" [innerHTML]="to.label"></button>
    <ng-template *ngFor="let value of values">
      <a [href]="getFileSrc(value)" [class]="to.className" target="_blank" *ngIf="to.hidden === true" [innerHTML]="value"></a>
    </ng-template>
    <div class="row" *ngIf="!to.template && formControl.value && to.hidden != true">
      <div class="col-md-3 mb-3" *ngFor="let value of values; let i = index">
        <a [href]="getFileSrc(value)" [ngClass]="to.className ? to.className : ''" target="_blank" *ngIf="!isImage(value)">{{ value }}</a>
        <a [href]="getFileSrc(value)" class="w-100" [ngClass]="to.className ? to.className : ''" target="_blank" *ngIf="isImage(value)">
          <img
            [src]="getFileSrc(value)"
            class="img-thumbnail w-100"
            [ngClass]="to.className ? to.className : ''"
            style="height: 200px; object-fit: cover;"
          />
        </a>
        <button
          type="button"
          (click)="removeFile(i)"
          class="btn btn-danger btn-block"
          [disabled]="to.disabled"
          [hidden]="to.hidden ? true : false"
        >
          <fa-icon icon="times"></fa-icon>&nbsp; Remove
        </button>
      </div>
    </div>
    <ng-template #uploadModal let-modal>
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" (click)="modal.dismiss()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-3 mb-3" *ngFor="let static of statics; let i = index">
            <div class="custom-control custom-checkbox image-checkbox">
              <input type="checkbox" class="custom-control-input" [id]="i" [(ngModel)]="static.checked" *ngIf="to.multiple" />
              <input
                type="radio"
                class="custom-control-input"
                [id]="i"
                [name]="'name' + i"
                [value]="true"
                [(ngModel)]="static.checked"
                [checked]="static.checked === true"
                (click)="selectOne(static)"
                *ngIf="!to.multiple"
              />
              <label class="custom-control-label w-100 text-center" [for]="i">
                <img
                  class="img-thumbnail w-100"
                  [src]="getFileSrc(static.name)"
                  *ngIf="isImage(static.name)"
                  style="height: 300px; object-fit: cover"
                />
                {{ !isImage(static.name) ? static.name : '' }}
              </label>
            </div>
          </div>
        </div>
        <div>
          <!-- <div class="row justify-content-center">
            <jhi-item-count [params]="{ page: page, totalItems: totalItems, itemsPerPage: itemsPerPage }"></jhi-item-count>
          </div> -->

          <div class="row justify-content-center" *ngIf="this.assets.length >= this.itemsPerPage">
            <ngb-pagination
              [collectionSize]="totalItems"
              [(page)]="page"
              [pageSize]="itemsPerPage"
              [maxSize]="5"
              [rotate]="true"
              [boundaryLinks]="true"
              (pageChange)="transition()"
            ></ngb-pagination>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Hủy</button>
        <button type="button" class="btn btn-primary" (click)="modal.close()">Xác nhận</button>
      </div>
    </ng-template>
  `,
})
export class LibraryTypeComponent extends FieldType implements OnInit {
  @ViewChild('uploadModal', { static: true }) uploadModal!: NgbModalRef;
  assets: any[] = [];
  statics: any[] = [];
  bucketName = '';
  isLoading = false;
  totalItems = 0;
  itemsPerPage = 4;
  page = 1;
  values: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService,
    private modalService: NgbModal
  ) {
    super();
    const id = this.localStorageService.retrieve('id') ?? this.sessionStorageService.retrieve('id') ?? '';
    const login = this.localStorageService.retrieve('login') ?? this.sessionStorageService.retrieve('login') ?? '';
    this.bucketName = `${login}-${id}`;
  }

  ngOnInit(): void {
    this.loadAll();
    this.convertToArray(this.formControl.value);
  }

  loadAll(): void {
    this.isLoading = true;
    this.httpClient
      .get<any>(
        // `services/storage-mgmt/api/file-list/${this.bucketName}`,
        SERVER_API_URL + _.get(this.to, 'apiEndpoint', 'api/upload') + `${this.bucketName != '' ? '/' + this.bucketName : ''}`,
        {
          observe: 'response',
        }
      )
      .subscribe(
        res => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers);
          this.transition();
        },
        () => (this.isLoading = false)
      );
  }

  transition(): void {
    this.statics = this.assets.slice((this.page - 1) * this.itemsPerPage, this.page * this.itemsPerPage);
  }

  getFileSrc(val: string): string {
    return _.isFunction(this.to.getFileSrc)
      ? this.to.getFileSrc()
      : this.to.fileSrc
      ? this.to.fileSrc.replace('${fileName}', this.bucketName != '' ? `/${this.bucketName}/${val}` : val)
      : SERVER_API_URL + _.get(this.to, 'apiEndpoint', 'api/upload') + `${this.bucketName != '' ? '/' + this.bucketName : ''}` + `/${val}`;
  }

  isImage(val: string): boolean {
    return val.match(/(.jpg|.jpeg|.gif|.png)$/) ? true : false;
  }

  upload(): void {
    this.modalService.open(this.uploadModal, { size: 'xl' }).result.then(
      () => {
        if (this.to.multiple === true) {
          this.formControl.setValue(this.postProcess(_.filter(this.assets, e => e.checked)));
        } else {
          this.formControl.setValue(_.toString(this.postProcess(_.filter(this.assets, e => e.checked))));
        }
        this.convertToArray(this.formControl.value);
      },
      () => this.modalService.dismissAll()
    );
  }

  // postProcess extract the file ID from the key
  postProcess(filesInfo: any): string[] {
    if (filesInfo.every((e: any) => _.isString(e))) {
      return filesInfo;
    }
    if (this.to.key && _.isString(this.to.key) && filesInfo.every((e: { [x: string]: any }) => _.isString(e[this.to.key]))) {
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

  removeFile(idx: number): void {
    if (this.to.multiple === true) {
      const arr = this.formControl.value;
      if (arr.length > 1) {
        arr.splice(idx, 1);
        this.formControl.setValue(arr);
      } else {
        this.formControl.setValue(null);
      }
    } else {
      this.formControl.setValue(null);
    }
    this.convertToArray(this.formControl.value);
  }

  selectOne(val: any): void {
    _.forEach(
      _.filter(this.assets, e => e.checked != val.checked),
      ele => {
        ele.checked = false;
      }
    );
  }

  convertToArray(vals: any): void {
    if (_.isArray(vals)) {
      this.values = vals;
    } else if (vals === null) {
      this.values = [];
    } else {
      this.values = [vals];
    }
  }

  private onSuccess(assets: any[] | null, headers: HttpHeaders): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.assets = _.map(assets, e => _.assign(e, { checked: false }));
    if (_.isArray(this.formControl.value) && this.to.multiple) {
      _.forEach(this.assets, e => {
        _.forEach(this.formControl.value, el => {
          if (e[this.to.key] === el) {
            e.checked = true;
          }
        });
      });
    } else if (!this.to.multiple) {
      _.forEach(this.assets, e => {
        if (e[this.to.key] === this.formControl.value) {
          e.checked = true;
        }
      });
    }
  }
}
