import { Link } from "react-router-dom";
import { ArrowRight, Database, Code, Sparkles, Type } from "lucide-react";
import Button from "../components/ui/button";
import TypewriterEffect from "../components/TypewriterEffect";
export default function Home() {
  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <header className="navbar navbar-expand-lg navbar-light bg-light"></header>

      {/* Main Section */}
      <main>
        <section className="py-5 text-center">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold">
                  <TypewriterEffect />
                </h1>
                <p className="lead text-muted">
                  TechOptimizers helps you write, optimize, and understand SQL
                  queries using advanced AI technology. Save time and improve
                  database performance with intelligent query suggestions.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Button variant="primary" size="lg">
                    <Link to="/assistant" className="text-white">
                      Try SQL Assistant <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline-primary" size="lg">
                    <Link to="/docs">View Documentation</Link>
                  </Button>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">SQL Assistant</h5>
                    <pre className="bg-light p-3 rounded">
                      <span className="text-primary">-- User Query</span>
                      <p className="font-monospace">
                        SELECT * FROM customers WHERE last_purchase &gt;
                        '2023-01-01'
                      </p>
                    </pre>
                    <pre className="bg-primary/10 p-3 rounded text-primary">
                      <span className="font-semibold">AI Suggestion:</span>
                      <p className="font-monospace">
                        {`SELECT c.customer_id, c.name, c.email, c.last_purchase
FROM customers c
WHERE c.last_purchase > '2023-01-01'
ORDER BY c.last_purchase DESC
LIMIT 100;`}
                      </p>
                      <ul className="list-unstyled mt-2">
                        <li>
                          ✓ Added specific columns instead of * for better
                          performance
                        </li>
                        <li>✓ Added ORDER BY for more useful results</li>
                        <li>
                          ✓ Added LIMIT to prevent excessive data retrieval
                        </li>
                      </ul>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="bg-light py-5">
          <div className="container text-center">
            <h2 className="fw-bold mb-4">Why Choose TechOptimizers</h2>
            <p className="text-muted mb-5">
              Our AI-powered SQL assistant helps you write better queries,
              faster.
            </p>
            <div className="row">
              <div className="col-md-4">
                <div className="card p-4">
                  <div className="card-body text-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <h3 className="fw-bold mt-3">AI-Powered Optimization</h3>
                    <p className="text-muted">
                      Automatically optimize your SQL queries for better
                      performance and readability.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-4">
                  <div className="card-body text-center">
                    <Database className="h-8 w-8 text-primary" />
                    <h3 className="fw-bold mt-3">Schema Understanding</h3>
                    <p className="text-muted">
                      Our AI understands your database schema to provide
                      context-aware suggestions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-4">
                  <div className="card-body text-center">
                    <Code className="h-8 w-8 text-primary" />
                    <h3 className="fw-bold mt-3">Natural Language to SQL</h3>
                    <p className="text-muted">
                      Convert plain English descriptions into optimized SQL
                      queries with a single click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <div className="d-flex justify-content-center gap-2">
            <Database className="h-5 w-5" />
            <span>TechOptimizers</span>
          </div>
          <p className="text-muted mt-2">
            © 2024 TechOptimizers. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
