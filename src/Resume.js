import './Resume.scss';
import myResume from './Bailey_Poe.pdf';
import { useEffect, useRef } from 'react';

function Resume() {
    const bgRef = useRef();

    useEffect(() => {
        const handleScroll = () => {
            if (bgRef.current) {
                bgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll); // Cleanup
    }, []);

    return (
        <div className='resume-wrapper'>
            <div className='resume-container-1'>
                <div className='card-container'>
                    <h1>My Journey</h1>
                    <p>My name is Bailey Poe, and I am a Quality Program Manager at HP with a passion for front-end development. I have always been fascinated by technology and how it can be used to create innovative solutions. My journey into the world of programming began when I started learning HTML and CSS in my free time. I was amazed by how I could create visually appealing websites and bring my ideas to life.</p>
                    <p>As I delved deeper into web development, I discovered the power of JavaScript and its ability to make websites interactive. I started experimenting with different libraries and frameworks, such as React, which allowed me to build dynamic user interfaces. The more I learned, the more I realized that front-end development was where my true passion lay.</p>
                    <p>In addition to my work at HP, I have been actively involved in various personal projects. I am constantly seeking new challenges and opportunities to grow as a developer, and I am excited to see where my journey in front-end development will take me next.</p>
                    <a href={myResume} download="Bailey_Poe.pdf">Be sure to click here to get a copy of my resume!</a>
                </div>
            </div>
        </div>
    )
}

export default Resume;