import React from 'react';

// Fix for "Property does not exist on type JSX.IntrinsicElements"
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  details?: string;
  onClick?: () => void;
}

export interface IkigaiResponse {
  title: string;
  insight: string;
  careers: string[];
  skillsToDevelop: string[];
  learningPath: string[];
  actionableStep: string;
}

export interface ThemeProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
}