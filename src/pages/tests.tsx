import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Test } from '@/types';

// Add server-side props for better performance
export async function getServerSideProps() {
  try {
    // Fetch tests on the server side
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tests`);
    
    return {
      props: {
        initialTests: response.data || [],
        error: null
      }
    };
  } catch (err) {
    console.error('Exception in getServerSideProps for tests:', err);
    return {
      props: {
        initialTests: [],
        error: 'Une erreur est survenue lors du chargement des tests.'
      }
    };
  }
}

type Question = {
  question: string;
  options?: string[];
  type?: string;
};

type TestCategory = {
  id: number;
  name: string;
  description: string;
  image: string;
  duration: string;
  questions: Question[];
};

// Sample test data
const testCategories: TestCategory[] = [
  {
    id: 1,
    name: 'Test de Condition Physique',
    description: 'Évaluez votre niveau de forme physique global avec ce test complet.',
    image: '/assets/images/reelles/profil.jpg',
    duration: '15-20 min',
    questions: [
      {
        question: 'Combien de pompes pouvez-vous faire sans vous arrêter ?',
        options: ['0-5', '6-15', '16-25', '26-40', 'Plus de 40']
      },
      {
        question: 'Combien de temps pouvez-vous tenir une planche ?',
        options: ['Moins de 30s', '30s à 1min', '1-2min', '2-3min', 'Plus de 3min']
      },
      {
        question: 'Pouvez-vous toucher vos orteils jambes tendues ?',
        options: ['Non, loin de là', 'Presque', 'Juste', 'Facilement', 'Paumes au sol']
      },
      {
        question: 'Combien de kilomètres pouvez-vous courir sans vous arrêter ?',
        options: ['Moins de 1km', '1-3km', '3-5km', '5-10km', 'Plus de 10km']
      }
    ]
  },
  {
    id: 2,
    name: 'Analyse de Composition Corporelle',
    description: 'Estimez votre composition corporelle et découvrez votre type morphologique.',
    image: '/assets/images/reelles/deadweight.jpg',
    duration: '10 min',
    questions: [
      {
        question: 'Quel est votre poids actuel (en kg) ?',
        type: 'number'
      },
      {
        question: 'Quelle est votre taille (en cm) ?',
        type: 'number'
      },
      {
        question: 'Tour de taille (en cm) :',
        type: 'number'
      },
      {
        question: 'Tour de hanches (en cm) :',
        type: 'number'
      }
    ]
  },
  {
    id: 3,
    name: 'Évaluation des Objectifs',
    description: 'Définissez vos objectifs fitness et recevez des recommandations personnalisées.',
    image: '/assets/images/reelles/weight.jpg',
    duration: '5 min',
    questions: [
      {
        question: 'Quel est votre objectif principal ?',
        options: ['Perte de poids', 'Gain musculaire', 'Amélioration de l\'endurance', 'Tonification', 'Bien-être général']
      },
      {
        question: 'Combien de temps pouvez-vous consacrer à l\'exercice par semaine ?',
        options: ['Moins de 2h', '2-4h', '4-6h', '6-8h', 'Plus de 8h']
      },
      {
        question: 'Préférez-vous vous entraîner :',
        options: ['À la maison', 'En salle', 'En extérieur', 'Combinaison des trois']
      }
    ]
  }
];

interface TestsPageProps {
  initialTests: TestCategory[];
  error: string | null;
}

// Using React.memo to prevent unnecessary re-renders
const TestsPage: React.FC<TestsPageProps> = ({ initialTests = [], error: initialError = null }) => {
  const [tests, setTests] = useState<TestCategory[]>(initialTests);
  const [isLoading, setIsLoading] = useState(!initialTests.length);
  const [error, setError] = useState<string | null>(initialError);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);

  const handleStartTest = (testId: number) => {
    setSelectedTest(testId);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  // Fetch tests if not provided via SSR
  useEffect(() => {
    if (initialTests.length > 0) {
      console.log('Using server-side fetched tests:', initialTests.length);
      return;
    }
    
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/tests');
        setTests(response.data || []);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Une erreur est survenue lors du chargement des tests.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTests();
  }, [initialTests.length]);

  const handleAnswer = (answer: string | number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    });

    const test = tests.find(t => t.id === selectedTest);
    
    if (test && currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
    setShowResults(false);
  };

  const getCurrentTest = () => {
    return tests.find(test => test.id === selectedTest);
  };

  const renderTestQuestion = () => {
    const test = getCurrentTest();
    if (!test) return null;

    const question = test.questions[currentQuestion];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">{`Question ${currentQuestion + 1} sur ${test.questions.length}`}</h2>
        
        <p className="text-lg mb-6">{question.question}</p>
        
        {question.options ? (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-violet-50 hover:border-violet-300 transition-colors"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Votre réponse"
              onChange={(e) => e.target.value && handleAnswer(parseFloat(e.target.value))}
            />
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const test = getCurrentTest();
    if (!test) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-green-700">Test terminé !</h2>
          <p className="text-green-600">Merci d'avoir complété ce test. Votre profil est en cours d'analyse.</p>
        </div>

        <h3 className="text-lg font-medium mb-4">Vos réponses :</h3>
        <ul className="space-y-3 mb-6">
          {test.questions.map((q, index) => (
            <li key={index} className="border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">{q.question}</p>
              <p className="font-medium">{answers[index]}</p>
            </li>
          ))}
        </ul>

        <p className="text-gray-700 mb-6">
          Pour recevoir une analyse détaillée et des recommandations personnalisées, veuillez consulter notre gamme de programmes adaptés à vos besoins.
        </p>

        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={handleBackToTests}
          >
            Retour aux tests
          </button>
          <a
            href="/programs"
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            Voir les programmes recommandés
          </a>
        </div>
      </div>
    );
  };

  // Display loading indicator while fetching tests
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      </div>
    );
  }
  
  // Display error message if tests fetching failed
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md text-center">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedTest === null ? (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Tests & Analyses</h1>
          <p className="text-lg text-gray-600 mb-10 max-w-3xl">
            Découvrez votre profil fitness en répondant à nos tests rapides. Ces évaluations vous aideront à comprendre votre niveau actuel et à identifier les programmes les plus adaptés à vos besoins.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">Aucun test disponible pour le moment.</p>
              </div>
            ) : tests.map(test => (
              <div key={test.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {test.image && (
                  <img
                    src={test.image}
                    alt={test.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {test.name}
                  </h2>
                  <p className="text-gray-600 mb-3">
                    {test.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>Durée : {test.duration}</span>
                  </div>

                  <button 
                    className="w-full px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
                    onClick={() => handleStartTest(test.id)}
                  >
                    Commencer le test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {getCurrentTest()?.name}
          </h1>
          
          {showResults ? renderResults() : renderTestQuestion()}
        </div>
      )}
    </div>
  );
};

export default React.memo(TestsPage);
