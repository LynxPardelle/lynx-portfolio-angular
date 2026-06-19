import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSubCatBadgetsComponent } from './blog-subcat-badgets.component';

describe('BlogSubcatBadgetsComponent', () => {
  let component: BlogSubCatBadgetsComponent;
  let fixture: ComponentFixture<BlogSubCatBadgetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlogSubCatBadgetsComponent]
    });
    fixture = TestBed.createComponent(BlogSubCatBadgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
