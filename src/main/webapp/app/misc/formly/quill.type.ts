import { Component, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
// + HttpClient
import { HttpClient } from '@angular/common/http';

import * as _ from 'lodash';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'jhi-formly-field-quill',
  template: `
    <div [innerHTML]="formControl.value" *ngIf="to.disabled || to.readonly"></div>
    <div class="d-none">
      <input #quillFile type="file" (change)="quillFileSelected($event)" />
    </div>
    <quill-editor
      *ngIf="!to.disabled && !to.readonly"
      (onEditorCreated)="getEditorInstance($event)"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [styles]="to.styles"
    >
    </quill-editor>
  `,
})
export class QuillTypeComponent extends FieldType {
  formControl!: FormControl;
  defaultOptions = {
    wrappers: ['form-group'],
    templateOptions: { styles: { height: '150px' } },
  };
  fileToUpload: any;
  @ViewChild('quillFile', { static: true }) quillFileRef: any;
  meQuillRef: any;

  constructor(private httpClient: HttpClient) {
    super();
  }
  getEditorInstance(editorInstance: any): void {
    this.meQuillRef = editorInstance;
    const toolbar = editorInstance.getModule('toolbar');
    toolbar.addHandler('image', () => this.customImageUpload());
  }

  customImageUpload(): void {
    /* Here we trigger a click action on the file input field, this will open a file chooser on a client computer */
    this.quillFileRef.nativeElement.click();
  }

  quillFileSelected(ev: any): void {
    /* After the file is selected from the file chooser, we handle the upload process */
    this.fileToUpload = ev.target.files[0];
    const formData = new FormData();
    formData.append('file', this.fileToUpload, this.fileToUpload.name);
    this.httpClient
      .post(SERVER_API_URL + _.get(this.to, 'apiEndpoint', 'api/upload'), formData, { responseType: 'text' })
      .subscribe((fileId: string) => {
        const range = this.meQuillRef.getSelection(true);
        const img = '<img class="img-within" src="' + this.getFileSrc(fileId) + '"></img>';
        this.meQuillRef.clipboard.dangerouslyPasteHTML(range.index, img);
      });
  }

  getFileSrc(fileId: any): string {
    return this.to.getFileSrc
      ? this.to.getFileSrc(fileId)
      : this.to.fileSrc
      ? this.to.fileSrc.replace('${fileId}', fileId)
      : SERVER_API_URL + _.get(this.to, 'apiEndpoint', 'api/public/gridfs') + `/${fileId}`;
  }
}
