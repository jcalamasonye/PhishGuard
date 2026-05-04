'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Info, ShieldAlert, LogIn } from 'lucide-react';
import { PublicHeader } from '@/components/user/PublicHeader';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PhishingAlert } from '@/components/user/training/PhishingAlert';
import { RedFlagBreakdown } from '@/components/user/training/RedFlagBreakdown';
import { BestPractices } from '@/components/user/training/BestPractices';
import { ResourcesList } from '@/components/user/training/ResourcesList';
import { campaignService } from '@/services/campaignService';
import { templateService } from '@/services/templateService';
import { quizService, type Quiz } from '@/services/quizService';
import { useAuth } from '@/context/AuthContext';

interface RedFlag {
  id: string;
  title: string;
  examples: Array<{ label: string; value: string; isBad: boolean }>;
}

export default function TrainingPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  // Auth context — safe to call even when not logged in
  const { isAuthenticated, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [campaignName, setCampaignName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const sampleQuestion = {
    question: 'What is the first thing you should do when you receive a suspicious email?',
    options: [
      'Click the link to check if it is real',
      'Verify the sender address and hover over links before clicking',
      'Reply asking if the email is legitimate',
      'Forward it to colleagues for their opinion',
    ],
    correctAnswer: 1,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try fetching campaign + template data
        // These calls will work if user is logged in
        // If not logged in, we gracefully skip and show generic content
        try {
          const campaignData = await campaignService.getById(campaignId) as unknown as Record<string, unknown>;
          setCampaignName((campaignData.name as string) || '');
          const templateId = campaignData.templateId as string;

          if (templateId) {
            const template = await templateService.getById(templateId);
            setTemplateName(template.name || '');
            const templateRedFlags: RedFlag[] = (template.redFlags || []).map((flag: string, index: number) => ({
              id: String(index + 1),
              title: flag,
              examples: [],
            }));
            setRedFlags(templateRedFlags);
          }
        } catch {
          // Not logged in or campaign not found — show generic content
        }

        // Try fetching quizzes (works when logged in)
        try {
          const quizResult = await quizService.getAll({ limit: 5 });
          setQuizzes(quizResult.quizzes);
        } catch {
          // Not logged in — quizzes won't show, that's fine
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  const handleSubmitAnswer = () => {
    setShowResult(true);
  };

  const handleTakeFullQuiz = () => {
    if (isAuthenticated) {
      if (quizzes.length > 0) {
        router.push(`/quiz/${quizzes[0].id}`);
      } else {
        router.push('/quiz');
      }
    } else {
      // Not logged in — prompt them to login to take the full quiz
      router.push('/login');
    }
  };

 const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <>
        <PublicHeader />
        <main className="min-h-screen bg-gray-50 pt-[73px]">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen pt-[73px]">
        {/* Caught Banner */}
        <PhishingAlert />

        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-12">

            {/* Campaign context if available */}
            {campaignName && (
              <div className="flex items-center gap-2 mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">
                  You clicked a link from the simulated phishing campaign:
                  <span className="font-semibold"> {campaignName}</span>
                  {templateName && <span> using the <span className="font-semibold">&ldquo;{templateName}&rdquo;</span> template</span>}.
                </p>
              </div>
            )}

            {/* Red Flags from the template */}
            <RedFlagBreakdown redFlags={redFlags} />

            {/* Best Practices */}
            <BestPractices />

            {/* Quick Quiz Question */}
            <Card className="bg-blue-50 border-blue-200 mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Info className="w-6 h-6 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Test Your Knowledge</h3>
                  <p className="text-sm text-gray-600">Quick question before you go</p>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-4">{sampleQuestion.question}</h4>

              <div className="space-y-3 mb-6">
                {sampleQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedAnswer(index); setShowResult(false); }}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-blue-600 bg-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedAnswer === index ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-sm text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Submit button */}
              {!showResult && (
                <Button
                  variant="primary"
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="gap-2 mb-4"
                >
                  Submit Answer
                </Button>
              )}

              {/* Result feedback */}
              {showResult && selectedAnswer !== null && (
                <div className={`p-4 rounded-lg mb-4 ${
                  selectedAnswer === sampleQuestion.correctAnswer
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    selectedAnswer === sampleQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {selectedAnswer === sampleQuestion.correctAnswer
                      ? '✓ Correct! Always verify the sender and hover over links before interacting with them.'
                      : '✗ Not quite. The safest approach is to verify the sender address and hover over links to check their real destination before clicking.'}
                  </p>
                </div>
              )}

              {/* CTA after answer */}
              {showResult && (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {isAuthenticated ? (
                    <>
                      <Button variant="primary" onClick={handleTakeFullQuiz} className="gap-2">
                        Take Full Security Quiz
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" onClick={handleGoToDashboard}>
                        Go to Dashboard
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="primary" onClick={() => router.push('/login')} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Log In to Take Full Quiz
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/signup')}>
                        Create Account
                      </Button>
                    </>
                  )}
                </div>
              )}
            </Card>

            {/* Resources */}
            <ResourcesList />

          </div>
        </div>
      </main>
    </>
  );
}
