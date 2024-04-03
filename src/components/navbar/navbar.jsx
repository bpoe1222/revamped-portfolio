import './navbar.scss'

function Nav() {
    return(
        <div className="nav-container">
            <div className="nav-links">
                <ul>
                    <li>
                        <a href='/'>Home</a>
                    </li>
                    <li>
                        <a href='/resume'>Resume</a>
                    </li>
                    <li>
                        <a href='/about'>About Me</a>
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