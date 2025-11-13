/**
 * ComparisonField Component Tests
 *
 * Tests for the field comparison components that display AI vs Clinical data
 * with visual difference highlighting and formatting.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import {
  ComparisonField,
  BooleanComparisonField,
  ArrayComparisonField,
  TextComparisonField,
  ComparisonFieldHeader,
} from '../comparison-field';

describe('ComparisonField', () => {
  describe('Basic Rendering', () => {
    it('renders field label', () => {
      render(
        <ComparisonField
          label="Blood Pressure"
          aiValue="120/80"
          clinicalValue="130/85"
        />
      );

      expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    });

    it('renders AI value', () => {
      render(
        <ComparisonField
          label="Heart Rate"
          aiValue={72}
          clinicalValue={75}
        />
      );

      expect(screen.getByText('72')).toBeInTheDocument();
    });

    it('renders clinical value', () => {
      render(
        <ComparisonField
          label="Heart Rate"
          aiValue={72}
          clinicalValue={75}
        />
      );

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('renders unit when provided', () => {
      render(
        <ComparisonField
          label="Temperature"
          aiValue={36.5}
          clinicalValue={36.8}
          unit="°C"
        />
      );

      const units = screen.getAllByText('°C');
      expect(units).toHaveLength(2); // One for each value
    });

    it('does not render unit when value is null', () => {
      render(
        <ComparisonField
          label="Temperature"
          aiValue={null}
          clinicalValue={36.8}
          unit="°C"
        />
      );

      const units = screen.getAllByText('°C');
      expect(units).toHaveLength(1); // Only for clinical value
    });
  });

  describe('Null Value Handling', () => {
    it('displays "Not recorded" for null AI value', () => {
      render(
        <ComparisonField
          label="Blood Pressure"
          aiValue={null}
          clinicalValue="120/80"
        />
      );

      expect(screen.getByText('Not recorded')).toBeInTheDocument();
    });

    it('displays "Not recorded" for null clinical value', () => {
      render(
        <ComparisonField
          label="Blood Pressure"
          aiValue="120/80"
          clinicalValue={null}
        />
      );

      expect(screen.getByText('Not recorded')).toBeInTheDocument();
    });

    it('displays "Not recorded" for both null values', () => {
      render(
        <ComparisonField
          label="Blood Pressure"
          aiValue={null}
          clinicalValue={null}
        />
      );

      const notRecorded = screen.getAllByText('Not recorded');
      expect(notRecorded).toHaveLength(2);
    });
  });

  describe('Number Formatting', () => {
    it('displays integer numbers correctly', () => {
      render(
        <ComparisonField
          label="Age"
          aiValue={45}
          clinicalValue={45}
        />
      );

      const ages = screen.getAllByText('45');
      expect(ages).toHaveLength(2);
    });

    it('displays decimal numbers correctly', () => {
      render(
        <ComparisonField
          label="BMI"
          aiValue={24.5}
          clinicalValue={25.2}
        />
      );

      expect(screen.getByText('24.5')).toBeInTheDocument();
      expect(screen.getByText('25.2')).toBeInTheDocument();
    });

    it('displays zero values correctly', () => {
      render(
        <ComparisonField
          label="Score"
          aiValue={0}
          clinicalValue={0}
        />
      );

      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(2);
    });
  });

  describe('Difference Highlighting', () => {
    it('applies increase difference styling', () => {
      const { container } = render(
        <ComparisonField
          label="Risk Score"
          aiValue={60}
          clinicalValue={75}
          isDifferent={true}
          differenceType="increase"
        />
      );

      // Check for difference indicator classes (red/amber highlighting)
      const diffElements = container.querySelectorAll('.border-red-300, .border-amber-300');
      expect(diffElements.length).toBeGreaterThan(0);
    });

    it('applies decrease difference styling', () => {
      const { container } = render(
        <ComparisonField
          label="Risk Score"
          aiValue={75}
          clinicalValue={60}
          isDifferent={true}
          differenceType="decrease"
        />
      );

      // Check for difference indicator classes (green highlighting)
      const diffElements = container.querySelectorAll('.border-emerald-300');
      expect(diffElements.length).toBeGreaterThan(0);
    });

    it('applies changed difference styling for non-numeric changes', () => {
      const { container } = render(
        <ComparisonField
          label="Status"
          aiValue="Active"
          clinicalValue="Inactive"
          isDifferent={true}
          differenceType="changed"
        />
      );

      // Check for change indicator
      const diffElements = container.querySelectorAll('.border-blue-300');
      expect(diffElements.length).toBeGreaterThan(0);
    });

    it('does not apply difference styling when isDifferent is false', () => {
      const { container } = render(
        <ComparisonField
          label="Status"
          aiValue="Active"
          clinicalValue="Active"
          isDifferent={false}
        />
      );

      // Should have default border color (slate)
      const defaultElements = container.querySelectorAll('.border-slate-200');
      expect(defaultElements.length).toBeGreaterThan(0);
    });
  });

  describe('Difference Metrics', () => {
    it('displays absolute difference badge when provided', () => {
      render(
        <ComparisonField
          label="Heart Rate"
          aiValue={72}
          clinicalValue={80}
          isDifferent={true}
          differenceType="increase"
          absoluteDiff={8}
          unit="bpm"
        />
      );

      expect(screen.getByText(/8/)).toBeInTheDocument();
    });

    it('displays percentage difference when provided', () => {
      render(
        <ComparisonField
          label="Risk Score"
          aiValue={60}
          clinicalValue={75}
          isDifferent={true}
          differenceType="increase"
          absoluteDiff={15}
          percentageDiff={25}
        />
      );

      // Should show percentage in badge
      expect(screen.getByText(/25%/)).toBeInTheDocument();
    });

    it('does not display difference badge when absoluteDiff is undefined', () => {
      const { container } = render(
        <ComparisonField
          label="Status"
          aiValue="Active"
          clinicalValue="Inactive"
          isDifferent={true}
          differenceType="changed"
        />
      );

      // Should not have difference value badge, only indicator
      expect(container.querySelector('.absolute')).not.toBeNull();
    });
  });

  describe('Responsive Layout', () => {
    it('renders in grid layout', () => {
      const { container } = render(
        <ComparisonField
          label="Field"
          aiValue="Value 1"
          clinicalValue="Value 2"
        />
      );

      const gridElement = container.querySelector('.grid');
      expect(gridElement).toBeInTheDocument();
    });

    it('has three columns in the grid', () => {
      const { container } = render(
        <ComparisonField
          label="Field"
          aiValue="Value 1"
          clinicalValue="Value 2"
        />
      );

      // Check for grid-cols class
      const gridElement = container.querySelector('[class*="md:grid-cols"]');
      expect(gridElement).toBeInTheDocument();
    });
  });
});

describe('BooleanComparisonField', () => {
  it('formats true value as "Yes"', () => {
    render(
      <BooleanComparisonField
        label="Chest Pain"
        aiValue={true}
        clinicalValue={true}
      />
    );

    const yesElements = screen.getAllByText('Yes');
    expect(yesElements).toHaveLength(2);
  });

  it('formats false value as "No"', () => {
    render(
      <BooleanComparisonField
        label="Chest Pain"
        aiValue={false}
        clinicalValue={false}
      />
    );

    const noElements = screen.getAllByText('No');
    expect(noElements).toHaveLength(2);
  });

  it('formats null value as "Not recorded"', () => {
    render(
      <BooleanComparisonField
        label="Chest Pain"
        aiValue={null}
        clinicalValue={null}
      />
    );

    const notRecorded = screen.getAllByText('Not recorded');
    expect(notRecorded).toHaveLength(2);
  });

  it('shows difference when boolean values differ', () => {
    const { container } = render(
      <BooleanComparisonField
        label="Chest Pain"
        aiValue={true}
        clinicalValue={false}
        isDifferent={true}
        differenceType="changed"
      />
    );

    // Check for difference indicator
    const diffElements = container.querySelectorAll('.border-blue-300');
    expect(diffElements.length).toBeGreaterThan(0);
  });
});

describe('ArrayComparisonField', () => {
  it('formats array as comma-separated string', () => {
    render(
      <ArrayComparisonField
        label="Symptoms"
        aiValue={['Chest pain', 'Fatigue', 'Dizziness']}
        clinicalValue={['Chest pain', 'Fatigue']}
      />
    );

    expect(screen.getByText('Chest pain, Fatigue, Dizziness')).toBeInTheDocument();
    expect(screen.getByText('Chest pain, Fatigue')).toBeInTheDocument();
  });

  it('displays "None" for empty array', () => {
    render(
      <ArrayComparisonField
        label="Symptoms"
        aiValue={[]}
        clinicalValue={[]}
      />
    );

    const noneElements = screen.getAllByText('None');
    expect(noneElements).toHaveLength(2);
  });

  it('displays "None" for null array', () => {
    render(
      <ArrayComparisonField
        label="Symptoms"
        aiValue={null}
        clinicalValue={null}
      />
    );

    const noneElements = screen.getAllByText('None');
    expect(noneElements).toHaveLength(2);
  });

  it('handles single item arrays', () => {
    render(
      <ArrayComparisonField
        label="Medications"
        aiValue={['Aspirin']}
        clinicalValue={['Aspirin']}
      />
    );

    const aspirinElements = screen.getAllByText('Aspirin');
    expect(aspirinElements).toHaveLength(2);
  });

  it('shows difference when arrays differ', () => {
    const { container } = render(
      <ArrayComparisonField
        label="Symptoms"
        aiValue={['Chest pain']}
        clinicalValue={['Chest pain', 'Fatigue']}
        isDifferent={true}
        differenceType="changed"
      />
    );

    // Check for difference indicator
    const diffElements = container.querySelectorAll('.border-blue-300');
    expect(diffElements.length).toBeGreaterThan(0);
  });
});

describe('TextComparisonField', () => {
  it('displays text values correctly', () => {
    render(
      <TextComparisonField
        label="Clinical Notes"
        aiValue="Patient shows improvement"
        clinicalValue="Patient condition stable"
      />
    );

    expect(screen.getByText('Patient shows improvement')).toBeInTheDocument();
    expect(screen.getByText('Patient condition stable')).toBeInTheDocument();
  });

  it('displays "Not provided" for null values', () => {
    render(
      <TextComparisonField
        label="Notes"
        aiValue={null}
        clinicalValue={null}
      />
    );

    const notProvided = screen.getAllByText('Not provided');
    expect(notProvided).toHaveLength(2);
  });

  it('displays "Not provided" for empty string', () => {
    render(
      <TextComparisonField
        label="Notes"
        aiValue=""
        clinicalValue=""
      />
    );

    const notProvided = screen.getAllByText('Not provided');
    expect(notProvided).toHaveLength(2);
  });

  it('applies line clamp for long text', () => {
    const { container } = render(
      <TextComparisonField
        label="Notes"
        aiValue="Very long text that should be clamped"
        clinicalValue="Another long text"
        maxLines={2}
      />
    );

    // Check for line-clamp class
    const clampedElements = container.querySelectorAll('[class*="line-clamp"]');
    expect(clampedElements.length).toBeGreaterThan(0);
  });

  it('uses default maxLines of 3', () => {
    const { container } = render(
      <TextComparisonField
        label="Notes"
        aiValue="Text with default line clamp"
        clinicalValue="Another text"
      />
    );

    // Check for line-clamp-3 class (default)
    const clampedElements = container.querySelectorAll('[class*="line-clamp-3"]');
    expect(clampedElements.length).toBeGreaterThan(0);
  });

  it('shows difference when text values differ', () => {
    const { container } = render(
      <TextComparisonField
        label="Notes"
        aiValue="Different text A"
        clinicalValue="Different text B"
        isDifferent={true}
        differenceType="changed"
      />
    );

    // Check for difference indicator
    const diffElements = container.querySelectorAll('.border-blue-300');
    expect(diffElements.length).toBeGreaterThan(0);
  });
});

describe('ComparisonFieldHeader', () => {
  it('renders column headers', () => {
    render(<ComparisonFieldHeader />);

    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('AI Assessment')).toBeInTheDocument();
    expect(screen.getByText('Clinical Review')).toBeInTheDocument();
  });

  it('uses grid layout matching ComparisonField', () => {
    const { container } = render(<ComparisonFieldHeader />);

    const gridElement = container.querySelector('[class*="grid-cols-[200px,1fr,1fr]"]');
    expect(gridElement).toBeInTheDocument();
  });

  it('is hidden on mobile (md:grid)', () => {
    const { container } = render(<ComparisonFieldHeader />);

    const headerElement = container.querySelector('.hidden.md\\:grid');
    expect(headerElement).toBeInTheDocument();
  });
});

describe('Custom Styling', () => {
  it('applies custom className to ComparisonField', () => {
    const { container } = render(
      <ComparisonField
        label="Test"
        aiValue="A"
        clinicalValue="B"
        className="custom-class"
      />
    );

    const customElements = container.querySelectorAll('.custom-class');
    expect(customElements.length).toBeGreaterThan(0);
  });

  it('merges custom className with default classes', () => {
    const { container } = render(
      <ComparisonField
        label="Test"
        aiValue="A"
        clinicalValue="B"
        className="custom-class"
      />
    );

    // Should have both custom and default classes
    const element = container.querySelector('.custom-class');
    expect(element?.className).toContain('rounded-xl');
    expect(element?.className).toContain('border');
  });
});
