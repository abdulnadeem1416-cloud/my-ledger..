/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LedgerProvider } from './context/LedgerContext';
import { AppLayout } from './components/layout/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <LedgerProvider>
        <AppLayout />
      </LedgerProvider>
    </BrowserRouter>
  );
}

