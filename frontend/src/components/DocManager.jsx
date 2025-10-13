import React, { useEffect, useState } from 'react';

function DocManager({backendUrl}) {

    const [selectedFile, setSelectedFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchDocs = async() => {
        try{
            const response = await fetch(`${backendUrl}/documents`);
            if(!response.ok){
                throw new Error('Failed to fetch documents');
            }
            const data = await response.json();
            console.log(data);
            setDocuments(data);
        } catch(err){
            console.error('Error fetching documents:', err);
        }
    }

    useEffect(() => {
        fetchDocs();
    }, [])

    // Selecting File
    const handleChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setStatus('');
    }

    // Uploading File
    const handleUpload = async() => {
        if(!selectedFile){
            setStatus('Please select a file to upload.');
            return ;
        }

        setIsLoading(true);
        setStatus(`Uploading ${selectedFile.name}...`);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try{
            const response = await fetch(`${backendUrl}/ingest`, {method: 'POST', body: formData});

            if(!response.ok){
                
                let errorMessage = 'Upload failed due to an unknown error.';
                try {
                    const errData = await response.json();
                    console.log("Backend error details:", errData);
                    setStatus(errData.detail)
                    
                    if (errData && errData.detail) {
                        errorMessage = errData.detail;
                    } else {
                        errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
                    }
                } catch (jsonError) {
                    console.error('Failed to parse error response JSON:', jsonError);
                    errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setStatus(`Successfully uploaded ${selectedFile.name} with ${result.chunks} chunks.`);
            setSelectedFile(null);
            fetchDocs();
        } catch(err){
            console.error('Error uploading file:', err);
            setStatus(`${err}`);
        } finally {
            setIsLoading(false);
        }
    }

    const limitReached = documents.length >= 5;

    return (
        <div className="p-6 bg-white shadow-xl rounded-xl h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4 text-center">
                Manage And Upload Documents To Train
            </h2>
            
            {/* Upload Section */}
            <div className={`p-4 border-2 border-dashed ${limitReached ? 'border-red-400 bg-red-50' : 'border-indigo-300 bg-indigo-50'} rounded-lg mb-6`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (.pdf, .docx, .txt)</label>
                
                <div className="flex space-x-3 items-center">
                    <input 
                        type="file" 
                        onChange={handleChange} 
                        disabled={isLoading || limitReached}
                        accept=".pdf, .doc, .docx, .txt, .md, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                        className="flex-grow p-2 border border-gray-300 rounded-lg text-sm bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                    />
                    
                    <button 
                        onClick={handleUpload} 
                        disabled={!selectedFile || isLoading || limitReached}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition duration-150"
                    >
                        {isLoading ? 'Indexing...' : 'Upload'}
                    </button>
                </div>
                {limitReached ? (
                    <p className="mt-2 text-sm text-red-600 font-semibold">
                        ❌ Can’t upload more than 5 documents. Hire Satvik To Resolve This And Unlock The True Potential.
                    </p>
                ) : (
                    status && (
                        <p
                            className={`mt-2 text-sm ${
                                status.startsWith('❌') ? 'text-red-600' : 'text-green-600'
                            }`}
                        >
                            {status}
                        </p>
                    )
                )}
            </div>

            {/* Document List Section */}
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
                Indexed Documents ({documents.length})
            </h3>
            
            <div className="flex-grow overflow-y-auto pr-2">
                {documents.length === 0 ? (
                    <p className="text-gray-500 italic">No documents indexed yet. Upload a file to begin RAG.</p>
                ) : (
                    <ul className="space-y-3">
                        {documents.map((doc, index) => (
                            <li 
                                key={index} 
                                className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center transition hover:bg-gray-100"
                            >
                                <div>
                                    <p className="font-medium text-gray-800 truncate" title={doc.filename}>
                                        {doc.filename}
                                    </p>
                                    <p className="text-xs text-gray-500">Chunks: {doc.chunks_count}</p>
                                </div>
                                <span className="text-xs text-indigo-500 min-w-[100px] text-right">
                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default DocManager;