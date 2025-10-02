import { TestBed } from '@angular/core/testing';

import { SessionService } from './conversations.service';

describe('ConversationsService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
