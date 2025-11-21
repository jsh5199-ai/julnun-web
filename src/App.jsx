import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift
} from 'lucide-react';

// =================================================================
// [1] 현장 유형 설정
// =================================================================
const HOUSING_TYPES = [
  { 
    id: 'new', 
    label: '신축 아파트(입주 전)', 
    multiplier: 1.0, 
  },
  { 
    id: 'old', 
    label: '구축/거주 중', 
    multiplier: 1.5, 
  },
];

// =================================================================
// [2] 재료 설정 (일반 vs 고급)
// =================================================================
const MATERIALS = [
  { 
    id: 'poly', 
    label: '일반형 (폴리아스파틱)', 
    priceMod: 1.0, 
    description: '탄성과 광택이 우수하며 가성비가 좋습니다.' 
  },
  { 
    id: 'kerapoxy', 
    label: '고급형 (에폭시/무광,무펄)', 
    priceMod: 1.8, 
    description: '내구성이 뛰어나고 매트한 질감 (프리미엄)' 
  },
];

// =================================================================
// [3] 시공 구역 및 기본 단가 설정
// =================================================================
const SERVICE_AREAS = [
  { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소' },
  { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
  
  { id: 'shower_booth', label: '샤워부스 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
  { id: 'bathtub_wall', label: '욕조 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
  
  { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
  { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
  
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 150000, icon: LayoutGrid, unit: '개소', desc: '원하는 개수만큼 선택' },
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역' },
  
  { id: 'bathtub_silicon_reform', label: '욕조실리콘 리폼', basePrice: 80000, icon: Sparkles, unit: '개소', desc: '단독 8만 / 패키지시 5만' },
  
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '복도,주방 포함' },
];

export default function GroutEstimatorApp() {
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
  
  const [quantities, setQuantities] = useState(
    SERVICE_AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  const [showModal, setShowModal] = useState(false);

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const nextValue = Math.max(0, prev[id] + delta);
      const nextState = { ...prev, [id]: nextValue };

      if ((id === 'master_bath_wall' || id === 'common_bath_wall') && delta > 0) {
        nextState['shower_booth'] = 0;
        nextState['bathtub_wall'] = 0;
      }
      return nextState;
    });
  };

  const calculation = useMemo(() => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
    const selectedMaterial = MATERIALS.find(m => m.id === material);

    let q = { ...quantities };
    let total = 0;
    let labelText = null;
    
    let isPackageActive = false; 
    let isFreeEntrance = false;

    // 1. 패키지 조건 확인
    if (q['bathroom_floor'] >= 2 && q['master_bath_wall'] >= 1 && q['common_bath_wall'] >= 1) {
        let pkgPrice = 700000 * selectedMaterial.priceMod * selectedHousing.multiplier;
        total += pkgPrice;
        q['bathroom_floor'] -= 2;
        q['master_bath_wall'] -= 1;
        q['common_bath_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(풀패키지 할인 + 현관 서비스)';
    }
    else if (q['bathroom_floor'] >= 2 && (q['shower_booth'] >= 1 || q['bathtub_wall'] >= 1)) {
        let pkgPrice = 380000 * selectedMaterial.priceMod * selectedHousing.multiplier;
        total += pkgPrice;
        q['bathroom_floor'] -= 2;
        if (q['shower_booth'] >= 1) q['shower_booth'] -= 1;
        else q['bathtub_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(패키지 할인 + 현관 서비스)';
    }
    else if (q['bathroom_floor'] >= 2 && q['entrance'] >= 1) {
        isPackageActive = true;
        isFreeEntrance = false;
        labelText = '(패키지 혜택 적용)';
    }
    else {
        const remainingCoreItems = Object.keys(q).filter(k => 
            k !== 'entrance' && k !== 'bathtub_silicon_reform' && q[k] > 0
        ).length;

        if (remainingCoreItems === 1 && q['bathroom_floor'] === 1) {
             let minPrice = 200000 * selectedMaterial.priceMod * selectedHousing.multiplier;
             total += minPrice;
             q['bathroom_floor'] -= 1;
             labelText = '(최소 시공비 적용)';
        }
    }

    // 2. 나머지 항목 계산
    SERVICE_AREAS.forEach(area => {
        const count = q[area.id];
        if (count > 0) {
            let itemTotal = 0;
            
            if (area.id === 'entrance') {
                if (!isFreeEntrance) {
                    let price = area.basePrice * count;
                    itemTotal = price * selectedMaterial.priceMod * selectedHousing.multiplier;
                }
            } 
            else if (area.id === 'bathtub_silicon_reform') {
                let unitPrice = isPackageActive ? 50000 : 80000;
                itemTotal = count * unitPrice;
            } 
            else if (area.id === 'living_room') {
                let baseCalc = area.basePrice * count;
                let currentMod = selectedMaterial.priceMod;
                if (selectedMaterial.id === 'kerapoxy') currentMod = 2.0;
                
                let price = baseCalc * currentMod * selectedHousing.multiplier;
                
                if (isPackageActive) {
                    if (selectedMaterial.id === 'poly') price -= (50000 * count);
                    else if (selectedMaterial.id === 'kerapoxy') price -= (150000 * count);
                }
                itemTotal = price;
            } 
            else {
                let p = area.basePrice * count;
                let currentMod = selectedMaterial.priceMod;
                itemTotal = p * currentMod * selectedHousing.multiplier;
            }
            
            total += itemTotal;
        }
    });

    return { 
      price: Math.floor(total / 1000) * 1000, 
      label: labelText,
      isPackageActive,
      isFreeEntrance
    };

  }, [housingType, material, quantities]);

  const generateQuoteText = () => {
    const housingLabel = HOUSING_TYPES.find(h => h.id === housingType).label;
    let materialLabel = MATERIALS.find(m => m.id === material).label;
    
    if (material === 'poly') {
      materialLabel += ` (${polyOption === 'pearl' ? '펄' : '무펄'})`;
    } else if (material === 'kerapoxy') {
      materialLabel += ` (${epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})`;
    }
    
    let text = `[줄눈의미학 견적 문의]\n\n`;
    text += `🏠 현장유형: ${housingLabel}\n`;
    text += `✨ 시공재료: ${materialLabel}\n\n`;
    text += `📋 선택항목:\n`;
    SERVICE_AREAS.forEach(area => {
      if (quantities[area.id] > 0) {
        text += `- ${area.label}: ${quantities[area.id]}${area.unit}\n`;
      }
    });
    
    if (calculation.isPackageActive) {
      text += `\n🎁 [서비스 적용됨] 욕실 젠다이 실리콘 오염방지, 주방 싱크볼`;
      if (calculation.isFreeEntrance) {
        text += `, 현관바닥(무료)`;
      }
      text += `\n`;
    }

    text += `\n💰 예상 견적가: ${calculation.price.toLocaleString()}원`;
    if (calculation.label) {
      text += ` ${calculation.label}`;
    }
    
    text += `\n\n※ 줄눈의미학 온라인 견적입니다. 현장 상황에 따라 변동될 수 있습니다.`;
    return text;
  };

  const copyToClipboard = () => {
    const text = generateQuoteText();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert("견적서가 복사되었습니다! 상담원에게 꼭! 전달해주세요!");
    } catch (err) {
        console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans ${calculation.isPackageActive ? 'pb-48' : 'pb-28'}`}>
      <header className="bg-teal-600 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* ★ 로고 이미지 경로 수정됨 (/logo.png) ★ */}
            <img 
              src="/logo.png" 
              alt="줄눈의미학"
              className="h-8 w-auto object-contain bg-white rounded-full" 
              onError={(e) => {
                e.target.style.display = 'none'; // 이미지가 없으면 숨김
              }}
            />
            {/* 이미지가 없을 때를 대비해 아이콘도 살짝 남겨둠 (필요없으면 삭제 가능) */}
            <img 
              src="" 
              alt="" 
              className="hidden"
              onError={(e) => {
                 if(e.target.previousSibling.style.display === 'none') {
                    // 로고 이미지 로드 실패 시 대체 아이콘 표시 로직 (여기선 생략)
                 }
              }}
            />
            <h1 className="text-xl font-bold">줄눈의미학</h1>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs bg-teal-700 px-2 py-1 rounded hover:bg-teal-800 transition"
          >
            초기화
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* 1. 현장 유형 */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Home className="h-5 w-5 text-teal-600" />
            1. 현장 유형을 선택하세요
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  housingType === type.id 
                    ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="font-bold text-sm">{type.label}</div>
                {type.description && (
                  <div className="text-xs mt-1 text-gray-500 leading-tight">{type.description}</div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 2. 재료 선택 */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Hammer className="h-5 w-5 text-teal-600" />
            2. 시공 재료 선택
          </h2>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <div 
                  onClick={() => setMaterial(item.id)}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    material === item.id 
                      ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                    material === item.id ? 'border-teal-600' : 'border-gray-400'
                  }`}>
                    {material === item.id && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">{item.label}</span>
                      {item.priceMod > 1 && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                          프리미엄
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </div>

                {material === 'poly' && item.id === 'poly' && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-teal-100 space-y-2 animate-slide-down">
                    <div className="text-xs font-bold text-teal-700 flex items-center gap-1">
                      <Palette size={12} /> 펄 유무 선택
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPolyOption('pearl')}
                        className={`flex-1 py-2 text-sm rounded-md border transition-all ${
                          polyOption === 'pearl'
                            ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        펄
                      </button>
                      <button
                        onClick={() => setPolyOption('no_pearl')}
                        className={`flex-1 py-2 text-sm rounded-md border transition-all ${
                          polyOption === 'no_pearl'
                            ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        무펄
                      </button>
                    </div>
                  </div>
                )}

                {material === 'kerapoxy' && item.id === 'kerapoxy' && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-orange-100 space-y-2 animate-slide-down">
                    <div className="text-xs font-bold text-orange-700 flex items-center gap-1">
                      <Crown size={12} /> 브랜드 선택
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEpoxyOption('kerapoxy')}
                        className={`flex-1 py-2 text-sm rounded-md border transition-all ${
                          epoxyOption === 'kerapoxy'
                            ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        케라폭시
                      </button>
                      <button
                        onClick={() => setEpoxyOption('starlike')}
                        className={`flex-1 py-2 text-sm rounded-md border transition-all ${
                          epoxyOption === 'starlike'
                            ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        스타라이크
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. 시공 구역 */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Calculator className="h-5 w-5 text-teal-600" />
            3. 원하는 시공범위를 선택해주세요
          </h2>
          <div className="space-y-3">
            {SERVICE_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-teal-600">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{area.label}</div>
                      <div className="text-xs text-gray-500">
                        기본 {area.basePrice.toLocaleString()}원~
                        {area.desc && <span className="block text-teal-600">{area.desc}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200">
                    <button 
                      onClick={() => handleQuantityChange(area.id, -1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                        quantities[area.id] > 0 ? 'text-teal-600 hover:bg-teal-50 font-bold text-lg' : 'text-gray-300'
                      }`}
                    >
                      -
                    </button>
                    <span className={`w-6 text-center font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                      {quantities[area.id]}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(area.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-full font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            위 가격은 타일크기 바닥 30x30cm, 벽면 30x60 크기 기준이며, 재시공은 기존 견적가의 1.5배로 산정됩니다. 또한, 조각타일은 시공이 불가합니다.
          </p>
        </div>

      </main>

      {/* 패키지 서비스 알림 바 */}
      {calculation.isPackageActive && (
        <div className="fixed bottom-[90px] left-4 right-4 max-w-md mx-auto z-10 animate-bounce-up">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Gift className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-yellow-300 mb-0.5">🎉 패키지 혜택 적용중!</div>
              <div>
                욕실 젠다이 실리콘, 주방 싱크볼 <span className="font-bold underline">서비스</span>
                {calculation.isFreeEntrance && <span>, 현관바닥 무료</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 safe-area-bottom z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">총 예상 견적가</div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-teal-600">
                {calculation.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-500">원</span>
              </div>
              {calculation.label && (
                <div className="text-xs font-bold text-orange-500 mb-1 animate-pulse">
                  {calculation.label}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!hasSelections}
            className={`px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all ${
              hasSelections 
                ? 'bg-teal-600 hover:bg-teal-700 active:scale-95' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            견적서 보기
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                예상 견적서
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">현장 유형</span>
                  <span className="font-bold">{HOUSING_TYPES.find(h => h.id === housingType).label}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">시공 재료</span>
                  <span className="font-bold text-teal-600">
                    {MATERIALS.find(m => m.id === material).label}
                    {material === 'poly' && <span className="text-xs ml-1 text-gray-500">({polyOption === 'pearl' ? '펄' : '무펄'})</span>}
                    {material === 'kerapoxy' && <span className="text-xs ml-1 text-gray-500">({epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})</span>}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-500 text-xs mb-1">선택 구역</p>
                  {SERVICE_AREAS.map(area => {
                    if (quantities[area.id] > 0) {
                      return (
                        <div key={area.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span>{area.label} <span className="text-gray-400 text-xs">x {quantities[area.id]}</span></span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                <div className="pt-4 mt-2 border-t border-gray-200">
                  {/* 모달 내부 서비스 표시 */}
                  {calculation.isPackageActive && (
                    <div className="bg-indigo-50 p-3 rounded-lg mb-3 text-xs text-indigo-800 border border-indigo-100">
                      <div className="font-bold mb-1 flex items-center gap-1">
                        <Gift size={14} /> 서비스 혜택 적용됨
                      </div>
                      <ul className="list-disc list-inside text-indigo-600 space-y-0.5 pl-1">
                        <li>욕실 젠다이 실리콘 오염방지</li>
                        <li>주방 싱크볼</li>
                        {calculation.isFreeEntrance && <li>현관 바닥 (무료)</li>}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-800">총 예상 합계</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-teal-600">{calculation.price.toLocaleString()}원</span>
                      {calculation.label && (
                        <div className="text-xs text-orange-500 font-bold mt-1">{calculation.label}</div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
               <button 
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                <Copy size={18} />
                복사하기
              </button>
              <button 
                onClick={() => window.location.href = 'tel:010-1234-5678'}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-sm"
              >
                <Phone size={18} />
                상담 예약
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}