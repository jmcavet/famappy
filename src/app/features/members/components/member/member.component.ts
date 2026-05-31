import {
  Component,
  computed,
  inject,
  input,
  Input,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MemberWithId } from './member.model';
import { MemberModalComponent } from '../member-modal/member-modal.component';
import { DatePipe } from '@angular/common';
import { MemberBackendService } from '../../../../services/backend/member.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ModalConfirmComponent } from '../../../../shared/layout/overlays/modal/modal-confirm/modal-confirm.component';
import { LoadingComponent } from '../../../../shared/layout/overlays/loading/loading.component';

@Component({
  selector: 'app-member',
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    MemberModalComponent,
    DatePipe,
    LoadingComponent,
  ],
  templateUrl: './member.component.html',
  styleUrl: './member.component.css',
})
export class MemberComponent {
  private modalService = inject(ModalService);
  private _formBuilder = inject(FormBuilder);

  /** Services */
  private memberBackendService = inject(MemberBackendService);

  /** Declaration of signals communicating with firestore */
  readonly memberIsBeingDeleted = this.memberBackendService.deleting;

  /** Declaration of local signals */
  title = signal<string>('Test');

  member = input.required<MemberWithId>();
  members = input.required<MemberWithId[]>();

  memberForm: FormGroup = this._formBuilder.group({});

  readonly pageIsRefreshing = computed(() => {
    return this.memberIsBeingDeleted();
  });

  ngOnInit(): void {
    this.memberForm = this._formBuilder.group({
      name: [this.member().name, Validators.required],
      sex: [this.member().sex, Validators.required],
      birthday: [this.member().birthday, Validators.required],
    });

    const index = this.members()
      .filter((member) => member.type === this.member().type)
      .findIndex((member) => member.name === this.member().name);

    this.title.set(
      `${this.capitalizeFirstLetter(this.member().type)} ${index + 1}`,
    );
  }

  capitalizeFirstLetter(str: string) {
    if (str.length === 0) return str; // Handle empty string case
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  openDeleteModal(event: MouseEvent, cuisineId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message:
          'Do you really want to remove this member? You will lose all your data...',
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.onRemoveMember(),
      },
    );
  }

  async onRemoveMember() {
    try {
      await this.memberBackendService.removeMemberFromStore(this.member().id);
    } catch (error) {
      console.error('Error removing member: ', error);
    }
  }
}
