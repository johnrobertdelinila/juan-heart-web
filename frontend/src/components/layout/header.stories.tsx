'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './header';

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default header
export const Default: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: true,
    notificationCount: 0,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
    },
  },
};

// With notifications
export const WithNotifications: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: true,
    notificationCount: 5,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
    },
  },
};

// Many notifications
export const ManyNotifications: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: true,
    notificationCount: 15,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
    },
  },
};

// Without search
export const WithoutSearch: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: false,
    showNotifications: true,
    notificationCount: 3,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
    },
  },
};

// Without notifications
export const WithoutNotifications: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: false,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
    },
  },
};

// Different user roles
export const AdminUser: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: true,
    notificationCount: 2,
    user: {
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@phc.gov.ph',
      role: 'PHC Administrator',
    },
  },
};

export const NurseUser: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: true,
    notificationCount: 8,
    user: {
      name: 'Anna Reyes',
      email: 'anna.reyes@phc.gov.ph',
      role: 'Registered Nurse',
    },
  },
};

// With user avatar
export const WithUserAvatar: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: true,
    notificationCount: 3,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
  },
};

// Custom title
export const CustomTitle: Story = {
  args: {
    title: 'Philippine Heart Center',
    showSearch: true,
    showNotifications: true,
    notificationCount: 1,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
    },
  },
};

// Minimal header (no user)
export const MinimalHeader: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: false,
    showNotifications: false,
  },
};

// With interactions
export const WithInteractions: Story = {
  args: {
    title: 'Juan Heart',
    showSearch: true,
    showNotifications: true,
    notificationCount: 5,
    user: {
      name: 'Dr. Maria Santos',
      email: 'maria.santos@phc.gov.ph',
      role: 'Cardiologist',
    },
    onMenuClick: () => console.log('Menu clicked'),
    onSearch: (query: string) => console.log('Search:', query),
    onLogout: () => console.log('Logout clicked'),
  },
};
