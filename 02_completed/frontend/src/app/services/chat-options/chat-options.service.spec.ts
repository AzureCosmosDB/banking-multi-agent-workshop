import { TestBed } from '@angular/core/testing';

import { ChatOptionsService } from './chat-options.service';

describe('ChatOptionsService', () => {
  let service: ChatOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
