import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'accordion-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="accordion-group" [class]="panelClass">
      <div class="accordion-header">
        <ng-content select="[slot=header]"></ng-content>
      </div>
      <div class="accordion-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .accordion-group {
      border-bottom: 1px solid #ddd;
    }
    .accordion-header {
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #ddd;
      cursor: pointer;
    }
    .accordion-body {
      padding: 15px;
    }
  `]
})
export class AccordionGroupComponent {
  @Input() panelClass: string = '';
}
