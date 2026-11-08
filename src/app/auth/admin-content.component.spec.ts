import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import spanish from '../../../public/assets/i18n/es.json';
import english from '../../../public/assets/i18n/en.json';
import { AdminContent } from './admin-content.component';
import { AdminSession } from './admin-session.service';

describe('AdminContent', () => {
  let fixture: ComponentFixture<AdminContent>;
  let request: jasmine.Spy;

  async function open(collection: string) {
    request = jasmine.createSpy('request').and.callFake(async (method, path) => {
      if (path === 'admin/content') return { collections: {
        mains: { label: 'Inicio', fields: [
          ['profileHeadline', 'Titular', 'text'], ['profileSummaryEng', 'Resumen en inglés', 'long'], ['logo', 'Logo', 'media'],
        ] },
        websites: { label: 'Sitios', fields: [['title', 'Título', 'text'], ['desc', 'Descripción', 'long'], ['order', 'Orden', 'number']] },
      } };
      if (path === 'admin/media') return { files: [] };
      if (method === 'PUT') return { id: 'main', version: 1, values: {} };
      if (collection === 'mains') return { records: [{ id: 'main', version: 0,
        values: { profileHeadline: null, profileSummaryEng: null, logo: 'existing-file' },
      }] };
      return { records: [{ id: 'site', version: 0, values: { title: 'Sitio actual', desc: 'Descripción actual', order: 0 } }] };
    });
    TestBed.configureTestingModule({
      imports: [AdminContent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        { provide: AdminSession, useValue: { role: signal('admin'), request } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ collection })) } },
      ],
    });
    fixture = TestBed.createComponent(AdminContent);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
    expect(request).toHaveBeenCalledWith('GET', `admin/content/${collection}`);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('form')).withContext(element.textContent || '').not.toBeNull();
  }

  it('opens with the public profile copy and only submits the field the admin edits', async () => {
    await open('mains');
    const element = fixture.nativeElement as HTMLElement;
    const headline = element.querySelector<HTMLInputElement>('form input')!;
    expect(headline.value).toBe(spanish['portfolio.headline']);
    expect(element.querySelector<HTMLTextAreaElement>('form textarea')!.value).toBe(english['portfolio.summary']);
    expect(element.querySelector<HTMLSelectElement>('form select')!.selectedOptions[0]?.textContent).toContain('Archivo actual');
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    expect(request.calls.allArgs().some(([method]) => method === 'PUT')).toBeFalse();
    headline.value = 'Nuevo titular';
    headline.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    expect(request).toHaveBeenCalledWith('PUT', 'admin/content/mains/main', { values: { profileHeadline: 'Nuevo titular' }, version: 0 });
  });

  it('retains existing text and numeric zero for migrated records', async () => {
    await open('websites');
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector<HTMLInputElement>('form input:not([type="number"])')!.value).toBe('Sitio actual');
    expect(element.querySelector<HTMLTextAreaElement>('form textarea')!.value).toBe('Descripción actual');
    expect(element.querySelector<HTMLInputElement>('form input[type="number"]')!.value).toBe('0');
  });
});
