import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { MemberComponent } from './components/member/member.component';
import { MemberModalComponent } from './components/member-modal/member-modal.component';
import { MemberBackendService } from '../../services/backend/member.service';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { MemberWithId } from './components/member/member.model';

@Component({
  selector: 'app-members',
  imports: [
    MemberComponent,
    FormsModule,
    CommonModule,
    ButtonComponent,
    MemberModalComponent,
    LoadingComponent,
    SegmentedControlComponent,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent {
  /** Services */
  private memberBackendService = inject(MemberBackendService);
  private location = inject(Location);

  /** Declaration of signals communicating with firestore */
  readonly dbMembers: Signal<MemberWithId[]> =
    this.memberBackendService.members;
  readonly isLoading = this.memberBackendService.loading;

  /** Declaration of local signals */
  memberType = signal<string>('parent');
  readonly modalTitle = signal<string>('Enter new parent');
  readonly parentCount = computed(
    () => this.dbMembers().filter((member) => member.type === 'parent').length,
  );
  readonly memberCount = computed(
    () =>
      this.dbMembers().filter(
        (member) => member.type === this.memberType(),
      ).length,
  );
  readonly visibleMembers = computed(() =>
    this.dbMembers().filter((member) => member.type === this.memberType()),
  );
  readonly addMemberDisabled = computed(
    () => this.memberType() === 'parent' && this.parentCount() >= 2,
  );

  toggleMember(member: string) {
    this.memberType.update(() => member);
    this.modalTitle.set(`Enter new ${this.memberType()}`);
  }

  goBack() {
    this.location.back();
  }

  // showParents() {
  //   this.memberType.set('parent');
  //   this.modalTitle.set(`Enter new ${this.memberType}`);
  // }

  // showChildren() {
  //   this.memberType.set('child');
  //   this.modalTitle.set(`Enter new ${this.memberType}`);
  // }

}
