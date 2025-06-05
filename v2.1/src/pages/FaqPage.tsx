import React from 'react';
import Accordion from 'react-bootstrap/Accordion'; // Assurez-vous d'installer react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'; // Importez le CSS de Bootstrap

const FAQ: React.FC = () => {
  return (
    <div className="container w-full relative left-32 px-64 py-8 min-h-[120vh] bg-white">
      <h1 className="text-center mb-4">Foire Aux Questions</h1>
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Puis-je échanger ou me faire rembourser mon achat de programme ?</Accordion.Header>
          <Accordion.Body>
            Aucun remboursement ou échange n’est possible. Le format pdf ne nous permet pas de récupérer le produit. Merci de faire attention d’avoir les bons produits dans votre panier, avant de valider votre achat.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>J’ai le Programme 1 / Programme 2 / Programme 3, comment se passe un entraînement ?</Accordion.Header>
          <Accordion.Body>
            Il y a trois circuits par séance :
            <ul>
              <li>Circuit 1 : à faire 2 fois en 10mn</li>
              <li>Circuit 2 : à faire 2 fois en 10mn</li>
              <li>Circuit 3 : à faire 1 fois en 10mn</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Quel cardio puis-je faire ?</Accordion.Header>
          <Accordion.Body>
            Le mieux pour votre corps est de varier votre cardio, car en faisant tout le temps la même activité, votre corps à tendance à s’habituer et à moins éliminer.
            Tous les cardio sont efficaces : Corde à sauter, course, vélo, stepper, zumba, Hiit, piscine … À vous de trouver ce qui vous convient le mieux selon votre condition physique et vos préférences : le principal est de transpirer et d’augmenter son rythme cardiaque !
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>Quand commencer notre programme SwipeShape en tant que Femmes Enceintes ?</Accordion.Header>
          <Accordion.Body>
            Le programme axé Femmes Enceintes est adapté de la première semaine de grossesse jusqu’à la trentième. À partir du moment où vous avez un accord médical, il vous suffit de commencer à la semaine qui correspond à votre nombre de semaines de grossesse (Exemple : vous êtes enceinte de 15 semaines ? Vous commencez semaine 15).
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header>Quand commencer le Swipe Shape Formule Intense ?</Accordion.Header>
          <Accordion.Body>
            Contre indications : Consultez votre médecin avant de commencer tout programme post-partum.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="5">
          <Accordion.Header>Les programmes sont-ils adaptés à tout le monde ?</Accordion.Header>
          <Accordion.Body>
            Les programmes sont conçus pour être accessibles à un large public, mais il est toujours recommandé de consulter un professionnel de santé avant de commencer tout nouveau programme d'exercice.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="6">
          <Accordion.Header>Les programmes sont-ils fait pour tous les régimes alimentaires ?</Accordion.Header>
          <Accordion.Body>
            Nos programmes peuvent être adaptés à divers régimes alimentaires. N'hésitez pas à nous contacter pour des conseils personnalisés.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="7">
          <Accordion.Header>Vous ne trouvez pas de réponse ?</Accordion.Header>
          <Accordion.Body>
            Envoyez-nous un mail à <a href="mailto:assistance2@soniatlev.com">yaza@swipeshape.kiwi</a>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default FAQ;
