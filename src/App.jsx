import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer
} from 'lucide-react';

// =================================================================
// [1] 현장 유형 설정 (신축 vs 구축 할증률)
// =================================================================
const HOUSING_TYPES = [
  { 
    id: 'new', 
    label: '신축 아파트 (입주 전)', 
    multiplier: 1.0, // 1.0은 가격 변동 없음
    description: '백시멘트 제거가 비교적 쉽습니다.' 
  },
  { 
    id: 'old', 
    label: '구축/거주 중', 
    multiplier: 1.3, // 1.3은 30% 비싸짐
    description: '기존 줄눈 제거 비용이 추가됩니다.' 
  },
];

// =================================================================
// [2] 재료 설정 (일반 vs 케라폭시 가격 배수)
// =================================================================
const MATERIALS = [
  { 
    id: 'poly', 
    label: '일반형 (폴리우레아)', 
    priceMod: 1.0, 
    description: '가성비가 좋고 다양한 펄 색상 선택 가능' 
  },
  { 
    id: 'kerapoxy', 
    label: '고급형 (케라폭시/무광)', 
    priceMod: 1.8, 
    description: '내구성이 뛰어나고 매트한 질감 (고급)' 
  },
];

// =================================================================
// [3] 시공 구역 및 기본 단가 설정
// =================================================================
const SERVICE_AREAS = [
  { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소' },
  { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 120000, icon: Bath, unit: '개소' },
  { id: 'balcony', label: '베란다/발코니', basePrice: 150000, icon: LayoutGrid, unit: '개소' },
  { id: 'laundry', label: '세탁실/다용도실', basePrice: 150000, icon: RefreshCw, unit: '개소' },
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 200000, icon: Utensils, unit: '구역' },
  { id: 'silicon_package', label: '실리콘 오염방지', basePrice: 100000, icon: Sparkles, unit: '세트', desc: '욕조+젠다이+세면대+싱크볼' },
];

export default function GroutEstimatorApp() {
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  const [quantities, setQuantities] = useState(
    SERVICE_AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  const [showModal, setShowModal] = useState(false);

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const calculateTotal = useMemo(() => {
    let subtotal = 0;
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
    const selectedMaterial = MATERIALS.find(m => m.id === material);

    SERVICE_AREAS.forEach(area => {
      const count = quantities[area.id];
      if (count > 0) {
        let itemPrice = area.basePrice * count;
        itemPrice = itemPrice * selectedMaterial.priceMod;
        if (area.id !== 'silicon_package') {
           itemPrice = itemPrice * selectedHousing.multiplier;
        }
        subtotal += itemPrice;
      }
    });

    return Math.floor(subtotal / 1000) * 1000;
  }, [housingType, material, quantities]);

  const generateQuoteText = () => {
    const housingLabel = HOUSING_TYPES.find(h => h.id === housingType).label;
    const materialLabel = MATERIALS.find(m => m.id === material).label;
    
    let text = `[줄눈의미학 견적 문의]\n\n`;
    text += `🏠 현장유형: ${housingLabel}\n`;
    text += `✨ 시공재료: ${materialLabel}\n\n`;
    text += `📋 선택항목:\n`;
    SERVICE_AREAS.forEach(area => {
      if (quantities[area.id] > 0) {
        text += `- ${area.label}: ${quantities[area.id]}${area.unit}\n`;
      }
    });
    text += `\n💰 예상 견적가: ${calculateTotal.toLocaleString()}원`;
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
        alert("견적서가 복사되었습니다! 문자나 카톡에 붙여넣기 하세요.");
    } catch (err) {
        console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24">
      <header className="bg-teal-600 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-300" />
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
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  housingType === type.id 
                    ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="font-bold text-sm">{type.label}</div>
                <div className="text-xs mt-1 text-gray-500 leading-tight">{type.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Hammer className="h-5 w-5 text-teal-600" />
            2. 시공 재료 선택
          </h2>
          <div className="space-y-2">
            {MATERIALS.map((item) => (
              <div 
                key={item.id}
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
            ))}
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Calculator className="h-5 w-5 text-teal-600" />
            3. 시공 구역 추가
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
            위 가격은 대략적인 예상 금액이며, 타일 크기(소형 타일일수록 비쌈)나 현장 컨디션에 따라 최종 견적은 달라질 수 있습니다. 정확한 견적은 방문 후 확정됩니다.
          </p>
        </div>

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">총 예상 견적가</div>
            <div className="text-2xl font-bold text-teal-600">
              {calculateTotal.toLocaleString()}
              <span className="text-sm font-normal text-gray-500">원</span>
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
                  <span className="font-bold text-teal-600">{MATERIALS.find(m => m.id === material).label}</span>
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
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-800">총 예상 합계</span>
                    <span className="text-2xl font-bold text-teal-600">{calculateTotal.toLocaleString()}원</span>
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
                onClick={() => window.location.href = 'tel:010-3132-4030'} // ★ 여기를 사장님 번호로 고치세요!
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
