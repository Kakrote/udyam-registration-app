import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step1Form } from '@/components/Step1Form';

describe('Step1Form', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render all required fields', () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/aadhaar number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name of entrepreneur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pan number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
  });

  it('should validate Aadhaar number format', async () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    const aadhaarInput = screen.getByLabelText(/aadhaar number/i);
    fireEvent.change(aadhaarInput, { target: { value: '123' } });

    await waitFor(() => {
      expect(screen.getByText(/aadhaar number must be exactly 12 digits/i)).toBeInTheDocument();
    });
  });

  it('should validate mobile number format', async () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    const mobileInput = screen.getByLabelText(/mobile number/i);
    fireEvent.change(mobileInput, { target: { value: '1234567890' } });

    await waitFor(() => {
      expect(screen.getByText(/mobile number must start with 6-9/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await waitFor(() => {
      expect(screen.getByText(/please provide a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should validate PAN format when provided', async () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    const panInput = screen.getByLabelText(/pan number/i);
    fireEvent.change(panInput, { target: { value: 'INVALID' } });

    await waitFor(() => {
      expect(screen.getByText(/pan must be in format ABCDE1234F/i)).toBeInTheDocument();
    });
  });

  it('should submit valid form data', async () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/aadhaar number/i), {
      target: { value: '123456789012' }
    });
    fireEvent.change(screen.getByLabelText(/name of entrepreneur/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: '9876543210' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/pan number/i), {
      target: { value: 'ABCDE1234F' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        aadhaarNumber: '123456789012',
        applicantName: 'John Doe',
        mobileNumber: '9876543210',
        emailAddress: 'john@example.com',
        panNumber: 'ABCDE1234F'
      });
    });
  });

  it('should handle optional PAN number', async () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    // Fill out required fields only
    fireEvent.change(screen.getByLabelText(/aadhaar number/i), {
      target: { value: '123456789012' }
    });
    fireEvent.change(screen.getByLabelText(/name of entrepreneur/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: '9876543210' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        aadhaarNumber: '123456789012',
        applicantName: 'John Doe',
        mobileNumber: '9876543210',
        emailAddress: 'john@example.com',
        panNumber: undefined
      });
    });
  });

  it('should disable submit button when form is invalid', async () => {
    render(<Step1Form onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /next step/i });
    expect(submitButton).toBeDisabled();

    // Fill partial data (missing required fields)
    fireEvent.change(screen.getByLabelText(/aadhaar number/i), {
      target: { value: '123456789012' }
    });

    // Button should still be disabled
    expect(submitButton).toBeDisabled();
  });
});
