import { render, screen } from '@testing-library/react';
import App from './App';
import Sidebar from './Sidebar';
import SearchBox from './SearchBox';
import UserCard from './UserCard';
import WelcomeBanner from './WelcomeBanner';
import PhotoOfWeek from './PhotoOfWeek';
import OtherGreetings from './OtherGreetings';
import TeamPreview from './TeamPreview';
import LiveUpdates from './LiveUpdates';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
