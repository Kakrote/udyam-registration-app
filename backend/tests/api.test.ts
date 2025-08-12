import request from 'supertest';
import app from '../src/index';

describe('API Health Check', () => {
  it('should return 200 OK for health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Udyam Registration API is running');
    expect(response.body.endpoints).toBeDefined();
  });
});

describe('Form Schema API', () => {
  it('should return form schema', async () => {
    const response = await request(app)
      .get('/api/form-schema')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.steps).toBeInstanceOf(Array);
    expect(response.body.data.steps.length).toBeGreaterThan(0);
  });

  it('should have required fields in schema', async () => {
    const response = await request(app)
      .get('/api/form-schema')
      .expect(200);

    const schema = response.body.data;
    expect(schema.steps).toBeDefined();
    expect(schema.validationRules).toBeDefined();
    
    // Check for required validation rules
    expect(schema.validationRules.aadhaar).toBeDefined();
    expect(schema.validationRules.mobile).toBeDefined();
    expect(schema.validationRules.email).toBeDefined();
  });
});

describe('Form Submission API', () => {
  const validFormData = {
    aadhaarNumber: '123456789012',
    applicantName: 'John Doe',
    mobileNumber: '9876543210',
    emailAddress: 'john.doe@example.com',
    businessName: 'Test Business',
    businessType: 'proprietorship',
    businessAddress: '123 Test Street, Test City',
    pincode: '110001',
    state: 'Delhi',
    district: 'Central Delhi',
  };

  it('should reject form submission with invalid data', async () => {
    const invalidData = {
      aadhaarNumber: '123', // Too short
      applicantName: '',     // Empty
      mobileNumber: '123',   // Invalid format
      emailAddress: 'invalid-email',
    };

    const response = await request(app)
      .post('/api/submit')
      .send(invalidData)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Validation error');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(response.body.details.length).toBeGreaterThan(0);
  });

  it('should validate Aadhaar number format', async () => {
    const invalidAadhaar = {
      ...validFormData,
      aadhaarNumber: '12345', // Invalid length
    };

    const response = await request(app)
      .post('/api/submit')
      .send(invalidAadhaar)
      .expect(400);

    const aadhaarError = response.body.details.find(
      (error: any) => error.field === 'aadhaarNumber'
    );
    expect(aadhaarError).toBeDefined();
  });

  it('should validate mobile number format', async () => {
    const invalidMobile = {
      ...validFormData,
      mobileNumber: '1234567890', // Should start with 6-9
    };

    const response = await request(app)
      .post('/api/submit')
      .send(invalidMobile)
      .expect(400);

    const mobileError = response.body.details.find(
      (error: any) => error.field === 'mobileNumber'
    );
    expect(mobileError).toBeDefined();
  });

  it('should validate PIN code format', async () => {
    const invalidPincode = {
      ...validFormData,
      pincode: '12345', // Should be 6 digits
    };

    const response = await request(app)
      .post('/api/submit')
      .send(invalidPincode)
      .expect(400);

    const pincodeError = response.body.details.find(
      (error: any) => error.field === 'pincode'
    );
    expect(pincodeError).toBeDefined();
  });

  it('should validate email format', async () => {
    const invalidEmail = {
      ...validFormData,
      emailAddress: 'invalid-email-format',
    };

    const response = await request(app)
      .post('/api/submit')
      .send(invalidEmail)
      .expect(400);

    const emailError = response.body.details.find(
      (error: any) => error.field === 'emailAddress'
    );
    expect(emailError).toBeDefined();
  });

  // Note: This test would require a test database setup
  // it('should accept valid form submission', async () => {
  //   const response = await request(app)
  //     .post('/api/submit')
  //     .send(validFormData)
  //     .expect('Content-Type', /json/)
  //     .expect(201);

  //   expect(response.body.success).toBe(true);
  //   expect(response.body.data.id).toBeDefined();
  //   expect(response.body.data.isCompleted).toBe(true);
  // });
});

describe('PIN Code API', () => {
  it('should validate PIN code format', async () => {
    const response = await request(app)
      .get('/api/pincode/12345') // Invalid: only 5 digits
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid PIN code format');
  });

  it('should accept valid PIN code format', async () => {
    const response = await request(app)
      .get('/api/pincode/110001')
      .expect('Content-Type', /json/);

    // Should return either 200 (found) or 404 (not found)
    expect([200, 404]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data.pincode).toBe('110001');
    }
  });
});

describe('Error Handling', () => {
  it('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/non-existent-route')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.error).toBe('Route not found');
  });

  it('should handle invalid JSON in request body', async () => {
    const response = await request(app)
      .post('/api/submit')
      .send('invalid json')
      .set('Content-Type', 'application/json')
      .expect(400);

    // Express handles malformed JSON automatically
  });
});
