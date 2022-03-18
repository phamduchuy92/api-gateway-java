import { Component, ViewChild, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FieldArrayType } from '@ngx-formly/core';
import * as _ from 'lodash';

@Component({
  selector: 'jhi-formly-datatable',
  template: `
    <button *ngIf="to.create && !formControl.disabled" type="button" class="btn btn-primary btn-sm float-right" (click)="create()">
      <fa-icon icon="plus"></fa-icon>&nbsp;
      <span class="d-none d-md-inline">Create New</span>
    </button>

    <div class="table-responsive">
      <table class="table table-striped table-bordered" [ngClass]="columns.length > 5 ? 'small' : ''">
        <thead>
          <tr>
            <th><strong>No</strong></th>
            <th *ngFor="let c of columns; let ci = index" style="word-wrap: break-word; white-space: normal !important;">
              <strong *ngIf="c.jhiTranslate" [jhiTranslate]="c.jhiTranslate"></strong>
              <strong *ngIf="!c.jhiTranslate" [innerHtml]="c.label"></strong>
            </th>
            <th *ngIf="!to.readonly && !formControl.disabled"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let val of rows; let i = index; trackBy: trackId">
            <td [innerHTML]="i + 1"></td>
            <td
              *ngFor="let c of columnKeys"
              style="word-wrap: break-word; white-space: normal !important;"
              [innerHTML]="_.get(val, c, '')"
            ></td>
            <th class="text-right" *ngIf="!to.readonly && !formControl.disabled">
              <div class="btn-group">
                <button type="button" class="btn btn-success btn-sm" (click)="editItem(i)">
                  <fa-icon icon="pencil-alt"></fa-icon>&nbsp;
                  <span class="d-none d-md-inline">Edit</span>
                </button>
                <button class="btn btn-danger btn-sm" type="button" (click)="delete(i)">
                  <fa-icon icon="ban"></fa-icon>&nbsp;
                  <span class="d-none d-md-inline">Delete</span>
                </button>
              </div>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #deleteModal let-delmodal>
      <div class="modal-header">
        <h4 class="modal-title" jhiTranslate="entity.delete.title">Confirm delete operation</h4>
        <button type="button" class="close" (click)="delmodal.dismiss()">&times;</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this item?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal" (click)="delmodal.dismiss()">
          <fa-icon [icon]="'ban'"></fa-icon>&nbsp;<span jhiTranslate="entity.action.cancel">Cancel</span>
        </button>
        <button id="jhi-confirm-delete-ticket" type="submit" class="btn btn-danger" (click)="delmodal.close()">
          <fa-icon [icon]="'times'"></fa-icon>&nbsp;<span jhiTranslate="entity.action.delete">Delete</span>
        </button>
      </div>
    </ng-template>
    <ng-template #formModal let-formmodal>
      <form (ngSubmit)="formmodal.close()">
        <div class="modal-header">
          <h4 class="modal-title" [jhiTranslate]="to.addTitle || 'Add Item'"></h4>
          <button type="button" class="close" (click)="formmodal.dismiss()">&times;</button>
        </div>
        <div class="modal-body">
          <formly-form [model]="modalModel" [fields]="field.fieldArray?.fieldGroup!" [options]="options!"></formly-form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="formmodal.dismiss()">
            <fa-icon icon="ban"></fa-icon>&nbsp;
            <span jhiTranslate="entity.action.cancel">Cancel</span>
          </button>
          <button id="jhi-confirm-delete-ticket" type="button" class="btn btn-danger" (click)="formmodal.close()">
            <fa-icon icon="save"></fa-icon>&nbsp;
            <span jhiTranslate="entity.action.save">Save</span>
          </button>
        </div>
      </form>
    </ng-template>
  `,
})
export class DatatableTypeComponent extends FieldArrayType implements OnInit {
  rows: any[] = [];
  columns: any[] = [];
  columnsMap: any = {};
  columnKeys: string[] = [];
  prop = '';
  apiEndpoint = '';
  _ = _;
  // pagination
  links = '';
  totalItems = 0;
  itemsPerPage = 20;
  page = 1;
  predicate: any;
  previousPage: any;
  ascending: any;
  // + selected
  hideSelected = true;
  // + delete Modal
  @ViewChild('deleteModal', { static: true }) deleteModal: any;
  @ViewChild('formModal', { static: true }) formModal: any;
  rowIdx = 0;
  modalModel: any = {};

  constructor(private modalService: NgbModal) {
    super();
  }

  ngOnInit(): void {
    this.page = 1;
    this.itemsPerPage = _.get(this.to, 'itemsPerPage', 1000);
    this.hideSelected = _.get(this.to, 'hideSelected', true);
    this.columns = _.map(_.get(this.to, 'columns', ['id']), v =>
      // _.isString(v) ? { prop: v, pattern: 'ci(contains(${ term }))', jhiTranslate: v, label: v } : v
      _.isString(v) ? { prop: v, pattern: '{"$like":"%${ term }%"}', jhiTranslate: v, label: v } : v
    );
    this.columnKeys = _.map(this.columns, 'prop');

    this.loadAll();
  }

  loadAll(): void {
    this.rows = this.formControl.value;
    this.totalItems = this.formControl.value.length;
  }

  loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.loadAll();
    }
  }

  ngOnDestroy(): void {
    // this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: any): string {
    return item.id;
  }

  // Update item
  editItem(i: number): void {
    this.modalModel = this.formControl.value[i];
    this.openUpdateModal(i);
  }

  // + delete confirm
  delete(i: number): void {
    this.modalService.open(this.deleteModal).result.then(
      () => {
        this.remove(i);
        this.loadAll();
      },
      () => this.modalService.dismissAll()
    );
  }

  // Create
  create(): void {
    this.modalModel = {};
    _.each(this.to.params, (v, k) => _.set(this.modalModel, k, v));
    this.openUpdateModal();
  }

  // Open the modal
  openUpdateModal(i?: number): void {
    this.modalService.open(this.formModal, { size: 'xl', backdrop: 'static' }).result.then(
      () => {
        if (i != undefined) {
          this.formControl.value.splice(i, 1, this.modalModel);
          this.formControl.setValue(this.formControl.value);
        } else {
          this.add();
          this.formControl.value.splice(this.formControl.value.length - 1, 1, this.modalModel);
          this.formControl.setValue(this.formControl.value);
        }
        this.loadAll();
      },
      () => this.modalService.dismissAll()
    );
  }
}
