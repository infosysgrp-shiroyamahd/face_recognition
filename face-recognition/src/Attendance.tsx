import React, {useRef, useState, useEffect} from 'react';
import Sidebar from './Sidebar';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button} from '@mui/material';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.scss';

const Attendance: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number>(0);
    const [buttonText, setButtonText] = useState<string>('Start Video');
    const [buttonClass, setButtonClass] = useState<string>('mt-4 px-6 py-3 bg-green-500 text-white font-semibold text-xl rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75');
    const [alertOpen, setAlertOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {
    });
    const [attendanceDetails, setAttendanceDetails] = useState({
        employee_number: '',
        employee_name: '',
        attendance_time: '',
        status: '',
    });
    const [manualOverride, setManualOverride] = useState<boolean>(false);

    useEffect(() => {
        const checkStatus = () => {
            if (manualOverride) return;

            const currentTime = new Date();
            const currentHour = currentTime.getHours();

            if (currentHour >= 4 && currentHour < 15) {
                if (selectedStatus !== 1) {
                    setSelectedStatus(1); // 出勤
                }
            } else {
                if (selectedStatus !== 2) {
                    setSelectedStatus(2); // 退勤
                }
            }
        };

        checkStatus(); // Initial check

        const interval = setInterval(checkStatus, 60000); // Check every minute

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [selectedStatus, manualOverride]);

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
            video: {width: 640, height: 480}
        })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setButtonText('打刻開始');
                setButtonClass('mt-4 px-6 py-3 bg-blue-500 text-white font-semibold text-xl rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75');
            })
            .catch(error => {
                console.error("Something went wrong!", error);
                showAlert("ビデオを開始できません: " + error.message);
            });
    };

    const startAttendance = () => {
        if (selectedStatus === 0) {
            showAlert('打刻種類を選択してください');
            return;
        }
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        if (video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                const formData = new FormData();
                formData.append('image', blob as Blob);
                formData.append('status', selectedStatus.toString());

                fetch('https://insightface.japaneast.cloudapp.azure.com/api/record_attendance', {
                    method: 'POST',
                    body: formData
                }).then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            showAlert(data.error);
                        } else if (data.override) {
                            showConfirm(`あなたはすでに${data.status === '1' ? '出勤' : '退勤'}しました<br>前回の打刻時間: ${data.attendance_time}<br>前回の打刻情報を上書きしますか？`, () => {
                                formData.append('override', 'true');
                                fetch('https://insightface.japaneast.cloudapp.azure.com/api/record_attendance', {
                                    method: 'POST',
                                    body: formData
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.error) {
                                            showAlert(data.error);
                                        } else {
                                            showAlert(`打刻記録が成功しました<br>社員番号: ${data.employee_number}<br>社員名: ${data.employee_name}<br>打刻時間: ${data.attendance_time}<br>打刻種類: ${selectedStatus === 1 ? '出勤' : '退勤'}`);
                                        }
                                    })
                                    .catch(error => showAlert('上書き操作に失敗しました: ' + error.message));
                            });
                        } else {
                            setAttendanceDetails({
                                employee_number: data.employee_number || '',
                                employee_name: data.employee_name || '',
                                attendance_time: data.attendance_time || '',
                                status: selectedStatus === 1 ? '出勤' : '退勤',
                            });
                            showAlert(`打刻記録が成功しました<br>社員番号: ${data.employee_number}<br>社員名: ${data.employee_name}<br>打刻時間: ${data.attendance_time}<br>打刻種類: ${selectedStatus === 1 ? '出勤' : '退勤'}`);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            });
        }
    };

    const handleStatusClick = (status: number) => {
        setSelectedStatus(status);
        setManualOverride(true);

        setTimeout(() => {
            setManualOverride(false);
        }, 300000); // Disable auto selection for 10 minutes
    };

    return (
        <div className="flex h-screen font-sans antialiased bg-gray-200">
            <Sidebar/> {/* 使用 Sidebar 组件 */}
            <div className="flex-1 flex flex-col items-center justify-center p-10">
                <Dialog
                    open={alertOpen}
                    onClose={() => setAlertOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle style={{fontSize: '1.5rem'}}>メッセージ</DialogTitle>
                    <DialogContent>
                        <DialogContentText
                            style={{fontSize: '1.25rem'}}
                            dangerouslySetInnerHTML={{__html: alertMessage}}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setAlertOpen(false)}
                            style={{backgroundColor: 'blue', color: 'white', fontSize: '1.25rem'}}
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
                    <DialogTitle style={{fontSize: '1.5rem'}}>確認</DialogTitle>
                    <DialogContent>
                        <DialogContentText
                            style={{fontSize: '1.25rem'}}
                            dangerouslySetInnerHTML={{__html: confirmMessage}}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            style={{backgroundColor: 'red', color: 'white', fontSize: '1.25rem'}}
                        >
                            NO
                        </Button>
                        <Button
                            onClick={() => {
                                confirmCallback();
                                setConfirmOpen(false);
                            }}
                            style={{backgroundColor: 'blue', color: 'white', fontSize: '1.25rem'}}
                        >
                            YES
                        </Button>
                    </DialogActions>
                </Dialog>

                <div className="flex flex-col items-center justify-center h-full">
                    <video ref={videoRef} width="640" height="480" className="rounded-lg shadow-lg mb-4" autoPlay
                           playsInline></video>
                    <div className="flex mb-4 space-x-4">
                        <button
                            className={`text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-2xl px-24 py-10 text-center transition-transform transform ${selectedStatus === 1 ? 'selected scale-110' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusClick(1);
                            }}
                        >
                            出勤
                        </button>
                        <button
                            className={`text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-2xl px-24 py-10 text-center transition-transform transform ${selectedStatus === 2 ? 'selected scale-110' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusClick(2);
                            }}
                        >
                            退勤
                        </button>
                    </div>
                    <button
                        onClick={buttonText === 'Start Video' ? startVideo : startAttendance}
                        className={buttonClass}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
