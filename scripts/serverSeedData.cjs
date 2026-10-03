const INITIAL_EVENTS = [
  {
    title: 'Season of Commits',
    year: 2025,
    date: '2025-01-13',
    description: 'A month-long initiative focused on mentoring TKMCE students into active open-source contributors with real-world pull requests.',
    category: 'HACKATHON',
    coverImage: '/events/2025/season-of-commits-poster.jpg',
    highlights: ['Git / GitHub Mentorship', 'Real repo PR sprints', 'FOSS Swag & Certificates'],
    status: 'COMPLETED',
    location: 'TKMCE Campus / GitHub'
  },
  {
    title: 'DevOps & Cloud Native Tooling',
    year: 2025,
    date: '2025-02-15',
    description: 'Hands-on deep dive into Docker containers, automated CI/CD pipelines, reproducible builds, and Linux systems administration.',
    category: 'WORKSHOP',
    coverImage: '/events/2025/devops-workshop-poster.jpg',
    highlights: ['Containerization with Docker', 'GitHub Actions CI/CD', 'Self-hosting FOSS services'],
    status: 'COMPLETED',
    location: 'APJ Abdul Kalam Computer Centre, TKMCE'
  },
  {
    title: 'Santa FOSS Sketch',
    year: 2024,
    date: '2024-12-25',
    description: 'Festive community creative coding sprint using Inkscape, Blender, and open-source generative art frameworks.',
    category: 'COMMUNITY',
    coverImage: '/events/2024/santa-foss-sketch-poster.jpg',
    highlights: ['Inkscape Vector Graphics', 'Creative Commons Art', 'Generative Python Sketches'],
    status: 'COMPLETED',
    location: 'Online / Discord'
  },
  {
    title: 'Hacktoberfest TKMCE',
    year: 2024,
    date: '2024-10-18',
    description: 'Annual global celebration of Free and Open Source software. First-time contributors onboarded to upstream repositories.',
    category: 'HACKATHON',
    coverImage: '/events/2024/hacktoberfest-poster.jpg',
    highlights: ['First PR walkthroughs', 'Open source ethics', 'Maintainer talks'],
    status: 'COMPLETED',
    location: 'Mechanical Seminar Hall, TKMCE'
  },
  {
    title: 'Student Induction Program (SIP)',
    year: 2024,
    date: '2024-11-05',
    description: 'Welcoming the incoming freshmen to the world of GNU/Linux, terminal productivity, and software freedom.',
    category: 'COMMUNITY',
    coverImage: '/events/2024/sip-poster.jpg',
    highlights: ['Why FOSS matters', 'Terminal 101', 'Dual boot clinic'],
    status: 'COMPLETED',
    location: 'Main Auditorium, TKMCE'
  },
  {
    title: 'GitHub Guide 101',
    year: 2024,
    date: '2024-09-20',
    description: 'Comprehensive practical session on Git version control, branching models, resolving merge conflicts, and remote teamwork.',
    category: 'WORKSHOP',
    coverImage: '/events/2024/github-guide-poster.jpg',
    highlights: ['CLI Git Mastery', 'Merge conflict resolution', 'Interactive PR reviews'],
    status: 'COMPLETED',
    location: 'CS Lab 2, TKMCE'
  },
  {
    title: 'Beyond Code',
    year: 2024,
    date: '2024-08-10',
    description: 'Exploring non-code contributions in Free Software: documentation, technical writing, UI/UX, localization, and community advocacy.',
    category: 'TALK',
    coverImage: '/events/2024/beyond-code-poster.jpg',
    highlights: ['Technical documentation', 'Open source licensing', 'Accessibility in FOSS'],
    status: 'COMPLETED',
    location: 'Civil Seminar Hall, TKMCE'
  },
  {
    title: 'FOSS Cell Orientation 2024',
    year: 2024,
    date: '2024-07-28',
    description: 'The foundation talk outlining the vision, past projects, upcoming roadmap, and cultural ethos of FOSS Cell TKMCE.',
    category: 'TALK',
    coverImage: '/events/2024/orientation-poster.jpg',
    highlights: ['Free Software philosophy', 'Roadmap for 2024-25', 'Open Q&A'],
    status: 'COMPLETED',
    location: 'Main Auditorium, TKMCE'
  }
];

