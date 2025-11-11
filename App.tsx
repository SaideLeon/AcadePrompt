
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AppStatus } from './types';
import { generateEnhancedPrompt, generateUniversalImageStylePrompt, generateEnhancedPromptStream, generateOptimizedInstructionStream } from './services/geminiService';

// Helper to define types for PDF.js library loaded from CDN
declare const pdfjsLib: any;

// --- ICONS ---
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);
const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);
// --- Icons for Explanation & Structured Prompt Section ---
const PersonaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const ChecklistIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);
const FormatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const ConstraintsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);
const StructureIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);
// --- Icons for Main Tabs ---
const AcademicCapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422A12.083 12.083 0 0121 18.782V17.5a2 2 0 00-2-2h-1a1 1 0 00-1 1v1.5a2.5 2.5 0 005 0V12l-9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l-9-5 9 5 9-5-9 5zm0 0v5.5a2.5 2.5 0 005 0V12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-5.5a2.5 2.5 0 015 0V21" />
    </svg>
);
const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2 2 2.293 2.293a1 1 0 010 1.414L5 22m14-14l2.293 2.293a1 1 0 010 1.414L16 12l-2 2 2.293 2.293a1 1 0 010 1.414L14 22" />
    </svg>
);

type PromptMode = 'academic' | 'image' | 'optimizer';
type AcademicInputMethod = 'pdf' | 'text';
type AppSessionState = {
  promptMode: PromptMode;
  academicInputMethod: AcademicInputMethod;
  academicText: string;
  optimizerInstruction: string;
};
type ParsedPromptSection = {
    title: string;
    content: string;
    icon: React.FC<{ className?: string }>;
};

// --- State Persistence ---
const loadSessionState = (): AppSessionState => {
  const defaultState: AppSessionState = {
    promptMode: 'academic',
    academicInputMethod: 'pdf',
    academicText: '',
    optimizerInstruction: '',
  };
  try {
    const savedStateJSON = localStorage.getItem('appSessionState');
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      return { ...defaultState, ...savedState };
    }
  } catch (e) {
    console.error("Failed to load session state:", e);
  }
  return defaultState;
};

