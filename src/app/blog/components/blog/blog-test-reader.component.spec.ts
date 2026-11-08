import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AdminSession } from '../../../auth/admin-session.service';
import { BlogTestReader } from './blog-test-reader.component';

describe('BlogTestReader', () => {
  it('requests a private list and reads an article only when an admin opens it', async () => {
    const item = { slug: 'muestra', title: 'Muestra', titleEng: 'Sample', category: 'test', tags: ['test'], subcategories: [] };
    const role = signal<string | null>(null);
    const request = jasmine.createSpy('request').and.returnValues(
      Promise.resolve({ articles: [item] }),
      Promise.resolve({ article: { ...item, html: '<p>Contenido privado</p>', htmlEng: '<p>Private content</p>' } }),
    );
    const login = jasmine.createSpy('login').and.resolveTo(undefined);
    TestBed.configureTestingModule({ imports: [BlogTestReader], providers: [
      { provide: AdminSession, useValue: { role, request, login } },
    ] });
    const fixture = TestBed.createComponent(BlogTestReader);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector('button')!.click();
    expect(login).toHaveBeenCalledWith('/blog');
    await fixture.whenStable();
    role.set('editor');
    fixture.detectChanges();
    expect(element.querySelector('button')).toBeNull();
    expect(request).not.toHaveBeenCalled();
    role.set('admin');
    fixture.detectChanges();
    element.querySelector('button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(request).toHaveBeenCalledWith('GET', 'editorial/test-articles');
    element.querySelector<HTMLButtonElement>('section button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(request).toHaveBeenCalledWith('GET', 'editorial/test-articles/muestra');
    expect(element.querySelector('article')?.textContent).toContain('Contenido privado');
    role.set(null);
    fixture.detectChanges();
    expect(element.querySelector('article')).toBeNull();
  });
});
