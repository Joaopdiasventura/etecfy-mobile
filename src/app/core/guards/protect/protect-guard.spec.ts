import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { protectGuard } from './protect-guard';

describe('protectGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => protectGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
