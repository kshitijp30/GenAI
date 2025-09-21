import React, { useState, useEffect, PropsWithChildren } from 'react';
import { Detector } from './components/Detector';
import { Educator } from './components/Educator';

const About = () => (
    <div className="w-full max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg border border-gray-200 dark:border-gray-700/50">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">About TruthLens</h2>
        <p className="text-gray-600 dark:text-gray-300">
            TruthLens is a tool designed to combat misinformation by leveraging the power of AI. Our goal is not just to detect false information, but to educate users on how to identify it themselves. We believe in promoting a more informed and discerning public.
        </p>
    </div>
);

type Page = 'analyze' | 'learn' | 'about';

const ThemeToggle = ({ theme, setTheme }: { theme: 'light' | 'dark', setTheme: (theme: 'light' | 'dark') => void }) => {
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500">
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
};

const Header = ({ activePage, setActivePage, theme, setTheme }: { activePage: Page, setActivePage: (page: Page) => void, theme: 'light' | 'dark', setTheme: (theme: 'light' | 'dark') => void }) => {
    const NavLink = ({ pageId, children }: PropsWithChildren<{ pageId: Page }>) => (
        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage(pageId); }} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 relative ${activePage === pageId ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
            {children}
            {activePage === pageId && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>}
        </a>
    );

    return (
        <header className="py-4">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        TruthLens
                    </h1>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <NavLink pageId="analyze">Analyze</NavLink>
                    <NavLink pageId="learn">Learn</NavLink>
                    <NavLink pageId="about">About</NavLink>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
            </nav>
        </header>
    );
};

const Footer = () => (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} TruthLens</p>
            <p className="mt-2 sm:mt-0">Built for responsible AI. Detect, Explain, Educate.</p>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">AI analysis may not be 100% accurate. Always verify with multiple sources.</p>
    </footer>
);

const App = () => {
  const [activePage, setActivePage] = useState<Page>('analyze');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        if ('theme' in localStorage) return localStorage.theme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const renderPage = () => {
    switch (activePage) {
      case 'analyze': return <Detector />;
      case 'learn': return <Educator />;
      case 'about': return <About />;
      default: return <Detector />;
    }
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-white font-sans">
        <Header activePage={activePage} setActivePage={setActivePage} theme={theme} setTheme={setTheme} />
        <main>
            {renderPage()}
        </main>
        <Footer />
    </div>
  );
};

export default App;