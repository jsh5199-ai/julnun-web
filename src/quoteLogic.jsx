import React, { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
    HOUSING_TYPES, MATERIALS, MATERIAL_GUIDE, SERVICE_AREAS, SILICON_AREAS, 
    REVIEW_EVENTS, FAQ_ITEMS, ICON_PATHS, getBasePrice, calculateEstimate 
} from './quoteLogic';

// [아이콘 컴포넌트]
const Icon = ({ name, size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {ICON_PATHS[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
);

// [스타일 정의]
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    body { font-family: "Pretendard Variable", "Pretendard", sans-serif; background-color: #FFFFFF; color: #1e3a8a; margin: 0; padding: 0; font-size: 16px; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-enter { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; } 
    .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .shadow-card { box-shadow: 0 4px 12px rgba(30, 58, 138, 0.08); }
    .shadow-float { box-shadow: 0 -5px 20px -5px rgba(30, 58, 138, 0.15); }
    
    /* 캡처 대상 요소를 정확히 지정하기 위한 클래스 */
    .quote-capture-area { 
        background-color: #FFFFFF !important; 
        padding: 24px; 
        border-radius: 10px; 
        overflow-y: auto; 
    }
  `}</style>
);

// [아코디언 컴포넌트]
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button className="flex justify-between items-center w-full py-5 text-left group" onClick={() => setIsOpen(!isOpen)}>
                <span className={`text-base transition-colors ${isOpen ? 'font-bold text-[#1e3a8a]' : 'font-medium text-slate-600 group-hover:text-[#1e3a8a]'}`}>{question}</span>
                <Icon name="chevronDown" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} size={18} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-slate-500 pb-5 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

// =================================================================
// [메인 앱]
// =================================================================
export default function GroutEstimatorApp() {
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
  
  const [quantities, setQuantities] = useState(
    [...SERVICE_AREAS, ...SILICON_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [packageToastDismissed, setPackageToastDismissed] = useState(false);
  const [showMaterialGuide, setShowMaterialGuide] = useState(false);
  
  // 🌟 [최종]: 캡처 대상 요소를 견적 컨텐츠 영역으로 지정
  const quoteContentRef = useRef(null); 

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const nextValue = Math.max(0, prev[id] + delta);
      const nextState = { ...prev, [id]: nextValue };
      return nextState;
    });
    setPackageToastDismissed(false);
  };

  const toggleReview = (id) => {
    setSelectedReviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  
  const calculation = useMemo(() => {
    const effectiveMaterialId = material === 'poly' ? material : epoxyOption;
    return calculateEstimate(quantities, housingType, effectiveMaterialId, selectedReviews);
  }, [housingType, material, epoxyOption, quantities, selectedReviews]);

  // 🌟 [이미지 저장 기능 수정]: 버튼을 제외하고 컨텐츠만 캡처
  const saveAsImage = async () => {
    const elementToCapture = quoteContentRef.current; // 캡처 대상을 순수 컨텐츠 영역으로 변경
    
    if (!elementToCapture) {
        alert("에러: 견적서 영역을 찾을 수 없습니다.");
        return;
    }
    
    try {
        // 캡처 전 준비
        const originalScrollTop = elementToCapture.scrollTop;
        const originalOverflowY = elementToCapture.style.overflowY;
        const originalMaxHeight = elementToCapture.style.maxHeight;

        elementToCapture.scrollTop = 0; 
        elementToCapture.style.overflowY = 'visible'; 
        elementToCapture.style.maxHeight = 'fit-content'; 
        
        // 🌟 html2canvas 옵션 조정: 고해상도 및 배경색 지정
        const canvas = await html2canvas(elementToCapture, { 
            scale: 3, // 시인성 개선
            logging: false, 
            useCORS: true, 
            backgroundColor: '#FFFFFF', // 명확한 흰색 배경 지정
            height: elementToCapture.scrollHeight, // 스크롤 가능한 높이 전체를 캡처
            width: elementToCapture.scrollWidth, 
        });

        // 캡처 후 원본 스타일 복구
        elementToCapture.style.overflowY = originalOverflowY;
        elementToCapture.style.maxHeight = originalMaxHeight;
        elementToCapture.scrollTop = originalScrollTop; 

        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
        
        setShowModal(false);
        alert("견적서 이미지가 성공적으로 저장되었습니다!");
    } catch (error) {
        console.error("이미지 저장 중 오류 발생:", error);
        alert("이미지 저장에 실패했습니다. 콘솔을 확인하세요.");
    }
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);
  const showPulse = hasSelections && !showModal;
  const showPackageBanner = calculation.isPackageActive && !packageToastDismissed && !calculation.isMinCost;

  const finalMaterialId = material === 'poly' ? material : epoxyOption;

  return (
    <div className="min-h-screen pb-44 selection:bg-[#1e3a8a] selection:text-white bg-white">
      <GlobalStyles />
      {/* 헤더 (변경 없음) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
               <div className="bg-[#1e3a8a] text-white p-1 rounded-md"><Icon name="shield" size={18} /></div>
               <span className="font-bold text-lg tracking-tight text-[#1e3a8a]">줄눈의미학</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-md hover:bg-slate-50 transition text-slate-500">
            <Icon name="refresh" size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-24 space-y-10">
        {/* STEP 1, 2, 3 및 할인 혜택 (변경 없음) */}
        <section className="animate-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">현장 유형</h2>
            <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full">STEP 01</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button key={type.id} onClick={() => setHousingType(type.id)} className={`flex flex-col items-start p-6 rounded-xl transition-all duration-200 border ${housingType === type.id ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'}`}>
                <div className={`mb-3 ${housingType === type.id ? 'text-white' : 'text-slate-400'}`}><Icon name={type.icon} size={26} /></div>
                <div className="font-bold text-lg">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: 재료 선택 */}
        <section className="animate-enter" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">시공 소재</h2>
            <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full">STEP 02</span>
          </div>
          <div className="mb-4">
              <button onClick={() => setShowMaterialGuide(!showMaterialGuide)} className="w-full text-center py-2 text-sm font-semibold rounded-lg text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                소재 정보 {showMaterialGuide ? '숨기기' : '확인하기'} <Icon name="chevronDown" size={16} className={`transition-transform ${showMaterialGuide ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showMaterialGuide ? 'max-h-96 opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    {MATERIAL_GUIDE.map((guide, idx) => (
                        <div key={idx} className="border-b border-slate-200 last:border-0 pb-3 last:pb-0">
                            <h4 className={`font-bold text-base mb-1 ${guide.color === 'blue' ? 'text-blue-700' : 'text-slate-700'}`}>{guide.material}</h4>
                            <div className="flex text-sm">
                                <div className="w-1/2 pr-2 text-green-700"><span className="font-bold">장점: </span>{guide.pros.join(', ')}</div>
                                <div className="w-1/2 pl-2 border-l border-slate-200 text-red-700"><span className="font-bold">단점: </span>{guide.cons.join(', ')}</div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          </div>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} onClick={() => setMaterial(item.id)} className={`group relative overflow-hidden p-6 rounded-xl transition-all duration-200 border ${material === item.id ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{item.label}</span>
                            {material === item.id && <Icon name="check" size={20} className="text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${material === item.id ? 'text-slate-200' : 'text-slate-500'}`}>{item.subLabel}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold tracking-wider ${material === item.id ? 'bg-[#172554] text-blue-200' : item.badgeColor}`}>{item.tags[0]}</span>
                </div>
                <p className={`text-sm leading-relaxed ${material === item.id ? 'text-slate-300' : 'text-slate-500'}`}>{item.description}</p>
                <div className={`transition-all duration-300 ease-out ${material === item.id ? 'max-h-24 opacity-100 mt-5' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex gap-3">
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${polyOption === 'pearl' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>펄</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${polyOption === 'no_pearl' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>무펄</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${epoxyOption === 'kerapoxy' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${epoxyOption === 'starlike' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>스타라이크</button>
                        </>
                    )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEP 3: 공간 선택 */}
        <section className="animate-enter" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">시공 구역</h2>
            <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full">STEP 03</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Icon name="layout" size={16}/> 줄눈 시공 범위</h3>
            </div>
            <div className="p-2">
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-blue-100 text-[#1e3a8a]' : 'bg-slate-100 text-slate-400'}`}><Icon name={area.icon} size={24} /></div>
                            <div>
                                <div className="font-bold text-slate-900 text-lg">{area.label}</div>
                                <div className="text-sm text-slate-500 font-medium">{getBasePrice(area.id, material).toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-1">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-[#1e3a8a] hover:bg-blue-50' : 'text-slate-300'}`}><Icon name="x" size={14} className="rotate-45" /></button>
                             <span className={`w-8 text-center text-lg font-bold ${quantities[area.id] > 0 ? 'text-[#1e3a8a]' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-9 h-9 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"><Icon name="x" size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 border-t">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Icon name="eraser" size={16}/> 실리콘 오염방지</h3>
            </div>
            <div className="p-2">
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}><Icon name={area.icon} size={24} /></div>
                            <div>
                                <div className="font-bold text-slate-900 text-lg">{area.label}</div>
                                <div className="text-sm text-slate-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-1">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-orange-700 hover:bg-orange-50' : 'text-slate-300'}`}><Icon name="x" size={14} className="rotate-45" /></button>
                             <span className={`w-8 text-center text-lg font-bold ${quantities[area.id] > 0 ? 'text-orange-900' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-9 h-9 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"><Icon name="x" size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* 할인 혜택 */}
        <section className="animate-enter" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">프로모션</h2>
            <Icon name="gift" size={24} className="text-[#1e3a8a]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button key={evt.id} onClick={() => toggleReview(evt.id)} className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 ${selectedReviews.has(evt.id) ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                <div className="flex items-center gap-1 mb-2">
                    <Icon name="star" size={16} className={selectedReviews.has(evt.id) ? 'text-yellow-400' : 'text-slate-300'} />
                    <span className={`text-sm font-medium ${selectedReviews.has(evt.id) ? 'text-slate-300' : 'text-slate-500'}`}>{evt.label}</span>
                </div>
                <div className={`text-xl font-bold ${selectedReviews.has(evt.id) ? 'text-white' : 'text-slate-400'}`}>-{evt.discount.toLocaleString()}원</div>
              </button>
            ))}
          </div>
          <div className="text-center mt-4"><p className="text-sm text-rose-500 font-bold bg-rose-50 inline-block px-4 py-2 rounded-lg">※ 서비스 이용 후 꼭! 작성해주세요</p></div>
        </section>

        {/* FAQ */}
        <section className="pb-8">
               <h2 className="text-xl font-bold text-[#1e3a8a] mb-5">자주 묻는 질문</h2>
               <div className="bg-white rounded-xl border border-slate-200 px-4">
                 {FAQ_ITEMS.map((item, idx) => <Accordion key={idx} question={item.question} answer={item.answer} />)}
               </div>
        </section>
      </main>

      {/* --- Floating Bottom Bar --- (변경 없음) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 pb-8 shadow-float">
        <div className="max-w-md mx-auto relative">
            {calculation.isMinCost && (
                <div className="absolute bottom-full left-0 right-0 mb-4 animate-enter">
                    <div className="bg-rose-600 text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-3">
                        <div className="bg-rose-700 p-1.5 rounded-md"><Icon name="info" size={18} /></div>
                        <div className="flex-1"><span className="font-bold text-sm block">현재 견적가는 최소출장비용입니다.</span><span className="text-xs text-rose-100 opacity-90">선택하신 구역의 합계가 최소금액 미만입니다.</span></div>
                    </div>
                </div>
            )}
            {showPackageBanner && (
                <div className="absolute bottom-full left-0 right-0 mb-4 animate-enter mx-auto max-w-md">
                    <div className="bg-[#1e3a8a]/95 backdrop-blur text-white p-4 rounded-xl shadow-lg border border-blue-900">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#172554] p-2 rounded-lg shrink-0"><Icon name="gift" size={20} /></div>
                                <div>
                                    <div className="font-bold text-base text-white mb-1">{calculation.label} 적용중!</div>
                                    <ul className="text-xs text-blue-100 space-y-1 pl-1">
                                        {calculation.isFreeEntrance && <li>• 현관 바닥 시공 (서비스 - 폴리아스파틱)</li>}
                                        <li>• 변기 테두리 / 바닥 테두리 서비스</li>
                                        {calculation.FREE_SILICON_AREAS.includes('silicon_sink') && <li>• 욕실 젠다이/세면대 실리콘 오염방지</li>}
                                    </ul>
                                </div>
                            </div>
                            <button onClick={() => setPackageToastDismissed(true)} className="p-1 rounded-full text-slate-300 hover:text-white bg-transparent transition"><Icon name="x" size={16} /></button>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg flex items-start gap-2">
                            <Icon name="info" size={14} className="mt-0.5 text-yellow-300 shrink-0"/>
                            <span className="text-[11px] text-blue-50 leading-snug"><span className="font-bold text-yellow-300">타일 크기 기준:</span> 바닥 30x30cm, 벽면 30x60cm 크기 기준이며, 이보다 작거나 조각 타일인 경우 현장에서 추가 비용이 발생할 수 있습니다.</span>
                        </div>
                    </div>
                </div>
            )}
            <button onClick={() => setShowModal(true)} disabled={!hasSelections} className={`w-full h-16 rounded-lg flex items-center justify-between px-6 transition-all ${showPulse ? 'bg-[#1e3a8a] text-white hover:bg-[#1e40af] shadow-sharp animate-pulse-slow' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                <div className="flex flex-col items-start">
                    <span className={`text-xs font-bold tracking-wider uppercase ${hasSelections ? 'text-white/70' : 'text-slate-400'}`}>Total Estimate</span>
                    <div className="text-xl font-bold flex items-baseline gap-1">{calculation.price.toLocaleString()}<span className="text-base font-normal opacity-80">원</span></div>
                </div>
                <div className="flex items-center gap-2 font-bold text-base">견적서 확인 <Icon name="arrowRight" size={20} /></div>
            </button>
        </div>
      </div>

      {/* --- Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-enter max-h-[90vh] flex flex-col">
                
                {/* 🌟 캡처 대상 영역: 헤더부터 유의사항까지 포함하는 스크롤 영역 */}
                <div ref={quoteContentRef} className="flex-1 overflow-y-auto quote-capture-area"> 
                    
                    {/* 모달 헤더 (제목 변경) */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-2xl text-[#0f172a] flex items-center gap-2"><Icon name="shield" size={28} className="text-[#1e3a8a]"/> 줄눈의미학</h3>
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">발행일: {new Date().toLocaleDateString()}</span>
                    </div>
                    
                    {/* 견적 요약 */}
                    <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-6 mb-6">
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">현장 유형</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1 text-base">{HOUSING_TYPES.find(h => h.id === housingType).label}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">시공 소재</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1 text-base">{MATERIALS.find(m => m.id === material).label}</div>
                        </div>
                    </div>
                    
                    {/* 선택 내역 및 금액 */}
                    <div>
                        <h4 className="text-sm font-bold text-[#1e3a8a] mb-3 flex items-center gap-2 uppercase tracking-wider">선택 내역</h4>
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                            {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => {
                                const isFreeSilicon = calculation.isPackageActive && calculation.FREE_SILICON_AREAS.includes(area.id);
                                return (
                                    <div key={area.id} className="flex justify-between items-center text-sm py-1">
                                        <span className="text-slate-700 font-medium flex items-center gap-2">
                                            <Icon name={area.icon} size={16} className="text-slate-400"/>
                                            {area.label} <span className="text-slate-400 text-xs bg-slate-100 px-1.5 py-0.5 rounded">x{quantities[area.id]}</span>
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {area.id === 'entrance' && calculation.isFreeEntrance 
                                                ? <span className="text-[#1e3a8a] text-xs bg-blue-50 px-2 py-1 rounded-full">Service (Poly)</span> 
                                                : isFreeSilicon 
                                                    ? <span className="text-[#1e3a8a] text-xs bg-blue-50 px-2 py-1 rounded-full">Service</span>
                                                    : `${(getBasePrice(area.id, finalMaterialId) * quantities[area.id]).toLocaleString()}원` 
                                            }
                                        </span>
                                    </div>
                                )})}
                        </div>
                    </div>
                    
                    {/* 최종 합계 */}
                    <div className="space-y-2 py-5 border-y border-slate-200 mt-6">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-500"><span>순수 개별 견적 합계</span><span className='line-through text-slate-400'>{calculation.fullOriginalPrice.toLocaleString()}원</span></div>
                        {(calculation.isPackageActive || calculation.isMinCost) && (<div className="flex justify-between items-center text-sm font-bold text-blue-600"><span>패키지/최소 비용 적용가</span><span>{calculation.priceAfterPackageDiscount.toLocaleString()}원</span></div>)}
                        {calculation.totalReviewDiscount > 0 && (<div className="flex justify-between items-center text-sm font-bold text-red-500"><span>리뷰 할인</span><span>-{calculation.totalReviewDiscount.toLocaleString()}원</span></div>)}
                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-dashed border-slate-200"><span className="text-lg font-extrabold text-slate-900">최종 결제 금액</span><span className="text-2xl font-extrabold text-[#1e3a8a]">{calculation.price.toLocaleString()}원</span></div>
                    </div>
                    
                    {/* 패키지 서비스 및 유의사항 */}
                    <div className="space-y-3 pt-5">
                        {calculation.isPackageActive && !calculation.isMinCost && (<div className="bg-blue-50 p-4 rounded-lg space-y-2 text-xs border border-blue-100"><h4 className="text-[#1e3a8a] font-bold flex items-center gap-1.5 text-sm"><Icon name="gift" size={16}/> 패키지 서비스 (FREE)</h4><ul className="list-disc list-inside text-slate-700 space-y-1 pl-1"><li>현관 바닥 시공 (폴리아스파틱)</li><li>변기 테두리 / 바닥 테두리 서비스</li>{calculation.FREE_SILICON_AREAS.includes('silicon_sink') && <li>욕실 젠다이/세면대 실리콘 오염방지</li>}</ul></div>)}
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700">
                            <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 text-sm">
                                <Icon name="info" className="text-rose-500" size={18}/> 
                                시공 시 유의사항
                            </h4>
                            <ul className="space-y-3 text-xs leading-relaxed">
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                                    <span>
                                        <span className="font-bold text-slate-900">타일 크기 기준:</span> 바닥 30x30, 벽면 30x60cm 기준
                                        <br/>
                                        <span className="text-slate-500 tracking-tight">※ 조각/소형 타일은 현장 상황에 따라 추가비용 발생</span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                                    <span>
                                        <span className="font-bold text-slate-900">재시공(셀프포함):</span> 기존 줄눈 제거 작업 필요 시
                                        <br/>
                                        <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">1.5~2배의 추가 비용</span>이 발생합니다.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {calculation.isMinCost && (<div className="bg-rose-50 p-4 rounded-lg border border-rose-100 text-rose-700"><div className="flex items-center gap-2 font-bold mb-1 text-sm"><Icon name="info" size={16}/> 최소 출장비 적용</div><p className="text-xs opacity-90">선택하신 시공 범위가 최소 기준 미만이라, 기본 출장비 20만원이 적용되었습니다.</p></div>)}
                    </div>
                </div>
                
                {/* 🌟 [수정]: 버튼 영역은 캡처 영역 외부에 유지됨 */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex-none">
                    <p className='text-[10px] text-center text-slate-400 mb-3'>* 위 내용은 이미지로 저장되며, 현장 상황에 따라 변동될 수 있습니다.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={saveAsImage} className="py-3.5 rounded-lg bg-[#0f172a] text-white font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 text-sm"><Icon name="copy" size={18}/> 이미지 저장</button>
                        <button onClick={() => window.location.href = 'tel:010-0000-0000'} className="py-3.5 rounded-lg bg-[#1e3a8a] text-white font-bold hover:bg-[#1e40af] transition flex items-center justify-center gap-2 text-sm"><Icon name="phone" size={18} /> 전화 상담</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}