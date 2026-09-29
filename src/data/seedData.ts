import { FosEvent, ExecomMember, Announcement, PostEventReport, ClubSettings } from '../types';

export const INITIAL_EVENTS: Omit<FosEvent, 'id'>[] = [
  {
    title: 'Season of Commits 2025',
    year: 2025,
    date: '2025-01-13',
    time: '17:00 IST',
    description: 'A month-long initiative focused on mentoring TKMCE students into active open-source contributors with real-world pull requests.',
    category: 'HACKATHON',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Git / GitHub Mentorship', 'Real repo PR sprints', 'FOSS Swag & Certificates'],
    status: 'COMPLETED',
    location: 'TKMCE Campus / GitHub',
    registrationUrl: 'https://foss.tkmce.ac.in/soc-2025',
    registrationOpen: false,
    maxSeats: 150
  },
  {
    title: 'DevOps & Cloud Native Tooling',
    year: 2025,
    date: '2025-02-15',
    time: '09:30 IST',
    description: 'Hands-on deep dive into Docker containers, automated CI/CD pipelines, reproducible builds, and Linux systems administration.',
    category: 'WORKSHOP',
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Containerization with Docker', 'GitHub Actions CI/CD', 'Self-hosting FOSS services'],
    status: 'COMPLETED',
    location: 'APJ Abdul Kalam Computer Centre, TKMCE',
    registrationUrl: '',
    registrationOpen: false,
    maxSeats: 80
  },
  {
    title: 'FOSS Hack & Open Sprint 2026',
    year: 2026,
    date: '2026-10-15',
    time: '10:00 IST',
    description: 'Annual flagship 36-hour hackathon for building libre software, privacy-first tools, and decentralized networks.',
    category: 'HACKATHON',
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Cash prizes worth 50k', 'Mentorship from OSS maintainers', 'Free food & stickers'],
    status: 'UPCOMING',
    location: 'Main Auditorium & Labs, TKMCE',
    registrationUrl: 'https://foss.tkmce.ac.in/register/fosshack26',
    registrationOpen: true,
    maxSeats: 200,
    contactPerson: 'chair@foss.tkmce.ac.in'
  },
  {
    title: 'Linux Kernel & C Deep Dive',
    year: 2026,
    date: '2026-11-04',
    time: '16:00 IST',
    description: 'Demystifying syscalls, memory layouts, virtual file systems, and compiling your very first custom Linux kernel patch.',
    category: 'TALK',
    coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80',
    highlights: ['VFS & Syscalls', 'Custom Kernel Compilation', 'Patch submission guidelines'],
    status: 'UPCOMING',
    location: 'Mechanical Seminar Hall, TKMCE',
    registrationUrl: 'https://foss.tkmce.ac.in/events/kernel',
    registrationOpen: true,
    maxSeats: 100
  },
  {
    title: 'Hacktoberfest TKMCE',
    year: 2024,
    date: '2024-10-18',
    time: '13:30 IST',
    description: 'Annual global celebration of Free and Open Source software. First-time contributors onboarded to upstream repositories.',
    category: 'HACKATHON',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    highlights: ['First PR walkthroughs', 'Open source ethics', 'Maintainer talks'],
    status: 'COMPLETED',
    location: 'Mechanical Seminar Hall, TKMCE',
    registrationOpen: false
  }
];

