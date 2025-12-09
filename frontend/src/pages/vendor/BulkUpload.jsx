import { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BulkUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/products/bulk-template/', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product_upload_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Template downloaded!');
        } catch (error) {
            toast.error('Failed to download template');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setResults(null);
        } else {
            toast.error('Please select a CSV file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/products/bulk-upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResults(response.data);
            toast.success(`Upload complete! ${response.data.created} created, ${response.data.updated} updated`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Bulk Product Upload</h1>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Instructions
                </h2>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Download the CSV template</li>
                    <li>Fill in your product details</li>
                    <li>Upload the completed CSV file</li>
                    <li>Review the results</li>
                </ol>
            </div>

            {/* Download Template */}
            <button
                onClick={handleDownloadTemplate}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                <Download className="w-4 h-4" />
                Download CSV Template
            </button>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                />
                <label
                    htmlFor="csv-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                    Choose CSV File
                </label>
                {file && (
                    <p className="mt-2 text-sm text-gray-600">
                        Selected: {file.name}
                    </p>
                )}
            </div>

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
                {uploading ? 'Uploading...' : 'Upload Products'}
            </button>

            {/* Results */}
            {results && (
                <div className="mt-6 space-y-4">
                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Upload Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Total</p>
                                <p className="text-2xl font-bold">{results.total}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Created</p>
                                <p className="text-2xl font-bold text-green-600">{results.created}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Updated</p>
                                <p className="text-2xl font-bold text-blue-600">{results.updated}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Errors */}
                    {results.errors && results.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-800">
                                <AlertCircle className="w-5 h-5" />
                                Errors ({results.errors.length})
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {results.errors.map((error, idx) => (
                                    <div key={idx} className="text-sm">
                                        <span className="font-medium">Row {error.row}:</span> {error.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {results.success && results.success.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-800">
                                <CheckCircle className="w-5 h-5" />
                                Successfully Imported ({results.success.length})
                            </h3>
                            <div className="space-y-1 max-h-60 overflow-y-auto text-sm">
                                {results.success.slice(0, 10).map((item, idx) => (
                                    <div key={idx}>
                                        Row {item.row}: {item.name} ({item.action})
                                    </div>
                                ))}
                                {results.success.length > 10 && (
                                    <p className="text-gray-600 italic">
                                        ...and {results.success.length - 10} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;
