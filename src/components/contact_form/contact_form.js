import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import './contact_form.scss';

export const ContactUs = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs.sendForm('service_6sw93ah', 'template_hi6tylm', form.current, 'DzhXM2GUAzn3AEAEc')
      .then(() => {
        alert("Message sent! I'll get back to you soon.");
        form.current.reset();
      }, () => {
        alert("Oops! Something went wrong.");
      });
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <label>Name</label>
      <input type="text" name="name" required />         {/* was "user_name" */}

      <label>Email</label>
      <input type="email" name="email" required />       {/* was "user_email" */}

      <label>Message</label>
      <textarea name="message" required />

      {/* Hidden field to populate {{title}} in your subject line */}
      <input type="hidden" name="title" value="Contact Form" />

      <button type="submit">Send</button>
    </form>
  );
};