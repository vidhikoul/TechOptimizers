import { FileText, Code, Database, BookOpen, ArrowRight } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Documentation() {
  // Gradient styles with light purple background
  const containerStyle = {
    maxWidth: '1200px',
    background: 'rgba(245, 240, 255, 0.9)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(101, 43, 215, 0.1)',
    border: '1px solid rgba(220, 210, 255, 0.5)'
  };

  const cardGradient = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(220, 210, 255, 0.5)',
    boxShadow: '0 4px 20px rgba(101, 43, 215, 0.1)',
    borderRadius: '12px'
  };

  const navCardStyle = {
    ...cardGradient,
    background: 'rgba(230, 220, 255, 0.8)'
  };

  const codeBlockStyle = {
    background: 'rgba(240, 235, 255, 0.9)',
    border: '1px solid rgba(200, 180, 255, 0.5)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
    color: '#333'
  };

  const primaryButtonStyle = {
    background: 'linear-gradient(145deg, #8a63ff 0%, #6d8cff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(138, 99, 255, 0.3)',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="container my-5" style={containerStyle}>
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3" style={{ 
          background: 'linear-gradient(90deg, #8a63ff, #6d8cff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Documentation
        </h1>
        <p className="lead" style={{ color: '#666' }}>
          Learn how to use the <span style={{ color: '#8a63ff' }}>TechOptimizers</span> SQL Assistant
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <div className="card" style={navCardStyle}>
            <div className="card-header" style={{ 
              background: 'rgba(220, 210, 255, 0.5)',
              borderBottom: '1px solid rgba(200, 180, 255, 0.5)'
            }}>
              <h5 className="card-title mb-0" style={{ color: '#6a11cb' }}>Navigation</h5>
            </div>
            <div className="card-body p-0">
              <nav className="nav flex-column">
                <a
                  href="#getting-started"
                  className="nav-link d-flex align-items-center py-3 px-4 border-bottom hover-glow"
                  style={{ 
                    transition: 'all 0.3s ease',
                    color: '#555',
                    borderColor: 'rgba(200, 180, 255, 0.5)'
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" style={{ color: '#8a63ff' }} />
                  Getting Started
                </a>
                <a
                  href="#sql-assistant"
                  className="nav-link d-flex align-items-center py-3 px-4 border-bottom hover-glow"
                  style={{ 
                    transition: 'all 0.3s ease',
                    color: '#555',
                    borderColor: 'rgba(200, 180, 255, 0.5)'
                  }}
                >
                  <Database className="h-4 w-4 mr-2" style={{ color: '#8a63ff' }} />
                  SQL Assistant
                </a>
                <a
                  href="#api-reference"
                  className="nav-link d-flex align-items-center py-3 px-4 border-bottom hover-glow"
                  style={{ 
                    transition: 'all 0.3s ease',
                    color: '#555',
                    borderColor: 'rgba(200, 180, 255, 0.5)'
                  }}
                >
                  <Code className="h-4 w-4 mr-2" style={{ color: '#8a63ff' }} />
                  API Reference
                </a>
                <a
                  href="#examples"
                  className="nav-link d-flex align-items-center py-3 px-4 hover-glow"
                  style={{ 
                    transition: 'all 0.3s ease',
                    color: '#555'
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" style={{ color: '#8a63ff' }} />
                  Examples
                </a>
              </nav>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card mb-4" style={cardGradient} id="getting-started">
            <div className="card-header" style={{ 
              background: 'rgba(220, 210, 255, 0.5)',
              borderBottom: '1px solid rgba(200, 180, 255, 0.5)'
            }}>
              <h2 className="card-title mb-0" style={{ color: '#6a11cb' }}>
                <BookOpen className="h-5 w-5 mr-2 d-inline" style={{ color: '#8a63ff' }} />
                Getting Started
              </h2>
            </div>
            <div className="card-body" style={{ color: '#444' }}>
              <h3 className="h5 mb-3" style={{ color: '#6a11cb' }}>Introduction</h3>
              <p>
                TechOptimizers SQL Assistant is an AI-powered tool that helps
                you write, optimize, and understand SQL queries with advanced
                machine learning models.
              </p>

              <h3 className="h5 mt-4 mb-3" style={{ color: '#6a11cb' }}>Key Features</h3>
              <ul className="list-styled">
                <li className="mb-2 d-flex align-items-start">
                  <span className="badge rounded-pill me-2 mt-1" style={{ 
                    width: '24px', 
                    height: '24px', 
                    lineHeight: '24px',
                    background: 'linear-gradient(145deg, #8a63ff, #6d8cff)',
                    color: 'white'
                  }}>1</span>
                  SQL query optimization with detailed explanations
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <span className="badge rounded-pill me-2 mt-1" style={{ 
                    width: '24px', 
                    height: '24px', 
                    lineHeight: '24px',
                    background: 'linear-gradient(145deg, #8a63ff, #6d8cff)',
                    color: 'white'
                  }}>2</span>
                  Natural language to SQL conversion
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <span className="badge rounded-pill me-2 mt-1" style={{ 
                    width: '24px', 
                    height: '24px', 
                    lineHeight: '24px',
                    background: 'linear-gradient(145deg, #8a63ff, #6d8cff)',
                    color: 'white'
                  }}>3</span>
                  Schema-aware suggestions and auto-completion
                </li>
                <li className="d-flex align-items-start">
                  <span className="badge rounded-pill me-2 mt-1" style={{ 
                    width: '24px', 
                    height: '24px', 
                    lineHeight: '24px',
                    background: 'linear-gradient(145deg, #8a63ff, #6d8cff)',
                    color: 'white'
                  }}>4</span>
                  Performance analytics and monitoring
                </li>
              </ul>

              <h3 className="h5 mt-4 mb-3" style={{ color: '#6a11cb' }}>Quick Start</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    Navigate to the <a href="/assistant" style={{ color: '#8a63ff' }}>SQL Assistant</a> page
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    Enter your SQL query or natural language description
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    Click "Optimize" or "Generate SQL" to get results
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    Review the optimized query and suggestions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SQL Assistant Section */}
          <div className="card mb-4" style={cardGradient} id="sql-assistant">
            <div className="card-header" style={{ 
              background: 'rgba(220, 210, 255, 0.5)',
              borderBottom: '1px solid rgba(200, 180, 255, 0.5)'
            }}>
              <h2 className="card-title mb-0" style={{ color: '#6a11cb' }}>
                <Database className="h-5 w-5 mr-2 d-inline" style={{ color: '#8a63ff' }} />
                SQL Assistant
              </h2>
            </div>
            <div className="card-body" style={{ color: '#444' }}>
              <h3 className="h5 mb-3" style={{ color: '#6a11cb' }}>SQL Editor Mode</h3>
              <p>
                The SQL Editor mode allows you to input existing SQL queries for optimization,
                with suggestions for performance, readability, and best practices.
              </p>

              <h3 className="h5 mt-4 mb-3" style={{ color: '#6a11cb' }}>Natural Language Mode</h3>
              <p>
                Describe what you want to query in plain English (e.g., "Show me all customers
                who made a purchase in the last 30 days") and get the appropriate SQL query.
              </p>

              <h3 className="h5 mt-4 mb-3" style={{ color: '#6a11cb' }}>Understanding Results</h3>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#8a63ff" d="M3 17v2h6v-2H3M3 5v2h10V5H3m10 16v-2h8v-2h-8v-2h-2v6h2M7 9v2H3v2h4v2h2V9H7m14 4v-2H11v2h10m-6-4h2V7h4V5h-4V3h-2v6z"/>
                    </svg>
                  </div>
                  <h4 style={{ color: '#6a11cb' }}>Optimized SQL</h4>
                  <p style={{ color: '#666' }}>The improved version of your query</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#8a63ff" d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3m-1 5h2v2h-2V8m0 3h2v5h-2v-5z"/>
                    </svg>
                  </div>
                  <h4 style={{ color: '#6a11cb' }}>Explanations</h4>
                  <p style={{ color: '#666' }}>Detailed reasoning for each optimization</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#8a63ff" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14v14M7 12h2v5H7v-5m4-7h2v12h-2V5m4 5h2v7h-2v-7"/>
                    </svg>
                  </div>
                  <h4 style={{ color: '#6a11cb' }}>Performance</h4>
                  <p style={{ color: '#666' }}>Impact estimates and metrics</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#8a63ff" d="M3 3h8v8H3V3m10 0h8v8h-8V3M3 13h8v8H3v-8m10 0h8v8h-8v-8z"/>
                    </svg>
                  </div>
                  <h4 style={{ color: '#6a11cb' }}>Alternatives</h4>
                  <p style={{ color: '#666' }}>Different approaches when applicable</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Reference Section */}
          <div className="card mb-4" style={cardGradient} id="api-reference">
            <div className="card-header" style={{ 
              background: 'rgba(220, 210, 255, 0.5)',
              borderBottom: '1px solid rgba(200, 180, 255, 0.5)'
            }}>
              <h2 className="card-title mb-0" style={{ color: '#6a11cb' }}>
                <Code className="h-5 w-5 mr-2 d-inline" style={{ color: '#8a63ff' }} />
                API Reference
              </h2>
            </div>
            <div className="card-body">
              <div className="nav nav-tabs" role="tablist" style={{ borderBottom: '1px solid rgba(200, 180, 255, 0.5)' }}>
                <a
                  href="#rest-api"
                  className="nav-link active"
                  data-bs-toggle="tab"
                  style={{ 
                    color: '#6a11cb',
                    borderColor: 'rgba(200, 180, 255, 0.5)',
                    background: 'rgba(220, 210, 255, 0.3)'
                  }}
                >
                  REST API
                </a>
                <a 
                  href="#sdk" 
                  className="nav-link" 
                  data-bs-toggle="tab"
                  style={{ color: '#666' }}
                >
                  SDK
                </a>
              </div>
              <div className="tab-content mt-4">
                <div className="tab-pane fade show active" id="rest-api">
                  <h3 className="h5 mb-3" style={{ color: '#6a11cb' }}>Endpoints</h3>
                  <div className="p-4 rounded" style={codeBlockStyle}>
                    <h5 className="text-monospace text-sm font-semibold" style={{ color: '#6a11cb' }}>
                      POST /api/optimize
                    </h5>
                    <p style={{ color: '#666' }}>Optimize an existing SQL query</p>
                    <h6 className="text-sm font-semibold mt-3" style={{ color: '#6a11cb' }}>
                      Request Body:
                    </h6>
                    <pre className="p-3 rounded mt-2 overflow-x-auto" style={codeBlockStyle}>
                      {`{
  "query": "SELECT * FROM customers",
  "schema": "optional_schema_id",
  "options": {
    "level": "performance" // or "readability"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="tab-pane fade" id="sdk">
                  <h3 className="h5 mb-3" style={{ color: '#6a11cb' }}>JavaScript SDK</h3>
                  <div className="p-4 rounded" style={codeBlockStyle}>
                    <pre className="p-3 rounded overflow-x-auto" style={codeBlockStyle}>
                      {`// Installation
npm install techoptimizers-sdk

// Usage
import { TechOptimizers } from 'techoptimizers-sdk';

const client = new TechOptimizers({
  apiKey: 'your_api_key'
});

// Optimize a query
const result = await client.optimizeQuery({
  query: 'SELECT * FROM customers',
  options: { level: 'performance' }
});

// Natural language to SQL
const sqlQuery = await client.naturalLanguageToSQL({
  text: 'Show all customers who spent more than $100'
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Examples Section */}
          <div className="card mb-4" style={cardGradient} id="examples">
            <div className="card-header" style={{ 
              background: 'rgba(220, 210, 255, 0.5)',
              borderBottom: '1px solid rgba(200, 180, 255, 0.5)'
            }}>
              <h2 className="card-title mb-0" style={{ color: '#6a11cb' }}>
                <FileText className="h-5 w-5 mr-2 d-inline" style={{ color: '#8a63ff' }} />
                Examples
              </h2>
            </div>
            <div className="card-body">
              <h3 className="h5 mb-4" style={{ color: '#6a11cb' }}>Basic Query Optimization</h3>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-4 rounded" style={codeBlockStyle}>
                    <h6 className="text-sm font-semibold" style={{ color: '#6a11cb' }}>Original Query:</h6>
                    <pre className="p-3 rounded mt-2 overflow-x-auto" style={codeBlockStyle}>
                      {`SELECT * 
FROM orders 
WHERE customer_id = 123`}
                    </pre>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded" style={codeBlockStyle}>
                    <h6 className="text-sm font-semibold" style={{ color: '#6a11cb' }}>Optimized Query:</h6>
                    <pre className="p-3 rounded mt-2 overflow-x-auto" style={codeBlockStyle}>
                      {`SELECT order_id, order_date, status, total_amount
FROM orders
WHERE customer_id = 123
ORDER BY order_date DESC
LIMIT 100`}
                    </pre>
                  </div>
                </div>
              </div>

              <h3 className="h5 mt-5 mb-4" style={{ color: '#6a11cb' }}>Natural Language Example</h3>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-4 rounded" style={codeBlockStyle}>
                    <h6 className="text-sm font-semibold" style={{ color: '#6a11cb' }}>Natural Language:</h6>
                    <div className="p-3" style={{ color: '#666' }}>
                      Find all customers who made a purchase in the last 30 days
                      and spent more than $500 total
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded" style={codeBlockStyle}>
                    <h6 className="text-sm font-semibold" style={{ color: '#6a11cb' }}>Generated SQL:</h6>
                    <pre className="p-3 rounded mt-2 overflow-x-auto" style={codeBlockStyle}>
                      {`SELECT 
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email,
  SUM(o.total_amount) AS total_spent
FROM 
  customers c
JOIN 
  orders o ON c.customer_id = o.customer_id
WHERE 
  o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY 
  c.customer_id, c.first_name, c.last_name, c.email
HAVING 
  total_spent > 500
ORDER BY 
  total_spent DESC`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <a
                  href="/assistant"
                  className="btn btn-lg d-inline-flex align-items-center py-3 px-4"
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Try the SQL Assistant now{" "}
                  <ArrowRight className="ms-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background-color: #f5f0ff;
          background-image: linear-gradient(145deg, #f0e5ff 0%, #e5daff 100%);
          color: #333;
        }
        
        .hover-glow:hover {
          background: rgba(220, 210, 255, 0.3) !important;
        }
        
        .steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .step-number {
          background: linear-gradient(145deg, #8a63ff, #6d8cff);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .step-content {
          color: #555;
          padding-top: 4px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(220, 210, 255, 0.5);
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(138, 99, 255, 0.1);
          border-color: rgba(200, 180, 255, 0.8);
        }
        
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          background: rgba(220, 210, 255, 0.3);
        }
        
        .feature-card h4 {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        .feature-card p {
          font-size: 0.9rem;
          margin-bottom: 0;
        }
        
        .text-monospace {
          font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(138, 99, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
}