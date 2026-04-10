import { ContactUs } from "./components/contact_form/contact_form";
import './Contact.scss'

function Contact() {
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
            <div className="contact-container">
                <div className="card-container-contact">
                <h1>Contact Me</h1>
                    <ContactUs />
                </div>

            </div>

        </div>
    )
}

export default Contact