import { lazy } from 'react';

const About = lazy(() => import("../pages/About"))

const coreRoutes = [
  {
    path: '/about',
    title: 'About',
    component: About,
  },
];

const routes = [...coreRoutes];
export default routes;
