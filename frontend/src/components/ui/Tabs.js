// src/components/ui/Tabs.js
import React, { useState } from "react";

const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="tabs-header flex">
        {React.Children.map(children, (child, index) => (
          <button
            onClick={() => setActiveTab(index)}
            className={`tab ${activeTab === index ? "active" : ""}`}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">{children[activeTab]}</div>
    </div>
  );
};

const Tab = ({ children }) => <div>{children}</div>;

Tabs.Tab = Tab;

export default Tabs;
