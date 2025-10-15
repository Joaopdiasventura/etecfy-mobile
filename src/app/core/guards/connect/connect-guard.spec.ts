import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { connectGuard } from './connect-guard';

describe('connectGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => connectGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
