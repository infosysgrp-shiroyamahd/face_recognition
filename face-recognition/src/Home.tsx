import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import './clock.scss';
import moment from 'moment';

const Home: React.FC = () => {

    useEffect(() => {
        const updateTime = () => {
            document.documentElement.style.setProperty('--timer-day', `'${moment().format("dd")}'`);
            document.documentElement.style.setProperty('--timer-hours', `'${moment().format("HH")}'`);
            document.documentElement.style.setProperty('--timer-minutes', `'${moment().format("mm")}'`);
            document.documentElement.style.setProperty('--timer-seconds', `'${moment().format("ss")}'`);
            requestAnimationFrame(updateTime);
        };
        requestAnimationFrame(updateTime);
    }, []);

    return (
        <div className="flex h-screen font-sans antialiased bg-gray-200 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center p-10 w-full min-w-0">
                <div className="clock-container">
                    <div className="clock-col">
                        <p className="clock-day clock-timer"></p>
                        <p className="clock-label">Day</p>
                    </div>
                    <div className="clock-col">
                        <p className="clock-hours clock-timer"></p>
                        <p className="clock-label">Hours</p>
                    </div>
                    <div className="clock-col">
                        <p className="clock-minutes clock-timer"></p>
                        <p className="clock-label">Minutes</p>
                    </div>
                    <div className="clock-col">
                        <p className="clock-seconds clock-timer"></p>
                        <p className="clock-label">Seconds</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
