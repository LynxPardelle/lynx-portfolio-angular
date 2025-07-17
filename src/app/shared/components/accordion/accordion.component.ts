import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="accordion" [attr.data-close-others]="closeOthers" [attr.data-animated]="isAnimated">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .accordion {
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class AccordionComponent {
  @Input() closeOthers: boolean = false;
  @Input() isAnimated: boolean = true;
}