const App: React.FC = () => {
  // Load initial state from localStorage
  const initialSessionState = loadSessionState();
  
  // General State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  // Mode State (from session)
  const [promptMode, setPromptMode] = useState<PromptMode>(initialSessionState.promptMode);
  
  // Academic Mode State (from session)
  const [academicInputMethod, setAcademicInputMethod] = useState<AcademicInputMethod>(initialSessionState.academicInputMethod);
  const [academicText, setAcademicText] = useState(initialSessionState.academicText);
  const [isExplanationVisible, setIsExplanationVisible] = useState<boolean>(false);
  
  // Image Mode State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Optimizer Mode State (from session)
  const [optimizerInstruction, setOptimizerInstruction] = useState(initialSessionState.optimizerInstruction);
  
  // History State
  const [academicHistory, setAcademicHistory] = useState<string[]>([]);
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [optimizerHistory, setOptimizerHistory] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigationItems = [
    { mode: 'academic' as PromptMode, label: 'Trabalho Acadêmico', icon: AcademicCapIcon },
    { mode: 'image' as PromptMode, label: 'Edição de Imagem', icon: ImageIcon },
    { mode: 'optimizer' as PromptMode, label: 'Otimizador', icon: SparklesIcon },
  ];

  // --- EFFECT HOOKS ---
  useEffect(() => {
    const stateToSave: AppSessionState = {
      promptMode,
      academicInputMethod,
      academicText,
      optimizerInstruction,
    };
    try {
      localStorage.setItem('appSessionState', JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to save session state to localStorage", e);
    }
  }, [promptMode, academicInputMethod, academicText, optimizerInstruction]);

  const useHistoryPersistence = (key: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    useEffect(() => {
      try {
        const storedHistory = localStorage.getItem(key);
        if (storedHistory) setState(JSON.parse(storedHistory));
      } catch (error) {
        console.error(`Failed to load history from localStorage key "${key}"`, error);
      }
    }, [key, setState]);
  
    useEffect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        console.error(`Failed to save history to localStorage key "${key}"`, e);
      }
    }, [key, state]);
  };

  useHistoryPersistence('academicPromptHistory', academicHistory, setAcademicHistory);
  useHistoryPersistence('imagePromptHistory', imageHistory, setImageHistory);
  useHistoryPersistence('optimizerPromptHistory', optimizerHistory, setOptimizerHistory);

  const formattedPromptHtml = useMemo(() => {
    if (!generatedPrompt) return { __html: '' };
    const html = generatedPrompt
        .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[--primary-light] font-semibold">$1</strong>');
    return { __html: html };
  }, [generatedPrompt]);
  
  // --- HANDLERS ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (promptMode === 'academic') {
        if (file.type !== 'application/pdf') {
            setError('Por favor, selecione um arquivo PDF válido.');
            setStatus(AppStatus.ERROR);
            return;
        }
        processPdfFile(file);
    } else if (promptMode === 'image') {
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione um arquivo de imagem válido.');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const processPdfFile = async (file: File) => {
    setStatus(AppStatus.PROCESSING);
    setLoadingMessage('Processando o PDF e extraindo o texto...');
    setError(null);
    setGeneratedPrompt('');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
      }

      if (!fullText.trim()) {
        throw new Error('O PDF parece estar vazio ou não contém texto legível.');
      }
      
      setLoadingMessage('Analisando as instruções e gerando o prompt...');
      const prompt = await generateEnhancedPrompt(fullText);
      setGeneratedPrompt(prompt);
      setStatus(AppStatus.SUCCESS);
      setAcademicHistory(prev => [prompt, ...prev.filter(p => p !== prompt)].slice(0, 10));

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar o arquivo.');
      setStatus(AppStatus.ERROR);
    } finally {
        setLoadingMessage('');
    }
  };

  const handleGenerateClick = async () => {
    setStatus(AppStatus.PROCESSING);
    setError(null);
    setGeneratedPrompt('');

    let currentLoadingMessage = 'Gerando prompt...';
    if (promptMode === 'academic') {
        currentLoadingMessage = 'Analisando as instruções e gerando o prompt...';
    } else if (promptMode === 'image') {
        currentLoadingMessage = 'Analisando a imagem e extraindo o estilo...';
    } else if (promptMode === 'optimizer') {
        currentLoadingMessage = 'Otimizando sua instrução...';
    }
    setLoadingMessage(currentLoadingMessage);
    
    try {
        if (promptMode === 'academic') {
            if (!academicText.trim()) throw new Error('Por favor, insira as instruções do trabalho.');
            const stream = generateEnhancedPromptStream(academicText);
            let finalPrompt = "";
            for await (const chunk of stream) {
                finalPrompt += chunk;
                setGeneratedPrompt(finalPrompt);
            }
            setAcademicHistory(prev => [finalPrompt, ...prev.filter(p => p !== finalPrompt)].slice(0, 10));
        } else if (promptMode === 'image') {
            if (!imageFile) throw new Error('Por favor, carregue uma imagem.');
            
            const fileToBase64 = (file: File): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        resolve(base64String);
                    };
                    reader.onerror = (error) => reject(error);
                });

            const base64Image = await fileToBase64(imageFile);
            const prompt = await generateUniversalImageStylePrompt(base64Image, imageFile.type);
            setGeneratedPrompt(prompt);
            setImageHistory(prev => [prompt, ...prev.filter(p => p !== prompt)].slice(0, 10));
        } else if (promptMode === 'optimizer') {
            if (!optimizerInstruction.trim()) throw new Error('Por favor, insira uma instrução para otimizar.');
            const stream = generateOptimizedInstructionStream(optimizerInstruction);
            let finalPrompt = "";
            for await (const chunk of stream) {
                finalPrompt += chunk;
                setGeneratedPrompt(finalPrompt);
            }
            setOptimizerHistory(prev => [finalPrompt, ...prev.filter(p => p !== finalPrompt)].slice(0, 10));
        }
        setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao gerar o prompt.');
        setStatus(AppStatus.ERROR);
    } finally {
        setLoadingMessage('');
    }
  };

  const handleCopy = useCallback(() => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [generatedPrompt]);

  const handleDownloadPrompt = useCallback(() => {
    if (!generatedPrompt) return;
    const blob = new Blob([generatedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prompt-gerado.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedPrompt]);

  const handleShare = useCallback(async () => {
    if (navigator.share && generatedPrompt) {
      try {
        await navigator.share({
          title: 'Prompt Gerado',
          text: generatedPrompt,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    }
  }, [generatedPrompt]);

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setGeneratedPrompt('');
    setError(null);
    setIsCopied(false);
    setAcademicText('');
    setImageFile(null);
    setImagePreview(null);
    setOptimizerInstruction('');
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectFromHistory = (prompt: string, mode: PromptMode) => {
    setPromptMode(mode);
    setGeneratedPrompt(prompt);
    setStatus(AppStatus.SUCCESS);
    setError(null);
    setIsCopied(false);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };
  
  const handleClearHistory = () => {
    switch (promptMode) {
        case 'academic': setAcademicHistory([]); break;
        case 'image': setImageHistory([]); break;
        case 'optimizer': setOptimizerHistory([]); break;
    }
  };

  const handleExportHistory = () => {
    let history: string[] = [];
    let filename = '';
    switch(promptMode) {
        case 'academic':
            history = academicHistory;
            filename = 'historico-prompts-academicos.json';
            break;
        case 'image':
            history = imageHistory;
            filename = 'historico-prompts-imagem.json';
            break;
        case 'optimizer':
            history = optimizerHistory;
            filename = 'historico-prompts-otimizador.json';
            break;
    }
    if (history.length === 0) return;
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOptimizerExample = () => {
    setOptimizerInstruction('escreva um email para meu chefe pedindo um dia de folga');
  };
  
  // --- RENDER FUNCTIONS ---
  const renderPromptExplanation = () => (
    <section className="mt-12 w-full max-w-4xl p-6 bg-[--bg-secondary]/50 border border-[--border-color] rounded-xl transition-all">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExplanationVisible(!isExplanationVisible)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setIsExplanationVisible(!isExplanationVisible)} aria-expanded={isExplanationVisible}>
            <h3 className="text-xl font-bold text-[--text-primary] font-heading">Explicação do Prompt Acadêmico</h3>
            <button className="p-1 text-[--text-secondary] hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[--primary-main]" aria-label={isExplanationVisible ? "Esconder explicação" : "Mostrar explicação"}>
                {isExplanationVisible ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
            </button>
        </div>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExplanationVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <p className="text-[--text-secondary] mt-4 mb-6 text-sm">Entenda por que esta estrutura transforma instruções simples em comandos poderosos para a IA, garantindo resultados mais precisos e úteis.</p>
            <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="flex-shrink-0 w-8 h-8 rounded-full bg-[--primary-dark]/50 flex items-center justify-center"><PersonaIcon className="w-5 h-5 text-[--primary-light]" /></div><div><h4 className="font-semibold text-[--primary-light]">1. Persona</h4><p className="text-[--text-secondary] text-sm">Define o "papel" que a IA deve assumir. Isso ajusta o tom, estilo e profundidade do conhecimento da resposta.</p></div></div>
                <div className="flex items-start gap-4"><div className="flex-shrink-0 w-8 h-8 rounded-full bg-[--primary-dark]/50 flex items-center justify-center"><TargetIcon className="w-5 h-5 text-[--primary-light]" /></div><div><h4 className="font-semibold text-[--primary-light]">2. Objetivo Principal</h4><p className="text-[--text-secondary] text-sm">É a declaração de missão para a IA. Diz exatamente qual é o resultado final esperado.</p></div></div>
                <div className="flex items-start gap-4"><div className="flex-shrink-0 w-8 h-8 rounded-full bg-[--primary-dark]/50 flex items-center justify-center"><ChecklistIcon className="w-5 h-5 text-[--primary-light]" /></div><div><h4 className="font-semibold text-[--primary-light]">3. Tarefas/Etapas Detalhadas</h4><p className="text-[--text-secondary] text-sm">Funciona como um roteiro, guiando a IA no processo de construção da resposta.</p></div></div>
                <div className="flex items-start gap-4"><div className="flex-shrink-0 w-8 h-8 rounded-full bg-[--primary-dark]/50 flex items-center justify-center"><FormatIcon className="w-5 h-5 text-[--primary-light]" /></div><div><h4 className="font-semibold text-[--primary-light]">4. Formato de Saída</h4><p className="text-[--text-secondary] text-sm">Instrui a IA sobre como estruturar a resposta final (ensaio, código, tópicos, etc.).</p></div></div>
                <div className="flex items-start gap-4"><div className="flex-shrink-0 w-8 h-8 rounded-full bg-[--primary-dark]/50 flex items-center justify-center"><ConstraintsIcon className="w-5 h-5 text-[--primary-light]" /></div><div><h4 className="font-semibold text-[--primary-light]">5. Restrições e Requisitos</h4><p className="text-[--text-secondary] text-sm">São as "regras do jogo" (contagem de palavras, fontes) para atender aos critérios.</p></div></div>
                <div className="flex items-start gap-4"><div className="flex-shrink-0 w-8 h-8 rounded-full bg-[--primary-dark]/50 flex items-center justify-center"><StructureIcon className="w-5 h-5 text-[--primary-light]" /></div><div><h4 className="font-semibold text-[--primary-light]">6. Exemplo/Estrutura de Saída</h4><p className="text-[--text-secondary] text-sm">Fornecer um esqueleto ou exemplo visual é a forma mais clara de mostrar o que você quer.</p></div></div>
            </div>
        </div>
    </section>
  );

  const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
    'persona': PersonaIcon,
    'objetivo principal': TargetIcon,
    'objetivo final': TargetIcon,
    'tarefas/etapas detalhadas': ChecklistIcon,
    'passos e requisitos': ChecklistIcon,
    'formato de saída': FormatIcon,
    'restrições e requisitos': ConstraintsIcon,
    'exemplo/estrutura de saída (se aplicável)': StructureIcon,
    'contexto e persona': PersonaIcon,
    'tom e estilo': FormatIcon,
    'ação principal': SparklesIcon,
    'estilo e qualidade visual': ImageIcon,
    'composição e pose': PersonaIcon,
    'iluminação e atmosfera': SparklesIcon,
    'fundo (background)': ImageIcon,
    'paleta de cores e tonalidade': FormatIcon,
    'detalhes finos a replicar': ChecklistIcon
  };

  const parseStructuredPrompt = (prompt: string): ParsedPromptSection[] => {
      const sections = prompt.split('\n').filter(line => line.trim() !== '' && !line.startsWith('**Título:'));
      const parsed: ParsedPromptSection[] = [];
      let currentSection: ParsedPromptSection | null = null;
  
      for (const line of sections) {
          const match = line.match(/^\*\*(.*?):\*\*(.*)/);
          if (match) {
              if (currentSection) parsed.push(currentSection);
              
              const fullTitle = match[1].replace(/^\d+\.\s*/, '').trim();
              const content = match[2].trim();
              const iconKey = Object.keys(iconMap).find(key => fullTitle.toLowerCase().includes(key));
              const icon = iconKey ? iconMap[iconKey] : ChecklistIcon;
              
              currentSection = { title: fullTitle, content: content, icon: icon };
          } else if (currentSection) {
              currentSection.content += '\n' + line;
          }
      }
      if (currentSection) parsed.push(currentSection);
      return parsed.map(s => ({...s, content: s.content.trim()}));
  };

  const renderStructuredPrompt = (prompt: string) => {
    const parsedSections = parseStructuredPrompt(prompt);

    if (parsedSections.length === 0) {
      // Fallback para formatos inesperados ou prompt de imagem
      return (
        <pre className="whitespace-pre-wrap break-words p-4 pt-12 sm:p-8 sm:pt-14 text-[--text-secondary] overflow-auto max-h-[60vh] text-sm sm:text-base leading-relaxed">
          <code dangerouslySetInnerHTML={formattedPromptHtml} />
        </pre>
      )
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {parsedSections.map(({ title, content, icon: Icon }, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-[--bg-tertiary]/60 rounded-lg border border-transparent hover:border-[--primary-main]/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[--primary-dark]/50 flex items-center justify-center mt-1">
                        <Icon className="w-5 h-5 text-[--primary-light]" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-[--primary-light]">{title}</h4>
                        <p className="text-[--text-secondary] text-sm whitespace-pre-wrap">{content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const renderInitialScreen = () => {
    const commonTitleClass = "text-4xl sm:text-5xl font-extrabold text-[--primary-light] font-heading";
    const commonDescriptionClass = "mt-3 max-w-2xl mx-auto text-base sm:text-lg text-[--text-secondary]";
    const generateButtonClass = "mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-black/80 bg-[--accent-green] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--bg-primary] focus:ring-[--accent-green] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed";

    switch (promptMode) {
      case 'academic':
        return (
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-8"><h1 className={commonTitleClass}>Gerador de Prompt Acadêmico</h1><p className={commonDescriptionClass}>Transforme as instruções do seu trabalho em um prompt perfeito para IA.</p></div>
            <div className="w-full max-w-lg">
                <div className="flex justify-center border-b border-[--border-color] mb-6">
                    <button onClick={() => setAcademicInputMethod('pdf')} className={`px-4 py-2 text-sm font-medium transition-colors ${academicInputMethod === 'pdf' ? 'border-b-2 border-[--primary-main] text-[--primary-light]' : 'text-[--text-secondary] hover:text-white'}`}>Carregar PDF</button>
                    <button onClick={() => setAcademicInputMethod('text')} className={`px-4 py-2 text-sm font-medium transition-colors ${academicInputMethod === 'text' ? 'border-b-2 border-[--primary-main] text-[--primary-light]' : 'text-[--text-secondary] hover:text-white'}`}>Colar Texto</button>
                </div>
                {academicInputMethod === 'pdf' ? (
                    <label htmlFor="file-upload" className="w-full cursor-pointer flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed border-[--border-color] rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:border-[--primary-main] bg-[--bg-secondary]/50 hover:bg-[--bg-secondary]">
                        <UploadIcon className="w-12 h-12 text-[--text-muted]" />
                        <p className="mt-4 text-lg font-semibold text-[--text-secondary]">Arraste e solte um PDF aqui</p>
                        <p className="text-sm text-[--text-muted]">ou clique para selecionar um arquivo</p>
                        <span className="mt-4 px-4 py-2 text-white text-sm font-medium rounded-md transition-colors bg-[--primary-main] hover:brightness-110">Carregar Documento</span>
                    </label>
                ) : (
                    <div className='w-full'>
                        <textarea value={academicText} onChange={(e) => setAcademicText(e.target.value)} placeholder="Cole aqui as instruções do seu trabalho acadêmico..." className="w-full h-48 p-4 bg-[--bg-secondary] border border-[--border-color] rounded-lg focus:ring-2 focus:ring-[--primary-main] focus:border-[--primary-main] text-[--text-primary] transition-colors" />
                        <button onClick={handleGenerateClick} disabled={!academicText.trim()} className={generateButtonClass}>Gerar Prompt</button>
                    </div>
                )}
            </div>
          </div>
        );
      case 'image':
        return (
            <div className="flex flex-col items-center w-full">
                <div className="text-center mb-8"><h1 className={commonTitleClass}>Extrator de Estilo de Imagem</h1><p className={commonDescriptionClass}>Envie uma imagem de referência e crie um prompt de estilo universal para aplicar a mesma estética em outras fotos.</p></div>
                <div className="w-full max-w-lg space-y-6">
                    <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[--border-color] rounded-xl bg-[--bg-secondary]/50 transition-all hover:border-[--primary-main] hover:bg-[--bg-secondary] cursor-pointer">
                        {imagePreview ? <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" /> : <><ImageIcon className="w-12 h-12 text-[--text-muted]" /><p className="mt-2 text-lg font-semibold text-[--text-secondary]">Carregar Imagem</p></>}
                    </label>
                    <button onClick={handleGenerateClick} disabled={!imageFile} className={generateButtonClass}>Extrair Estilo</button>
                </div>
            </div>
        );
      case 'optimizer':
        return (
            <div className="flex flex-col items-center w-full">
                <div className="text-center mb-8"><h1 className={commonTitleClass}>Otimizador de Instrução</h1><p className={commonDescriptionClass}>Transforme uma ideia simples em um prompt detalhado e eficaz para qualquer IA.</p></div>
                <div className="w-full max-w-lg">
                    <div className="flex justify-end mb-2">
                        <button onClick={handleOptimizerExample} className="text-sm text-[--primary-light] hover:brightness-125 transition-colors font-medium">
                            Usar Exemplo
                        </button>
                    </div>
                    <textarea value={optimizerInstruction} onChange={(e) => setOptimizerInstruction(e.target.value)} placeholder="Ex: escreva um email para meu chefe pedindo um dia de folga" className="w-full h-48 p-4 bg-[--bg-secondary] border border-[--border-color] rounded-lg focus:ring-2 focus:ring-[--primary-main] text-[--text-primary]" />
                    <button onClick={handleGenerateClick} disabled={!optimizerInstruction.trim()} className={generateButtonClass}>Otimizar Instrução</button>
                </div>
            </div>
        );
    }
  };

  const renderContent = () => {
    switch (status) {
      case AppStatus.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-[--primary-light] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-[--text-secondary]">{loadingMessage || 'Processando...'}</p>
            <p className="text-sm text-[--text-muted]">Isso pode levar alguns segundos.</p>
          </div>
        );
      case AppStatus.SUCCESS:
        return (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[--primary-light] mb-4 text-center font-heading">Seu Prompt Otimizado está Pronto!</h2>
            <div className="relative bg-[--bg-secondary] rounded-lg shadow-xl border border-[--border-color] w-full">
              <button onClick={handleCopy} className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--bg-secondary] focus:ring-[--primary-main] ${isCopied ? 'bg-green-500 text-white transform scale-110 shadow-lg' : 'bg-[--bg-tertiary] text-[--text-secondary] hover:brightness-125'}`} aria-label={isCopied ? "Copiado!" : "Copiar prompt"}>
                {isCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
              </button>
              {renderStructuredPrompt(generatedPrompt)}
            </div>
            <div className="mt-6 w-full flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                <button onClick={handleReset} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-black/80 bg-[--accent-green] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--bg-primary] focus:ring-[--accent-green] transition-transform transform hover:scale-105">Gerar Outro Prompt</button>
                <button onClick={handleDownloadPrompt} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-[--text-primary] bg-[--bg-tertiary] hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--bg-primary] focus:ring-[--primary-main] transition-transform transform hover:scale-105"><DownloadIcon className="w-5 h-5 mr-2" /> Salvar em .txt</button>
                {navigator.share && (
                    <button onClick={handleShare} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-[--text-primary] bg-[--bg-tertiary] hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--bg-primary] focus:ring-[--primary-main] transition-transform transform hover:scale-105">
                        <ShareIcon className="w-5 h-5 mr-2" /> Compartilhar
                    </button>
                )}
            </div>
            {(promptMode === 'academic' && status === AppStatus.SUCCESS) && renderPromptExplanation()}
          </div>
        );
      case AppStatus.ERROR:
        return (
          <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h3 className="text-2xl font-semibold text-red-400 font-heading">Ocorreu um Erro</h3>
            <p className="mt-2 text-red-300">{error}</p>
            <button onClick={handleReset} className="mt-6 inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--bg-primary] focus:ring-red-500">
                Tentar Novamente
            </button>
          </div>
        );
      case AppStatus.IDLE:
      default:
        return renderInitialScreen();
    }
  };

  const getPromptTitle = (prompt: string, mode: PromptMode, index: number, historyLength: number): string => {
    if (mode === 'academic') {
        return prompt.split('\n').find(line => line.startsWith('**2. Objetivo Principal:**'))?.replace('**2. Objetivo Principal:**', '').trim() || `Prompt ${historyLength - index}`;
    }
    const firstLine = prompt.split('\n')[0].replace(/\*\*/g, '').replace('Título:', '').trim();
    if (firstLine.length > 5 && firstLine.length < 60) return firstLine;
    return `Prompt ${historyLength - index}`;
  };

  const renderHistory = () => {
    const histories = {
        academic: academicHistory,
        image: imageHistory,
        optimizer: optimizerHistory,
    };
    
    const titles = {
        academic: 'Histórico Acadêmico',
        image: 'Histórico de Estilos',
        optimizer: 'Histórico Otimizador',
    };

    const emptyMessages = {
        academic: 'Nenhum histórico ainda. Gere um prompt acadêmico para começar.',
        image: 'Nenhum histórico ainda. Extraia um estilo de imagem para começar.',
        optimizer: 'Nenhum histórico ainda. Otimize uma instrução para começar.',
    };

    const currentHistory = histories[promptMode];
    const currentTitle = titles[promptMode];
    const currentEmptyMessage = emptyMessages[promptMode];

    if (currentHistory.length === 0) return (
      <div className="text-center text-[--text-muted] text-sm mt-4 px-4">
        {currentEmptyMessage}
      </div>
    );
    return (
        <>
            <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-lg font-bold text-[--text-secondary] flex items-center"><HistoryIcon className="w-5 h-5 mr-2 text-[--primary-light]" />{currentTitle}</h2>
                <div className='flex items-center gap-2'>
                    <button onClick={handleExportHistory} className="text-xs text-[--primary-light] hover:brightness-125" title="Exportar">Exportar</button>
                    <button onClick={handleClearHistory} className="text-xs text-red-400 hover:text-red-300">Limpar</button>
                </div>
            </div>
            <div className="space-y-3 px-2">
                {currentHistory.map((prompt, index) => (
                    <div 
                      key={`${promptMode}-${index}`}
                      className="bg-[--bg-tertiary]/50 p-3 rounded-lg cursor-pointer hover:bg-[--bg-tertiary] transition-all duration-200 transform hover:scale-[1.02]" 
                      onClick={() => handleSelectFromHistory(prompt, promptMode)} 
                      role="button" 
                      tabIndex={0} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSelectFromHistory(prompt, promptMode)} 
                      aria-label={`Selecionar prompt: ${prompt.substring(0, 50)}...`}>
                        <p className="text-[--primary-light] font-semibold truncate text-sm">{getPromptTitle(prompt, promptMode, index, currentHistory.length)}</p>
                        <p className="text-xs text-[--text-muted] truncate mt-1">{prompt.substring(0, 150).replace(/\*\*/g, '')}...</p>
                    </div>
                ))}
            </div>
        </>
    );
  };

  return (
    <div className="flex h-screen bg-[--bg-primary] text-[--text-secondary] font-sans antialiased">
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 md:hidden" aria-hidden="true" />}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 flex-shrink-0 bg-[--bg-secondary]/80 backdrop-blur-sm border-r border-[--border-color] flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <header className="p-4 border-b border-[--border-color] flex-shrink-0">
          <h1 className="text-xl font-bold text-[--primary-light] text-center font-heading">
            Gerador de Prompt
          </h1>
        </header>

        <nav className="p-4 flex-shrink-0">
          <ul className="space-y-2">
            {navigationItems.map(({ mode, label, icon: Icon }) => (
              <li key={mode}>
                <button
                  onClick={() => {
                      if (promptMode !== mode) handleReset();
                      setPromptMode(mode);
                      setIsSidebarOpen(false); // Close sidebar on mobile
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[--primary-main] ${
                    promptMode === mode
                      ? 'bg-[--primary-main]/20 text-[--primary-light]'
                      : 'text-[--text-secondary] hover:bg-[--bg-tertiary] hover:text-[--text-primary]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* History Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 pt-0 flex-shrink-0">
             <div className="border-t border-[--border-color]"></div>
          </div>
          <div className="overflow-y-auto flex-1">
            {renderHistory()}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-0 sm:p-8 overflow-y-auto">
        <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden absolute top-5 left-5 z-10 p-2 bg-[--bg-secondary]/80 rounded-md text-[--text-secondary] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[--primary-main]"
            aria-label="Abrir menu"
        >
            <MenuIcon className="w-6 h-6" />
        </button>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={promptMode === 'academic' ? '.pdf' : 'image/*'}
          key={promptMode} // Reset file input when mode changes
        />
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
