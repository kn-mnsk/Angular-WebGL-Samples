import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sample6Component } from './sample6.component';

describe('Sample6Component', () => {
  let component: Sample6Component;
  let fixture: ComponentFixture<Sample6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sample6Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sample6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
