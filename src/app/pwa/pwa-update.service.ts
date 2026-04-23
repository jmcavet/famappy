import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  constructor(private swUpdate: SwUpdate) {
    if (this.swUpdate.isEnabled) {
      // Check for updates immediately when the app starts
      this.swUpdate.checkForUpdate();

      // When a new version is available, activate it immediately
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          // Reload the app to activate the new version
          document.location.reload();
        }
      });
    }
  }
}
