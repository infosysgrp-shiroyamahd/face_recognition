import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.scss';

const Verify: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const showAlert = (msg: string) => {
        setAlertMessage(msg);
        setAlertOpen(true);
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                document.getElementById('startVideo')!.style.display = 'none';
                document.getElementById('verify')!.style.display = 'inline-block';
            })
            .catch(error => {
                console.error(error);
                showAlert('ビデオを開始できません: ' + error.message);
            });
    };

    const verify = () => {
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        if (video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                const formData = new FormData();
                formData.append('image', blob as Blob);

                fetch('https://insightface.japaneast.cloudapp.azure.com/api/verify', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        showAlert(data.message);
                        if (data.age !== undefined) {
                            showAlert(`認証成功しました<br>Age: ${data.age}<br>Gender: ${data.gender}<br>Emotion: ${data.emotion}`);
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        showAlert('認証失敗しました: ' + error.message);
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

                <video ref={videoRef} width="640" height="480" autoPlay playsInline className="rounded-lg shadow-lg mb-4"></video>
                <button
                    id="startVideo"
                    onClick={startVideo}
                    className="mt-4 px-6 py-3 bg-green-500 text-white font-semibold text-xl rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                >
                    Start Video
                </button>
                <button
                    id="verify"
                    onClick={verify}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold text-xl rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    style={{ display: 'none' }}
                >
                    認証開始
                </button>
            </div>
        </div>
    );
};

export default Verify;
