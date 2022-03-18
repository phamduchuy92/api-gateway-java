import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// + HTTP support
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { createRequestOption } from 'app//core/request/request-util';
import { plainToFlattenObject } from 'app//misc/util/request-util';
// + ng-select
import { filter } from 'rxjs/operators';
import { FieldArrayType } from '@ngx-formly/core';
import * as _ from 'lodash';
// + Modal
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntityService } from 'app//misc/model/entity.service';
import * as jsyaml from 'js-yaml';

@Component({
  selector: 'jhi-formly-crud-table',
  styleUrls: ['./crud-table.type.scss'],
  templateUrl: './crud-table.type.html',
})
export class CrudTableTypeComponent extends FieldArrayType implements OnInit, OnDestroy {
  isReady = false;
  rows: any[] | null = [];
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

  // + references
  reference: any = {};
  referenceEndpoint: any = {};

  constructor(private httpClient: HttpClient, private modalService: NgbModal, private dataService: EntityService) {
    super();
  }

  ngOnInit(): void {
    this.page = 1;
    this.itemsPerPage = _.get(this.to, 'itemsPerPage', 1000);
    this.predicate = _.get(this.to, 'predicate', 'id');
    this.ascending = _.get(this.to, 'ascending', true);
    this.hideSelected = _.get(this.to, 'hideSelected', true);
    this.columns = _.map(_.get(this.to, 'columns', ['id']), v =>
      // _.isString(v) ? { prop: v, pattern: 'ci(contains(${ term }))', jhiTranslate: v, label: v } : v
      _.isString(v)
        ? {
            property: v,
            label: v,
            sortBy: v,
            searchBy: v,
            pattern: 'contains(${ term })',
            jhiTranslate: v,
          }
        : v
    );
    this.columnsMap = _.keyBy(this.columns, 'property');
    this.columnKeys = _.map(this.columns, 'property');
    // calculate reference based on options
    _.forEach(
      _.filter(this.columns, e => e.options),
      e => _.forEach(e.options, o => _.set(this.reference, [e.property, o.value], o.label))
    );
    // calculate reference based on apiEndpoint
    _.forEach(
      _.filter(this.columns, e => e.apiEndpoint),
      e => (this.referenceEndpoint[e.property] = _.pick(e, ['apiEndpoint', 'params', 'key', 'val']))
    );

    // hook to templateOptions.disabled to populate data in formly
    if (this.to.disabled != true) {
      this.loadAll();
    }
  }

  loadAll(): void {
    this.httpClient
      .get<any[]>(SERVER_API_URL + this.to.apiEndpoint, {
        params: createRequestOption(
          _.assign(
            {},
            {
              page: this.page - 1,
              size: this.itemsPerPage,
              sort: this.sort(),
            },
            plainToFlattenObject(this.to.params)
          )
        ),
        observe: 'response',
      })
      .pipe(filter(res => res.ok))
      .subscribe(
        (res: HttpResponse<any[]>) => {
          this.isReady = true;
          this.onSuccess(res.body, res.headers);
        },
        () => (this.isReady = false)
      );
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

  private sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  private onSuccess(data: any[] | null, headers: HttpHeaders): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.rows = data;
    this.loadReferenceEndpoint();
  }

  loadReferenceEndpoint(): void {
    // + load reference remote entities based on apiEndpoint
    _.each(this.referenceEndpoint, (templateOptions, fieldKey) => {
      const ids = _.uniq(
        _.flatMap(
          _.map(this.rows, i => _.get(i, fieldKey)).filter(i => !_.isEmpty(i)),
          values => (_.isArray(values) ? _.values(values) : values)
        )
      );
      const q = _.get(templateOptions, 'params', {});
      _.set(q, templateOptions.key, ids);
      this.dataService
        .query(q, templateOptions.apiEndpoint)
        .subscribe(refData =>
          _.each(refData.body, i => _.set(this.reference, [fieldKey, _.get(i, templateOptions.key)], _.get(i, templateOptions.val)))
        );
    });
  }

  // Update item
  editItem(model: any): void {
    this.modalModel = model;
    this.openUpdateModal();
  }
  // + delete confirm
  delete(model: any): void {
    this.modalModel = model;
    this.modalService.open(this.deleteModal).result.then(
      () => this.dataService.delete(model.id, this.to.apiEndpoint).subscribe(() => this.loadAll()),
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
  openUpdateModal(): void {
    this.modalService.open(this.formModal, { size: 'xl', backdrop: 'static' }).result.then(
      () =>
        (this.modalModel.id
          ? this.dataService.update(this.modalModel, this.to.apiEndpoint)
          : this.dataService.create(this.modalModel, this.to.apiEndpoint)
        ).subscribe(() => this.loadAll()),
      () => this.modalService.dismissAll()
    );
  }

  // Render cell value based on current reference map
  renderCell(row: any, col: string): any {
    // {{ _.get(reference, [c, _.get(val, c)], _.get(val, c)) }}
    let val;
    if (this.columnsMap[col].template) {
      try {
        val = _.template(this.columnsMap[col].template)(row);
      } catch (e) {
        val = _.get(row, col);
      }
    } else {
      val = _.get(row, col);
    }
    if (_.isArray(val)) {
      return _.map(val, v => _.get(this.reference, [col, v], v));
    } else if (_.isPlainObject(val)) {
      // support for tree type
      if (_.map(plainToFlattenObject(val)).every(e => typeof e === 'boolean')) {
        const parsedVal = _.filter(_.entries(plainToFlattenObject(val)), e => e.some(o => o === true));
        let res = {};
        _.forEach(parsedVal, (v, k) => _.assign(res, _.set(res, v[0], 'tree')));
        return `<pre>${jsyaml.dump(res).replace(/: tree/gi, '')}</pre>`;
      }
      return `<pre>${jsyaml.dump(val)}</pre>`;
    }
    return _.get(this.reference, [col, val], val);
  }
}
