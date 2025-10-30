import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Home from '../components/HomePage';
import About from '../components/AboutPage';
import SearchBox from '../components/SearchBox';
import HonorCarouselPage from '../components/HonorCarouselPage';
import CompanyTeam from '../components/CompanyTeam';
import OrganizationalChart from '../components/OrganizationalChart';
import ImportantLinks from '../components/ImportantLinks';
import UpdatesPage from '../components/UpdatesPage';
import ChatPage from '../components/ChatPage';

const MainRouter = ({ user }) => (
  <Routes>
    <Route path="/" element={<MainLayout user={user} />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="m" element={<SearchBox />} />
      <Route path="honors/:typeId" element={<HonorCarouselPage />} />
      <Route path="company-team" element={<CompanyTeam />} />
      <Route path="organizational-chart" element={<OrganizationalChart />} />
      <Route path="important-links" element={<ImportantLinks />} />
      <Route path="updates" element={<UpdatesPage />} />
      <Route path="chat" element={<ChatPage />} />

      {/* כאן תוכל להוסיף ראוטים נוספים */}
    </Route>
  </Routes>
);

export default MainRouter;
