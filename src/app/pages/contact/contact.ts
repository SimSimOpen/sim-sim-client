import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

type Status = 'idle' | 'sending' | 'sent' | 'error';

// Same EmailJS service/template/public key as the Resume site's contact form.
const EMAILJS_SERVICE_ID = 'service_ra5n9cp';
const EMAILJS_TEMPLATE_ID = 'template_1joytjl';
const EMAILJS_PUBLIC_KEY = 'tldOTuEHVBX9rDvfU';

@Component({
  selector: 'app-contact',
  imports: [TranslatePipe, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  readonly phone = '+998 90 965 24 52';
  readonly phoneHref = 'tel:+998909652452';
  readonly email = 'jimishukurow@gmail.com';

  firstName = signal('');
  lastName = signal('');
  senderEmail = signal('');
  subject = signal('');
  message = signal('');
  status = signal<Status>('idle');

  isDisabled = computed(
    () =>
      !this.firstName().trim() ||
      !this.senderEmail().trim() ||
      !this.message().trim() ||
      this.status() === 'sending',
  );

  onEdit() {
    if (this.status() === 'sent' || this.status() === 'error') this.status.set('idle');
  }

  async send() {
    if (this.isDisabled()) return;
    this.status.set('sending');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: `${this.firstName().trim()} ${this.lastName().trim()}`.trim(),
          email: this.senderEmail().trim(),
          subject: this.subject().trim() || 'SimSim contact form',
          message: this.message().trim(),
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      this.firstName.set('');
      this.lastName.set('');
      this.senderEmail.set('');
      this.subject.set('');
      this.message.set('');
      this.status.set('sent');
    } catch (error) {
      console.error('Error sending email:', error);
      this.status.set('error');
    }
  }
}
