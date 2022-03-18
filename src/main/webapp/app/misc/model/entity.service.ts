import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';

export type EntityResponseType = HttpResponse<any>;
export type EntityArrayResponseType = HttpResponse<any[]>;

@Injectable({ providedIn: 'root' })
export class EntityService {
  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(entity: any, apiEndpoint: string, microservice?: string): Observable<EntityResponseType> {
    const resourceUrl = this.applicationConfigService.getEndpointFor(apiEndpoint, microservice);
    const copy = this.convertDateFromClient(entity);
    return this.http
      .post<any>(resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(entity: any, apiEndpoint: string, microservice?: string): Observable<EntityResponseType> {
    const resourceUrl = this.applicationConfigService.getEndpointFor(apiEndpoint, microservice);
    const copy = this.convertDateFromClient(entity);
    return this.http
      .put<any>(`${resourceUrl}/${entity.id}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(entity: any, apiEndpoint: string, microservice?: string): Observable<EntityResponseType> {
    const resourceUrl = this.applicationConfigService.getEndpointFor(apiEndpoint, microservice);
    const copy = this.convertDateFromClient(entity);
    return this.http
      .patch<any>(`${resourceUrl}/${entity.id}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: string | number, apiEndpoint: string, microservice?: string): Observable<EntityResponseType> {
    const resourceUrl = this.applicationConfigService.getEndpointFor(apiEndpoint, microservice);
    return this.http
      .get<any>(`${resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req: any, apiEndpoint: string, microservice?: string): Observable<EntityArrayResponseType> {
    const resourceUrl = this.applicationConfigService.getEndpointFor(apiEndpoint, microservice);
    const options = createRequestOption(req);
    return this.http
      .get<any[]>(resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: string | number, apiEndpoint: string, microservice?: string): Observable<HttpResponse<{}>> {
    const resourceUrl = this.applicationConfigService.getEndpointFor(apiEndpoint, microservice);
    return this.http.delete(`${resourceUrl}/${id}`, { observe: 'response' });
  }

  addEntityToCollectionIfMissing(entityCollection: any[], ...entitiesToCheck: (any | null | undefined)[]): any[] {
    const entities: any[] = entitiesToCheck.filter(isPresent);
    if (entities.length > 0) {
      const entityCollectionIdentifiers = entityCollection.map(entityItem => entityItem.id!);
      const entitiesToAdd = entities.filter(entityItem => {
        const entityIdentifier = entityItem.id;
        if (entityIdentifier === null || entityCollectionIdentifiers.includes(entityIdentifier)) {
          return false;
        }
        entityCollectionIdentifiers.push(entityIdentifier);
        return true;
      });
      return [...entitiesToAdd, ...entityCollection];
    }
    return entityCollection;
  }

  protected convertDateFromClient(entity: any): any {
    return Object.assign({}, entity, {
      timestamp: entity.timestamp?.isValid() ? entity.timestamp.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.timestamp = res.body.timestamp ? dayjs(res.body.timestamp) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((entity: any) => {
        entity.timestamp = entity.timestamp ? dayjs(entity.timestamp) : undefined;
      });
    }
    return res;
  }
}
