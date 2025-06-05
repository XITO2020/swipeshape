import React from 'react';
import NewsletterForm from '../components/NewsletterForm';

const ContactPage: React.FC = () => {
  return (
    <div>
      <section>
        <div>
            <h2>Vontactez nous</h2>
            <p>telephone</p>
            <p>email</p>
            <p>Envoi de colis (démarchage commercial)</p>
            <p>Adresses</p>
            <p>Nos Horaires de Lives</p>
            <p>Tiktok</p>
            <p>Instagram</p>
            <p>Youtube</p>
        </div>
      </section>
      <section>
        <NewsletterForm />
      </section>
    </div>
  );
};

export default ContactPage;