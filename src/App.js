import './App.scss';

function App() {
  return (
    <div>
      <div className='welcome-container'>
        <div className='right'>
          <div className='card-container'>
            <h1>Hello World!</h1>
            {/* <img src={myImage}></img> */}
            <p>I'm Bailey Poe, a Quality Program Manager at HP with a passion for front-end development.</p>
            <p>Explore my tech journey below!</p>
            <a href='/resume'>My journey</a>
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;
