import { FileText, Code, Database, BookOpen, ArrowRight } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Documentation() {
  return (
    <div className="container my-5">
      <h1 className="display-4 mb-4">Documentation</h1>
      <p className="text-muted mb-5">
        Learn how to use the TechOptimizers SQL Assistant
      </p>

      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Navigation</h5>
            </div>
            <div className="card-body">
              <nav className="nav flex-column">
                <a
                  href="#getting-started"
                  className="nav-link d-flex align-items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Getting Started
                </a>
                <a
                  href="#sql-assistant"
                  className="nav-link d-flex align-items-center"
                >
                  <Database className="h-4 w-4 mr-2" />
                  SQL Assistant
                </a>
                <a
                  href="#api-reference"
                  className="nav-link d-flex align-items-center"
                >
                  <Code className="h-4 w-4 mr-2" />
                  API Reference
                </a>
                <a
                  href="#examples"
                  className="nav-link d-flex align-items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Examples
                </a>
              </nav>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card mb-4" id="getting-started">
            <div className="card-header">
              <h5 className="card-title">Getting Started</h5>
            </div>
            <div className="card-body">
              <h3 className="h5">Introduction</h3>
              <p>
                TechOptimizers SQL Assistant is an AI-powered tool that helps
                you write, optimize, and understand SQL queries. It uses
                advanced machine learning models to analyze your database schema
                and provide intelligent suggestions.
              </p>

              <h3 className="h5">Key Features</h3>
              <ul>
                <li>SQL query optimization with detailed explanations</li>
                <li>Natural language to SQL conversion</li>
                <li>Schema-aware suggestions and auto-completion</li>
                <li>Performance analytics and monitoring</li>
              </ul>

              <h3 className="h5">Quick Start</h3>
              <ol>
                <li>
                  Navigate to the{" "}
                  <a href="/assistant" className="text-primary">
                    SQL Assistant
                  </a>{" "}
                  page
                </li>
                <li>Enter your SQL query or natural language description</li>
                <li>Click "Optimize" or "Generate SQL" to get results</li>
                <li>Review the optimized query and suggestions</li>
              </ol>
            </div>
          </div>

          <div className="card mb-4" id="sql-assistant">
            <div className="card-header">
              <h5 className="card-title">SQL Assistant</h5>
            </div>
            <div className="card-body">
              <h3 className="h5">SQL Editor Mode</h3>
              <p>
                The SQL Editor mode allows you to input your existing SQL
                queries for optimization. The assistant will analyze your query
                and suggest improvements for performance, readability, and best
                practices.
              </p>

              <h3 className="h5">Natural Language Mode</h3>
              <p>
                The Natural Language mode lets you describe what you want to
                query in plain English. For example, you can type "Show me all
                customers who made a purchase in the last 30 days" and the
                assistant will generate the appropriate SQL query.
              </p>

              <h3 className="h5">Understanding Results</h3>
              <p>
                When you receive an optimized query, the assistant will provide:
              </p>
              <ul>
                <li>The optimized SQL query</li>
                <li>Explanations for each optimization made</li>
                <li>Performance impact estimates</li>
                <li>Alternative approaches when applicable</li>
              </ul>
            </div>
          </div>

          <div className="card mb-4" id="api-reference">
            <div className="card-header">
              <h5 className="card-title">API Reference</h5>
            </div>
            <div className="card-body">
              <div className="nav nav-tabs" role="tablist">
                <a
                  href="#rest-api"
                  className="nav-link active"
                  data-bs-toggle="tab"
                >
                  REST API
                </a>
                <a href="#sdk" className="nav-link" data-bs-toggle="tab">
                  SDK
                </a>
              </div>
              <div className="tab-content mt-3">
                <div className="tab-pane fade show active" id="rest-api">
                  <h3 className="h5">Endpoints</h3>
                  <div className="p-3 border rounded">
                    <h5 className="text-mono text-sm font-semibold">
                      POST /api/optimize
                    </h5>
                    <p>Optimize an existing SQL query</p>
                    <h6 className="text-sm font-semibold mt-3">
                      Request Body:
                    </h6>
                    <pre className="bg-muted p-2 rounded-md text-xs mt-1 overflow-x-auto">
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
                  <h3 className="h5">JavaScript SDK</h3>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
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

          <div className="card mb-4" id="examples">
            <div className="card-header">
              <h5 className="card-title">Examples</h5>
            </div>
            <div className="card-body">
              <h3 className="h5 mb-3">Basic Query Optimization</h3>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-sm font-semibold">Original Query:</h6>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {`SELECT * 
FROM orders 
WHERE customer_id = 123`}
                  </pre>
                </div>
                <div className="col-md-6">
                  <h6 className="text-sm font-semibold">Optimized Query:</h6>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {`SELECT order_id, order_date, status, total_amount
FROM orders
WHERE customer_id = 123
ORDER BY order_date DESC
LIMIT 100`}
                  </pre>
                </div>
              </div>

              <h3 className="h5 mb-3">Natural Language Example</h3>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-sm font-semibold">Natural Language:</h6>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    Find all customers who made a purchase in the last 30 days
                    and spent more than $500 total
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-sm font-semibold">Generated SQL:</h6>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
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

              <div className="text-center mt-4">
                <a
                  href="/assistant"
                  className="btn btn-primary d-flex align-items-center"
                >
                  Try the SQL Assistant now{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}