import './navbar.scss'
import { useEffect, useState } from 'react';

function Nav() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`nav-container ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-links">
                <ul>
                    <li>
                        <a href='/'>Home</a>
                    </li>
                    <li>
                        <a href='/resume'>Resume</a>
                    </li>
                    <li>
                        <a href='/contact'>Contact Me</a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Nav