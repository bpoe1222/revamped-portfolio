import logo from './logo.svg';
import './App.scss';
import myImage from './images/pfp.jpg'

function App() {
  return (
    <div>
      <div className="gradient-bg">
      <div className='gradients-container'>
        <div className='g1'></div>
        <div className='g2'></div>
        <div className='g3'></div>
        <div className='g4'></div>
        <div className='g5'></div>
      </div>
    </div>
    <div className='welcome-container'>
      <div className='right'>
        <div className='card-container'>
          <h1>Hello World!</h1>
          {/* <img src={myImage}></img> */}
          <p>I'm Bailey Poe, a Quality Assurance Analyst at HP with a passion for front-end development.</p>
          <p>Explore my tech journey below!</p>
          <a href='/resume'>My journey</a>
        </div>
      </div>
    </div>
    </div>
    
  );
}

export default App;
