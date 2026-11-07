import React, { useState, useEffect } from 'react';
import { MainViewTab, VehicleRecord } from './types';
import {
  getStoredRecords,
  saveRecordsToStorage,
  getStoredTheme,
  saveTheme,
  getStoredAutoBackup,
  saveAutoBackup,
  getStoredBusinessName,
  saveBusinessName,
} from './utils/storage';
import { normalizePlate } from './utils/formatters';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CalculatorView } from './components/CalculatorView';
import { InventoryView } from './components/InventoryView';
import { TotalProfitView } from './components/TotalProfitView';
import { DealSheetModal } from './components/DealSheetModal';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = getStoredTheme();
    if (typeof document !== 'undefined') {
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-mode');
      }
    }
    return saved;
  });
  const [businessName, setBusinessName] = useState<string>(getStoredBusinessName);
  const [records, setRecords] = useState<VehicleRecord[]>(getStoredRecords);
  const [activeTab, setActiveTab] = useState<MainViewTab>('calculator');
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [modalRecord, setModalRecord] = useState<VehicleRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(getStoredAutoBackup);

  // Sync document title with custom Car Trading business name
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${businessName} | Buy & Sell Settlement & Fleet Manager`;
    }
  }, [businessName]);

  const handleChangeBusinessName = (newName: string) => {
    setBusinessName(newName);
    saveBusinessName(newName);
    showToast(`✔ Business name updated to "${newName}"`, 'success');
  };

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
    saveTheme(nextTheme);
    setTheme(nextTheme);
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    saveAutoBackup(enabled);
  };

  // Export JSON backup
  const handleExportBackupJSON = (isAuto = false) => {
    if (records.length === 0) {
      if (!isAuto) alert('No saved vehicle records to export yet.');
      return;
    }
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const safeSlug = (businessName || 'belbros').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `${safeSlug}-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    if (!isAuto) {
      showToast('✔ Backup JSON downloaded successfully!', 'success');
    }
  };

  // Import JSON backup
  const handleImportBackupJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (!Array.isArray(importedData)) {
          alert('Invalid backup file format. Expected a JSON array of vehicle records.');
          return;
        }

        let addedCount = 0;
        let updatedCount = 0;
        const currentRecords = [...records];

        importedData.forEach((importedItem: VehicleRecord) => {
          if (!importedItem.plate) return;
          const cleanPlate = normalizePlate(importedItem.plate);
          const existingIndex = currentRecords.findIndex(
            (r) => normalizePlate(r.plate) === cleanPlate
          );

          if (existingIndex !== -1) {
            currentRecords[existingIndex] = importedItem;
            updatedCount++;
          } else {
            currentRecords.unshift(importedItem);
            addedCount++;
          }
        });

        setRecords(currentRecords);
        saveRecordsToStorage(currentRecords);
        showToast(
          `✔ Restored ${importedData.length} records (${addedCount} added, ${updatedCount} updated)!`,
          'success'
        );
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('No saved vehicle records to export.');
      return;
    }

    const headers = [
      'Plate Number',
      'Vehicle Title',
      'Year',
      'Make',
      'Model',
      'Date Bought',
      'Date Sold',
      'Days Held',
      'Currency',
      'Selling Price',
      'Total Capital Outlay',
      'Net Profit',
      'Profit Margin %',
      'Partner Payout Summary',
    ];

    const csvRows = records.map((r) => {
      let partnerSummary = '';
      if (r.partners && r.partners.length > 0) {
        partnerSummary = r.partners
          .map((p) => `${p.name} [${p.share || 0}%]: ${p.payout || 0}`)
          .join(' | ');
      }

      return [
        `"${(r.plate || '').replace(/"/g, '""')}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${r.year || ''}"`,
        `"${(r.make || '').replace(/"/g, '""')}"`,
        `"${(r.model || '').replace(/"/g, '""')}"`,
        `"${r.dateBought || ''}"`,
        `"${r.dateSold || ''}"`,
        `"${r.totalDays !== null && r.totalDays !== undefined ? r.totalDays : ''}"`,
        `"${r.currency || '₱'}"`,
        `"${r.sell || 0}"`,
        `"${r.totalCapital || 0}"`,
        `"${r.profit || 0}"`,
        `"${(r.margin || 0).toFixed(1)}"`,
        `"${partnerSummary.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `belbros-inventory-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    showToast('✔ CSV spreadsheet exported!', 'info');
  };

  // Save / Update Record
  const handleSaveRecord = (recordToSave: VehicleRecord, autoBackup: boolean) => {
    const cleanPlate = normalizePlate(recordToSave.plate);
    const existingIndex = records.findIndex(
      (r) => normalizePlate(r.plate) === cleanPlate
    );

    let updatedRecords: VehicleRecord[];
    let isUpdate = false;

    if (existingIndex !== -1) {
      isUpdate = true;
      updatedRecords = [...records];
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        ...recordToSave,
        id: updatedRecords[existingIndex].id, // preserve ID
        updatedAt: Date.now(),
      };
      setActiveUnitId(updatedRecords[existingIndex].id);
    } else {
      updatedRecords = [recordToSave, ...records];
      setActiveUnitId(recordToSave.id);
    }

    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);

    showToast(
      isUpdate
        ? `✔ Updated Plate: ${recordToSave.plate}${autoBackup ? ' & auto-saved backup' : ''}`
        : `✔ Saved Plate: ${recordToSave.plate}${autoBackup ? ' & auto-saved backup' : ''}`,
      'success'
    );

    if (autoBackup) {
      handleExportBackupJSON(true);
    }
  };

  // Delete Record
  const handleDeleteRecord = (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle record from the log?')) {
      const remaining = records.filter((r) => r.id !== id);
      setRecords(remaining);
      saveRecordsToStorage(remaining);
      if (activeUnitId === id) {
        setActiveUnitId(null);
      }
      showToast('Record deleted.', 'info');
    }
  };

  // Clear All
  const handleClearAll = () => {
    if (
      confirm(
        'Are you sure you want to delete all saved vehicle records from this browser? Make sure to download a Backup (JSON) first.'
      )
    ) {
      setRecords([]);
      saveRecordsToStorage([]);
      setActiveUnitId(null);
      showToast('All vehicle records cleared.', 'info');
    }
  };

  // Edit in Calculator
  const handleEditRecord = (record: VehicleRecord) => {
    setActiveUnitId(record.id);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Deal Sheet
  const handleOpenDealSheet = (record: VehicleRecord) => {
    setModalRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-amber-300 selection:text-amber-950">
      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        totalSavedUnits={records.length}
        businessName={businessName}
        onChangeBusinessName={handleChangeBusinessName}
      />

      {/* Navigation Switcher */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        inventoryCount={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'calculator' && (
          <CalculatorView
            records={records}
            activeUnitId={activeUnitId}
            onSelectUnit={setActiveUnitId}
            onSaveRecord={handleSaveRecord}
            onOpenDealSheet={handleOpenDealSheet}
            autoBackupEnabled={autoBackupEnabled}
            onToggleAutoBackup={handleToggleAutoBackup}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            records={records}
            onEditRecord={handleEditRecord}
            onOpenDealSheet={handleOpenDealSheet}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
            onExportBackupJSON={() => handleExportBackupJSON(false)}
            onImportBackupJSON={handleImportBackupJSON}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'summary' && (
          <TotalProfitView
            records={records}
            onExportCSV={handleExportCSV}
            onOpenDealSheet={handleOpenDealSheet}
          />
        )}
      </main>

      {/* Deal Settlement Statement Modal */}
      <DealSheetModal
        record={modalRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        businessName={businessName}
      />

      {/* Toast Alerts */}
      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}
