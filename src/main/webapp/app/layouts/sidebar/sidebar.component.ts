import { Component } from '@angular/core';
import { LayoutService } from '../layout.service';
import * as _ from 'lodash';
import * as jsyaml from 'js-yaml';
import { HttpClient } from '@angular/common/http';
import { filter, map } from 'rxjs';

@Component({
  selector: 'jhi-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  sidebarConfig: any;
  _ = _;

  constructor(private layoutService: LayoutService, private httpClient: HttpClient) {
    this.loadMenu();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  loadMenu(): void {
    this.httpClient
      .get(SERVER_API_URL + `assets/menu/sidebar.yaml`, { responseType: 'text', observe: 'response' })
      .pipe(
        filter(res => res.ok),
        map(res => jsyaml.load(res.body ?? ''))
      )
      .subscribe(res => (this.sidebarConfig = res));
  }
}
