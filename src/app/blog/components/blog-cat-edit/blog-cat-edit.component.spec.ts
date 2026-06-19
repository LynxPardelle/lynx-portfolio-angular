import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { BlogCatEditComponent } from './blog-cat-edit.component';
import { GenericButtonComponent } from '../../../shared/components/generic-button/generic-button.component';
import { GenericDropdownComponent } from '../../../shared/components/generic-dropdown/generic-dropdown.component';
import { GenericGroupButtonsComponent } from '../../../shared/components/generic-group-buttons/generic-group-buttons.component';
import { GenericInputComponent } from '../../../shared/components/generic-input/generic-input.component';
import { HarshifyPipe } from '../../../shared/pipes/harshify.pipe';

describe('BlogCatEditComponent', () => {
  let component: BlogCatEditComponent;
  let fixture: ComponentFixture<BlogCatEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BlogCatEditComponent,
        GenericGroupButtonsComponent,
        GenericInputComponent,
      ],
      imports: [
        CommonModule,
        FormsModule,
        GenericButtonComponent,
        GenericDropdownComponent,
      ],
      providers: [
        HarshifyPipe,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { main: { loading: false }, sesion: { active: false } },
        }),
      ],
    });
    fixture = TestBed.createComponent(BlogCatEditComponent);
    component = fixture.componentInstance;
    component.article = { cat: '', subCats: [] } as any;
    component.cats = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
