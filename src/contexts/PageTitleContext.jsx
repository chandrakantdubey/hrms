import { createContext, useContext, useState, useEffect } from "react";

const PageTitleContext = createContext(undefined);

export const PageTitleProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("Dashboard"); // Default title

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
};

// Custom hook to set the document and context title from a component
export const useSetPageTitle = (title) => {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    const appName = "HRMS";
    document.title = `${title} | ${appName}`;
    setPageTitle(title);
  }, [title, setPageTitle]);
};
