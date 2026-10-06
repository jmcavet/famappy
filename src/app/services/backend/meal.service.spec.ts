import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MealBackendService } from './meal.service';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './generic.service';
import { NgxImageCompressService } from 'ngx-image-compress';

describe('MealBackendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MealBackendService,
        {
          provide: AuthService,
          useValue: {
            user: signal(null),
          },
        },
        {
          provide: FirebaseService,
          useValue: {},
        },
        {
          provide: FirestoreService,
          useValue: {
            loadFirestoreCollection: jasmine.createSpy(
              'loadFirestoreCollection',
            ),
          },
        },
        {
          provide: NgxImageCompressService,
          useValue: {},
        },
      ],
    });
  });

  it('should not stay in loading state when no user is signed in', () => {
    const service = TestBed.inject(MealBackendService);

    expect(service.loading()).toBeFalse();
  });
});
