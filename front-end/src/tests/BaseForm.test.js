// front-end/src/tests/BaseForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../Components/context/AuthContext';
import BaseForm from '../Components/common/BaseForm';
import theme from '../theme';

// Mock de los servicios
jest.mock('../services/securityService', () => ({
  validatePermissions: jest.fn(() => true),
  sanitizeInput: jest.fn((data) => data)
}));

jest.mock('../services/validationSchemas', () => ({
  userSchema: {
    validate: jest.fn(() => Promise.resolve())
  }
}));

// Wrapper para testing
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

describe('BaseForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockValidationSchema = {
    validate: jest.fn(() => Promise.resolve())
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with title and subtitle', () => {
    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          subtitle="Test Subtitle"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
        >
          <div>Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  test('renders form content', () => {
    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
        >
          <div data-testid="form-content">Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    expect(screen.getByTestId('form-content')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
          loading={true}
        >
          <div>Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error message', () => {
    const errorMessage = 'Test error message';
    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
          error={errorMessage}
        >
          <div>Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('shows success message', () => {
    const successMessage = 'Test success message';
    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
          success={successMessage}
        >
          <div>Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    expect(screen.getByText(successMessage)).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
        >
          <button type="submit">Submit</button>
        </BaseForm>
      </TestWrapper>
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('validates form data on submission', async () => {
    const mockValidate = jest.fn(() => Promise.resolve());
    const mockSchema = { validate: mockValidate };

    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockSchema}
          onSubmit={mockOnSubmit}
        >
          <button type="submit">Submit</button>
        </BaseForm>
      </TestWrapper>
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled();
    });
  });

  test('shows permission denied when user lacks permissions', () => {
    const { validatePermissions } = require('../services/securityService');
    validatePermissions.mockReturnValue(false);

    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
          requiredPermissions={['test:permission']}
        >
          <div>Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
  });

  test('applies custom styling', () => {
    const customSx = { backgroundColor: 'red' };
    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
          sx={customSx}
        >
          <div>Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    const formElement = screen.getByText('Test Form').closest('div');
    expect(formElement).toHaveStyle({ backgroundColor: 'red' });
  });

  test('handles mobile responsive design', () => {
    // Mock useMediaQuery to return true (mobile)
    jest.spyOn(require('@mui/material'), 'useMediaQuery').mockReturnValue(true);

    render(
      <TestWrapper>
        <BaseForm
          title="Test Form"
          validationSchema={mockValidationSchema}
          onSubmit={mockOnSubmit}
        >
          <div>Form Content</div>
        </BaseForm>
      </TestWrapper>
    );

    // Verificar que el formulario se renderiza correctamente en móvil
    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });
}); 