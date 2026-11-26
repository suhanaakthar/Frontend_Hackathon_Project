import home from './HomePage.html?raw';
import login from './LoginPage.html?raw';
import register from './RegisterPage.html?raw';
import dashboard from './DashboardPage.html?raw';
import freelancers from './FreelancersPage.html?raw';
import jobs from './JobsPage.html?raw';
import profile from './ProfilePage.html?raw';
import postJob from './PostJobPage.html?raw';

export const pages = {
  '/': { html: home, title: 'FreelanceHub' },
  '/login': { html: login, title: 'Login — FreelanceHub' },
  '/register': { html: register, title: 'Sign Up — FreelanceHub' },
  '/dashboard': { html: dashboard, title: 'Dashboard — FreelanceHub' },
  '/freelancers': { html: freelancers, title: 'Find Freelancers — FreelanceHub' },
  '/jobs': { html: jobs, title: 'Find Jobs — FreelanceHub' },
  '/profile': { html: profile, title: 'Freelancer Profile — FreelanceHub' },
  '/post-job': { html: postJob, title: 'Post a Job — FreelanceHub' },
};
