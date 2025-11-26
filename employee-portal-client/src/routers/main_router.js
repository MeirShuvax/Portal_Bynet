import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Home from '../components/HomePage';
import About from '../components/AboutPage';
import SearchBox from '../components/SearchBox';
import HonorCarouselPage from '../components/HonorCarouselPage';
import CompanyTeam from '../components/CompanyTeam';
import CompanyPostsPage from '../components/CompanyPostsPage';
import OrganizationalChart from '../components/OrganizationalChart';
import ImportantLinks from '../components/ImportantLinks';
import UpdatesPage from '../components/UpdatesPage';
import ChatPage from '../components/ChatPage';
import ImageUploadPage from '../components/ImageUploadPage';
import AdminSettingsPage from '../components/AdminSettingsPage';
import AdminUsersPage from '../components/AdminUsersPage';
import AdminLinksPage from '../components/AdminLinksPage';
import AdminUpdatesPage from '../components/AdminUpdatesPage';
import AdminHonorsPage from '../components/AdminHonorsPage';

const MainRouter = ({ user }) => (
  <Routes>
    <Route path="/" element={<MainLayout user={user} />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="m" element={<SearchBox />} />
      <Route path="honors/:typeId" element={<HonorCarouselPage />} />
      <Route path="company-team" element={<CompanyTeam />} />
      <Route path="company-posts" element={<CompanyPostsPage />} />
      <Route path="organizational-chart" element={<OrganizationalChart />} />
      <Route path="important-links" element={<ImportantLinks />} />
      <Route path="updates" element={<UpdatesPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="admin" element={<AdminSettingsPage />} />
      <Route path="admin/settings" element={<AdminSettingsPage />} />
      <Route path="upload-images" element={<ImageUploadPage />} />
      <Route path="admin/users" element={<AdminUsersPage />} />
      <Route path="admin/links" element={<AdminLinksPage />} />
      <Route path="admin/updates" element={<AdminUpdatesPage />} />
      <Route path="admin/honors" element={<AdminHonorsPage />} />

      {/* כאן תוכל להוסיף ראוטים נוספים */}
    </Route>
  </Routes>
);

export default MainRouter;
