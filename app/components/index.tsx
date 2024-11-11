// components/FileUploadComponent.js
"use client";
import React, { useState, useEffect } from 'react';
import { FileUploader } from 'baseui/file-uploader';
import { Button, KIND } from 'baseui/button';
import { Card, StyledBody, StyledAction } from 'baseui/card';
import { useStyletron } from 'baseui';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const initialFiles = [
  { filename: 'file1.csv', status: 0 },
  { filename: 'file2.csv', status: 1 },
  { filename: 'file3.csv', status: -1 }
];

const FileUploadComponent = () => {
  const [file, setFile] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(initialFiles.length > 0 ? 'success' : 'empty');
  const [progress, setProgress] = useState(0); // Track upload progress
  const [files, setFiles] = useState(initialFiles); // Manage file status
  const [css] = useStyletron();

  // Simulate upload progress
  useEffect(() => {
    if (uploadStatus === 'uploading') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus(Math.random() > 0.2 ? 'success' : 'failure'); // Randomly succeed or fail
            return 100;
          }
          return prev + 10; // Increment progress
        });
      }, 200); // Simulate progress every 200ms
    }
  }, [uploadStatus]);

  // Handle file upload
  const handleFileUpload = (acceptedFiles:any) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile({
        name: newFile.name,
        status: 'uploading',
      });
      setUploadStatus('uploading');
      setProgress(0); // Reset progress

      setFiles((prevFiles) => [
        ...prevFiles,
        { filename: newFile.name, status: 0 }
      ]);
    }
  };

  // Reset the uploader
  const resetUploader = () => {
    setFile(null);
    setUploadStatus('empty');
    setProgress(0);
  };

  // Render file status icons
  const renderStatusIcon = (status:any) => {
    switch (status) {
      case 1:
        return <FaCheckCircle color="#28a745" size={20} />;
      case -1:
        return <FaTimesCircle color="#dc3545" size={20} />;
      case 0:
      default:
        return <FaClock color="#ffc107" size={20} />;
    }
  };

  return (
    <div className={css({
      padding: '20px',
      backgroundColor: '#f8f8f8',
      borderRadius: '8px',
      maxWidth: '500px',
      margin: 'auto',
      textAlign: 'center'
    })}>
      <h3 className={css({ marginBottom: '16px' })}>File Upload</h3>

      {/* File Uploader Component */}
      {uploadStatus === 'empty' && (
        <FileUploader
          onDropAccepted={handleFileUpload}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          progressMessage="Uploading..."
          overrides={{
            Root: {
              style: {
                borderColor: isDragging ? '#0070f3' : '#ccc',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: isDragging ? '#e0f7ff' : '#ffffff',
              },
            },
            ContentMessage: { style: { color: '#888', fontSize: '14px' } },
          }}
        />
      )}

      {/* Uploading State */}
      {uploadStatus === 'uploading' && (
        <div className={css({
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          backgroundColor: '#f8f8f8',
        })}>
          <p className={css({ marginBottom: '8px' })}>Uploading {file?.name}</p>
          {/* Custom Progress Bar */}
          <div className={css({
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '12px',
          })}>
            <div
              className={css({
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#0070f3',
                transition: 'width 0.2s ease',
              })}
            />
          </div>
          <Button kind={KIND.tertiary} onClick={resetUploader} overrides={{
            BaseButton: { style: { color: '#0070f3' } }
          }}>Cancel</Button>
        </div>
      )}

      {/* Success State */}
      {uploadStatus === 'success' && (
        <div className={css({
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #28a745',
          backgroundColor: '#e6f8eb',
        })}>
          <FaCheckCircle color="#28a745" size={24} />
          <p className={css({ color: '#28a745', fontWeight: 'bold' })}>Upload Complete</p>
          <p>{file?.name}</p>
          <div>
            <Button kind={KIND.primary} onClick={resetUploader}>New Upload</Button>
            <Button kind={KIND.tertiary} overrides={{
              BaseButton: { style: { marginLeft: '8px', color: '#0070f3' } }
            }}>View Details</Button>
          </div>
        </div>
      )}

      {/* Failure State */}
      {uploadStatus === 'failure' && (
        <div className={css({
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dc3545',
          backgroundColor: '#f8d7da',
        })}>
          <FaTimesCircle color="#dc3545" size={24} />
          <p className={css({ color: '#dc3545', fontWeight: 'bold' })}>Upload Failed</p>
          <p>{file?.name}</p>
          <div>
            <Button kind={KIND.primary} onClick={() => setUploadStatus('uploading')}>Retry</Button>
            <Button kind={KIND.tertiary} onClick={resetUploader} overrides={{
              BaseButton: { style: { marginLeft: '8px', color: '#0070f3' } }
            }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Display Initial and Newly Uploaded Files in Card Layout */}
      <div className={css({
        marginTop: '20px',
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
      })}>
        <h4>Uploaded Files</h4>
        {files.map((file, index) => (
          <div key={index} >
            <StyledBody>
              <div className={css({ display: 'flex', alignItems: 'center' })}>
                {renderStatusIcon(file.status)}
                <span className={css({ marginLeft: '10px' })}>{file.filename}</span>
              </div>
            </StyledBody>
            <StyledAction>
              <Button kind={KIND.tertiary} overrides={{
                BaseButton: { style: { color: '#0070f3' } }
              }}>View Details</Button>
            </StyledAction>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadComponent;
