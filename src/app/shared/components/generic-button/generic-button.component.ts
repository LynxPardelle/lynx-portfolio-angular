import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Services */
import { SharedService } from 'src/app/shared/services/shared.service';

/* Pipes */
import { HarshifyPipe } from 'src/app/shared/pipes/harshify.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html';

/* Libraries */
import { NgxBootstrapExpandedFeaturesService } from 'ngx-bootstrap-expanded-features';
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
    private _befService: NgxBootstrapExpandedFeaturesService
  ) {}

  ngOnInit(): void {
    this.randomId = this._harshifyPipe.transform(9, 'letters');
    this.buttonId.emit(this.randomId);
    if (this.classButton && typeof window !== 'undefined') {
      this._befService.updateClasses(
        this.classButton
          .split(' ')
          .filter((c) => c !== '' && c.includes('bef-'))
      );
    }
    this.cssCreate();
  }

  getHtml() {
    return this._sharedService.getHTML(
      this.customHtml ? this.customHtml : this.type
    );
  }

  cssCreate() {
    if (typeof window !== 'undefined') {
      this._befService.cssCreate();
    }
  }
}
