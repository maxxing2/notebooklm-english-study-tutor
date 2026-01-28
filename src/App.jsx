import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Copy, Check, Youtube, MessageSquare, 
  Headphones, BookOpen, Sparkles, Wand2, BrainCircuit, 
  AlertCircle, Loader2, Target, Clapperboard, Briefcase, Mic,
  ArrowRight, RefreshCw, GraduationCap, MousePointer2, Layers
} from 'lucide-react';

// --- Gemini API Configuration ---
const apiKey = ""; // API Key injected by environment
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const App = () => {
  const [step, setStep] = useState('selection'); // 'selection' | 'guide'
  const [selections, setSelections] = useState({ material: '', goal: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  
  // Custom AI Prompt State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [generatedCustomPrompt, setGeneratedCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Content Logic ---
  const getSlides = (material, goal) => {
    // 1. Intro Slide
    const introSlide = {
      step: "시작하기",
      title: "1분 컷! 소스 추가",
      icon: <Youtube className="w-12 h-12 text-red-500" />,
      description: "먼저 공부할 유튜브 영상의 URL을 복사해서 NotebookLM 소스에 추가하세요.",
      instructions: ["영상 URL 복사", "NotebookLM 왼쪽 [+ 소스 추가] 클릭", "[웹사이트] 선택 후 붙여넣기"],
      bgColor: "bg-red-50",
      accentColor: "bg-red-500"
    };

    // 2. Text Slide
    let textSlide = { step: "Step 1. 읽기", bgColor: "bg-blue-50", accentColor: "bg-blue-500", icon: <BookOpen className="w-12 h-12 text-blue-500" /> };
    
    if (goal === 'casual') {
      textSlide.title = "리얼한 원어민 표현 줍기";
      textSlide.description = "교과서엔 없는 슬랭, 이디엄, 유행어를 찾아 정리합니다.";
      textSlide.prompt = "이 영상에서 원어민들이 실제로 쓰는 슬랭(Slang), 이디엄(Idiom), 또는 구어체 표현 10가지를 뽑아줘. 각 표현의 직역과 의역을 비교해서 설명해주고, 친구와 대화할 때 쓸 수 있는 예문도 3개씩 만들어줘.";
      textSlide.tip = "영화나 드라마 클립에 최적화된 프롬프트입니다.";
    } else if (goal === 'business') {
      textSlide.title = "프로페셔널한 어휘 정리";
      textSlide.description = "업무나 발표에 바로 쓸 수 있는 고급 어휘와 표현을 익힙니다.";
      textSlide.prompt = "이 영상에 나오는 전문 용어(Term)나 비즈니스 표현 10개를 추출해줘. 각 단어의 정의를 명확히 설명하고, 비즈니스 이메일이나 프레젠테이션에서 사용할 수 있는 격식 있는 예문을 작성해줘.";
      textSlide.tip = "TED 강연이나 뉴스, 세미나 영상에 좋습니다.";
    } else { 
      textSlide.title = "들리는 대로 받아적기";
      textSlide.description = "발음과 억양을 완벽하게 카피하기 위한 대본을 만듭니다.";
      textSlide.prompt = "이 영상의 처음 3분 분량의 대본을 작성해줘. 연음(Linking)이 일어나는 부분은 대괄호[]로 표시하고, 강세가 들어가는 단어는 BOLD 처리해서 읽기 호흡을 알 수 있게 해줘.";
      textSlide.tip = "짧은 영상을 반복해서 훈련할 때 좋습니다.";
    }

    // 3. Audio Slide (Updated with detailed studio instructions)
    let audioSlide = { 
      step: "Step 2. 듣기", 
      bgColor: "bg-green-50", 
      accentColor: "bg-green-500", 
      icon: <Headphones className="w-12 h-12 text-green-500" />,
      instructions: [
        "화면 상단(혹은 하단) [노트북 가이드] 클릭",
        "'오디오 개요' 영역의 [맞춤설정(Customize)] 버튼 클릭",
        "아래 프롬프트를 입력하고 [생성] 클릭"
      ]
    };
    
    if (goal === 'casual') {
      audioSlide.title = "수다떨듯 배우는 뉘앙스";
      audioSlide.description = "스튜디오 모드를 켜고, AI 호스트들에게 친구처럼 설명해달라고 요청하세요.";
      audioSlide.prompt = "두 명의 친한 친구가 카페에서 수다를 떨듯이 이 영상의 내용을 이야기해줘. 특히 등장인물들의 감정 변화나 숨겨진 의도를 중심으로 재미있게 분석해줘.";
    } else if (goal === 'business') {
      audioSlide.title = "핵심 요약 브리핑";
      audioSlide.description = "스튜디오 모드를 활용해 출근길에 들을 수 있는 고품격 브리핑을 만듭니다.";
      audioSlide.prompt = "전문 뉴스 앵커나 분석가처럼 이 영상의 핵심 내용을 브리핑해줘. 감정적인 요소는 배제하고, 논리적인 구조와 핵심 주장 위주로 명확하게 전달해줘.";
    } else {
      audioSlide.title = "발음 코칭 라디오";
      audioSlide.description = "영어 선생님이 발음 팁과 주요 문장을 반복해서 들려주도록 설정합니다.";
      audioSlide.prompt = "친절한 영어 선생님이 학생에게 가르치듯이 설명해줘. 어려운 문장은 천천히 두 번씩 반복해서 읽어주고, 발음할 때 주의할 점을 짚어줘.";
    }

    // 4. Flashcard Slide (New!)
    let flashcardSlide = {
      step: "Step 3. 암기",
      bgColor: "bg-yellow-50",
      accentColor: "bg-yellow-500",
      icon: <Layers className="w-12 h-12 text-yellow-500" />,
      title: "AI가 떠먹여주는 '단어장 & 퀴즈'",
      description: "단어장 만들 시간에 공부하세요. NotebookLM의 '학습 가이드' 기능이 플래시카드를 대신합니다.",
      instructions: [
        "채팅창 위쪽 [노트북 가이드]를 다시 클릭하세요.",
        "[학습 가이드] 섹션에서 '용어집(Glossary)'이나 'FAQ'를 확인하세요.",
        "더 구체적인 단어장이 필요하다면 아래 프롬프트를 쓰세요."
      ],
      prompt: "이 영상의 핵심 단어 20개를 뽑아서 '단어(영어) - 뜻(한글) - 예문(영어)' 형식의 표(Table)로 만들어줘. 엑셀이나 Anki에 복사해서 쓸 수 있게 정리해줘.",
      tip: "자동 생성된 '용어집'도 훌륭한 플래시카드 역할을 합니다!"
    };

    // 5. Practice Slide (Output)
    const practiceSlide = {
      step: "Step 4. 실전",
      title: "완벽하게 내 것으로 만들기",
      icon: <Target className="w-12 h-12 text-purple-500" />,
      description: "눈으로만 보면 잊어버립니다. 배운 내용을 직접 써먹어보세요.",
      bgColor: "bg-purple-50",
      accentColor: "bg-purple-500",
      prompt: goal === 'business' 
        ? "오늘 배운 표현을 활용해서 클라이언트에게 보낼 수 있는 정중한 팔로우업 이메일 초안을 작성해줘. 그리고 내가 쓴 문장이 맞는지 체크할 수 있는 빈칸 퀴즈도 3개 만들어줘."
        : "오늘 배운 표현들이 들어간 짧은 상황극 대본(Role-play script)을 만들어줘. A와 B가 대화하는 형식으로 작성해줘."
    };

    return [introSlide, textSlide, audioSlide, flashcardSlide, practiceSlide];
  };

  const slides = selections.material && selections.goal ? getSlides(selections.material, selections.goal) : [];

  // --- Gemini API Logic ---
  const generateCustomPrompt = async () => {
    if (!customInput) return;
    setIsGenerating(true);
    setGeneratedCustomPrompt("");

    const systemPrompt = `You are a prompt engineer for language learners. 
    User wants to customize a prompt for NotebookLM based on their specific need: "${customInput}".
    The current context is: Material=${selections.material}, Goal=${selections.goal}.
    Generate a single, highly effective prompt (Korean instruction for NotebookLM to process) that the user can copy. 
    Output ONLY the prompt text.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: customInput }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const data = await response.json();
      setGeneratedCustomPrompt(data.candidates?.[0]?.content?.parts?.[0]?.text || "오류가 발생했습니다.");
    } catch (e) {
      setGeneratedCustomPrompt("생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Render Components ---

  // 1. Selection Screen
  if (step === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans text-gray-900">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black mb-3 text-gray-800">어떤 영어를 배우고 싶으세요?</h1>
            <p className="text-gray-500">학습 목표를 선택하면 딱 맞는 NotebookLM 가이드를 만들어드립니다.</p>
          </div>

          <div className="space-y-8">
            {/* Question 1 */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block pl-1">1. 주로 어떤 영상을 보시나요?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'movie', label: '영화/미드', icon: <Clapperboard size={20}/> },
                  { id: 'news', label: '뉴스/강연', icon: <Briefcase size={20}/> },
                  { id: 'vlog', label: '브이로그', icon: <Youtube size={20}/> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelections({...selections, material: item.id})}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selections.material === item.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                  >
                    {item.icon}
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block pl-1">2. 가장 중요한 목표는 무엇인가요?</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'casual', label: '자연스러운 회화 & 슬랭 익히기', sub: '친구랑 수다떨기, 넷플릭스 자막 없이 보기', icon: "🗣️" },
                  { id: 'business', label: '프로페셔널한 비즈니스 영어', sub: '이메일 작성, 발표, 전문 용어 습득', icon: "💼" },
                  { id: 'shadowing', label: '발음 & 리스닝 완벽 교정', sub: '쉐도잉, 딕테이션, 연음 듣기 연습', icon: "👂" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelections({...selections, goal: item.id})}
                    className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${selections.goal === item.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-bold">{item.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!selections.material || !selections.goal}
              onClick={() => { setStep('guide'); setCurrentSlide(0); }}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${!selections.material || !selections.goal ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'}`}
            >
              나만의 가이드 생성하기 <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Guide Screen
  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className={`w-full max-w-md ${slide.bgColor} rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 relative flex flex-col min-h-[680px] border-4 border-white`}>
        
        {/* Header / Nav */}
        <div className="bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-white/50 sticky top-0 z-10">
          <button onClick={() => setStep('selection')} className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
             <ChevronLeft size={14} /> 다시 선택
          </button>
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? slide.accentColor : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-grow flex flex-col relative overflow-y-auto">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-sm ${slide.accentColor}`}>
              {slide.step}
            </span>
          </div>

          {/* Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex p-5 bg-white rounded-3xl shadow-sm mb-4 transform hover:scale-110 transition-transform duration-300">
              {slide.icon}
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight mb-3">
              {slide.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed px-4">
              {slide.description}
            </p>
          </div>

          {/* Instructions List (Common for most slides) */}
          {slide.instructions && (
            <div className="bg-white/60 p-6 rounded-2xl border border-white mb-6">
               <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <MousePointer2 size={16} className="text-gray-500" /> 따라해 보세요
                </h3>
              <ul className="space-y-4">
                {slide.instructions.map((ins, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${slide.accentColor}`}>{i + 1}</span>
                    <span className="leading-snug">{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prompt Section (If applicable) */}
          {slide.prompt && (
            <div className="mb-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
              <div className="bg-white p-1 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors shadow-sm">
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare size={14} className="text-blue-500" /> 복사할 프롬프트
                    </h3>
                    {slide.tip && <span className="text-[10px] text-blue-500 font-medium px-2 py-0.5 bg-blue-100 rounded-full">{slide.tip}</span>}
                  </div>
                  
                  <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4 whitespace-pre-line">
                    "{slide.prompt}"
                  </p>

                  <button 
                    onClick={() => handleCopy(slide.prompt, currentSlide)}
                    className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all transform active:scale-95 ${copiedId === currentSlide ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-black'}`}
                  >
                    {copiedId === currentSlide ? <><Check size={16} /> 복사완료!</> : <><Copy size={16} /> 복사하기</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Customizer Toggle */}
          {slide.prompt && (
            <div className="mt-auto">
              <button 
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
              >
                <Wand2 size={12} /> 프롬프트가 마음에 안 드시나요? AI로 고치기
              </button>

              {isCustomizing && (
                <div className="mt-3 bg-white p-4 rounded-2xl border border-blue-100 shadow-lg animate-in slide-in-from-bottom-2 fade-in">
                  <p className="text-xs font-bold text-blue-600 mb-2">어떻게 바꾸고 싶으세요?</p>
                  <textarea 
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="예: 조금 더 쉬운 단어로 바꿔줘 / 한국어 해석도 같이 달아줘"
                    className="w-full p-3 bg-gray-50 rounded-xl text-xs border border-gray-200 mb-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    rows={2}
                  />
                  {generatedCustomPrompt ? (
                     <div className="mb-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-900 font-medium mb-2">"{generatedCustomPrompt}"</p>
                        <button 
                          onClick={() => handleCopy(generatedCustomPrompt, 'custom')}
                          className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                        >
                          {copiedId === 'custom' ? <Check size={12}/> : <Copy size={12}/>} 새 프롬프트 복사
                        </button>
                     </div>
                  ) : (
                    <button 
                      onClick={generateCustomPrompt}
                      disabled={isGenerating || !customInput}
                      className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="animate-spin w-3 h-3"/> : <Sparkles className="w-3 h-3"/>}
                      {isGenerating ? "AI가 생각 중..." : "새로운 프롬프트 생성"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Nav */}
        <div className="p-4 bg-white/50 border-t border-white/50 flex justify-between items-center gap-4">
          <button 
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-30 hover:scale-105 transition-all"
          >
            <ChevronLeft className="text-gray-600" />
          </button>
          
          <button 
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide(currentSlide + 1);
              } else {
                setStep('selection');
                setSelections({ material: '', goal: '' });
              }
            }}
            className={`flex-grow py-3.5 rounded-xl text-white font-bold shadow-md transform active:scale-95 transition-all ${slide.accentColor}`}
          >
            {currentSlide === slides.length - 1 ? "다른 목표로 다시 하기" : "다음 단계"}
          </button>

          <button 
             onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
             disabled={currentSlide === slides.length - 1}
             className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-30 hover:scale-105 transition-all"
          >
            <ChevronRight className="text-gray-600" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
