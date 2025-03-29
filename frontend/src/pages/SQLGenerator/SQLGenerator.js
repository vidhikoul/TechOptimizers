import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Navbar, Modal, Toast, Dropdown, Table } from 'react-bootstrap';
import { Copy, Database, Magic, Eye, EyeSlash } from 'react-bootstrap-icons';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

class ResizeObserverErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return /ResizeObserver/.test(error.message) ? { hasError: true } : null;
  }

  componentDidCatch(error) {
    if (!/ResizeObserver/.test(error.message)) {
      console.error(error);
    }
  }

  render() {
    return this.props.children;
  }
}

const SQLAssistant = () => {
  const navigate = useNavigate();
  const [leftPanelWidth, setLeftPanelWidth] = useState('30%');
  const dividerRef = useRef(null);
  const containerRef = useRef(null);

  // State declarations
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [editorQuery, setEditorQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dbType, setDbType] = useState('mysql');
  const [dbConfig, setDbConfig] = useState({
    mysql: { uid : 'tempuser', host: '', port: '3306', user: '', password: '', db_name: '' },
    postgres: { host: '', port: '5432', user: '', password: '', database: '' },
    spark: { host: '', port: '10000', username: '', password: '' },
    trino: { host: '', port: '8080', username: '', password: '' }
  });
  const [connectionStatus, setConnectionStatus] = useState('');
  const [ghostMode, setGhostMode] = useState(false);
  const [showGhostSuggestion, setShowGhostSuggestion] = useState(false);
  const [ghostSuggestion, setGhostSuggestion] = useState('');
  const [isGeneratingGhostSuggestion, setIsGeneratingGhostSuggestion] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const startX = useRef(0);
  const startWidth = useRef(0);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const ghostModeRef = useRef(ghostMode);

  // Suppress ResizeObserver errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (/ResizeObserver/.test(args[0])) return;
      originalError.apply(console, args);
    };
    return () => { console.error = originalError; };
  }, []);

  // Handle divider resizing
  const handleDividerMouseDown = (e) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startWidth.current = parseInt(leftPanelWidth, 10);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - startX.current;
    const newWidth = startWidth.current + (deltaX / containerRect.width) * 100;
    setLeftPanelWidth(`${Math.max(20, Math.min(60, newWidth))}%`);
  }, [isDragging]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Database connection handlers
  const handleDbConfigChange = (field, value) => {
    setDbConfig(prev => ({
      ...prev,
      [dbType]: { ...prev[dbType], [field]: value }
    }));
  };

  const handleConnectDatabase = async () => {
    const currentConfig = dbConfig[dbType];
    const requiredFields = dbType === 'spark' || dbType === 'trino'
      ? ['host', 'port', 'username'] 
      : ['host', 'port', 'user', 'password', 'db_name'];
    
    const missingFields = requiredFields.filter(field => !currentConfig[field]);
    if (missingFields.length > 0) {
      setToastMessage(`Missing fields: ${missingFields.join(', ')}`);
      setShowToast(true);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/mysql/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbType, ...currentConfig }),
      });

      const result = await response.json();
      if (result.success) {
        setShowModal(false);
        setConnectionStatus(`${dbType.toUpperCase()}: ${currentConfig.database || currentConfig.host}`);
        setToastMessage('Connected to database successfully!');
        setShowToast(false);
        setToastMessage('Connected successfully!');
      } else {
        throw new Error(result.message || 'Failed to connect');
      }
    } catch (error) {
      setToastMessage(`Connection failed: ${error.message}`);
    } finally {
      setShowToast(true);
    }
  };

  // Editor handlers
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    editor.onKeyDown((e) => {
      if (e.code === "Enter" && ghostModeRef.current) {
        const position = editor.getPosition();
        const model = editor.getModel();
        if (model) {
          const lineContent = model.getLineContent(position.lineNumber).trim();
          if (lineContent.startsWith("--")) {
            const comment = lineContent.substring(2).trim();
            if (comment) handleGhostSuggestion(comment, position);
          }
        }
      }
    });

    // Initial layout stabilization
    setTimeout(() => editor.layout(), 100);
  };

  const handleGhostSuggestion = async (comment) => {
    setIsGeneratingGhostSuggestion(true);
    try {
      const res = await axios.get('http://localhost:5001/api/mysql/generate', { 
        params: { userQuery: comment }  
      });
      if (res.data.sql_query) {
        setGhostSuggestion(res.data.sql_query.replace(/```sql|```/g, '').trim());
        setShowGhostSuggestion(true);
      }
    } catch (error) {
      setToastMessage('Error generating SQL from comment!');
      setShowToast(true);
    } finally {
      setIsGeneratingGhostSuggestion(false);
    }
  };

  const applyGhostSuggestion = () => {
    if (!ghostSuggestion || !editorRef.current || !monacoRef.current) return;
    
    const position = editorRef.current.getPosition();
    editorRef.current.executeEdits("insert-sql", [{
      range: new monacoRef.current.Range(position.lineNumber + 1, 1, position.lineNumber + 1, 1),
      text: "\n" + ghostSuggestion,
      forceMoveMarkers: true
    }]);
    
    setShowGhostSuggestion(false);
    setToastMessage('Suggestion applied!');
    setShowToast(true);
  };

  const toggleGhostMode = () => {
    const newState = !ghostMode;
    setGhostMode(newState);
    ghostModeRef.current = newState;
    setToastMessage(`Ghost Mode ${newState ? 'enabled' : 'disabled'}`);
    setShowToast(true);
  };

  // SQL generation and execution
  const generateSQL = async () => {
    if (!userQuery.trim()) return;
    
    setLoading(true);
    setChatHistory(prev => [...prev, { type: 'user', content: userQuery }]);
    
    try {
      const res = await axios.post('http://localhost:5001/api/mysql/generateSql', {
        "uid" : "tempuser", "query" : userQuery, "dialect" : "mysql"
      });
      
      const sqlResponse = res.data.query.replace(/```sql|```/g, '').trim();
      
      const botChatEntry = { type: 'bot', content: sqlResponse };
      setChatHistory(prev => [...prev, botChatEntry]);
      
      setToastMessage('SQL generated successfully!');
    } catch (error) {
      setChatHistory(prev => [...prev, { type: 'bot', content: 'Error generating SQL' }]);
      setToastMessage('Error generating SQL!');
    } finally {
      setLoading(false);
      setShowToast(true);
    }
  };

  const executeQuery = async () => {
    if (!editorQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/mysql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: editorQuery,
          dbType: dbType,
          ...dbConfig[dbType]
        }),
      });

      const result = await response.json();
      if (result.success) {
        setQueryResult(result.data);
        setToastMessage('Query executed successfully!');
      } else {
        throw new Error(result.message || 'Failed to execute query');
      }
    } catch (error) {
      setToastMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setShowToast(true);
    }
  };

  const copyToClipboard = (content) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setToastMessage('Copied to clipboard!');
    setShowToast(true);
  };

  // Render methods
  const renderDbConnectionForm = () => {
    const config = dbConfig[dbType];
    const commonFields = [
      { field: 'host', placeholder: 'localhost' },
      { field: 'port', placeholder: dbType === 'mysql' ? '3306' : dbType === 'postgres' ? '5432' : dbType === 'spark' ? '10000' : '8080' },
      { field: dbType === 'spark' || dbType === 'trino' ? 'username' : 'user', placeholder: dbType === 'mysql' ? 'root' : dbType === 'postgres' ? 'postgres' : dbType === 'spark' ? 'spark_user' : 'trino_user' }
    ];

    return (
      <>
        {commonFields.map(({ field, placeholder }) => (
          <Form.Group key={field} className="mb-3">
            <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
            <Form.Control
              type={field === 'password' ? 'password' : 'text'}
              value={config[field] || ''}
              onChange={(e) => handleDbConfigChange(field, e.target.value)}
              placeholder={placeholder}
            />
          </Form.Group>
        ))}

        {(dbType === 'mysql' || dbType === 'postgres') && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={config.password}
                onChange={(e) => handleDbConfigChange('password', e.target.value)}
                placeholder="password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Database Name</Form.Label>
              <Form.Control
                type="text"
                value={config.db_name}
                onChange={(e) => handleDbConfigChange('db_name', e.target.value)}
                placeholder="database_name"
              />
            </Form.Group>
          </>
        )}

        {dbType === 'spark' && (
          <Form.Group className="mb-3">
            <Form.Label>Password (Optional)</Form.Label>
            <Form.Control
              type="password"
              value={config.password}
              onChange={(e) => handleDbConfigChange('password', e.target.value)}
              placeholder="password"
            />
          </Form.Group>
        )}
      </>
    );
  };

  const renderQueryResults = () => {
    if (!queryResult) {
      return <div className="text-muted p-3">Results will appear here after query execution</div>;
    }

    if (queryResult.length === 0) {
      return <div className="text-muted p-3">Query executed successfully but returned no data</div>;
    }

    return (
      <div className="query-results-container">
        <Table bordered hover size="sm" className="results-table m-0">
          <thead>
            <tr>
              {Object.keys(queryResult[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queryResult.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, idx) => (
                  <td key={idx}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <ResizeObserverErrorBoundary>
      <Container fluid className="vh-100 p-0 d-flex flex-column">
        <style>{`
          .chat-container {
            display: flex;
            height: calc(100vh - 72px);
            width: 100%;
            contain: layout paint;
          }

          .left-panel {
            width: ${leftPanelWidth};
            height: 100%;
            min-width: 250px;
            max-width: 60%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            contain: strict;
          }

          .right-panel {
            flex: 1;
            height: 100%;
            min-width: 40%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            contain: strict;
          }

          .divider {
            width: 6px;
            height: 100%;
            background-color: #f0f0f0;
            cursor: col-resize;
            flex-shrink: 0;
          }

          .chat-history {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            contain: content;
          }

          .editor-container {
            flex: 1;
            min-height: 200px;
            overflow: hidden;
            contain: strict;
          }

          .query-results-container {
            flex: 1;
            min-height: 200px;
            max-height: 300px;
            overflow: auto;
            contain: strict;
          }

          .results-table {
            width: 100%;
            font-size: 0.85rem;
          }

          .results-table th {
            position: sticky;
            top: 0;
            background: white;
            z-index: 10;
          }

          .ghost-mode-toggle {
            position: absolute;
            right: 15px;
            top: 15px;
            z-index: 100;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #ddd;
            transition: all 0.3s ease;
          }
          
          .ghost-mode-toggle:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(1.1);
          }
          
          .ghost-mode-toggle.active {
            background: rgba(108, 117, 125, 0.8);
            color: white;
          }
          
          .ghost-suggestion-panel {
            position: absolute;
            right: 0;
            top: 0;
            width: 350px;
            height: 100%;
            background: white;
            z-index: 90;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            padding: 15px;
            overflow-y: auto;
            transition: transform 0.3s ease;
            contain: strict;
          }

          .chat-message {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: 12px;
            max-width: 85%;
            word-wrap: break-word;
            font-size: 0.9rem;
            contain: content;
          }

          .user-message {
            align-self: flex-end;
            background-color: #e3f2fd;
            margin-left: auto;
            border-bottom-right-radius: 2px;
          }

          .bot-message {
            align-self: flex-start;
            background-color: #f5f5f5;
            margin-right: auto;
            border-bottom-left-radius: 2px;
          }
        `}</style>
        
        <Navbar bg="dark" variant="dark" className="p-3">
          <Container fluid className="navbar-content">
            <Navbar.Brand className="fs-4 fw-bold">SQL Assistant</Navbar.Brand>
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="outline-light"
                onClick={toggleGhostMode}
                active={ghostMode}
                className="d-flex align-items-center"
                size="sm"
              >
                <Magic className="me-1" size={14} />
                Ghost Mode
              </Button>
              <Button
                onClick={() => navigate('/SchemaGenerator')}
                disabled={loading}
                variant="outline-light"
                size="sm"
              >
                Schema Recommendation
              </Button>
              <Button
                variant={connectionStatus ? 'primary' : 'success'}
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="d-flex align-items-center"
                size="sm"
              >
                <Database className="me-1" size={14} />
                {connectionStatus || 'Connect DB'}
              </Button>
            </div>
          </Container>
        </Navbar>

        <div className="chat-container" ref={containerRef}>
          <div className="left-panel">
            <Card className="h-100 d-flex flex-column">
              <Card.Header className="bg-white p-2">
                <h5 className="m-0 fs-5">SQL Chat Assistant</h5>
              </Card.Header>
              <Card.Body className="d-flex flex-column p-0 overflow-hidden">
                <div className="chat-history">
                  {chatHistory.length === 0 ? (
                    <div className="text-muted text-center py-5">
                      Start a conversation by entering your query
                    </div>
                  ) : (
                    chatHistory.map((item, index) => (
                      <div 
                        key={index} 
                        className={`chat-message ${item.type === 'user' ? 'user-message' : 'bot-message'}`}
                      >
                        <strong className="d-block mb-1">{item.type === 'user' ? 'You:' : 'Assistant:'}</strong>
                        <div>
                          {item.type === 'bot' ? (
                            <>
                              <pre>{item.content}</pre>
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => copyToClipboard(item.content)}
                                className="mt-1"
                              >
                                <Copy size={12} className="me-1" /> Copy SQL
                              </Button>
                            </>
                          ) : (
                            item.content
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Form.Group className="p-2 border-top">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Describe the SQL query you need..."
                    disabled={loading}
                    className="fs-6"
                  />
                  <Button 
                    className="mt-2 w-100" 
                    onClick={generateSQL} 
                    disabled={loading || !userQuery.trim()}
                    size="sm"
                  >
                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : 'Generate SQL'}
                  </Button>
                </Form.Group>
              </Card.Body>
            </Card>
          </div>

          <div 
            className="divider"
            ref={dividerRef}
            onMouseDown={handleDividerMouseDown}
          />

          <div className="right-panel d-flex flex-column">
            <div className="d-flex flex-column h-100 position-relative">
              <div 
                className={`ghost-mode-toggle ${ghostMode ? 'active' : ''}`}
                onClick={toggleGhostMode}
                title={ghostMode ? 'Disable Ghost Mode' : 'Enable Ghost Mode'}
              >
                {ghostMode ? <Eye size={16} /> : <EyeSlash size={16} />}
              </div>
              
              {showGhostSuggestion && (
                <div className="ghost-suggestion-panel">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Ghost Suggestion</h5>
                    <Button 
                      variant="outline-secondary"
                      size="sm" 
                      onClick={() => setShowGhostSuggestion(false)}
                    >
                      Close
                    </Button>
                  </div>
                  
                  {isGeneratingGhostSuggestion ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Generating SQL suggestion...</p>
                    </div>
                  ) : (
                    <>
                      <pre className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                        {ghostSuggestion}
                      </pre>
                      <div className="d-flex justify-content-between mt-3">
                        <Button 
                          variant="outline-secondary"
                          onClick={() => {
                            copyToClipboard(ghostSuggestion);
                            setShowGhostSuggestion(false);
                          }}
                        >
                          <Copy className="me-2" /> Copy Only
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => {
                            applyGhostSuggestion();
                            setShowGhostSuggestion(false);
                          }}
                        >
                          Apply to Editor
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <Card className="flex-grow-1 mb-2 shadow-sm">
                <Card.Header className="bg-white p-2 d-flex justify-content-between align-items-center">
                  <h5 className="m-0 fs-5">SQL Editor</h5>
                  {ghostMode && (
                    <span className="text-success" style={{ fontSize: '0.8rem' }}>
                      Ghost Mode Active
                    </span>
                  )}
                </Card.Header>
                <Card.Body className="p-0 editor-container">
                  <Editor
                    height="100%"
                    defaultLanguage="sql"
                    value={editorQuery}
                    onChange={setEditorQuery}
                    defaultValue="-- Write your SQL query here\n-- Press Enter in Ghost Mode to generate from comments"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      scrollbar: {
                        alwaysConsumeMouseWheel: false,
                        vertical: 'hidden',
                        horizontal: 'hidden'
                      },
                      renderWhitespace: 'none',
                      lineNumbersMinChars: 3
                    }}
                    onMount={handleEditorDidMount}
                  />
                </Card.Body>
                <Card.Footer className="bg-white p-2">
                  <Button 
                    className="w-100" 
                    onClick={executeQuery} 
                    disabled={loading || !editorQuery.trim()}
                    size="sm"
                  >
                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : 'Execute Query'}
                  </Button>
                </Card.Footer>
              </Card>

              <Card className="shadow-sm flex-grow-1">
                <Card.Header className="bg-white p-2">
                  <h5 className="m-0 fs-5">Query Results</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {renderQueryResults()}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Database Connection</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Database Type</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" className="w-100">
                    {dbType.toUpperCase()}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    <Dropdown.Item onClick={() => setDbType('mysql')}>MySQL</Dropdown.Item>
                    <Dropdown.Item onClick={() => setDbType('postgres')}>PostgreSQL</Dropdown.Item>
                    <Dropdown.Item onClick={() => setDbType('spark')}>Spark SQL</Dropdown.Item>
                    <Dropdown.Item onClick={() => setDbType('trino')}>Trino</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
              
              {renderDbConnectionForm()}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConnectDatabase}>
              Connect
            </Button>
          </Modal.Footer>
        </Modal>

        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          style={{ position: 'fixed', bottom: '20px', right: '20px' }}
        >
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </Container>
    </ResizeObserverErrorBoundary>
  );
};

export default SQLAssistant;