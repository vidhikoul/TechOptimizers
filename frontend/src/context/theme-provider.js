import React from "react";

export function ThemeProvider({
  children,
  attribute,
  defaultTheme,
  enableSystem,
}) {
  return <div className={defaultTheme}>{children}</div>;
}
