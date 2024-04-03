import './pagenotfound.scss'

function Page() {
    return(
        <div>
            <div className="gradient-bg">
            <div className="gradients-container">
                <div className='g1'></div>
                <div className='g2'></div>
                <div className='g3'></div>
                <div className='g4'></div>
                <div className='g5'></div>
            </div>
        </div>
        <div className="pnf-container">
                <div className='pnf-text-container'>
                    <h1>Oops, that page doesn't exist yet!</h1>
                    <p>
                        <a href='/'>Return to safety</a>
                    </p>
                </div>  
            </div>
        </div>
        
    )
}

export default Page