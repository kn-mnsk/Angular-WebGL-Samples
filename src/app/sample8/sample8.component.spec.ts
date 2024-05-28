import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sample8Component } from './sample8.component';

describe('sample8Component', () => {
  let component: Sample8Component;
  let fixture: ComponentFixture<Sample8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sample8Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sample8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
