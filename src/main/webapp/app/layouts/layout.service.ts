import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  isSidebarPinned = false;
  isSidebarToggeled = false;

  toggleSidebar(): void {
    this.isSidebarToggeled = !this.isSidebarToggeled;
  }

  toggleSidebarPin(): void {
    this.isSidebarPinned = !this.isSidebarPinned;
  }

  getSidebarStatus(): any {
    return {
      isSidebarPinned: this.isSidebarPinned,
      isSidebarToggeled: this.isSidebarToggeled,
    };
  }
}
