'use client';

import { UdyamRegistrationForm } from '../components/UdyamRegistrationForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">
                  Udyam Registration Portal
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Government of India
              </span>
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">IN</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12">
        <UdyamRegistrationForm />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              This is a demo application showcasing the Udyam Registration form.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a 
                href="https://udyamregistration.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Official Website
              </a>
              <a 
                href="/api/form-schema" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
