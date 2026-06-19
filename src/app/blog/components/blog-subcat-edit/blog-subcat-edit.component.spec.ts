import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { BlogSubcatEditComponent } from './blog-subcat-edit.component';
import { GenericButtonComponent } from '../../../shared/components/generic-button/generic-button.component';
import { GenericDropdownComponent } from '../../../shared/components/generic-dropdown/generic-dropdown.component';
import { GenericGroupButtonsComponent } from '../../../shared/components/generic-group-buttons/generic-group-buttons.component';
import { GenericInputComponent } from '../../../shared/components/generic-input/generic-input.component';
import { HarshifyPipe } from '../../../shared/pipes/harshify.pipe';

describe('BlogSubcatEditComponent', () => {
  let component: BlogSubcatEditComponent;
  let fixture: ComponentFixture<BlogSubcatEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BlogSubcatEditComponent,
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
    fixture = TestBed.createComponent(BlogSubcatEditComponent);
    component = fixture.componentInstance;
    component.article = { cat: '', subCats: [] } as any;
    component.subCats = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
