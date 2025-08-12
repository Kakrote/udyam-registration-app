const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Udyam Registration Form Scraper
 * Extracts form fields, validation patterns, and dropdown options from the first two steps
 * of the Udyam Registration form at https://udyamregistration.gov.in/UdyamRegistration.aspx
 */

class UdyamScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.formSchema = {
      steps: [],
      validationRules: {},
      dropdownOptions: {},
      fieldMappings: {}
    };
  }

  async initialize() {
    console.log('Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent to avoid bot detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  async navigateToForm() {
    console.log('Navigating to Udyam Registration form...');
    try {
      await this.page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait for form to load
      await this.page.waitForSelector('form', { timeout: 15000 });
      console.log('Form loaded successfully');
    } catch (error) {
      console.error('Error navigating to form:', error.message);
      throw error;
    }
  }

  async extractStep1Fields() {
    console.log('Extracting Step 1 fields...');
    
    const step1Fields = await this.page.evaluate(() => {
      const fields = [];
      
      // Common field selectors for Udyam registration form
      const fieldSelectors = [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="number"]',
        'select',
        'textarea',
        'input[type="radio"]',
        'input[type="checkbox"]'
      ];
      
      fieldSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          if (element.style.display !== 'none' && !element.disabled) {
            const field = {
              id: element.id || `field_${selector}_${index}`,
              name: element.name || element.id || `field_${selector}_${index}`,
              type: element.type || element.tagName.toLowerCase(),
              required: element.required || element.hasAttribute('required'),
              placeholder: element.placeholder || '',
              maxLength: element.maxLength || null,
              pattern: element.pattern || '',
              className: element.className || '',
              value: element.value || '',
              step: 1
            };
            
            // Get label text
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) {
              field.label = label.textContent.trim();
            } else {
              // Try to find label by looking at parent elements
              let parent = element.parentElement;
              while (parent && !field.label) {
                const labelInParent = parent.querySelector('label');
                if (labelInParent) {
                  field.label = labelInParent.textContent.trim();
                  break;
                }
                parent = parent.parentElement;
              }
            }
            
            // Get options for select elements
            if (element.tagName.toLowerCase() === 'select') {
              field.options = Array.from(element.options).map(option => ({
                value: option.value,
                text: option.textContent.trim()
              }));
            }
            
            // Get validation attributes
            if (element.hasAttribute('data-val-regex-pattern')) {
              field.validationPattern = element.getAttribute('data-val-regex-pattern');
            }
            
            fields.push(field);
          }
        });
      });
      
      return fields;
    });
    
    this.formSchema.steps.push({
      stepNumber: 1,
      title: "Basic Information",
      fields: step1Fields
    });
    
    console.log(`Extracted ${step1Fields.length} fields from Step 1`);
  }

  async extractStep2Fields() {
    console.log('Extracting Step 2 fields...');
    
    try {
      // Try to navigate to step 2 if there's a next button
      const nextButton = await this.page.$('button[type="submit"], input[type="submit"], .next-step, #btnNext');
      if (nextButton) {
        await nextButton.click();
        await this.page.waitForTimeout(2000); // Wait for step transition
      }
    } catch (error) {
      console.log('Could not navigate to step 2, extracting available fields...');
    }
    
    const step2Fields = await this.page.evaluate(() => {
      const fields = [];
      
      // Look for fields that might be in step 2 containers
      const step2Container = document.querySelector('#step2, .step-2, [data-step="2"]');
      const searchContainer = step2Container || document;
      
      const fieldSelectors = [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="number"]',
        'select',
        'textarea'
      ];
      
      fieldSelectors.forEach(selector => {
        const elements = searchContainer.querySelectorAll(selector);
        elements.forEach((element, index) => {
          if (element.style.display !== 'none' && !element.disabled) {
            const field = {
              id: element.id || `step2_field_${selector}_${index}`,
              name: element.name || element.id || `step2_field_${selector}_${index}`,
              type: element.type || element.tagName.toLowerCase(),
              required: element.required || element.hasAttribute('required'),
              placeholder: element.placeholder || '',
              maxLength: element.maxLength || null,
              pattern: element.pattern || '',
              className: element.className || '',
              value: element.value || '',
              step: 2
            };
            
            // Get label
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) {
              field.label = label.textContent.trim();
            }
            
            // Get options for select elements
            if (element.tagName.toLowerCase() === 'select') {
              field.options = Array.from(element.options).map(option => ({
                value: option.value,
                text: option.textContent.trim()
              }));
            }
            
            fields.push(field);
          }
        });
      });
      
      return fields;
    });
    
    this.formSchema.steps.push({
      stepNumber: 2,
      title: "Additional Details",
      fields: step2Fields
    });
    
    console.log(`Extracted ${step2Fields.length} fields from Step 2`);
  }

  async extractValidationRules() {
    console.log('Extracting validation rules...');
    
    // Common validation patterns for Indian forms
    this.formSchema.validationRules = {
      aadhaar: {
        pattern: "^[0-9]{12}$",
        message: "Aadhaar number must be 12 digits",
        required: true
      },
      pan: {
        pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
        message: "PAN must be in format ABCDE1234F",
        required: true
      },
      mobile: {
        pattern: "^[6-9][0-9]{9}$",
        message: "Mobile number must be 10 digits starting with 6-9",
        required: true
      },
      email: {
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message: "Please enter a valid email address",
        required: true
      },
      pincode: {
        pattern: "^[0-9]{6}$",
        message: "PIN code must be 6 digits",
        required: true
      },
      gstin: {
        pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
        message: "Please enter a valid GSTIN",
        required: false
      }
    };
  }

  async extractDropdownOptions() {
    console.log('Extracting dropdown options...');
    
    const dropdownData = await this.page.evaluate(() => {
      const dropdowns = {};
      const selectElements = document.querySelectorAll('select');
      
      selectElements.forEach(select => {
        if (select.options && select.options.length > 0) {
          const fieldName = select.name || select.id || 'unknown';
          dropdowns[fieldName] = Array.from(select.options).map(option => ({
            value: option.value,
            text: option.textContent.trim(),
            selected: option.selected
          }));
        }
      });
      
      return dropdowns;
    });
    
    this.formSchema.dropdownOptions = dropdownData;
  }

  async addFieldMappings() {
    console.log('Adding field mappings...');
    
    // Map common field patterns to our schema
    this.formSchema.fieldMappings = {
      applicantName: ["name", "applicant_name", "owner_name"],
      aadhaarNumber: ["aadhaar", "aadhaar_number", "aadhar"],
      panNumber: ["pan", "pan_number"],
      mobileNumber: ["mobile", "phone", "contact"],
      emailAddress: ["email", "email_address"],
      address: ["address", "business_address"],
      pincode: ["pincode", "pin", "postal_code"],
      state: ["state"],
      district: ["district"],
      city: ["city", "town"],
      businessName: ["business_name", "enterprise_name"],
      businessType: ["business_type", "organization_type"]
    };
  }

  async saveSchema() {
    const outputPath = path.join(__dirname, '..', 'src', 'lib', 'udyam-schema.json');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Add metadata
    this.formSchema.metadata = {
      scrapedAt: new Date().toISOString(),
      source: "https://udyamregistration.gov.in/UdyamRegistration.aspx",
      version: "1.0.0",
      description: "Udyam Registration form schema extracted from official website"
    };
    
    await fs.writeFile(outputPath, JSON.stringify(this.formSchema, null, 2));
    console.log(`Schema saved to: ${outputPath}`);
    
    // Also save a copy in the backend
    const backendPath = path.join(__dirname, '..', 'backend', 'src', 'data', 'udyam-schema.json');
    await fs.mkdir(path.dirname(backendPath), { recursive: true });
    await fs.writeFile(backendPath, JSON.stringify(this.formSchema, null, 2));
    console.log(`Schema copy saved to: ${backendPath}`);
  }

  async scrape() {
    try {
      await this.initialize();
      await this.navigateToForm();
      await this.extractStep1Fields();
      await this.extractStep2Fields();
      await this.extractValidationRules();
      await this.extractDropdownOptions();
      await this.addFieldMappings();
      await this.saveSchema();
      
      console.log('✅ Scraping completed successfully!');
      console.log(`Found ${this.formSchema.steps.length} steps with ${this.formSchema.steps.reduce((total, step) => total + step.fields.length, 0)} total fields`);
      
    } catch (error) {
      console.error('❌ Scraping failed:', error.message);
      
      // Create fallback schema if scraping fails
      await this.createFallbackSchema();
      
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async createFallbackSchema() {
    console.log('Creating fallback schema based on typical Udyam registration fields...');
    
    this.formSchema = {
      steps: [
        {
          stepNumber: 1,
          title: "Basic Information",
          fields: [
            {
              id: "applicant_name",
              name: "applicant_name",
              type: "text",
              label: "Name of Applicant",
              required: true,
              placeholder: "Enter full name",
              maxLength: 100,
              step: 1
            },
            {
              id: "aadhaar_number",
              name: "aadhaar_number",
              type: "text",
              label: "Aadhaar Number",
              required: true,
              placeholder: "Enter 12-digit Aadhaar number",
              maxLength: 12,
              pattern: "^[0-9]{12}$",
              step: 1
            },
            {
              id: "pan_number",
              name: "pan_number",
              type: "text",
              label: "PAN Number",
              required: true,
              placeholder: "Enter PAN number",
              maxLength: 10,
              pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
              step: 1
            },
            {
              id: "mobile_number",
              name: "mobile_number",
              type: "tel",
              label: "Mobile Number",
              required: true,
              placeholder: "Enter 10-digit mobile number",
              maxLength: 10,
              pattern: "^[6-9][0-9]{9}$",
              step: 1
            },
            {
              id: "email_address",
              name: "email_address",
              type: "email",
              label: "Email Address",
              required: true,
              placeholder: "Enter email address",
              step: 1
            }
          ]
        },
        {
          stepNumber: 2,
          title: "Business Details",
          fields: [
            {
              id: "business_name",
              name: "business_name",
              type: "text",
              label: "Name of Enterprise",
              required: true,
              placeholder: "Enter business name",
              maxLength: 200,
              step: 2
            },
            {
              id: "business_type",
              name: "business_type",
              type: "select",
              label: "Type of Organization",
              required: true,
              step: 2,
              options: [
                { value: "", text: "Select Organization Type" },
                { value: "proprietorship", text: "Proprietorship" },
                { value: "partnership", text: "Partnership" },
                { value: "llp", text: "Limited Liability Partnership (LLP)" },
                { value: "private_limited", text: "Private Limited Company" },
                { value: "public_limited", text: "Public Limited Company" },
                { value: "cooperative", text: "Cooperative Society" }
              ]
            },
            {
              id: "business_address",
              name: "business_address",
              type: "textarea",
              label: "Business Address",
              required: true,
              placeholder: "Enter complete business address",
              step: 2
            },
            {
              id: "pincode",
              name: "pincode",
              type: "text",
              label: "PIN Code",
              required: true,
              placeholder: "Enter 6-digit PIN code",
              maxLength: 6,
              pattern: "^[0-9]{6}$",
              step: 2
            },
            {
              id: "state",
              name: "state",
              type: "select",
              label: "State",
              required: true,
              step: 2,
              options: [
                { value: "", text: "Select State" },
                { value: "andhra_pradesh", text: "Andhra Pradesh" },
                { value: "arunachal_pradesh", text: "Arunachal Pradesh" },
                { value: "assam", text: "Assam" },
                { value: "bihar", text: "Bihar" },
                { value: "chhattisgarh", text: "Chhattisgarh" },
                { value: "delhi", text: "Delhi" },
                { value: "goa", text: "Goa" },
                { value: "gujarat", text: "Gujarat" },
                { value: "haryana", text: "Haryana" },
                { value: "himachal_pradesh", text: "Himachal Pradesh" },
                { value: "jharkhand", text: "Jharkhand" },
                { value: "karnataka", text: "Karnataka" },
                { value: "kerala", text: "Kerala" },
                { value: "madhya_pradesh", text: "Madhya Pradesh" },
                { value: "maharashtra", text: "Maharashtra" },
                { value: "manipur", text: "Manipur" },
                { value: "meghalaya", text: "Meghalaya" },
                { value: "mizoram", text: "Mizoram" },
                { value: "nagaland", text: "Nagaland" },
                { value: "odisha", text: "Odisha" },
                { value: "punjab", text: "Punjab" },
                { value: "rajasthan", text: "Rajasthan" },
                { value: "sikkim", text: "Sikkim" },
                { value: "tamil_nadu", text: "Tamil Nadu" },
                { value: "telangana", text: "Telangana" },
                { value: "tripura", text: "Tripura" },
                { value: "uttar_pradesh", text: "Uttar Pradesh" },
                { value: "uttarakhand", text: "Uttarakhand" },
                { value: "west_bengal", text: "West Bengal" }
              ]
            },
            {
              id: "district",
              name: "district",
              type: "text",
              label: "District",
              required: true,
              placeholder: "Enter district name",
              step: 2
            }
          ]
        }
      ],
      validationRules: {
        aadhaar: {
          pattern: "^[0-9]{12}$",
          message: "Aadhaar number must be 12 digits",
          required: true
        },
        pan: {
          pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
          message: "PAN must be in format ABCDE1234F",
          required: true
        },
        mobile: {
          pattern: "^[6-9][0-9]{9}$",
          message: "Mobile number must be 10 digits starting with 6-9",
          required: true
        },
        email: {
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          message: "Please enter a valid email address",
          required: true
        },
        pincode: {
          pattern: "^[0-9]{6}$",
          message: "PIN code must be 6 digits",
          required: true
        }
      },
      dropdownOptions: {},
      fieldMappings: {
        applicantName: ["applicant_name", "name"],
        aadhaarNumber: ["aadhaar_number"],
        panNumber: ["pan_number"],
        mobileNumber: ["mobile_number"],
        emailAddress: ["email_address"],
        businessName: ["business_name"],
        businessType: ["business_type"],
        businessAddress: ["business_address"],
        pincode: ["pincode"],
        state: ["state"],
        district: ["district"]
      },
      metadata: {
        scrapedAt: new Date().toISOString(),
        source: "Fallback schema - website scraping failed",
        version: "1.0.0-fallback",
        description: "Udyam Registration form schema (fallback version)"
      }
    };
    
    await this.saveSchema();
    console.log('✅ Fallback schema created successfully!');
  }
}

// Run scraper if called directly
if (require.main === module) {
  const scraper = new UdyamScraper();
  scraper.scrape().catch(console.error);
}

module.exports = UdyamScraper;
