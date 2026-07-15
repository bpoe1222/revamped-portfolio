'use client';

import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const mailtoHref =
  'mailto:Contact@baileypoe.dev?subject=Portfolio%20Contact&body=Hi%20Bailey%2C%0A%0A';

const getFocusableElements = (container) =>
  Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );

function ContactFeedbackDialog({ status, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const isSuccess = status === 'success';
  const titleId = `contact-${status}-title`;
  const descriptionId = `contact-${status}-description`;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(dialogRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div className="contact-modal-backdrop" onKeyDown={handleKeyDown}>
      <section
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        ref={dialogRef}
      >
        {!isSuccess && (
          <button
            className="contact-modal__dismiss"
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
          >
            Close
          </button>
        )}

        <p className="contact-modal__status">{isSuccess ? 'Sent' : 'Error'}</p>
        <h2 id={titleId}>{isSuccess ? 'Message sent' : 'Message could not be sent'}</h2>
        <p id={descriptionId}>
          {isSuccess
            ? "Thanks for reaching out. I'll get back to you as soon as I can."
            : 'Something went wrong while sending your message. You can try again, or email me directly.'}
        </p>

        <div className="contact-modal__actions">
          {isSuccess ? (
            <button
              className="contact-modal__primary"
              type="button"
              onClick={onClose}
              ref={closeButtonRef}
            >
              Close
            </button>
          ) : (
            <>
              <button className="contact-modal__primary" type="button" onClick={onClose}>
                Try again
              </button>
              <a className="contact-modal__secondary" href={mailtoHref}>
                Email directly
              </a>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export const ContactUs = () => {
  const form = useRef();
  const submitButtonRef = useRef(null);
  const wasDialogOpen = useRef(false);
  const [formStatus, setFormStatus] = useState('idle');
  const isSubmitting = formStatus === 'submitting';
  const dialogStatus = formStatus === 'success' || formStatus === 'error' ? formStatus : null;

  useEffect(() => {
    if (!dialogStatus && wasDialogOpen.current) {
      submitButtonRef.current?.focus();
    }

    wasDialogOpen.current = Boolean(dialogStatus);
  }, [dialogStatus]);

  const closeDialog = () => {
    setFormStatus('idle');
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setFormStatus('submitting');

    emailjs.sendForm('service_6sw93ah', 'template_hi6tylm', form.current, 'DzhXM2GUAzn3AEAEc')
      .then(() => {
        setFormStatus('success');
        form.current.reset();
      }, () => {
        setFormStatus('error');
      });
  };

  return (
    <>
      <form className="contact-form" ref={form} onSubmit={sendEmail} aria-busy={isSubmitting}>
        <div className="contact-form__field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" type="text" name="name" autoComplete="name" required />
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" type="email" name="email" autoComplete="email" required />
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" required />
        </div>

        {/* Hidden field to populate {{title}} in your subject line */}
        <input type="hidden" name="title" value="Contact Form" />

        <button type="submit" disabled={isSubmitting} ref={submitButtonRef}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {dialogStatus && <ContactFeedbackDialog status={dialogStatus} onClose={closeDialog} />}
    </>
  );
};
