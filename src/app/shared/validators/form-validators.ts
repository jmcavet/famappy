import { AbstractControl, ValidationErrors } from '@angular/forms';

export function numberValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;

  return isNaN(value) ? { notANumber: true } : null;
}

export function pastDateValidator(
  control: AbstractControl
): ValidationErrors | null {
  const currentDate = new Date();
  const inputDate = new Date(control.value);

  return inputDate < currentDate ? null : { pastDate: true };
}
