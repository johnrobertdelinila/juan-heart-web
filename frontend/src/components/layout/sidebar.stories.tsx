'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './sidebar';
import {
  LayoutDashboard,
  Heart,
  FileText,
  Building2,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  Activity,
  Calendar,
  MessageSquare,
} from 'lucide-react';

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-background h-screen">
        <div className="h-16 border-b" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default sidebar (expanded)
export const Default: Story = {
  args: {
    collapsed: false,
    collapsible: true,
  },
};

// Collapsed sidebar
export const Collapsed: Story = {
  args: {
    collapsed: true,
    collapsible: true,
  },
};

// Non-collapsible
export const NonCollapsible: Story = {
  args: {
    collapsed: false,
    collapsible: false,
  },
};

// With badges
export const WithBadges: Story = {
  args: {
    collapsed: false,
    collapsible: true,
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Assessments',
        href: '/assessments',
        icon: Heart,
        badge: 12,
      },
      {
        title: 'Referrals',
        href: '/referrals',
        icon: FileText,
        badge: 5,
      },
      {
        title: 'Facilities',
        href: '/facilities',
        icon: Building2,
      },
      {
        title: 'Patients',
        href: '/patients',
        icon: Users,
        badge: 'NEW',
      },
      {
        title: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
      },
    ],
  },
};

// Collapsed with badges
export const CollapsedWithBadges: Story = {
  args: {
    collapsed: true,
    collapsible: true,
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Assessments',
        href: '/assessments',
        icon: Heart,
        badge: 12,
      },
      {
        title: 'Referrals',
        href: '/referrals',
        icon: FileText,
        badge: 5,
      },
      {
        title: 'Facilities',
        href: '/facilities',
        icon: Building2,
      },
      {
        title: 'Patients',
        href: '/patients',
        icon: Users,
      },
    ],
  },
};

// Custom navigation items
export const CustomNavigation: Story = {
  args: {
    collapsed: false,
    collapsible: true,
    items: [
      {
        title: 'Overview',
        href: '/overview',
        icon: LayoutDashboard,
      },
      {
        title: 'Clinical',
        href: '/clinical',
        icon: Activity,
        badge: 8,
      },
      {
        title: 'Appointments',
        href: '/appointments',
        icon: Calendar,
        badge: 3,
      },
      {
        title: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        badge: 15,
      },
      {
        title: 'Facilities',
        href: '/facilities',
        icon: Building2,
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
      },
      {
        title: 'Support',
        href: '/support',
        icon: HelpCircle,
      },
    ],
  },
};

// With disabled items
export const WithDisabledItems: Story = {
  args: {
    collapsed: false,
    collapsible: true,
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Assessments',
        href: '/assessments',
        icon: Heart,
        badge: 12,
      },
      {
        title: 'Referrals',
        href: '/referrals',
        icon: FileText,
        badge: 5,
      },
      {
        title: 'Facilities',
        href: '/facilities',
        icon: Building2,
        disabled: true,
      },
      {
        title: 'Patients',
        href: '/patients',
        icon: Users,
      },
      {
        title: 'Analytics (Coming Soon)',
        href: '/analytics',
        icon: BarChart3,
        disabled: true,
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
};

// Minimal navigation
export const MinimalNavigation: Story = {
  args: {
    collapsed: false,
    collapsible: true,
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Assessments',
        href: '/assessments',
        icon: Heart,
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
};

// Interactive example with state
export const Interactive: Story = {
  render: () => {
    const [collapsed, setCollapsed] = React.useState(false);

    return (
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        collapsible={true}
        items={[
          {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
          },
          {
            title: 'Assessments',
            href: '/assessments',
            icon: Heart,
            badge: 12,
          },
          {
            title: 'Referrals',
            href: '/referrals',
            icon: FileText,
            badge: 5,
          },
          {
            title: 'Facilities',
            href: '/facilities',
            icon: Building2,
          },
          {
            title: 'Patients',
            href: '/patients',
            icon: Users,
          },
          {
            title: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
          },
          {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
          },
          {
            title: 'Help',
            href: '/help',
            icon: HelpCircle,
          },
        ]}
      />
    );
  },
};
