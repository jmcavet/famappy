import { Component, inject, input, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../../shared/widgets/button/button.component';
import { MembersService } from '../../../services/members.service';
import { MemberWithId } from './member.model';
import { ModalConfirmComponent } from '../../../shared/modal-confirm/modal-confirm.component';
import { MemberModalComponent } from '../member-modal/member-modal.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-member',
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    ModalConfirmComponent,
    MemberModalComponent,
    DatePipe,
  ],
  templateUrl: './member.component.html',
  styleUrl: './member.component.css',
})
export class MemberComponent {
  private _formBuilder = inject(FormBuilder);

  title: string = 'Test';
  memberForm: FormGroup = this._formBuilder.group({});
  isLoading: boolean = false;
  showConfirmModal: boolean = false;

  member = input.required<MemberWithId>();
  members = input.required<MemberWithId[]>();
  message: string = '';

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    console.log('TRIGGERING NGONINIT.....');

    this.memberForm = this._formBuilder.group({
      name: [this.member().name, Validators.required],
      sex: [this.member().sex, Validators.required],
      birthday: [this.member().birthday, Validators.required],
    });

    const index = this.members()
      .filter((member) => member.type === this.member().type)
      .findIndex((member) => member.name === this.member().name);

    this.title = `${this.capitalizeFirstLetter(this.member().type)} ${
      index + 1
    }`;
  }

  async onUpdateMember() {
    if (this.memberForm.valid) {
      console.log('Form Submitted!', this.memberForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  capitalizeFirstLetter(str: string) {
    if (str.length === 0) return str; // Handle empty string case
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onConfirmRemoveMember() {
    // Open the Cancel/Confirm modal
    this.showConfirmModal = true;
  }

  onConfirmModalAction(confirm: boolean) {
    console.log('MY CONFIRM BOOLEAN: ', confirm);
    // Close the Cancel/Confirm modal
    this.showConfirmModal = false;

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.onRemoveMember();
    }
  }

  async onRemoveMember() {
    this.isLoading = true;

    try {
      this.membersService.removeMemberStoreById(this.member().id);
    } catch (error) {
      console.error('Error removing member: ', error);
    }
    this.isLoading = false;
  }
}
