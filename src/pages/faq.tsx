import React, { useState } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className={`flex justify-between items-center w-full px-4 py-3 text-left font-medium ${isOpen ? 'text-violet-700' : 'text-gray-800'}`}
        onClick={onClick}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 py-3 text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openItem, setOpenItem] = useState<number>(0);

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? -1 : index);
  };

  const faqItems = [
    {
      title: "Puis-je échanger ou me faire rembourser mon achat de programme ?",
      content: "Aucun remboursement ou échange n'est possible. Le format pdf ne nous permet pas de récupérer le produit. Merci de faire attention d'avoir les bons produits dans votre panier, avant de valider votre achat."
    },
    {
      title: "J'ai le Programme 1 / Programme 2 / Programme 3, comment se passe un entraînement ?",
      content: (
        <>
          Il y a trois circuits par séance :
          <ul className="list-disc pl-5 mt-2">
            <li>Circuit 1 : à faire 2 fois en 10mn</li>
            <li>Circuit 2 : à faire 2 fois en 10mn</li>
            <li>Circuit 3 : à faire 1 fois en 10mn</li>
          </ul>
        </>
      )
    },
    {
      title: "Quel cardio puis-je faire ?",
      content: "Le mieux pour votre corps est de varier votre cardio, car en faisant tout le temps la même activité, votre corps à tendance à s'habituer et à moins éliminer. Tous les cardio sont efficaces : Corde à sauter, course, vélo, stepper, zumba, Hiit, piscine … À vous de trouver ce qui vous convient le mieux selon votre condition physique et vos préférences : le principal est de transpirer et d'augmenter son rythme cardiaque !"
    },
    {
      title: "Quand commencer notre programme SwipeShape en tant que Femmes Enceintes ?",
      content: "Le programme axé Femmes Enceintes est adapté de la première semaine de grossesse jusqu'à la trentième. À partir du moment où vous avez un accord médical, il vous suffit de commencer à la semaine qui correspond à votre nombre de semaines de grossesse (Exemple : vous êtes enceinte de 15 semaines ? Vous commencez semaine 15)."
    },
    {
      title: "Quand commencer le Swipe Shape Formule Intense ?",
      content: "Contre indications : Consultez votre médecin avant de commencer tout programme post-partum."
    },
    {
      title: "Les programmes sont-ils adaptés à tout le monde ?",
      content: "Les programmes sont conçus pour être accessibles à un large public, mais il est toujours recommandé de consulter un professionnel de santé avant de commencer tout nouveau programme d'exercice."
    },
    {
      title: "Les programmes sont-ils fait pour tous les régimes alimentaires ?",
      content: "Nos programmes peuvent être adaptés à divers régimes alimentaires. N'hésitez pas à nous contacter pour des conseils personnalisés."
    },
    {
      title: "Vous ne trouvez pas de réponse ?",
      content: <>Envoyez-nous un mail à <a href="mailto:yaza@swipeshape.kiwi" className="text-violet-600 hover:underline">yaza@swipeshape.kiwi</a></>
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[120vh]">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Foire Aux Questions</h1>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm">
        {faqItems.map((item, index) => (
          <AccordionItem
            key={index}
            title={item.title}
            isOpen={openItem === index}
            onClick={() => toggleItem(index)}
          >
            {item.content}
          </AccordionItem>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
