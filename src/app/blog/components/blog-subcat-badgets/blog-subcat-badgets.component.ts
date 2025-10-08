import { Component, Input } from '@angular/core';
/* Interfaces */
import { IArticleSubCat } from '../../interfaces/blog';
@Component({
  selector: 'blog-subcat-badgets',
  templateUrl: './blog-subcat-badgets.component.html',
  styleUrls: ['./blog-subcat-badgets.component.scss'],
  standalone: false,
})
export class BlogSubCatBadgetsComponent {
  @Input() subcats!: IArticleSubCat[];
  @Input() lang: string = 'es';
  constructor() {}
}
