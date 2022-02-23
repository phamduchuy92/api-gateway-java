import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as _ from 'lodash';

export class FormlyValidators {
  static minlengthValidationMessage(err: any, field: any): string {
    return `Should have atleast ${_.toString(field.templateOptions.minLength)} characters`;
  }

  static maxlengthValidationMessage(err: any, field: any): string {
    return `This value should be less than ${_.toString(field.templateOptions.maxLength)} characters`;
  }

  static minValidationMessage(err: any, field: any): string {
    return `This value should be more than ${_.toString(field.templateOptions.min)}`;
  }

  static maxValidationMessage(err: any, field: any): string {
    return `This value should be less than ${_.toString(field.templateOptions.max)}`;
  }

  static IpValidator(control: AbstractControl): ValidationErrors {
    return !control.value || /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? { ip: false } : { ip: true };
  }

  static IpValidatorMessage(err: any, field: FormlyFieldConfig): string {
    return `"${_.toString(field.formControl?.value)}" is not a valid IP Address`;
  }

  static dateFutureValidator(control: FormControl, field: FormlyFieldConfig, options = {}): ValidationErrors {
    return {
      'date-future': {
        message: `Validator options: ${JSON.stringify(options)}`,
      },
    };
  }

  static fieldMatchValidator(control: AbstractControl): any {
    const { password, passwordConfirm } = control.value;

    // avoid displaying the message error when values are empty
    if (!passwordConfirm || !password) {
      return null;
    }

    if (passwordConfirm === password) {
      return null;
    }

    return { fieldMatch: { message: 'Password Not Matching' } };
  }
}
