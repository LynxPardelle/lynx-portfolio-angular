import { Component, Input } from '@angular/core';
/* Interfaces */
import { IArticleCat } from '../../interfaces/blog';
@Component({
  selector: 'blog-cat-badgets',
  templateUrl: './blog-cat-badgets.component.html',
  styleUrls: ['./blog-cat-badgets.component.scss'],
  standalone: false,
})
export class BlogCatBadgetsComponent {
  @Input() cats!: IArticleCat[] | any[];
  @Input() lang: string = 'es';
  constructor() {}
}
