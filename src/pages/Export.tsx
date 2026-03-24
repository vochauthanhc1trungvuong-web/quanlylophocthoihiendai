import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FileSpreadsheet, Download, Send, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const Export = () => {
  const { classes, students, records } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'excel' | 'sheets'>('excel');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean, message: string} | null>(null);

  const handleExport = () => {
    // Filter data
    const exportClasses = selectedClassId === 'all' 
      ? classes 
      : classes.filter(c => c.id === selectedClassId);
      
    const exportStudents = selectedClassId === 'all'
      ? students
      : students.filter(s => s.classId === selectedClassId);
      
    const exportRecords = selectedClassId === 'all'
      ? records
      : records.filter(r => r.classId === selectedClassId);

    // Create Workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Danh sách học sinh
    const studentData = exportStudents.map(s => {
      const cls = classes.find(c => c.id === s.classId);
      return {
        'Họ và tên': s.name,
        'Lớp': cls?.name || 'Không rõ',
      };
    });
    const wsStudents = XLSX.utils.json_to_sheet(studentData);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Danh sách học sinh');

    // Sheet 2: Bảng điểm tổng hợp
    const summaryData = exportStudents.map(s => {
      const cls = classes.find(c => c.id === s.classId);
      const totalPoints = exportRecords
        .filter(r => r.studentId === s.id)
        .reduce((sum, r) => sum + r.points, 0);
        
      return {
        'Họ và tên': s.name,
        'Lớp': cls?.name || 'Không rõ',
        'Tổng điểm': totalPoints
      };
    }).sort((a, b) => b['Tổng điểm'] - a['Tổng điểm']);
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Bảng điểm tổng hợp');

    // Sheet 3: Lịch sử cộng trừ điểm
    const historyData = exportRecords
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(r => {
        const student = students.find(s => s.id === r.studentId);
        const cls = classes.find(c => c.id === r.classId);
        return {
          'Thời gian': format(r.timestamp, 'dd/MM/yyyy HH:mm:ss'),
          'Họ và tên': student?.name || 'Không rõ',
          'Lớp': cls?.name || 'Không rõ',
          'Điểm': r.points,
          'Lý do': r.reason
        };
      });
    const wsHistory = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, wsHistory, 'Lịch sử điểm');

    // Generate filename
    const dateStr = format(new Date(), 'dd-MM-yyyy');
    const className = selectedClassId === 'all' ? 'Tat_ca_lop' : exportClasses[0]?.name;
    const fileName = `Bao_cao_ne_nep_${className}_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const handleSendToSheets = async () => {
    if (!webhookUrl) {
      setSendResult({ success: false, message: 'Vui lòng nhập Webhook URL' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const exportClasses = selectedClassId === 'all' 
        ? classes 
        : classes.filter(c => c.id === selectedClassId);
        
      const exportStudents = selectedClassId === 'all'
        ? students
        : students.filter(s => s.classId === selectedClassId);
        
      const exportRecords = selectedClassId === 'all'
        ? records
        : records.filter(r => r.classId === selectedClassId);

      const summaryData = exportStudents.map(s => {
        const cls = classes.find(c => c.id === s.classId);
        const totalPoints = exportRecords
          .filter(r => r.studentId === s.id)
          .reduce((sum, r) => sum + r.points, 0);
          
        return {
          studentName: s.name,
          className: cls?.name || 'Không rõ',
          totalPoints: totalPoints
        };
      }).sort((a, b) => b.totalPoints - a.totalPoints);

      const historyData = exportRecords
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(r => {
          const student = students.find(s => s.id === r.studentId);
          const cls = classes.find(c => c.id === r.classId);
          return {
            timestamp: format(r.timestamp, 'dd/MM/yyyy HH:mm:ss'),
            studentName: student?.name || 'Không rõ',
            className: cls?.name || 'Không rõ',
            points: r.points,
            reason: r.reason
          };
        });

      const payload = {
        action: 'exportData',
        summary: summaryData,
        history: historyData,
        exportDate: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
        className: selectedClassId === 'all' ? 'Tất cả các lớp' : exportClasses[0]?.name
      };

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      setSendResult({ success: true, message: 'Đã gửi yêu cầu đến Google Sheets thành công!' });
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
      setSendResult({ success: false, message: 'Có lỗi xảy ra khi gửi dữ liệu. Vui lòng kiểm tra lại URL.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Xuất dữ liệu</h2>
        <p className="text-gray-500 mt-1">Tải xuống hoặc đồng bộ dữ liệu nề nếp để lưu trữ và báo cáo.</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('excel')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'excel' 
              ? 'bg-green-600 text-white shadow-md' 
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Xuất file Excel
          </div>
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'sheets' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Gửi tới Google Sheets
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {activeTab === 'excel' ? (
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileSpreadsheet className="w-10 h-10 text-green-600" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xuất dữ liệu ra Excel</h3>
            <p className="text-gray-500 mb-8">
              File Excel sẽ bao gồm 3 sheet: Danh sách học sinh, Bảng điểm tổng hợp và Lịch sử cộng/trừ điểm chi tiết.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Chọn lớp cần xuất</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExport}
                disabled={classes.length === 0}
                className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors mt-4"
              >
                <Download className="w-5 h-5" />
                Tải xuống Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Đồng bộ với Google Sheets</h3>
              <p className="text-gray-500">
                Gửi dữ liệu trực tiếp lên Google Sheets thông qua Webhook URL (Google Apps Script).
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lớp cần gửi</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Apps Script Webhook URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {sendResult && (
                <div className={`p-4 rounded-xl ${sendResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {sendResult.message}
                </div>
              )}

              <button
                onClick={handleSendToSheets}
                disabled={classes.length === 0 || isSending}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-5 h-5" />
                {isSending ? 'Đang gửi...' : 'Gửi dữ liệu'}
              </button>

              <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-500" />
                  Hướng dẫn thiết lập Google Sheets
                </h4>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                  <li>Tạo một file Google Sheets mới.</li>
                  <li>Vào menu <strong>Tiện ích mở rộng</strong> {'>'} <strong>Apps Script</strong>.</li>
                  <li>Xóa mã cũ và dán đoạn mã bên dưới vào.</li>
                  <li>Nhấn <strong>Triển khai</strong> {'>'} <strong>Tùy chọn triển khai mới</strong>.</li>
                  <li>Chọn loại <strong>Ứng dụng web</strong>.</li>
                  <li>Quyền truy cập: Chọn <strong>Bất kỳ ai</strong>.</li>
                  <li>Nhấn <strong>Triển khai</strong>, cấp quyền và copy <strong>URL ứng dụng web</strong> dán vào ô bên trên.</li>
                </ol>
                
                <div className="mt-4 relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === 'exportData') {
      // 1. Ghi nhận thời gian gửi (Nhật ký đồng bộ)
      var logSheet = sheet.getSheetByName('Nhật ký đồng bộ');
      if (!logSheet) {
        logSheet = sheet.insertSheet('Nhật ký đồng bộ');
        logSheet.appendRow(['Thời gian gửi', 'Lớp được xuất', 'Số lượng học sinh', 'Số lượng bản ghi lịch sử']);
      }
      logSheet.appendRow([data.exportDate, data.className, data.summary.length, data.history.length]);

      // 2. Xử lý Bảng điểm tổng hợp
      var summarySheet = sheet.getSheetByName('Bảng điểm');
      if (!summarySheet) {
        summarySheet = sheet.insertSheet('Bảng điểm');
      }
      summarySheet.clear();
      summarySheet.appendRow(['Cập nhật lúc:', data.exportDate, 'Lớp:', data.className]);
      summarySheet.appendRow([]);
      summarySheet.appendRow(['Họ và tên', 'Lớp', 'Tổng điểm']);
      
      data.summary.forEach(function(row) {
        summarySheet.appendRow([row.studentName, row.className, row.totalPoints]);
      });
      
      // 3. Xử lý Lịch sử điểm
      var historySheet = sheet.getSheetByName('Lịch sử');
      if (!historySheet) {
        historySheet = sheet.insertSheet('Lịch sử');
      }
      historySheet.clear();
      historySheet.appendRow(['Cập nhật lúc:', data.exportDate, 'Lớp:', data.className]);
      historySheet.appendRow([]);
      historySheet.appendRow(['Thời gian', 'Họ và tên', 'Lớp', 'Điểm', 'Lý do']);
      
      data.history.forEach(function(row) {
        historySheet.appendRow([row.timestamp, row.studentName, row.className, row.points, row.reason]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
