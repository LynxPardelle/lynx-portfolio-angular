import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IButton } from '../../interfaces/button';
@Component({
  selector: 'generic-group-buttons',
  templateUrl: './generic-group-buttons.component.html',
  styleUrls: ['./generic-group-buttons.component.scss'],
  standalone: false,
})
export class GenericGroupButtonsComponent implements OnInit {
  @Input() buttons: IButton[] = [];
  @Input() buttonComboClass: string =
    'd-inline-block mx-auto mat-elevation-z1 ank ank-rounded-10px';

  /* Output */
  @Output() clicked = new EventEmitter<any>();
  @Output() buttonId = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {}
}
