import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, Image as ImageIcon, X
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
// [3] 줄눈 시공 구역
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
  
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '복도,주방 포함' },
];

// =================================================================
// [4] 실리콘 교체/리폼 구역
// =================================================================
const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '단독 8만 / 패키지시 5만' },
  { id: 'silicon_sink', label: '세면대+젠다이 교체', basePrice: 30000, icon: Eraser, unit: '개소', desc: '오염된 실리콘 제거 후 재시공' },
  { id: 'silicon_kitchen_line', label: '주방 실리콘오염방지', basePrice: 50000, icon: Eraser, unit: '구역', desc: '음식물 오염 방지' },
  { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35만' },
];

// =================================================================
// [5] 리뷰 이벤트
// =================================================================
const REVIEW_EVENTS = [
  { id: 'soomgo_review', label: '숨고 리뷰이벤트', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
  { id: 'karrot_review', label: '당근마켓 리뷰이벤트', discount: 10000, icon: Star, desc: '동네생활 후기 작성 약속' },
];

// =================================================================
// [6] 갤러리 데이터 (샘플 이미지)
// =================================================================
const PORTFOLIO_IMAGES = [
  { id: 1, title: "욕실 바닥 시공", desc: "깔끔한 화이트 펄 시공", src: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "현관 폴리싱 타일", desc: "고급스러운 골드 펄", src: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "주방 벽면", desc: "기름때 방지 시공", src: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
  { id: 4, title: "케라폭시 시공", desc: "무광 매트 질감", src: "https://images.unsplash.com/photo-1620626012053-1847789ae40b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
  { id: 5, title: "실리콘 오염방지", desc: "욕조 테두리 리폼", src: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
  { id: 6, title: "베란다 타일", desc: "곰팡이 방지 시공", src: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
];

export default function GroutEstimatorApp() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' or 'gallery'
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
  
  const [quantities, setQuantities] = useState(
    [...SERVICE_AREAS, ...SILICON_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // 갤러리 모달용

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

  const toggleReview = (id) => {
    setSelectedReviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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

    const qBathFloor = q['bathroom_floor'] || 0;
    const qShower = q['shower_booth'] || 0;
    const qBathtub = q['bathtub_wall'] || 0;
    const qMasterWall = q['master_bath_wall'] || 0;
    const qCommonWall = q['common_bath_wall'] || 0;
    const qEntrance = q['entrance'] || 0;

    const remainingCoreItems = SERVICE_AREAS.filter(area => 
        area.id !== 'entrance' && q[area.id] > 0
    ).length;

    if (selectedMaterial.id === 'kerapoxy') {
      if (qBathFloor >= 2 && qMasterWall >= 1 && qCommonWall >= 1) {
        let pkgPrice = 1300000 * selectedHousing.multiplier;
        total += pkgPrice;
        q['bathroom_floor'] -= 2;
        q['master_bath_wall'] -= 1;
        q['common_bath_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true; 
        labelText = '(풀패키지 할인 적용)'; 
      }
      else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) {
        let pkgPrice = 950000 * selectedHousing.multiplier;
        total += pkgPrice;
        q['bathroom_floor'] -= 2;
        q['shower_booth'] -= 1;
        q['bathtub_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true; 
        labelText = '(패키지 할인 적용)'; 
      }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) {
        let pkgPrice = 750000 * selectedHousing.multiplier;
        total += pkgPrice;
        q['bathroom_floor'] -= 2;
        if (qShower >= 1) q['shower_booth'] -= 1;
        else q['bathtub_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true; 
        labelText = '(패키지 할인 적용)'; 
      }
      else if (remainingCoreItems === 1 && qBathFloor === 1) {
        let minPrice = 350000 * selectedHousing.multiplier;
        total += minPrice;
        q['bathroom_floor'] -= 1;
        labelText = '(최소 시공비 적용)';
      }
      else if (qBathFloor >= 2 && qEntrance >= 1) {
        isPackageActive = true;
        isFreeEntrance = false; 
        labelText = '(패키지 혜택 적용)';
      }
    } else {
      if (qBathFloor >= 2 && qMasterWall >= 1 && qCommonWall >= 1) {
        let pkgPrice = 700000 * selectedMaterial.priceMod * selectedHousing.multiplier;
        total += pkgPrice;
        q['bathroom_floor'] -= 2;
        q['master_bath_wall'] -= 1;
        q['common_bath_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(풀패키지 할인 + 현관 서비스)';
      }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) {
        let pkgPrice = 380000 * selectedMaterial.priceMod * selectedHousing.multiplier;
        total += pkgPrice;
        q['bathroom_floor'] -= 2;
        if (qShower >= 1) q['shower_booth'] -= 1;
        else q['bathtub_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(패키지 할인 + 현관 서비스)';
      }
      else if (qBathFloor >= 2 && qEntrance >= 1) {
        isPackageActive = true;
        isFreeEntrance = false;
        labelText = '(패키지 혜택 적용)';
      }
      else if (remainingCoreItems === 1 && qBathFloor === 1) {
        let minPrice = 200000 * selectedMaterial.priceMod * selectedHousing.multiplier;
        total += minPrice;
        q['bathroom_floor'] -= 1;
        labelText = '(최소 시공비 적용)';
      }
    }

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

    SILICON_AREAS.forEach(area => {
      const count = q[area.id];
      if (count > 0) {
        let unitPrice = area.basePrice;
        if (area.id === 'silicon_bathtub' && isPackageActive) unitPrice = 50000;
        else if (area.id === 'silicon_living_baseboard' && isPackageActive) unitPrice = 350000;
        total += (unitPrice * count);
      }
    });

    let discountAmount = 0;
    REVIEW_EVENTS.forEach(evt => {
      if (selectedReviews.has(evt.id)) {
        discountAmount += evt.discount;
      }
    });
    
    total -= discountAmount;

    return { 
      price: Math.max(0, Math.floor(total / 1000) * 1000), 
      label: labelText,
      isPackageActive,
      isFreeEntrance,
      discountAmount
    };

  }, [housingType, material, quantities, selectedReviews]);

  const generateQuoteText = () => {
    const housingLabel = HOUSING_TYPES.find(h => h.id === housingType).label;
    let materialLabel = MATERIALS.find(m => m.id === material).label;
    
    if (material === 'poly') materialLabel += ` (${polyOption === 'pearl' ? '펄' : '무펄'})`;
    else if (material === 'kerapoxy') materialLabel += ` (${epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})`;
    
    let text = `[줄눈의미학 견적 문의]\n\n`;
    text += `🏠 현장유형: ${housingLabel}\n`;
    text += `✨ 시공재료: ${materialLabel}\n\n`;
    
    text += `📋 [줄눈 시공]\n`;
    SERVICE_AREAS.forEach(area => {
      if (quantities[area.id] > 0) text += `- ${area.label}: ${quantities[area.id]}${area.unit}\n`;
    });

    if (SILICON_AREAS.some(area => quantities[area.id] > 0)) {
      text += `\n📋 [실리콘 교체]\n`;
      SILICON_AREAS.forEach(area => {
        if (quantities[area.id] > 0) text += `- ${area.label}: ${quantities[area.id]}${area.unit}\n`;
      });
    }
    
    if (selectedReviews.size > 0) {
      text += `\n🎁 [할인 혜택]\n`;
      REVIEW_EVENTS.forEach(evt => {
        if (selectedReviews.has(evt.id)) text += `- ${evt.label}: -${evt.discount.toLocaleString()}원\n`;
      });
    }
    
    if (calculation.isPackageActive) {
      text += `\n🎁 [패키지 서비스 적용됨]\n`;
      text += `- 욕실 젠다이 실리콘 오염방지\n`;
      text += `- 주방 싱크볼\n`;
      if (calculation.isFreeEntrance) text += `- 현관바닥 (무료)\n`;
    }

    text += `\n💰 예상 견적가: ${calculation.price.toLocaleString()}원`;
    if (calculation.label) text += ` ${calculation.label}`;
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
        alert("견적서가 복사되었습니다!");
    } catch (err) {
        console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans ${calculation.isPackageActive ? 'pb-48' : 'pb-28'}`}>
      <header className="bg-teal-600 text-white sticky top-0 z-20 shadow-md">
        <div className="p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="줄눈의미학"
              className="h-8 w-auto object-contain bg-white rounded-full" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-xl font-bold">줄눈의미학</h1>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs bg-teal-700 px-2 py-1 rounded hover:bg-teal-800 transition">
            초기화
          </button>
        </div>
        
        {/* 탭 메뉴 추가 */}
        <div className="flex text-sm font-bold">
          <button 
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-3 text-center transition-colors ${activeTab === 'calculator' ? 'bg-white text-teal-600 border-b-4 border-teal-800' : 'bg-teal-700 text-teal-100 hover:bg-teal-600'}`}
          >
            <div className="flex items-center justify-center gap-1">
              <Calculator size={16} /> 견적 계산기
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-3 text-center transition-colors ${activeTab === 'gallery' ? 'bg-white text-teal-600 border-b-4 border-teal-800' : 'bg-teal-700 text-teal-100 hover:bg-teal-600'}`}
          >
            <div className="flex items-center justify-center gap-1">
              <ImageIcon size={16} /> 시공 갤러리
            </div>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === 'calculator' ? (
          <>
            {/* 기존 견적기 화면 */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Home className="h-5 w-5 text-teal-600" /> 1. 현장 유형을 선택하세요
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {HOUSING_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setHousingType(type.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      housingType === type.id ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="font-bold text-sm">{type.label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Hammer className="h-5 w-5 text-teal-600" /> 2. 시공 재료 선택
              </h2>
              <div className="space-y-4">
                {MATERIALS.map((item) => (
                  <div key={item.id} className="animate-fade-in">
                    <div onClick={() => setMaterial(item.id)} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${material === item.id ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${material === item.id ? 'border-teal-600' : 'border-gray-400'}`}>
                        {material === item.id && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">{item.label}</span>
                          {item.priceMod > 1 && <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">프리미엄</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    {material === 'poly' && item.id === 'poly' && (
                      <div className="mt-2 ml-4 pl-4 border-l-2 border-teal-100 space-y-2 animate-slide-down">
                        <div className="text-xs font-bold text-teal-700 flex items-center gap-1"><Palette size={12} /> 펄 유무 선택</div>
                        <div className="flex gap-2">
                          <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'pearl' ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>펄</button>
                          <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'no_pearl' ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>무펄</button>
                        </div>
                      </div>
                    )}
                    {material === 'kerapoxy' && item.id === 'kerapoxy' && (
                      <div className="mt-2 ml-4 pl-4 border-l-2 border-orange-100 space-y-2 animate-slide-down">
                        <div className="text-xs font-bold text-orange-700 flex items-center gap-1"><Crown size={12} /> 브랜드 선택</div>
                        <div className="flex gap-2">
                          <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'kerapoxy' ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>케라폭시</button>
                          <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'starlike' ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>스타라이크</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-teal-600" /> 3. 원하는 시공범위를 선택해주세요
              </h2>
              <div className="space-y-3">
                {SERVICE_AREAS.map((area) => {
                  const Icon = area.icon;
                  return (
                    <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm text-teal-600"><Icon size={20} /></div>
                        <div>
                          <div className="font-bold text-gray-800">{area.label}</div>
                          <div className="text-xs text-gray-500">기본 {area.basePrice.toLocaleString()}원~{area.desc && <span className="block text-teal-600">{area.desc}</span>}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200">
                        <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-full transition ${quantities[area.id] > 0 ? 'text-teal-600 hover:bg-teal-50 font-bold text-lg' : 'text-gray-300'}`}>-</button>
                        <span className={`w-6 text-center font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{quantities[area.id]}</span>
                        <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-full font-bold text-lg">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Eraser className="h-5 w-5 text-teal-600" /> 4. 실리콘 교체할 곳 선택
              </h2>
              <div className="space-y-3">
                {SILICON_AREAS.map((area) => {
                  const Icon = area.icon;
                  return (
                    <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm text-teal-600"><Icon size={20} /></div>
                        <div>
                          <div className="font-bold text-gray-800">{area.label}</div>
                          <div className="text-xs text-gray-500">{area.basePrice.toLocaleString()}원{area.desc && <span className="block text-teal-600">{area.desc}</span>}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200">
                        <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-full transition ${quantities[area.id] > 0 ? 'text-teal-600 hover:bg-teal-50 font-bold text-lg' : 'text-gray-300'}`}>-</button>
                        <span className={`w-6 text-center font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{quantities[area.id]}</span>
                        <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-full font-bold text-lg">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3 text-indigo-900">
                <Gift className="h-5 w-5 text-indigo-600" /> 5. 할인 혜택 (리뷰 이벤트)
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {REVIEW_EVENTS.map((evt) => {
                  const isSelected = selectedReviews.has(evt.id);
                  return (
                    <button key={evt.id} onClick={() => toggleReview(evt.id)} className={`p-3 rounded-lg border-2 transition-all relative overflow-hidden ${isSelected ? 'border-indigo-500 bg-white shadow-md ring-1 ring-indigo-500' : 'border-gray-200 bg-white/50 text-gray-500 hover:bg-white'}`}>
                      {isSelected && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-bold">선택됨</div>}
                      <div className="flex flex-col items-center text-center gap-1">
                        <span className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-600'}`}>{evt.label}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-pink-600' : 'text-gray-400'}`}>-{evt.discount.toLocaleString()}원</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-indigo-400 mt-2 text-center">※ 중복 선택 가능합니다. 시공 완료 후 꼭 작성해주세요!</p>
            </section>
            
            <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>위 가격은 타일크기 바닥 30x30cm, 벽면 30x60 크기 기준이며, 재시공은 기존 견적가의 1.5배로 산정됩니다. 또한, 조각타일은 시공이 불가합니다.</p>
            </div>
          </>
        ) : (
          // 갤러리 탭 내용
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-1">시공 포트폴리오</h2>
              <p className="text-xs text-gray-500 mb-4">줄눈의미학의 꼼꼼한 시공 사례를 확인해보세요.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {PORTFOLIO_IMAGES.map((img) => (
                  <div 
                    key={img.id} 
                    onClick={() => setSelectedImage(img)}
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-gray-100"
                  >
                    <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span className="text-white font-bold text-sm">{img.title}</span>
                      <span className="text-white/80 text-xs">{img.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-xs text-yellow-800">
              💡 <strong>갤러리 사진 교체 방법</strong><br/>
              사장님이 직접 찍은 사진 파일을 <code>public</code> 폴더에 넣고 코드를 수정하면 이곳에 내 사진을 띄울 수 있습니다.
            </div>
          </div>
        )}
      </main>

      {/* 하단 고정바 (갤러리 탭에서는 숨김 처리할 수도 있으나, 견적 유도를 위해 유지하는 것이 좋음. 단, 갤러리 탭에서는 '견적내러 가기' 버튼으로 바꾸는 것도 방법. 여기서는 유지하되 탭에 따라 동작 변경) */}
      {activeTab === 'calculator' && (
        <>
          {calculation.isPackageActive && (
            <div className="fixed bottom-[90px] left-4 right-4 max-w-md mx-auto z-10 animate-bounce-up">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full"><Gift className="w-5 h-5 text-yellow-300" /></div>
                <div className="text-xs">
                  <div className="font-bold text-yellow-300 mb-0.5">🎉 패키지 혜택 적용중!</div>
                  <div>욕실 젠다이 실리콘, 주방 싱크볼 <span className="font-bold underline">서비스</span>{calculation.isFreeEntrance && <span>, 현관바닥 무료</span>}</div>
                </div>
              </div>
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 safe-area-bottom z-20">
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-gray-500">총 예상 견적가</div>
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold text-teal-600">{calculation.price.toLocaleString()}<span className="text-sm font-normal text-gray-500">원</span></div>
                  {calculation.label && <div className="text-xs font-bold text-orange-500 mb-1 animate-pulse">{calculation.label}</div>}
                </div>
              </div>
              <button onClick={() => setShowModal(true)} disabled={!hasSelections} className={`px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all ${hasSelections ? 'bg-teal-600 hover:bg-teal-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}>견적서 보기</button>
            </div>
          </div>
        </>
      )}

      {/* 갤러리 이미지 확대 모달 */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2"><X size={24} /></button>
          <div className="max-w-lg w-full bg-white rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.title} className="w-full h-auto" />
            <div className="p-4">
              <h3 className="font-bold text-lg">{selectedImage.title}</h3>
              <p className="text-gray-500 text-sm">{selectedImage.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* 견적서 모달 (기존 코드) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />예상 견적서</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">✕</button>
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
                <div className="space-y-2 border-b pb-4">
                  <p className="text-gray-500 text-xs mb-1 font-bold">📋 줄눈 시공 범위</p>
                  {SERVICE_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-gray-50 p-2 rounded"><span>{area.label} <span className="text-gray-400 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                </div>
                {SILICON_AREAS.some(area => quantities[area.id] > 0) && (
                  <div className="space-y-2 border-b pb-4">
                    <p className="text-gray-500 text-xs mb-1 font-bold">🧴 실리콘 교체 범위</p>
                    {SILICON_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-orange-50 p-2 rounded border border-orange-100"><span>{area.label} <span className="text-gray-400 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                  </div>
                )}
                {calculation.discountAmount > 0 && (
                  <div className="space-y-2 border-b pb-4">
                    <p className="text-gray-500 text-xs mb-1 font-bold">🎁 할인 혜택</p>
                    {REVIEW_EVENTS.map(evt => {if (selectedReviews.has(evt.id)) {return (<div key={evt.id} className="flex justify-between items-center bg-indigo-50 p-2 rounded border border-indigo-100 text-indigo-800"><span>{evt.label}</span><span className="font-bold text-pink-600">-{evt.discount.toLocaleString()}원</span></div>);}return null;})}
                  </div>
                )}
                <div className="pt-2 mt-2">
                  {calculation.isPackageActive && (
                    <div className="bg-indigo-50 p-3 rounded-lg mb-3 text-xs text-indigo-800 border border-indigo-100">
                      <div className="font-bold mb-1 flex items-center gap-1"><Gift size={14} /> 서비스 혜택 적용됨</div>
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
                      {calculation.label && <div className="text-xs text-orange-500 font-bold mt-1">{calculation.label}</div>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
               <button onClick={copyToClipboard} className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition"><Copy size={18} />복사하기</button>
               <button onClick={() => window.location.href = 'tel:010-1234-5678'} className="flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-sm"><Phone size={18} />상담 예약</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}