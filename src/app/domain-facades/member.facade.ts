import { computed, inject, Injectable, Signal } from '@angular/core';
import { MemberBackendService } from '../services/backend/member.service';
import { MemberWithId } from '../features/members/components/member/member.model';

@Injectable({ providedIn: 'root' })
export class MemberDomainFacade {
  // Meal-related state services
  private memberBackendService = inject(MemberBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbMembers: Signal<MemberWithId[]> =
    this.memberBackendService.members;
  readonly membersLoading = this.memberBackendService.loading;

  readonly parents = computed<MemberWithId[]>(() =>
    this.dbMembers().filter((m) => m.type === 'parent'),
  );

  readonly children = computed<MemberWithId[]>(() =>
    this.dbMembers().filter((m) => m.type === 'child'),
  );

  readonly parentNames = computed(() => {
    return this.parents().map((parent) => parent.name);
  });

  readonly membersAreLoaded = computed(
    () => !this.membersLoading() && this.dbMembers().length > 0,
  );

  readonly membersAreNotYetRetrieved = computed(
    () => this.membersLoading() && this.dbMembers().length === 0,
  );
}
