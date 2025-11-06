/**
 * Test Page - Simple page to verify routing works
 */

import React from "react";

const TestPage = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Test Page</h1>
      <p>If you can see this, routing is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestPage;
