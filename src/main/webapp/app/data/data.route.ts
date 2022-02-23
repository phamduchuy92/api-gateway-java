import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, concatMap } from 'rxjs/operators';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import { DataComponent } from './data.component';
import { DataDetailComponent } from './data-detail.component';
import { DataUpdateComponent } from './data-update.component';

// custom
import * as _ from 'lodash';
import * as jsyaml from 'js-yaml';
import { createRequestOption } from 'app/core/request/request-util';

@Injectable({ providedIn: 'root' })
export class ConfigResolve implements Resolve<string> {
  constructor(private httpClient: HttpClient) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const service: string = _.get(route.params, 'service');
    const property: string = _.get(route.params, 'property');

    return this.httpClient
      .get(SERVER_API_URL + `assets/${service}/${property}.yaml`, {
        responseType: 'text',
        observe: 'response',
      })
      .pipe(
        filter(res => res.ok),
        map(content => jsyaml.load(content.body ?? '')),
        map(config => ({ service, property, config, apiEndpoint: `${service ? 'services/' + service : ''}/api/${property}` }))
      );
  }
}

@Injectable({ providedIn: 'root' })
export class ModelResolve implements Resolve<any> {
  constructor(private httpClient: HttpClient) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id: string = _.get(route.params, 'id');
    const service: string = _.get(route.params, 'service');
    const property: string = _.get(route.params, 'property');

    if (id) {
      return this.httpClient
        .get(SERVER_API_URL + `assets/${service}/${property}.yaml`, {
          responseType: 'text',
          observe: 'response',
        })
        .pipe(
          filter(res => res.ok),
          map(content => jsyaml.load(content.body ?? '')),
          concatMap(config =>
            this.httpClient
              .get(
                SERVER_API_URL +
                  _.toString(_.get(config, 'apiEndpoint', `${service ? 'services/' + service : ''}/api/${property}`)) +
                  `/${id}`,
                {
                  params: createRequestOption(_.get(config, 'queryParams', {})),
                  observe: 'response',
                }
              )
              .pipe(
                filter(res => res.ok),
                map(res => res.body)
              )
          )
        );
    }
    return of({});
  }
}

export const DATA_ROUTES: Routes = [
  {
    path: ':service/:property',
    component: DataComponent,
    resolve: {
      config: ConfigResolve,
    },
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':service/:property/:id/view',
    component: DataDetailComponent,
    resolve: {
      config: ConfigResolve,
      model: ModelResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':service/:property/new',
    component: DataUpdateComponent,
    resolve: {
      config: ConfigResolve,
      model: ModelResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':service/:property/:id/edit',
    component: DataUpdateComponent,
    resolve: {
      config: ConfigResolve,
      model: ModelResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];
