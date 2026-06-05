import React from 'react';

export default function AdminReports(){
  const exportCsv = ()=>{ window.location.href = '/api/admin/orders/export/csv'; };
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Reports</h1>
      <div>
        <button onClick={exportCsv} className="bg-primary text-white p-2 rounded">Export Orders CSV</button>
      </div>
    </div>
  );
}
