import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, Card, Form, Button, Spinner, Navbar, 
  Modal, Toast, Dropdown, Tab, Tabs, Table, 
  Badge, OverlayTrigger, Tooltip, Accordion 
} from 'react-bootstrap';
import { 
  Copy, Database, Magic, Eye, EyeSlash, 
  Play, Save, QuestionCircle, Lightning, 
  Gear, Columns, ClockHistory 
} from 'react-bootstrap-icons';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'sql-formatter';

const SQLAssistant = () => {
  const navigate = useNavigate();
  const [leftPanelWidth, setLeftPanelWidth] = useState('30%');
  const dividerRef = useRef(null);
  const containerRef = useRef(null);

  // State for chat interface
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  
  // State for editor and execution
  const [editorQuery, setEditorQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);

  // State for database connection
  const [showModal, setShowModal] = useState(false);
  const [dbType, setDbType] = useState('mysql');
  const [dbConfig, setDbConfig] = useState({
    mysql: { uid: "tempuser",host: 'localhost', port: '3306', user: 'root', password: '', database: '' },
    postgres: { host: 'localhost', port: '5432', user: 'postgres', password: '', database: '' },
    spark: { host: 'localhost', port: '10000', username: '', password: '' },
    trio: { host: 'localhost', port: '8080', username: '', password: '' }
  });
  const [connectionStatus, setConnectionStatus] = useState('');

  // State for ghost mode
  const [ghostMode, setGhostMode] = useState(false);
  const [showGhostSuggestion, setShowGhostSuggestion] = useState(false);
  const [ghostSuggestion, setGhostSuggestion] = useState('');
  const [isGeneratingGhostSuggestion, setIsGeneratingGhostSuggestion] = useState(false);

  // UI state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showQueryHistory, setShowQueryHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorTheme, setEditorTheme] = useState('light');
  const [autoFormat, setAutoFormat] = useState(true);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const ghostModeRef = useRef(ghostMode);
  const chatHistoryRef = useRef(null);

  // Handle divider mouse down
  const handleDividerMouseDown = (e) => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle mouse move for divider
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Set min and max width constraints (20% to 60%)
    const clampedWidth = Math.max(20, Math.min(60, newWidth));
    setLeftPanelWidth(`${clampedWidth}%`);
  };

  // Handle mouse up for divider
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]); // Add dependencies here
  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle database configuration changes
  const handleDbConfigChange = (field, value) => {
    setDbConfig(prev => ({
      ...prev,
      [dbType]: {
        ...prev[dbType],
        [field]: value
      }
    }));
  };

  // Handle database connection
  const handleConnectDatabase = async () => {
    const currentConfig = dbConfig[dbType];
    const requiredFields = dbType === 'spark' || dbType === 'trio'
      ? ['host', 'port', 'username'] 
      : ['host', 'port', 'user', 'database'];
    
    const missingFields = requiredFields.filter(field => !currentConfig[field]);
    if (missingFields.length > 0) {
      setToastMessage(`Missing required fields: ${missingFields.join(', ')}`);
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://techoptimizers-ml-backend.onrender.com/mysql/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentConfig
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowModal(false);
        const displayName = dbType === 'spark' || dbType === 'trio' 
          ? currentConfig.host 
          : currentConfig.database;
        setConnectionStatus(`${dbType.toUpperCase()}: ${displayName}`);
        setToastMessage('Connected to database successfully!');
        setShowToast(true);
      } else {
        throw new Error(result.message || 'Failed to connect');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setToastMessage(`Connection failed: ${error.message}`);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
  
    editor.onKeyDown((e) => {
      if (e.code !== "Enter" || !ghostModeRef.current) return;

      const position = editor.getPosition();
      const model = editor.getModel();
      if (model) {
        const lineContent = model.getLineContent(position.lineNumber).trim();
        if (lineContent.startsWith("--")) {
          const comment = lineContent.substring(2).trim();
          if (comment) {
            handleGhostSuggestion(comment, position);
          }
        }
      }
    });
  };

  // Handle ghost mode suggestions
  const handleGhostSuggestion = async (comment, position) => {
    setIsGeneratingGhostSuggestion(true);
    try {
      const res = await axios.get('http://localhost:5001/api/sql/generate', { 
        params: { userQuery: comment }  
      });
      
      if (res.data.sql_query) {
        const formattedSQL = format(res.data.sql_query.replace(/```sql|```/g, '').trim(), {
          language: dbType === 'postgres' ? 'postgresql' : dbType
        });
        setGhostSuggestion(formattedSQL);
        setShowGhostSuggestion(true);
      }
    } catch (error) {
      console.error('Error generating SQL:', error);
      setToastMessage('Error generating SQL from comment!');
      setShowToast(true);
    } finally {
      setIsGeneratingGhostSuggestion(false);
    }
  };

  // Apply ghost suggestion to editor
  const applyGhostSuggestion = () => {
    if (!ghostSuggestion || !editorRef.current || !monacoRef.current) return;
    
    const position = editorRef.current.getPosition();
    const monaco = monacoRef.current;
    
    editorRef.current.executeEdits("insert-sql", [{
      range: new monaco.Range(position.lineNumber + 1, 1, position.lineNumber + 1, 1),
      text: "\n" + ghostSuggestion,
      forceMoveMarkers: true
    }]);
    
    setShowGhostSuggestion(false);
    setToastMessage('Ghost Writer applied the suggestion!');
    setShowToast(true);
  };

  // Toggle ghost mode
  const toggleGhostMode = () => {
    setGhostMode((prev) => {
      const newState = !prev;
      ghostModeRef.current = newState;
      return newState;
    });
    
    setToastMessage(`Ghost Mode ${ghostMode ? 'disabled' : 'enabled'}`);
    setShowToast(true);
  };

  // Generate SQL from natural language
  const generateSQL = async () => {
    if (!userQuery.trim()) return;
    
    setLoading(true);
    const newChatEntry = { type: 'user', content: userQuery };
    setChatHistory(prev => [...prev, newChatEntry]);
    
    try {
      const res = await axios.get('http://localhost:5001/api/sql/generate', {
        params: { 
          userQuery: userQuery,
          dbType: dbType
        }
      });
      
      let sqlResponse = res.data.sql_query.replace(/```sql|```/g, '').trim();
      
      // Format the SQL if auto-format is enabled
      if (autoFormat) {
        sqlResponse = format(sqlResponse, {
          language: dbType === 'postgres' ? 'postgresql' : dbType
        });
      }
      
      const botChatEntry = { 
        type: 'bot', 
        content: sqlResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, botChatEntry]);
      
      setToastMessage('SQL generated successfully!');
      setShowToast(true);
    } catch (error) {
      console.error(error);
      const errorChatEntry = { 
        type: 'bot', 
        content: 'Error generating SQL. Please try again.',
        error: true,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, errorChatEntry]);
      
      setToastMessage('Error generating SQL!');
      setShowToast(true);
    } finally {
      setLoading(false);
      setUserQuery('');
    }
  };

  // Execute SQL query
  const executeQuery = async () => {
    if (!editorQuery.trim()) return;
    
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const response = await fetch('http://localhost:5001/api/sql/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: editorQuery,
          dbType: dbType,
          ...dbConfig[dbType]
        }),
      });

      const result = await response.json();
      const endTime = performance.now();
      setExecutionTime(((endTime - startTime) / 1000).toFixed(2));
      
      if (result.success) {
        setQueryResult(result.data);
        setToastMessage('Query executed successfully!');
        setShowToast(true);
        
        // Add to query history
        const newHistoryItem = {
          query: editorQuery,
          timestamp: new Date().toLocaleString(),
          resultCount: result.data ? result.data.length : 0,
          executionTime: ((endTime - startTime) / 1000).toFixed(2)
        };
        
        setQueryHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      } else {
        throw new Error(result.message || 'Failed to execute query');
      }
    } catch (error) {
      console.error(error);
      setToastMessage(`Error: ${error.message}`);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Format SQL in editor
  const formatSQL = () => {
    if (!editorRef.current) return;
    
    const model = editorRef.current.getModel();
    const currentValue = model.getValue();
    
    try {
      const formattedSQL = format(currentValue, {
        language: dbType === 'postgres' ? 'postgresql' : dbType
      });
      
      editorRef.current.setValue(formattedSQL);
      setToastMessage('SQL formatted successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error formatting SQL:', error);
      setToastMessage('Error formatting SQL!');
      setShowToast(true);
    }
  };

  // Load query from history
  const loadQueryFromHistory = (query) => {
    setEditorQuery(query);
    setShowQueryHistory(false);
    setToastMessage('Query loaded from history!');
    setShowToast(true);
  };

  // Copy to clipboard
  const copyToClipboard = (content) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setToastMessage('Copied to clipboard!');
    setShowToast(true);
  };

  // Clear chat history
  const clearChatHistory = () => {
    setChatHistory([]);
    setToastMessage('Chat history cleared!');
    setShowToast(true);
  };

  // Clear query results
  const clearResults = () => {
    setQueryResult(null);
    setExecutionTime(null);
  };

  // Save query to local storage
  const saveQuery = () => {
    if (!editorQuery.trim()) return;
    
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    const newQuery = {
      query: editorQuery,
      timestamp: new Date().toLocaleString(),
      dbType: dbType
    };
    
    localStorage.setItem('savedQueries', JSON.stringify([newQuery, ...savedQueries.slice(0, 49)]));
    setToastMessage('Query saved successfully!');
    setShowToast(true);
  };

  // Render database connection form based on selected type
  const renderDbConnectionForm = () => {
    const config = dbConfig[dbType];
    
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Host</Form.Label>
          <Form.Control
            type="text"
            value={config.host}
            onChange={(e) => handleDbConfigChange('host', e.target.value)}
            placeholder="localhost"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Port</Form.Label>
          <Form.Control
            type="text"
            value={config.port}
            onChange={(e) => handleDbConfigChange('port', e.target.value)}
            placeholder={dbType === 'mysql' ? '3306' : dbType === 'postgres' ? '5432' : dbType === 'spark' ? '10000' : '8080'}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{dbType === 'spark' || dbType === 'trio' ? 'Username' : 'User'}</Form.Label>
          <Form.Control
            type="text"
            value={dbType === 'spark' || dbType === 'trio' ? config.username : config.user}
            onChange={(e) => handleDbConfigChange(dbType === 'spark' || dbType === 'trio' ? 'username' : 'user', e.target.value)}
            placeholder={dbType === 'mysql' ? 'root' : dbType === 'postgres' ? 'postgres' : ''}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={config.password}
            onChange={(e) => handleDbConfigChange('password', e.target.value)}
            placeholder="password"
          />
        </Form.Group>
        {(dbType === 'mysql' || dbType === 'postgres') && (
          <Form.Group className="mb-3">
            <Form.Label>Database Name</Form.Label>
            <Form.Control
              type="text"
              value={config.database}
              onChange={(e) => handleDbConfigChange('database', e.target.value)}
              placeholder="database_name"
            />
          </Form.Group>
        )}
      </>
    );
  };

  // Tooltip components
  const renderTooltip = (props, text) => (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  );

  return (
    <Container fluid className="vh-100 p-0 overflow-hidden" data-theme={editorTheme}>
      {/* Custom CSS styles */}
      <style>{`
        :root {
          --primary-color: #4e73df;
          --secondary-color: #858796;
          --success-color: #1cc88a;
          --info-color: #36b9cc;
          --warning-color: #f6c23e;
          --danger-color: #e74a3b;
          --light-color: #f8f9fc;
          --dark-color: #5a5c69;
        }
        
        [data-theme="dark"] {
          --primary-color: #4e73df;
          --secondary-color: #858796;
          --success-color: #1cc88a;
          --info-color: #36b9cc;
          --warning-color: #f6c23e;
          --danger-color: #e74a3b;
          --light-color: #5a5c69;
          --dark-color: #f8f9fc;
        }
        
        body {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .ghost-mode-toggle {
          position: absolute;
          right: 15px;
          top: 15px;
          z-index: 100;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ddd;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .ghost-mode-toggle:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }
        
        .ghost-mode-toggle.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        .ghost-suggestion-panel {
          position: absolute;
          right: 0;
          top: 0;
          width: 350px;
          height: 100%;
          background: white;
          z-index: 90;
          box-shadow: -2px 0 15px rgba(0, 0, 0, 0.1);
          padding: 15px;
          overflow-y: auto;
          transition: transform 0.3s ease;
          border-left: 1px solid #eee;
        }

        .chat-container {
          display: flex;
          height: calc(100vh - 72px);
          position: relative;
          width: 100%;
        }

        .left-panel {
          width: ${leftPanelWidth};
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-width: 250px;
          max-width: 60%;
          background-color: var(--light-color);
        }

        .right-panel {
          flex: 1;
          height: 100%;
          min-width: 40%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background-color: white;
        }

        .divider {
          width: 8px;
          height: 100%;
          background-color: #f0f0f0;
          cursor: col-resize;
          position: relative;
          z-index: 10;
          transition: background-color 0.2s ease;
        }

        .divider:hover {
          background-color: var(--primary-color);
        }

        .divider::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 2px;
          right: 2px;
          background-color: #ccc;
        }

        .chat-message {
          margin-bottom: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          max-width: 85%;
          word-wrap: break-word;
          font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .user-message {
          align-self: flex-end;
          background-color: var(--primary-color);
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 2px;
        }

        .bot-message {
          align-self: flex-start;
          background-color: white;
          margin-right: auto;
          border-bottom-left-radius: 2px;
          border: 1px solid #eee;
        }

        .error-message {
          background-color: #fff3f3;
          border-left: 4px solid var(--danger-color);
        }

        .chat-history {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          background-color: var(--light-color);
        }

        .query-results {
          max-height: 300px;
          overflow-y: auto;
          font-size: 0.85rem;
          background-color: white;
        }

        .editor-container {
          flex: 1;
          min-height: 300px;
        }

        .navbar-content {
          max-width: 100%;
          overflow-x: auto;
        }

        pre {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          border-left: 3px solid var(--primary-color);
        }

        .form-control {
          font-size: 0.9rem;
          border-radius: 0.35rem;
        }

        .btn {
          font-size: 0.9rem;
          border-radius: 0.35rem;
          font-weight: 600;
        }

        .btn-primary {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .btn-primary:hover {
          background-color: #2e59d9;
          border-color: #2653d4;
        }

        .btn-outline-primary {
          color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .btn-outline-primary:hover {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .nav-tabs .nav-link {
          color: var(--dark-color);
          border: none;
          padding: 0.75rem 1rem;
          font-weight: 600;
        }

        .nav-tabs .nav-link.active {
          color: var(--primary-color);
          border-bottom: 2px solid var(--primary-color);
          background-color: transparent;
        }

        .nav-tabs .nav-link:hover {
          border-color: transparent;
          color: var(--primary-color);
        }

        .card {
          border: none;
          border-radius: 0.35rem;
          box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
        }

        .card-header {
          background-color: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 0.75rem 1.25rem;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1100;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .query-history-item {
          cursor: pointer;
          padding: 8px 12px;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }

        .query-history-item:hover {
          background-color: #f8f9fa;
        }

        .query-history-item pre {
          margin-bottom: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: none;
          padding: 0;
          border: none;
        }

        .status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 0.7rem;
        }

        .execution-info {
          font-size: 0.8rem;
          color: var(--secondary-color);
          margin-bottom: 10px;
        }

        .table-responsive {
          max-height: 250px;
          overflow-y: auto;
        }

        .table {
          font-size: 0.85rem;
          margin-bottom: 0;
        }

        .table th {
          position: sticky;
          top: 0;
          background-color: white;
          z-index: 10;
        }

        .settings-panel {
          position: absolute;
          right: 0;
          top: 0;
          width: 300px;
          height: 100%;
          background: white;
          z-index: 90;
          box-shadow: -2px 0 15px rgba(0, 0, 0, 0.1);
          padding: 15px;
          overflow-y: auto;
          border-left: 1px solid #eee;
        }

        .form-switch .form-check-input {
          width: 2.5em;
          height: 1.5em;
        }
        .chat-container {
            display: flex;
            height: calc(100vh - 72px);
            position: relative;
            width: 100%;
          }
          
          .left-panel {
            width: ${leftPanelWidth};
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            min-width: 250px;
            max-width: 60%;
            background-color: var(--light-color);
          }
          
          .chat-history-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .chat-history {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            background-color: var(--light-color);
          }
          
          .chat-input-container {
            padding: 16px;
            border-top: 1px solid #eee;
            background-color: white;
          }
      `}</style>
      
      <Navbar bg="white" variant="light" className="p-3 shadow-sm">
        <Container fluid className="navbar-content">
          <Navbar.Brand className="fs-4 fw-bold text-primary">
            <Database className="me-2" size={20} />
            SQL Assistant
          </Navbar.Brand>
          <div className="d-flex gap-2 align-items-center">
            <OverlayTrigger
              placement="bottom"
              overlay={renderTooltip({}, 'Toggle Ghost Mode (Generate SQL from comments)')}
            >
              <Button
                variant={ghostMode ? "primary" : "outline-primary"}
                onClick={toggleGhostMode}
                className="d-flex align-items-center"
                size="sm"
              >
                <Magic className="me-1" size={14} />
                Ghost Mode
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="bottom"
              overlay={renderTooltip({}, 'Generate database schema recommendations')}
            >
              <Button
                onClick={() => navigate('/SchemaGenerator')}
                disabled={loading}
                variant="outline-primary"
                size="sm"
              >
                <Columns className="me-1" size={14} />
                Schema Generator
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="bottom"
              overlay={renderTooltip({}, 'Manage database connections')}
            >
              <Button
                variant={connectionStatus ? "primary" : "success"}
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="d-flex align-items-center"
                size="sm"
              >
                <Database className="me-1" size={14} />
                {connectionStatus || 'Connect DB'}
              </Button>
            </OverlayTrigger>
          </div>
        </Container>
      </Navbar>

      <div className="chat-container" ref={containerRef}>
        {/* Left Panel - Chat Assistant */}
        <div className="left-panel">
          <Card className="flex-grow-1 shadow-sm h-100 m-2">
            <Card.Header className="bg-white p-2">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-0 border-bottom-0"
              >
                <Tab eventKey="chat" title="Chat Assistant" />
                <Tab eventKey="history" title="Query History" />
              </Tabs>
            </Card.Header>
            <Card.Body className="d-flex flex-column p-0 h-100">
              {activeTab === 'chat' ? (
                <>
                  <div className="chat-history" ref={chatHistoryRef}>
                    {chatHistory.length === 0 ? (
                      <div className="text-muted text-center py-5">
                        <Magic size={24} className="mb-2" />
                        <p>Describe the SQL query you need in natural language</p>
                        <small className="text-muted">Try: "Show me all customers from California"</small>
                      </div>
                    ) : (
                      chatHistory.map((item, index) => (
                        <div 
                          key={index} 
                          className={`chat-message ${item.type === 'user' ? 'user-message' : item.error ? 'error-message bot-message' : 'bot-message'}`}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <strong>{item.type === 'user' ? 'You:' : 'Assistant:'}</strong>
                            <small className="text-muted">{item.timestamp}</small>
                          </div>
                          <div>
                            {item.type === 'bot' ? (
                              <>
                                <pre>{item.content}</pre>
                                <div className="d-flex gap-2 mt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    onClick={() => {
                                      copyToClipboard(item.content);
                                      setEditorQuery(item.content);
                                    }}
                                  >
                                    <Copy size={12} className="me-1" /> Use in Editor
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline-secondary"
                                    onClick={() => copyToClipboard(item.content)}
                                  >
                                    <Copy size={12} className="me-1" /> Copy
                                  </Button>
                                </div>
                              </>
                            ) : (
                              item.content
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Form.Group className="p-3 border-top">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Describe the SQL query you need..."
                      disabled={loading}
                      className="fs-6 mb-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          generateSQL();
                        }
                      }}
                    />
                    <div className="d-flex justify-content-between">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={clearChatHistory}
                        disabled={chatHistory.length === 0}
                        className="text-muted"
                      >
                        Clear History
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={generateSQL} 
                        disabled={loading || !userQuery.trim()}
                        className="px-4"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lightning className="me-1" size={14} />
                            Generate SQL
                          </>
                        )}
                      </Button>
                    </div>
                  </Form.Group>
                </>
              ) : (
                <>
                  <div className="chat-history p-0">
                    {queryHistory.length === 0 ? (
                      <div className="text-muted text-center py-5">
                        <ClockHistory size={24} className="mb-2" />
                        <p>Your executed queries will appear here</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {queryHistory.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="query-history-item"
                            onClick={() => loadQueryFromHistory(item.query)}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">{item.timestamp}</small>
                              <Badge bg="info" pill>
                                {item.resultCount} rows
                              </Badge>
                            </div>
                            <pre>{item.query}</pre>
                            <small className="text-muted">Execution time: {item.executionTime}s</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Resizable Divider */}
        <div 
          className="divider"
          ref={dividerRef}
          onMouseDown={handleDividerMouseDown}
        />

        {/* Right Panel - Editor and Results */}
        <div className="right-panel">
          <div className="d-flex flex-column h-100 position-relative">
            {/* Ghost Mode Toggle Button */}
            <OverlayTrigger
              placement="left"
              overlay={renderTooltip({}, ghostMode ? 'Disable Ghost Mode' : 'Enable Ghost Mode')}
            >
              <div 
                className={`ghost-mode-toggle ${ghostMode ? 'active' : ''}`}
                onClick={toggleGhostMode}
              >
                {ghostMode ? <Eye size={18} /> : <EyeSlash size={18} />}
              </div>
            </OverlayTrigger>
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="settings-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Editor Settings</h5>
                  <Button 
                    variant="outline-secondary"
                    size="sm" 
                    onClick={() => setShowSettings(false)}
                  >
                    Close
                  </Button>
                </div>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Theme</Form.Label>
                    <Form.Select 
                      value={editorTheme}
                      onChange={(e) => setEditorTheme(e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="switch"
                      id="auto-format-switch"
                      label="Auto-format generated SQL"
                      checked={autoFormat}
                      onChange={(e) => setAutoFormat(e.target.checked)}
                    />
                  </Form.Group>
                </Form>
              </div>
            )}
            
            {/* Ghost Suggestion Panel */}
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
            
            <Card className="flex-grow-1 mb-2 shadow-sm m-2">
              <Card.Header className="bg-white p-2 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <h5 className="m-0 fs-5">SQL Editor</h5>
                  {ghostMode && (
                    <Badge bg="primary" pill className="ms-2">
                      Ghost Mode
                    </Badge>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={renderTooltip({}, 'Format SQL')}
                  >
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={formatSQL}
                      disabled={!editorQuery.trim()}
                    >
                      Format
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={renderTooltip({}, 'Save query')}
                  >
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={saveQuery}
                      disabled={!editorQuery.trim()}
                    >
                      <Save size={14} />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={renderTooltip({}, 'Settings')}
                  >
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Gear size={14} />
                    </Button>
                  </OverlayTrigger>
                </div>
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
                    fontSize: 14,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    theme: editorTheme === 'dark' ? 'vs-dark' : 'light',
                    automaticLayout: true
                  }}
                  onMount={handleEditorDidMount}
                />
              </Card.Body>
              <Card.Footer className="bg-white p-2 d-flex justify-content-between align-items-center">
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setShowQueryHistory(!showQueryHistory)}
                  >
                    <ClockHistory className="me-1" size={14} />
                    History
                  </Button>
                </div>
                <Button 
                  variant="primary" 
                  onClick={executeQuery} 
                  disabled={loading || !editorQuery.trim()}
                  className="px-4"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="me-1" size={14} />
                      Execute
                    </>
                  )}
                </Button>
              </Card.Footer>
            </Card>

            {/* Query History Panel */}
            {showQueryHistory && (
              <Card className="shadow-sm m-2 mb-0" style={{ maxHeight: '300px' }}>
                <Card.Header className="bg-white p-2 d-flex justify-content-between align-items-center">
                  <h5 className="m-0 fs-5">Query History</h5>
                  <Button 
                    variant="outline-secondary"
                    size="sm" 
                    onClick={() => setShowQueryHistory(false)}
                  >
                    Close
                  </Button>
                </Card.Header>
                <Card.Body className="p-0" style={{ overflowY: 'auto' }}>
                  {queryHistory.length === 0 ? (
                    <div className="text-muted text-center py-3">
                      No query history yet
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {queryHistory.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="query-history-item"
                          onClick={() => loadQueryFromHistory(item.query)}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">{item.timestamp}</small>
                            <Badge bg="info" pill>
                              {item.resultCount} rows
                            </Badge>
                          </div>
                          <pre>{item.query}</pre>
                          <small className="text-muted">Execution time: {item.executionTime}s</small>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            <Card className="shadow-sm m-2">
              <Card.Header className="bg-white p-2 d-flex justify-content-between align-items-center">
                <h5 className="m-0 fs-5">Query Results</h5>
                <div className="d-flex gap-2">
                  {executionTime && (
                    <small className="text-muted">
                      Execution time: {executionTime}s
                    </small>
                  )}
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={clearResults}
                    disabled={!queryResult}
                  >
                    Clear
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="query-results p-2">
                {queryResult ? (
                  queryResult.length > 0 ? (
                    <div className="table-responsive">
                      <Table striped bordered hover size="sm">
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
                  ) : (
                    <div className="text-muted">Query executed successfully but returned no data</div>
                  )
                ) : (
                  <div className="text-muted d-flex flex-column align-items-center py-4">
                    <QuestionCircle size={24} className="mb-2" />
                    <p className="mb-1">Results will appear here after query execution</p>
                    <small className="text-muted">Try executing a query using the button above</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Database Connection Modal */}
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
                  <Dropdown.Item onClick={() => setDbType('trio')}>Trio</Dropdown.Item>
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
          <Button variant="primary" onClick={handleConnectDatabase} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Connecting...
              </>
            ) : 'Connect'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)} 
        delay={3000} 
        autohide
        bg="dark"
      >
        <Toast.Body className="text-white">{toastMessage}</Toast.Body>
      </Toast>
    </Container>
  );
};

export default SQLAssistant;