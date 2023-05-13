import React from 'react';
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { PAGE_URL } from 'assets/static/url';
import { LAYOUT_COMMON, LINKS, NAV_LINKS } from 'assets/static/layout';

import { ProfilePage } from 'components/pages/profile';
import { ProjectPage } from 'components/pages/project';

import { Layout } from 'components/Layout';

// prettier-ignore
export const RouterProvider = () =>
  <BrowserRouter>
    <Routes>
      <Route path={PAGE_URL.root} element={<Layout common={LAYOUT_COMMON} navLinks={NAV_LINKS} links={LINKS} />}>
        <Route path={PAGE_URL.profile} element={<ProfilePage />} />
        <Route path={PAGE_URL.main} element={<>main</>} />
        <Route path={PAGE_URL.about} element={<>about</>} />
        <Route path={PAGE_URL.projects}>
          <Route index element={<>projects</>} />
          <Route path={':id'} element={<ProjectPage />} />
        </Route>
        <Route path={PAGE_URL.tests} element={<>tests</>} />
        <Route path={PAGE_URL.news} element={<>news</>} />
        <Route path={PAGE_URL.metrics} element={<>metrics</>} />
      </Route>
    </Routes>
  </BrowserRouter>;
