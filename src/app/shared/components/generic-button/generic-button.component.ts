import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Services */
import { SharedService } from '../../../shared/services/shared.service';
import { NgxAngoraService } from 'ngx-angora-css';

/* Pipes */
import { HarshifyPipe } from '../../../shared/pipes/harshify.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html';

/* Libraries */
import { TooltipModule } from 'ngx-bootstrap/tooltip';

export type TAvailablePlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'generic-button',
  templateUrl: './generic-button.component.html',
  styleUrls: ['./generic-button.component.scss'],
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe, TooltipModule],
})
export class GenericButtonComponent implements OnInit {
  public randomId: string = '';

  @Input() type: string = 'customHTML';
  @Input() classButton: string = '';
  @Input() customHtml!: string;
  @Input() disabled: boolean = false;
  @Input() disabledClassButton: string = '';
  @Input() tooltip: string = '';
  @Input() placement: TAvailablePlacement = 'auto';
  @Input() tooltipClass: string = '';

  /* Output */
  @Output() clicked = new EventEmitter<any>();
  @Output() buttonId = new EventEmitter<any>();
  constructor(
    private _harshifyPipe: HarshifyPipe,
    private _sharedService: SharedService,
    private _ankService: NgxAngoraService
  ) {}

  ngOnInit(): void {
    this.randomId = this._harshifyPipe.transform(9, 'letters');
    this.buttonId.emit(this.randomId);
    if (this.classButton && typeof window !== 'undefined') {
      const angoraClasses = this.classButton
        .split(' ')
        .filter((c) => c !== '' && c.includes('ank-'));

      if (angoraClasses.length > 0) {
        this._ankService.updateClasses(angoraClasses);
      }
    }
  }

  getHtml() {
    return this._sharedService.getHTML(
      this.customHtml ? this.customHtml : this.type
    );
  }
}
