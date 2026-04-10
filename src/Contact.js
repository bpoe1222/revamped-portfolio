import { ContactUs } from "./components/contact_form/contact_form";
import './Contact.scss'

function Contact() {
    return (

        <div>
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