export const INITIAL_EXECOM: Omit<ExecomMember, 'id'>[] = [
  // Current Execom 2025-26
  { name: "Dr. Aneesh G Nath", role: "Faculty Coordinator", tenure: "2025-26", isCurrent: true, department: "Computer Science", order: 1 },
  { name: "Muhammed Rasal", role: "Chairperson", tenure: "2025-26", isCurrent: true, department: "Computer Science", github: "https://github.com", order: 2 },
  { name: "Aromal R M", role: "Vice Chair & Tech Lead", tenure: "2025-26", isCurrent: true, department: "Computer Science", github: "https://github.com", order: 3 },
  { name: "Sheron Rajesh", role: "Web Head", tenure: "2025-26", isCurrent: true, department: "ECE", github: "https://github.com", order: 4 },
  { name: "Arshak Muhammed PK", role: "Systems & DevOps Head", tenure: "2025-26", isCurrent: true, department: "Computer Science", github: "https://github.com", order: 5 },
  { name: "Devanand M S", role: "Outreach & Community Lead", tenure: "2025-26", isCurrent: true, department: "Mechanical", order: 6 },
  { name: "Christina T Sunil", role: "Documentation & Content Lead", tenure: "2025-26", isCurrent: true, department: "Civil", order: 7 },
  { name: "Aron Mathew Tom", role: "Design Head", tenure: "2025-26", isCurrent: true, department: "Architecture", order: 8 },

  // Past Execom 2024-25
  { name: "Yoshua Immanuel Raju", role: "Former Chairperson", tenure: "2024-25", isCurrent: false, department: "Computer Science", order: 1 },
  { name: "Sudheep T Pillai", role: "Former PC Head", tenure: "2024-25", isCurrent: false, department: "Computer Science", order: 2 },
  { name: "Muhzin Muhammed", role: "Former PC Head", tenure: "2024-25", isCurrent: false, department: "Computer Science", order: 3 },
  { name: "Akash Prasad", role: "Former Tech Head", tenure: "2024-25", isCurrent: false, department: "Computer Science", order: 4 },
  { name: "Abhiram Arun", role: "Former Design Head", tenure: "2024-25", isCurrent: false, department: "Mechanical", order: 5 },
  { name: "Teresa Shelly", role: "Former Outreach Head", tenure: "2024-25", isCurrent: false, department: "EEE", order: 6 },
  { name: "Adelyn Kishore", role: "Former Documentation Head", tenure: "2024-25", isCurrent: false, department: "ECE", order: 7 }
];

export const INITIAL_ANNOUNCEMENTS: Omit<Announcement, 'id'>[] = [
  {
    title: 'TKMFOSS Execom 2026-27 Applications Now Open!',
    content: 'We are seeking passionate students across all branches for Web Development, Linux Systems, UI/UX Design, Event Management, and Documentation teams.',
    category: 'RECRUITMENT',
    priority: 'PINNED',
    isActive: true,
    actionUrl: 'https://forms.gle/tkmfoss-execom-26',
    actionLabel: 'Apply Now',
    date: '2026-09-28'
  },
  {
    title: 'Weekly Terminal & FOSS Workshop Every Wednesday',
    content: 'Join us at the Central Computing Lab from 4:30 PM to 6:00 PM for hands-on GNU/Linux hacking, Vim tips, and open source collaboration.',
    category: 'GENERAL',
    priority: 'NORMAL',
    isActive: true,
    actionUrl: 'https://discord.gg/tkmfoss',
    actionLabel: 'Join Discord',
    date: '2026-09-25'
  },
  {
    title: 'Scheduled Maintenance: Git & Matrix Server Upgrade',
    content: 'The campus self-hosted Matrix server and Git mirror will undergo routine kernel patch updates on Sunday 02:00 AM to 04:00 AM.',
    category: 'ALERT',
    priority: 'URGENT',
    isActive: true,
    date: '2026-09-29'
  }
];

export const INITIAL_REPORTS: Omit<PostEventReport, 'id'>[] = [
  {
    title: 'Season of Commits 2025 - Concluding Report',
    eventDate: '2025-02-14',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    summary: 'Season of Commits concluded with over 140 student participants and 320 merged pull requests across notable open source repositories including Mozilla, Oppia, and local Kerala FOSS tools.',
    attendeeCount: 142,
    speaker: 'TKMFOSS Senior Mentors & Alumni',
    outcomes: [
      '320+ merged upstream pull requests',
      '68 first-time Git and GitHub contributors onboarded',
      '5 student projects accepted into state open source showcase'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
    ],
    driveFolderUrl: 'https://drive.google.com/drive/folders/tkmfoss-soc-2025',
    reportDocUrl: 'https://docs.google.com/document/d/tkmfoss-soc-2025-report',
    submittedBy: 'Christina T Sunil (Doc Lead)'
  }
];

export const INITIAL_SETTINGS: ClubSettings = {
  clubName: 'TKMFOSS',
  tagline: 'TKMCE Free and Open Source Software Cell',
  manifesto: 'Promoting software freedom, open hardware, privacy, and digital autonomy since 2012 at TKM College of Engineering, Kollam.',
  email: 'foss@tkmce.ac.in',
  github: 'https://github.com/tkmfoss',
  instagram: 'https://instagram.com/tkmfoss',
  discord: 'https://discord.gg/tkmfoss',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: ''
};
