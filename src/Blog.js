import './Blog.scss'

function Blog() {
    return (
        <div className='blog-container'>
            <div className='card-container'>
                <h1>No GUI Needed Blog</h1>
                <p><em>Notes on things I'm learning and building.</em></p>
                <div className='blog-posts'>
                <a>
                <h3>First Issue</h3>
                <p>This is a simple test post for the blog.</p>
                <p>11/25/26</p>
                </a>
                </div>
            </div>
        </div>
    )
}

export default Blog