import { render, screen } from '@testing-library/react';
import App from './App';

test('renders portfolio homepage', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /bailey poe/i })).toBeInTheDocument();
  expect(screen.getByText(/quality systems, program leadership/i)).toBeInTheDocument();
});
