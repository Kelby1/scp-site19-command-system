const navigationItems = [
    "COMMAND CENTER",
    "SCP DATABASE",
    "PERSONNEL",
    "FACILITIES",
    "INCIDENTS",
    "SYSTEM TERMINAL"
];

function Sidebar(){
    return(
        <aside className="sidebar">
            <p className="sidebar__title">SITE-19 // NAVIGATION</p>
            <nav>
                {navigationItems.map((item)=>(<button className="sidebar__item" key={item}>{item}</button>))}
            </nav>
            <div className="sidebar__footer">
                <span>CLEARANCE LEVEL</span>
                <strong>LEVEL 4</strong>
            </div>
        </aside>
    );
}

export default Sidebar;