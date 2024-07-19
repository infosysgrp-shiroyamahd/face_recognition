import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import './styles.scss';

const ReRegister: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [videoStarted, setVideoStarted] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});

    const showAlert = (msg: string) => {
        setAlertMessage(msg);
        setAlertOpen(true);
    };

    const showConfirm = (msg: string, callback: () => void) => {
        setConfirmMessage(msg);
        setConfirmCallback(() => callback);
        setConfirmOpen(true);
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setVideoStarted(true);
                    document.getElementById('startVideo')!.style.display = 'none';
                    document.getElementById('reRegister')!.style.display = 'inline-block';
                }
            })
            .catch(error => {
                console.error('Error accessing the media devices.', error);
                showAlert('ビデオを開始できません: ' + error.message);
            });
    };

    const reRegister = () => {
        if (!employeeNumber.trim() || !employeeName.trim()) {
            showAlert('社員番号と名前を記入してください.');
            return;
        }

        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        if (video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                let formData = new FormData();
                formData.append('image', blob as Blob, employeeNumber + '.png');
                formData.append('employeeNumber', employeeNumber);
                formData.append('employeeName', employeeName);

                setStatus('アップロード中...');

                fetch('https://insightface.japaneast.cloudapp.azure.com/api/re_register', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.override_needed) {
                            showConfirm('社員番号既に存在します。上書きしますか？', () => {
                                let formDataOverride = new FormData();
                                formDataOverride.append('image', blob as Blob, employeeNumber + '.png');
                                formDataOverride.append('employeeNumber', employeeNumber);
                                formDataOverride.append('employeeName', employeeName);
                                formDataOverride.append('override', 'true');

                                fetch('https://insightface.japaneast.cloudapp.azure.com/api/re_register', {
                                    method: 'POST',
                                    body: formDataOverride,
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        showAlert(data.message);
                                        setStatus('');
                                    })
                                    .catch(error => {
                                        console.error('Error:', error);
                                        showAlert('エラーが発生しました: ' + error.message);
                                        setStatus('');
                                    });
                            });
                        } else {
                            showAlert(data.message);
                            setStatus('');
                        }
                    })
                    .catch(error => {
                        if (error.json) {
                            error.json().then((body: any) => {
                                showAlert(body.error);
                            });
                        } else {
                            console.error('Error uploading:', error);
                            showAlert('エラー: ' + error.message);
                        }
                        setStatus('');
                    });
            });
        }
    };

    return (
        <div className="flex h-screen font-sans antialiased bg-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center p-10">
                <Dialog
                    open={alertOpen}
                    onClose={() => setAlertOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle style={{ fontSize: '1.5rem' }}>メッセージ</DialogTitle>
                    <DialogContent>
                        <DialogContentText
                            style={{ fontSize: '1.25rem' }}
                            dangerouslySetInnerHTML={{ __html: alertMessage }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setAlertOpen(false)}
                            style={{ backgroundColor: 'blue', color: 'white', fontSize: '1.25rem' }}
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle style={{ fontSize: '1.5rem' }}>確認</DialogTitle>
                    <DialogContent>
                        <DialogContentText
                            style={{ fontSize: '1.25rem' }}
                            dangerouslySetInnerHTML={{ __html: confirmMessage }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            style={{ backgroundColor: 'red', color: 'white', fontSize: '1.25rem' }}
                        >
                            NO
                        </Button>
                        <Button
                            onClick={() => { confirmCallback(); setConfirmOpen(false); }}
                            style={{ backgroundColor: 'blue', color: 'white', fontSize: '1.25rem' }}
                        >
                            YES
                        </Button>
                    </DialogActions>
                </Dialog>

                <video ref={videoRef} width="640" height="480" autoPlay playsInline className="rounded-lg shadow-lg mb-4"></video>
                <button
                    id="startVideo"
                    onClick={startVideo}
                    className="mt-4 px-6 py-3 bg-green-500 text-white font-semibold text-xl rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                >
                    Start Video
                </button>
                <button
                    id="reRegister"
                    onClick={reRegister}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold text-xl rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    style={{ display: 'none' }}
                >
                    Capture
                </button>
                <div className="mt-4 flex space-x-4">
                    <input
                        type="text"
                        value={employeeNumber}
                        onChange={(e) => setEmployeeNumber(e.target.value)}
                        placeholder="Employee Number"
                        className="px-4 py-2 border text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        placeholder="Employee Name"
                        className="px-4 py-2 border text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mt-4 text-lg font-semibold text-green-500">{message}</div>
                <div className="mt-4 text-sm font-semibold text-gray-500">{status}</div>
            </div>
        </div>
    );
};

export default ReRegister;
