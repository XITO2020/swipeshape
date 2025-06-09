import React, { useState } from 'react';
import Link from 'next/link';

// This page is about quizzes and tests for women about nutrition, psychology, sport and personal development

interface QuizCategory {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
  colorHover: string;
  quizzes: Quiz[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: string;
  questions: number;
  imageUrl?: string;
}

const categories: QuizCategory[] = [
  {
    id: 1,
    title: "Nutrition",
    description: "Découvrez votre relation avec la nourriture et obtenez des conseils alimentaires personnalisés.",
    imageUrl: "/assets/images/reelles/nutrition.jpg",
    color: "bg-emerald-100",
    colorHover: "hover:bg-emerald-200",
    quizzes: [
      {
        id: 101,
        title: "Évaluez vos habitudes alimentaires",
        description: "Ce test analysera vos habitudes alimentaires quotidiennes et vous fournira des recommandations personnalisées.",
        duration: "5-7 min",
        questions: 15,
        imageUrl: "/assets/images/reelles/food.jpg"
      },
      {
        id: 102,
        title: "Quelle alimentation pour votre type d'entraînement ?",
        description: "Découvrez les meilleurs aliments pour optimiser votre performance selon votre type d'exercice préféré.",
        duration: "4-5 min",
        questions: 12,
        imageUrl: "/assets/images/reelles/foodsport.jpg"
      },
      {
        id: 103,
        title: "Test d'intolérance alimentaire",
        description: "Identifiez les signaux qui pourraient indiquer des sensibilités alimentaires.",
        duration: "8-10 min",
        questions: 20,
      }
    ]
  },
  {
    id: 2,
    title: "Psychologie",
    description: "Explorez votre esprit et développez une meilleure compréhension de vous-même.",
    imageUrl: "/assets/images/reelles/psychology.jpg",
    color: "bg-purple-100",
    colorHover: "hover:bg-purple-200",
    quizzes: [
      {
        id: 201,
        title: "Test de gestion du stress",
        description: "Évaluez votre niveau de stress et découvrez des techniques personnalisées pour le gérer.",
        duration: "6-8 min",
        questions: 18,
        imageUrl: "/assets/images/reelles/stress.jpg"
      },
      {
        id: 202,
        title: "Découvrez votre type de personnalité",
        description: "Un aperçu de vos traits de personnalité et comment ils influencent votre approche du fitness.",
        duration: "10-12 min",
        questions: 25,
        imageUrl: "/assets/images/reelles/personality.jpg"
      },
      {
        id: 203,
        title: "Relation avec votre corps",
        description: "Explorez votre relation avec votre image corporelle et développez une perspective plus saine.",
        duration: "7-9 min",
        questions: 20,
      }
    ]
  },
  {
    id: 3,
    title: "Sport",
    description: "Trouvez les activités physiques qui vous correspondent et optimisez votre entraînement.",
    imageUrl: "/assets/images/reelles/sport.jpg",
    color: "bg-rose-100",
    colorHover: "hover:bg-rose-200",
    quizzes: [
      {
        id: 301,
        title: "Quel sport est fait pour vous ?",
        description: "Découvrez quelles activités correspondent le mieux à votre personnalité et à vos objectifs.",
        duration: "5-6 min",
        questions: 15,
        imageUrl: "/assets/images/reelles/sports.jpg"
      },
      {
        id: 302,
        title: "Évaluez votre forme physique",
        description: "Un test complet pour évaluer votre condition physique actuelle et identifier vos points forts et vos axes d'amélioration.",
        duration: "8-10 min",
        questions: 20,
        imageUrl: "/assets/images/reelles/fente.jpg"
      },
      {
        id: 303,
        title: "Déterminez votre type d'entraînement idéal",
        description: "Découvrez si vous êtes plus adaptée aux exercices d'endurance, de force, de flexibilité ou d'équilibre.",
        duration: "6-8 min",
        questions: 18,
      }
    ]
  },
  {
    id: 4,
    title: "Développement personnel",
    description: "Progressez vers vos objectifs personnels et devenez la meilleure version de vous-même.",
    imageUrl: "/assets/images/reelles/personal.jpg",
    color: "bg-amber-100",
    colorHover: "hover:bg-amber-200",
    quizzes: [
      {
        id: 401,
        title: "Définissez vos objectifs de vie",
        description: "Clarifiez vos aspirations personnelles et professionnelles pour créer un plan d'action efficace.",
        duration: "7-9 min",
        questions: 18,
        imageUrl: "/assets/images/reelles/goals.jpg"
      },
      {
        id: 402,
        title: "Découvrez vos valeurs fondamentales",
        description: "Identifiez les valeurs qui guident vos décisions pour vivre plus authentiquement.",
        duration: "8-10 min",
        questions: 22,
        imageUrl: "/assets/images/dollarsbeige.jpg"
      },
      {
        id: 403,
        title: "Évaluez votre équilibre vie personnelle/professionnelle",
        description: "Analysez comment vous répartissez votre temps et votre énergie entre les différentes sphères de votre vie.",
        duration: "5-7 min",
        questions: 15,
      }
    ]
  }
];

const TestPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };
  
  const renderCategories = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {categories.map(category => (
          <div 
            key={category.id} 
            className={`${category.color} p-5 rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${category.colorHover} transform hover:-translate-y-1`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className="flex items-center space-x-4">
              {category.imageUrl && (
                <img
                  src={category.imageUrl}
                  alt={category.title}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderQuizzesByCategory = () => {
    if (selectedCategory === null) return null;
    
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return null;
    
    return (
      <div className="mt-6">
        <div className="flex items-center mb-6">
          <button 
            className="mr-4 text-violet-600 flex items-center" 
            onClick={() => setSelectedCategory(null)}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux catégories
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Tests {category.title}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {quiz.imageUrl && (
                <img
                  src={quiz.imageUrl}
                  alt={quiz.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Durée: {quiz.duration}</span>
                  <span>{quiz.questions} questions</span>
                </div>
                
                <Link href={`/quiz/${quiz.id}`}>
                  <div className="w-full px-4 py-2 bg-violet-600 text-center text-white rounded-md hover:bg-violet-700 transition-colors cursor-pointer">
                    Commencer le test
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Tests et Quiz Pour Femmes</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-3xl">
        Découvrez-en plus sur votre santé, votre esprit et votre potentiel grâce à nos tests spécialisés dans quatre domaines clés : nutrition, psychologie, sport et développement personnel.
      </p>
      
      {selectedCategory === null ? renderCategories() : renderQuizzesByCategory()}
      
      <div className="mt-12 bg-purple-50 rounded-lg p-6 border border-purple-100">
        <h2 className="text-xl font-semibold text-purple-800 mb-3">Pourquoi faire nos tests ?</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Des conseils personnalisés basés sur vos résultats</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Des tests conçus spécifiquement pour les femmes</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Une approche holistique de votre bien-être</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Des recommandations de programmes adaptés à vos besoins</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;