const INITIAL_EXECOM = [
  { name: 'Dr. Aneesh G Nath', role: 'Faculty Coordinator', tenure: '2024-25', isCurrent: false, photo: '/people/Aneesh G Nath.jpg', order: 1 },
  { name: 'Yoshua Immanuel Raju', role: 'Chairperson', tenure: '2024-25', isCurrent: false, photo: '/people/Yoshua Immanuel Raju.jpg', order: 2 },
  { name: 'Sudheep T Pillai', role: 'PC Head', tenure: '2024-25', isCurrent: false, photo: '/people/Sudheep T Pillai.jpg', order: 3 },
  { name: 'Muhzin Muhammed', role: 'PC Head', tenure: '2024-25', isCurrent: false, photo: '/people/Muhzin Muhammed.jpeg', order: 4 },
  { name: 'Aromal R M', role: 'Tech Head', tenure: '2024-25', isCurrent: false, photo: '/people/Aromal R M.jpg', order: 5 },
  { name: 'Akash Prasad', role: 'Tech Head', tenure: '2024-25', isCurrent: false, photo: '/people/Akash Prasad.jpg', order: 6 },
  { name: 'Arshak Muhammed PK', role: 'Web Head', tenure: '2024-25', isCurrent: false, photo: '/people/Arshak Muhammed PK.jpeg', order: 7 },
  { name: 'Sheron Rajesh', role: 'Web Team', tenure: '2024-25', isCurrent: false, photo: '/people/Sheron Rajesh.jpg', order: 8 },
  { name: 'Aron Mathew Tom', role: 'Design Head', tenure: '2024-25', isCurrent: false, photo: '/people/Aron Mathew Tom.jpg', order: 9 },
  { name: 'Abhiram Arun', role: 'Design Head', tenure: '2024-25', isCurrent: false, photo: '/people/Abhiram Arun.jpg', order: 10 },
  { name: 'Devanand M S', role: 'Outreach Head', tenure: '2024-25', isCurrent: false, photo: '/people/Devanand M S.jpg', order: 11 },
  { name: 'Teresa Shelly', role: 'Outreach Head', tenure: '2024-25', isCurrent: false, photo: '/people/Teresa Shelly.jpeg', order: 12 },
  { name: 'Adelyn Kishore', role: 'Documentation Head', tenure: '2024-25', isCurrent: false, photo: '/people/Adelyn Kishore.jpg', order: 13 },
  { name: 'Christina T Sunil', role: 'Documentation Head', tenure: '2024-25', isCurrent: false, photo: '/people/Christina T Sunil.jpg', order: 14 },
  { name: 'Aarya Tejaswini J', role: 'PC Team', tenure: '2024-25', isCurrent: false, photo: '/people/Aarya Tejaswini J.jpg', order: 15 },
  { name: 'A C Govardhan', role: 'PC Team', tenure: '2024-25', isCurrent: false, photo: '/people/A C Govardhan.jpg', order: 16 },
  { name: 'Rasha Ameena', role: 'Design Team', tenure: '2024-25', isCurrent: false, photo: '/people/Rasha Ameena.jpg', order: 17 },
  { name: 'Labeeba M', role: 'Documentation Team', tenure: '2024-25', isCurrent: false, photo: '/people/Labeeba M.jpg', order: 18 }
];

const INITIAL_SETTINGS = {
  clubName: 'FOSS Cell TKMCE',
  tagline: 'Freedom to Learn, Share, and Hack.',
  manifesto: 'Promoting software freedom, open hardware, privacy, and digital autonomy since 2012 at TKM College of Engineering, Kollam.',
  email: 'fosscelltkmce@gmail.com',
  github: 'https://github.com/tkmfoss',
  instagram: 'https://instagram.com/tkmfoss',
  discord: 'https://discord.gg/uXrWyWqvWx'
};

module.exports = {
  INITIAL_EVENTS,
  INITIAL_EXECOM,
  INITIAL_SETTINGS
};
