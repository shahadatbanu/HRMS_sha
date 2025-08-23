// Test if the frontend can access the backend API
async function testFrontendAPI() {
  try {
    console.log('Testing frontend access to backend API...');
    
    // Test the profile endpoint
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is accessible from frontend');
      console.log('Response data:', data);
    } else {
      console.log('❌ API returned error status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Frontend API test failed:', error);
  }
}

// Test image access
async function testImageAccess() {
  try {
    console.log('Testing image access from frontend...');
    
    const imageUrl = 'http://localhost:5000/uploads/1754041673008-810574019-Photo-1.jpeg';
    const response = await fetch(imageUrl);
    
    console.log('Image response status:', response.status);
    console.log('Image response headers:', response.headers);
    
    if (response.ok) {
      console.log('✅ Image is accessible from frontend');
      console.log('Image Content-Type:', response.headers.get('content-type'));
    } else {
      console.log('❌ Image is not accessible from frontend');
    }
    
  } catch (error) {
    console.error('❌ Frontend image test failed:', error);
  }
}

// Run tests
testFrontendAPI();
testImageAccess(); 