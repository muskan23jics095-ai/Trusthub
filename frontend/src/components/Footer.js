import React from 'react';

function Footer() {
  return (
    <footer style={{ background: '#007bff', color: 'white', textAlign: 'center', padding: '10px', marginTop: '30px' }}>
      <p>© {new Date().getFullYear()} TrustHub. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
