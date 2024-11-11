"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from 'baseui/file-uploader';
import { Button, KIND } from 'baseui/button';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useStyletron } from 'baseui';
import { MdOutlineUploadFile } from "react-icons/md";
type FileStatus = 'empty' | 'success' | 'failure' | 'uploading';

type FileType = {
  name: string;
  status: FileStatus;
  progress: number;
  cancel?: boolean;
  url?: string;
};

export const FileUploadComponent: React.FC = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [uploadStatus, setUploadStatus] = useState<FileStatus>('empty');
  const [css] = useStyletron();
  const uploadIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);  // Confirms component is running in the client
  }, []);

  // Modify the useEffect hook to handle all file status updates
  useEffect(() => {
    if (uploadStatus === 'uploading') {
      const interval = setInterval(() => {
        setFiles((prevFiles) => {
          const updatedFiles = prevFiles.map((file) => {
            if (file.status === 'uploading' && !file.cancel) {
              const newProgress = Math.min(file.progress + 10, 100);
              return {
                ...file,
                progress: newProgress,
                status: newProgress === 100 ? 'success' as FileStatus : 'uploading' as FileStatus
              };
            }
            return file;
          });

          // Check if all files are complete
          const allComplete = updatedFiles.every(
            file => file.status === 'success' || file.status === 'failure'
          );
          
          if (allComplete) {
            // Use setTimeout to avoid state updates during render
            setTimeout(() => setUploadStatus('success'), 0);
          }

          return updatedFiles;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [uploadStatus]);

  // Handle file upload
  const handleFileUpload = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      name: file.name,
      status: 'uploading' as FileStatus,
      progress: 0,
      url: file.name,
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadStatus('uploading');
  };

  // Cancel the upload of a specific file
  const cancelUpload = (fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === fileName ? { ...file, status: 'failure', cancel: true, progress: 0 } : file
      )
    );
    // Stop the progress interval for the canceled file
    const fileInterval = uploadIntervalsRef.current.get(fileName);
    if (fileInterval) {
      clearInterval(fileInterval);
      uploadIntervalsRef.current.delete(fileName);
    }
  };

  // Reset the uploader
  const resetUploader = () => {
    setUploadStatus('empty');
  };

  // Retry failed uploads
  const retryUpload = (fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === fileName ? { ...file, status: 'uploading', progress: 0, cancel: false } : file
      )
    );
    setUploadStatus('uploading');
  };

  // Render file status icons
  const renderStatusIcon = (status: 'success' | 'failure' | 'uploading') => {
    switch (status) {
      case 'success':
        return <FaCheckCircle color="#28a745" size={20} />;
      case 'failure':
        return <FaTimesCircle color="#dc3545" size={20} />;
      case 'uploading':
      default:
        return <FaClock color="#ffc107" size={20} />;
    }
  };

  return (
    <div className={css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
    })}>
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        margin: 'auto',
        textAlign: 'center',
        maxHeight: '100%',
        maxWidth: 'fit-content',
      })}>
        <div className={css({ marginBottom: '10px',display:'flex',alignItems:'center',justifyContent:'center' })}>
          <MdOutlineUploadFile size={20} />
          <h1>razorpay_payin</h1>
        </div>

        {
          uploadStatus === 'empty' && (
            <div className={css({ marginBottom: '10px',display:'flex',alignItems:'center',justifyContent:'center' })}>
              <h3>No File Uploaded</h3>
            </div>
          )
        }
          {
          uploadStatus === 'uploading' && (
            <div className={css({ marginBottom: '16px',display:'flex',alignItems:'center',justifyContent:'center' })}>
              <h3> File Uploaded</h3>
            </div>
          )
        }
     
        {/* File Uploader Component */}
        {uploadStatus === 'empty' && isClient&& (
          <FileUploader
            onDropAccepted={handleFileUpload}
            overrides={{
              Root: {
                style: {
                  borderColor: '#ccc',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  maxHeight:'100%',
                },
              },
            }}
          />
        )}

        {/* Display Uploaded Files */}
        <div className={css({ marginTop: '20px', display: 'flex', flexDirection: 'row', gap: '10px' })} >
         
          {files.map((file: FileType, index: number) => (
            <div
              key={index}
              className={css({
                border: file.status === 'success' ? '2px solid #048848' : '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '12px',
                backgroundColor: '#fff',
                maxHeight: '100%',
              })}
            >
              <div className={css({ display: 'flex', flexDirection: 'column', alignItems: 'center',maxHeight:'100%' })}>
                {file?.status === 'success' && renderStatusIcon('success')}
                {file?.status === 'failure' && renderStatusIcon('failure')} 
                {file?.status === 'uploading' && renderStatusIcon('uploading')}
                {file.status === 'uploading' && (
                  <div className={css({ marginTop:'10px' ,marginBottom:'10px' , display: 'flex', flexDirection: 'column', alignItems: 'center',})}>
                    <CircularProgressbar
                      value={file.progress}
                      text={`${file.progress}%`}
                      styles={buildStyles({
                        textSize: '20px',
                        pathColor: '#0070f3',
                        textColor: '#0070f3',
                        trailColor: '#d6d6d6',
                      })}
                      className={css({
                        width: '40px',
                        height: '40px',
                      })}
                    />
                         <div className={css({ marginTop:'10px' })}>
                   Uploading File
                  
                  </div> 
                  <Button
                        kind={KIND.tertiary}
                        onClick={() => cancelUpload(file.name)}
                      overrides={{
                        BaseButton: {
                          style: {
                            backgroundColor: '#E8E8E8',
                            borderRadius: '30px',
                            width:'128px',
                            height:'36px',
                            fontSize:'14px',
                            fontWeight:'600',
                          },
                        },                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {file.status === 'success' && (
                  <div className={css({ marginLeft: '10px',marginTop:'10px' })}>
                    <h2>Upload Complete</h2>
                    <h4>{file.name}</h4>
                  </div>
                )}
              </div>
              <div>
                {file.status === 'failure' ? (
                  <Button kind={KIND.primary} onClick={() => retryUpload(file.name)}>
                    Retry
                  </Button>
                ) : (
                  file.status === 'success' && isClient && (
                    <div className={css({display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginTop:'10px' })}>
                      <Button
                        kind={KIND.tertiary}
                        onClick={() => window.open(`/api/files/${file.name}`, '_blank')}
                        overrides={{
                          BaseButton: {
                            style: {
                              backgroundColor: '#E8E8E8',
                              borderRadius: '30px',
                              width:'128px',
                              height:'36px',
                              fontSize:'14px',
                              fontWeight:'600',
                            },
                          },
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        kind={KIND.tertiary}
                        onClick={resetUploader}
                        overrides={{
                          BaseButton: {
                            style: {
                              backgroundColor: '#E8E8E8',
                              borderRadius: '30px',
                              width:'128px',
                              height:'36px',
                              fontSize:'14px',
                              fontWeight:'600',
                            },
                          },                      }}
                      >
                        New Upload
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

