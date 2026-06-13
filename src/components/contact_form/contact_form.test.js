import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import emailjs from '@emailjs/browser';
import { ContactUs } from './contact_form';

jest.mock('@emailjs/browser', () => ({
  sendForm: jest.fn(),
}));

const fillForm = () => {
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'Bailey Poe' },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'bailey@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/message/i), {
    target: { value: 'Hello from the portfolio form.' },
  });
};

describe('ContactUs', () => {
  let alertSpy;

  beforeEach(() => {
    emailjs.sendForm.mockReset();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test('shows a success dialog without using browser alerts', async () => {
    emailjs.sendForm.mockResolvedValueOnce({});
    render(<ContactUs />);

    fillForm();
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    expect(emailjs.sendForm).toHaveBeenCalledTimes(1);
    expect(emailjs.sendForm.mock.calls[0]).toEqual([
      expect.any(String),
      expect.any(String),
      expect.any(HTMLFormElement),
      expect.any(String),
    ]);

    const dialog = await screen.findByRole('dialog', { name: /message sent/i });
    expect(dialog).toHaveTextContent(/thanks for reaching out/i);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /back to site/i })).not.toBeInTheDocument();
    expect(alertSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(submitButton).toHaveFocus();
  });

  test('shows an error dialog with retry and email fallback', async () => {
    emailjs.sendForm.mockRejectedValueOnce(new Error('Email failed'));
    render(<ContactUs />);

    fillForm();
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    const dialog = await screen.findByRole('dialog', { name: /message could not be sent/i });
    expect(dialog).toHaveTextContent(/something went wrong/i);
    expect(screen.getByLabelText(/message/i, { selector: 'textarea' })).toHaveValue(
      'Hello from the portfolio form.'
    );
    expect(screen.getByRole('link', { name: /email directly/i })).toHaveAttribute(
      'href',
      'mailto:Contact@baileypoe.dev?subject=Portfolio%20Contact&body=Hi%20Bailey%2C%0A%0A'
    );
    expect(alertSpy).not.toHaveBeenCalled();

    fireEvent.keyDown(dialog.parentElement, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(submitButton).toHaveFocus();
  });
});
