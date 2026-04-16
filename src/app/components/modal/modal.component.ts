import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { GlobalService } from '../../shared/services/global.service';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'handleEscape($event)',
  },
})
export class ModalComponent {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Input() closeOnBackdropClick = true;
  @Input() showCloseButton = true;
  @ViewChild('modalBody') modalBody!: ElementRef<HTMLDivElement>;

  private global = inject(GlobalService);

  openModal() {
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdropClick && event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  scrollToTop() {
    this.modalBody?.nativeElement?.scrollTo(0, 0);
  }

  // ✅ Close modal on Escape key
  handleEscape(event: Event) {
    if (this.isVisible && event instanceof KeyboardEvent && !this.global.ProductImageOpened) {
      this.closeModal();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible']) {
      this.toggleBodyScroll(changes['isVisible'].currentValue);
    }
  }

  ngOnDestroy() {
    // Safety net: always restore scroll when component is destroyed
    this.toggleBodyScroll(false);
  }

  private toggleBodyScroll(disable: boolean) {
    if (disable) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }
}
