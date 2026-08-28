function Header(){
    return(
        <header className="header">
            <div className="header__brand">
                <div className="header__logo">SCP</div>
                <div>
                    <h1>SECURE CONTAINMENT FOUNDATION</h1>
                    <p>SITE-19 SECURE COMMAND SYSTEM</p>
                </div>
            </div>
            <div className="header__status">
                <span className="status-indicator"></span>
                <span>SYSTEM ONLINE</span>
            </div>
        </header>
    );
}

export default Header;