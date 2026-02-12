import { render, screen } from '@testing-library/react';
import App from './App';

test('renders valentine question', () => {
  render(<App />);
  const linkElement = screen.getByText(/Will you be my Valentine/i);
  expect(linkElement).toBeInTheDocument();
});