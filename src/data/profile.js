// Single source of truth for everything the portfolio says about Hemant.
// All three views (terminal, ide, monitor) and the HTML head/noscript fallback
// read from here — edit content in this file only.
//
// Plain ESM with no JSX so vite.config.js can import it at build time.

export const profile = {
  name: 'Hemant Kumar',
  handle: 'hkumar',
  title: 'Software Engineer',
  focus: 'React Native',
  headline: 'Software Engineer · React Native',
  location: { city: 'New Delhi', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', tz: 'IST', remote: true },
  // Experience is counted from this month — keeps "4+ years" correct without edits.
  careerStart: '2022-10',
  site: 'https://hkumar.dev/',
  // Served from public/; resume.hkumar.dev redirects here (Cloudflare redirect rule).
  resume: { url: 'https://hkumar.dev/hemant-kumar-resume.pdf', share: 'https://resume.hkumar.dev', updated: '2026-10' },

  // Shown publicly as "open to …". Flip to false to hide every badge at once.
  status: { open: true, label: 'open to interesting opportunities' },

  summary:
    'Software Engineer building production software across mobile, web, backend, and cloud infrastructure, with a primary focus on React Native. Experienced in React Native architecture migrations, white-label mobile platforms, full-stack product development, production deployments, and end-to-end iOS/Android delivery.',

  // Short pitch lines reused in the og/meta description and terminal boot screen.
  pitch: [
    'React Native · white-label apps · New Architecture',
    'web, backend & AWS infra · App Store + Google Play',
  ],

  stats: { brands: '200+', users: '50k+' },

  // Contact details are stored reversed + base64-encoded so they never appear
  // as plain text in the HTML or JS bundle. Decode with lib/contact.js.
  contact: {
    email: 'dmVkLnJhbXVraEBrcm93',
    phone: 'NzYzMDQxNzUwNzE5Kw==',
  },

  links: [
    { id: 'github', name: 'GitHub', label: 'github.com/hkrobotics', url: 'https://github.com/hkrobotics' },
    { id: 'linkedin', name: 'LinkedIn', label: 'linkedin.com/in/hkumardev', url: 'https://www.linkedin.com/in/hkumardev/' },
    { id: 'x', name: 'X / Twitter', label: '@hkumarDev', url: 'https://x.com/hkumarDev' },
  ],

  experience: [
    {
      company: 'Wylo',
      url: 'https://wyloapp.com/',
      location: 'Chennai, India · remote',
      role: 'Software Developer',
      from: '2023-10',
      to: null,
      highlights: [
        'Work across mobile, web, and backend for a SaaS platform serving 200+ brands, with primary ownership of mobile',
        'Played a major role migrating the production React Native app from the Legacy to the New Architecture — dependency, native-build, and iOS/Android compatibility fixes',
        'Maintain a shared white-label React Native codebase (multiple iOS targets/schemes, Android product flavors) and ship branded apps to the App Store and Google Play',
        'Build end-to-end features across mobile, web, and backend: community, notifications, events, payments, native/web-integrated experiences',
        'Manage production deployments and Linux infrastructure on AWS, including Nginx configuration and production troubleshooting',
        'Introduce AI-assisted engineering workflows — evaluating tools and helping the team adopt them for exploration, debugging, and implementation',
      ],
    },
    {
      company: 'Wylo',
      url: 'https://wyloapp.com/',
      location: 'Chennai, India · remote',
      role: 'Software Developer Intern',
      from: '2022-10',
      to: '2023-10',
      highlights: [
        'Built and scaled a React + Redux web app serving 50,000+ active users',
        'Owned event creation, community management, earnings dashboards, and payout preferences',
        'Improved frontend performance and developer workflows',
      ],
    },
    {
      company: 'ICEM Incubation Cell',
      url: null,
      location: 'Pune, India',
      role: 'Software Developer Intern',
      from: '2021-12',
      to: '2022-04',
      highlights: [
        'Built Presence, a React attendance visualization platform used by 500+ users',
        'Mentored two interns during development',
      ],
    },
  ],

  // Dated milestones — rendered as the monitor's process list.
  milestones: [
    { what: 'white-label brand apps · ios targets + android flavors', when: 'now', running: true },
    { what: 'ai-assisted engineering workflows · team rollout', when: 'now', running: true },
    { what: 'aws · linux · nginx · production deploys', when: 'ongoing', running: true },
    { what: 'rn new architecture migration · fabric/turbomodules', when: 'q1 2026', running: false },
    { what: 'dineary · shipped to app store + google play', when: 'freelance', running: false },
    { what: 'webpack → vite/swc migration', when: 'q3 2024', running: false },
    { what: 'i18n rollout · multi-language', when: 'q1 2024', running: false },
    { what: 'producthunt + appsumo launches', when: '2024', running: false },
    { what: 'wylo web · react/redux · 50k+ users', when: 'oct 22—oct 23', running: false },
  ],

  projects: [
    {
      id: 'wylo',
      name: 'Wylo',
      url: 'https://wyloapp.com/',
      status: 'live',
      tagline: 'Community SaaS platform for 200+ brands — web, backend, and white-label mobile apps',
      description:
        'One React Native codebase ships separately branded iOS and Android apps via targets/schemes and product flavors. Migrated to the New Architecture. Web app scaled to 50,000+ active users; infra on AWS.',
      stack: ['react-native', 'white-label', 'new-arch', 'react', 'node', 'aws'],
    },
    {
      id: 'dineary',
      name: 'Dineary',
      url: 'https://dineary.com/',
      status: 'live',
      role: 'Freelance React Native Developer',
      tagline: 'Restaurant discovery & review app — React Native + Expo',
      description:
        'Location-based discovery with React Native Maps and Google Places: map search, filters, permissions, and clustered maps. Push notifications, auth, and end-to-end App Store / Google Play delivery.',
      stack: ['react-native', 'expo', 'maps', 'google-places', 'push'],
    },
  ],

  skills: [
    { group: 'mobile', items: ['React Native', 'Expo', 'TypeScript', 'RN New Architecture', 'Redux Toolkit', 'React Navigation', 'Expo Router', 'Reanimated', 'Hermes', 'React Native Maps', 'MMKV'] },
    { group: 'web & backend', items: ['React', 'Next.js', 'Node.js', 'Express', 'REST APIs', 'MongoDB', 'PostgreSQL', 'Firebase'] },
    { group: 'cloud & devops', items: ['AWS', 'Cloudflare', 'Nginx', 'Docker', 'Linux', 'GitHub Actions', 'DNS', 'SSL/TLS'] },
    { group: 'mobile delivery', items: ['Xcode', 'CocoaPods', 'Gradle', 'iOS Targets/Schemes', 'Android Product Flavors', 'App Store Connect', 'Google Play Console', 'Git'] },
  ],

  now: {
    updated: '2026-10-09',
    items: [
      'Shipping white-label brand apps at Wylo from one React Native codebase',
      'Rolling out AI-assisted engineering workflows across the team',
      'Running production deploys and infra on AWS',
      'Keeping Dineary healthy on the App Store and Google Play',
    ],
  },

  education: {
    school: 'Savitribai Phule Pune University',
    degree: 'B.E. Computer Engineering',
    cgpa: '9.0 / 10',
    from: '2019',
    to: '2023',
  },

  drafts: [
    'one react native codebase, many branded apps: targets, schemes & flavors',
    'moving a production rn app to the new architecture',
    'migrating webpack → vite swc',
    'store-release checklist that actually catches the dumb ones',
  ],
};
