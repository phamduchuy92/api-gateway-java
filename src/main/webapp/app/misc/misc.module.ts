import { NgModule } from '@angular/core';
// shared module
import { SharedModule } from '../shared/shared.module';
// material
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { OverlayModule } from '@angular/cdk/overlay';
// ngx-quill
import { QuillModule } from 'ngx-quill';
// ngx-color-picker
import { ColorPickerModule } from 'ngx-color-picker';
// ng-select
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
// ngx-formly
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
// ngx-mask
import { NgxMaskModule, IConfig } from 'ngx-mask';
// ngx-formly fields
import { ButtonTypeComponent } from './formly/button.type';
import { TimeTypeComponent } from './formly/timepicker.type';
import { DateTypeComponent } from './formly/datepicker.type';
import { RepeatTypeComponent } from './formly/repeat-section.type';
import { TabsTypeComponent } from './formly/tabs.type';
import { CardTypeComponent } from './formly/card.type';
import { AccordionTypeComponent } from './formly/accordion.type';
import { FileUploadTypeComponent } from './formly/file-upload.type';
import { FileValueAccessor } from './formly/file-value-accessor';
import { TemplateTypeComponent } from './formly/template.type';
import { FormlyValidators } from './formly/validators';
import { StepperTypeComponent } from './formly/stepper.type';
import { TabsetTypeComponent } from './formly/tabset.type';
import { TagsTypeComponent } from './formly/tags.type';
import { ChipsTypeComponent } from './formly/chips.type';
import { NgselectTypeComponent } from './formly/ng-select.type';
import { QuillTypeComponent } from './formly/quill.type';
import { ColorpickerTypeComponent } from './formly/colorpicker.type';
import { LeafletTypeComponent } from './formly/leaflet.type';
import { DatatableTypeComponent } from './formly/datatable.type';
import { CrudTableTypeComponent } from './formly/crud-table.type';
import { TreeTypeComponent } from './formly/tree';
import { DatetimeTypeComponent } from './formly/datetimepicker.type';
import { LibraryTypeComponent } from './formly/library.type';
// wrappers
import { FormGroupWrapperComponent } from './formly/form-group.wrapper';
import { FieldsetWrapperComponent } from './formly/fieldset.wrapper';
// utils
import { SafePipe } from './util/safe.pipe';
import { PriceTypeComponent } from './formly/price.type';
import { FileGridfsTypeComponent } from './formly/file-gridfs.type';

@NgModule({
  imports: [
    // + shared module,
    SharedModule,
    // + ng-select
    NgSelectModule,
    FormsModule,
    // + ngx-color-picker
    ColorPickerModule,
    // ngx-mask
    NgxMaskModule.forRoot(),
    // + material
    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
    // + ngx-formly
    ReactiveFormsModule,
    FormlyBootstrapModule,
    FormlyModule.forRoot({
      extras: { lazyRender: true },
      validators: [{ name: 'ip', validation: FormlyValidators.IpValidator }],
      validationMessages: [
        { name: 'required', message: 'This field is required.' },
        {
          name: 'minlength',
          message: FormlyValidators.minlengthValidationMessage,
        },
        {
          name: 'maxlength',
          message: FormlyValidators.maxlengthValidationMessage,
        },
        { name: 'min', message: FormlyValidators.minValidationMessage },
        { name: 'max', message: FormlyValidators.maxValidationMessage },
        { name: 'ip', message: FormlyValidators.IpValidatorMessage },
      ],
      wrappers: [
        { name: 'fieldset', component: FieldsetWrapperComponent },
        { name: 'form-group', component: FormGroupWrapperComponent },
      ],
      types: [
        { name: 'template', component: TemplateTypeComponent },
        { name: 'button', component: ButtonTypeComponent },
        { name: 'time', component: TimeTypeComponent },
        { name: 'date', component: DateTypeComponent },
        { name: 'card', component: CardTypeComponent },
        { name: 'accordion', component: AccordionTypeComponent },
        { name: 'tabs', component: TabsTypeComponent },
        { name: 'tabset', component: TabsetTypeComponent },
        { name: 'file-upload', component: FileUploadTypeComponent },
        { name: 'repeat', component: RepeatTypeComponent },
        { name: 'stepper', component: StepperTypeComponent },
        { name: 'tags', component: TagsTypeComponent },
        { name: 'quill', component: QuillTypeComponent },
        { name: 'ng-select', component: NgselectTypeComponent },
        { name: 'chips', component: ChipsTypeComponent },
        { name: 'color', component: ColorpickerTypeComponent },
        { name: 'map-marker', component: LeafletTypeComponent },
        { name: 'datatable', component: DatatableTypeComponent },
        { name: 'crud-table', component: CrudTableTypeComponent },
        { name: 'tree', component: TreeTypeComponent },
        { name: 'datetime', component: DatetimeTypeComponent },
        { name: 'library', component: LibraryTypeComponent },
        { name: 'price', component: PriceTypeComponent },
        { name: 'file-gridfs', component: FileGridfsTypeComponent },
      ],
    }),
    // + ngx-quill
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'], // toggled buttons
          ['blockquote', 'code-block'],

          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
          [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          [{ color: [] }, { background: [] }], // dropdown with defaults from theme
          [{ font: [] }],
          [{ align: [] }],

          ['clean'], // remove formatting button

          ['link', 'image', 'video'], // link and image, video
        ],
      },
    }),
  ],
  exports: [
    // + shared module
    SharedModule,
    // + material
    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
    // + formly
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    // + ng-select
    NgSelectModule,
    FormsModule,
    // + ngx-color-picker
    ColorPickerModule,
    // ngx-mask
    NgxMaskModule,
  ],
  declarations: [
    SafePipe,
    // + ngx-formly type
    TemplateTypeComponent,
    ButtonTypeComponent,
    TimeTypeComponent,
    DateTypeComponent,
    CardTypeComponent,
    RepeatTypeComponent,
    FileValueAccessor,
    AccordionTypeComponent,
    FileUploadTypeComponent,
    TabsTypeComponent,
    TabsetTypeComponent,
    TagsTypeComponent,
    NgselectTypeComponent,
    StepperTypeComponent,
    ChipsTypeComponent,
    QuillTypeComponent,
    FieldsetWrapperComponent,
    FormGroupWrapperComponent,
    ColorpickerTypeComponent,
    LeafletTypeComponent,
    DatatableTypeComponent,
    CrudTableTypeComponent,
    TreeTypeComponent,
    DatetimeTypeComponent,
    LibraryTypeComponent,
    PriceTypeComponent,
    FileGridfsTypeComponent,
  ],
  providers: [SafePipe],
})
export class MiscModule {}
