import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
    CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon, Download, DollarSign, List, Layers
} from 'lucide-react';

// =================================================================
// ⭐️ 상수 정의 및 기본 이미지 경로
// =================================================================
const MIN_FEE = 200000;
const KAKAO_CHAT_URL = 'http://pf.kakao.com/_jAxnYn/chat';
const DEFAULT_TILE_IMAGE_URL = '/default_tile.jpg'; 

const GROUT_COLORS = [
    { id: 'white', code: '#ffffff', label: '화이트', isDark: false },
    { id: 'light_beige', code: '#e2dfda', label: '103번', isDark: false },
    { id: 'light_gray', code: '#ccccca', label: '110번', isDark: false },
    { id: 'silver_gray', code: '#afb0aa', label: '111번', isDark: false },
    { id: 'medium_gray', code: '#848685', label: '112번', isDark: true },
    { id: 'dark_gray', code: '#797671', label: '113번', isDark: true },
    { id: 'black', code: '#49494b', label: '114번', isDark: true },
    { id: 'charcoal', code: '#565556', label: '119번', isDark: true },
    { id: 'shine_silver', code: '#c2c2c2', label: '127번', isDark: false }, 
    { id: 'moca_beige', code: '#dbcbbd', label: '131번', isDark: false },
    { id: 'sand_brown', code: '#887965', label: '133번', isDark: true },
    { id: 'dark_brown', code: '#85786f', label: '134번', isDark: true },
    { id: 'vintage_brown', code: '#96877e', label: '141번', isDark: true },
    { id: 'oat_brown', code: '#b0a9a4', label: '180번', isDark: false }, 
    { id: 'burnt_brown', code: '#8b8784', label: '187번', isDark: true },
];

// 밝기 조절의 목표 색상 정의
const BRIGHT_COLOR_CODE = '#ffffff'; // 화이트 (밝게)
const DARK_COLOR_CODE = '#565556'; // 119번 (어둡게)

// =================================================================
// ⭐️ [신규] 견적서 할인 문구에만 사용되는 "정가" 기준 ⭐️
// =================================================================
const ORIGINAL_PRICES = {
    // [항목 ID]: { poly: 정가, epoxy: 정가 }
    'bathroom_floor': { poly: 230000, epoxy: 400000 },
    'shower_booth': { poly: 150000, epoxy: 300000 },
    'bathtub_wall': { poly: 150000, epoxy: 300000 },
    'master_bath_wall': { poly: 300000, epoxy: 600000 },
    'common_bath_wall': { poly: 300000, epoxy: 600000 },
    'entrance': { poly: 50000, epoxy: 100000 },
    // 기타 항목 (기존 basePrice 기반 계산 유지)
    'balcony_laundry': { poly: 100000, epoxy: 250000 },
    'kitchen_wall': { poly: 150000, epoxy: 250000 },
    'living_room': { poly: 550000, epoxy: 1100000 },
    // 실리콘 항목 (원가와 단가 동일, 할인 시에만 차액 발생)
    'silicon_bathtub': { poly: 80000, epoxy: 80000 },
    'silicon_sink': { poly: 30000, epoxy: 30000 }, // 단가 3만원으로 고정
    'silicon_living_baseboard': { poly: 400000, epoxy: 400000 },
};

// =================================================================
// ⭐️ [유지] 색상 혼합 로직
// =================================================================
const mixColors = (color1, color2, weight) => {
    color1 = color1.replace('#', '');
    color2 = color2.replace('#', '');
    const r1 = parseInt(color1.substring(0, 2), 16);
    const g1 = parseInt(color1.substring(2, 4), 16);
    const b1 = parseInt(color1.substring(4, 6), 16);
    const r2 = parseInt(color2.substring(0, 2), 16);
    const g2 = parseInt(color2.substring(2, 4), 16);
    const b2 = parseInt(color2.substring(4, 6), 16);
    const r = Math.round(r1 * (1 - weight) + r2 * weight);
    const g = Math.round(g1 * (1 - weight) + g2 * weight);
    const b = Math.round(b1 * (1 - weight) + b2 * weight);
    const toHex = (c) => ('0' + Math.max(0, Math.min(255, c)).toString(16)).slice(-2);
    return '#' + toHex(r) + toHex(g) + toHex(b);
};


// =================================================================
// [스타일] 애니메이션 정의
// =================================================================
const GlobalStyles = () => (
    <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUpFadeOut { 0% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; transform: translateY(-10px); } 100% { opacity: 0; transform: translateY(-20px); } }
        @keyframes shine { 
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .shine-effect {
            background: #facc15; 
            background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
            background-size: 200% 100%;
            animation: shine 3s infinite;
            color: #1e3a8a; 
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        .animate-toast { animation: slideUpFadeOut 3s forwards; }
        .selection-box { transition: all 0.2s ease-in-out; }
        .selection-selected {
            border: 3px solid transparent; 
            background-color: #f3f4f6; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    `}</style>
);

// =================================================================
// [데이터] (P_MIX_08 가격 85만으로 수정 및 기타 정의 유지)
// =================================================================
const HOUSING_TYPES = [
    { id: 'new', label: '신축 아파트', multiplier: 1.0 },
    { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];
const MATERIALS = [
    { 
        id: 'poly', label: '폴리아스파틱', priceMod: 1.0, 
        description: '탄성과 광택이 우수하며 가성비가 좋습니다.',
        badge: '일반', badgeColor: 'bg-gray-200 text-gray-700'
    },
    { 
        id: 'kerapoxy', label: '에폭시(무광/무펄)', priceMod: 1.8, 
        description: '내구성이 뛰어나고 매트한 질감.',
        badge: '프리미엄', badgeColor: 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/30'
    },
];
const BATHROOM_AREAS = [
    { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
    { id: 'shower_booth', label: '샤워부스 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
    { id: 'bathtub_wall', label: '욕조 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
    { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
    { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
];
const OTHER_AREAS = [
    { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소', desc: '' }, 
    { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: LayoutGrid, unit: '개소', desc: '' }, 
    { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: '' },
    { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '' },
];
const SILICON_AREAS = [
    { id: 'silicon_bathtub', label: '욕조 테두리 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '' },
    { id: 'silicon_sink', label: '세면대+젠다이 교체', basePrice: 30000, icon: Eraser, unit: '개소', desc: '' },
    { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '' },
];
const ALL_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS, ...SILICON_AREAS];
const REVIEW_EVENTS = [
    { id: 'soomgo_review', label: '숨고 리뷰이벤트', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
];
const FAQ_ITEMS = [
    { question: "Q1. 시공 시간은 얼마나 걸리나요?", answer: "시공범위에 따라 다르지만, 평균적으로 4~6시간 정도 소요되고 있으며 범위/소재에 따라 최대 2일 시공이 걸리는 경우도 있습니다." },
    { question: "Q2. 줄눈 시공 후 바로 사용 가능한가요?", answer: "줄눈시공 후 폴리아스파틱은 6시간, 케라폭시는 2~3일, 스타라이크는 24시간 정도 양생기간이 필요합니다. 그 시간 동안은 물 사용을 자제해주시는 것이 가장 좋습니다." },
    { question: "Q3. 왜 줄눈 시공을 해야 하나요?", answer: "줄눈은 곰팡이와 물때가 끼는 것을 방지하고, 타일 틈새 오염을 막아 청소가 쉬워지며, 인테리어 효과까지 얻을 수 있는 필수 시공입니다." },
    { question: "Q4. A/S 기간 및 조건은 어떻게 되나요?", answer: "시공 후 폴리아스파틱은 2년, 에폭시는 5년의 A/S를 제공합니다. 단, 고객 부주의나 타일 문제로 인한 하자는 소액의 출장비가 발생할 수 있습니다." },
    { question: "Q5. 구축 아파트도 시공이 가능한가요?", answer: "네, 가능합니다. 기존 줄눈을 제거하는 그라인딩 작업이 추가로 필요하며, 현재 견적은 신축/구축 동일하게 적용됩니다." },
];
const YOUTUBE_VIDEOS = [
    { id: 'XekG8hevWpA', title: '에폭시 시공영상 (벽면/바닥)', label: '에폭시 시공영상' }, 
    { id: 'M6Aq_VVaG0s', title: '밑작업 영상 (라인 그라인딩)', label: '밑작업 영상' }, 
];
const getEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&rel=0`;

const OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION = ['entrance', 'balcony_laundry', 'kitchen_wall', 'living_room', 'silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'];
const ORIGINAL_MIXED_PACKAGES = [
    { id: 'P_MIX_01', price: 750000, label: '혼합패키지 01', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_02', price: 750000, label: '혼합패키지 02', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_03_OLD', price: 800000, label: '혼합패키지 03 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1]] },
    { id: 'P_MIX_04_OLD', price: 800000, label: '혼합패키지 04 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['common_bath_wall', 1]] },
    { id: 'P_MIX_05_OLD', price: 1050000, label: '혼합패키지 05 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1], ['common_bath_wall', 1]] },
    { id: 'P_MIX_06', price: 830000, label: '혼합패키지 06', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_07', price: 830000, label: '혼합패키지 07', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_08', price: 850000, label: '혼합패키지 08', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1], ['shower_booth', 1]] }, // 95만 -> 85만 수정 완료
    { id: 'P_MIX_09', price: 1200000, label: '혼합패키지 09', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1], ['common_bath_wall', 1]] },
    { id: 'P_MIX_10', price: 900000, label: '혼합패키지 10', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [] },
    { id: 'P_MIX_11', price: 900000, label: '혼합패키지 11', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [] },
    { id: 'P_MIX_13', price: 1100000, label: '혼합패키지 13', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [] },
    { id: 'P_MIX_14', price: 1100000, label: '혼합패키지 14', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [] },
];
const CUSTOM_MIXED_PACKAGES = [
    { id: 'P_MIX_NEW_A', price: 1150000, label: '혼합벽면A (바닥/안방벽E, 공용벽P) 115만', E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1]], P_areas: [['common_bath_wall', 1]] },
    { id: 'P_MIX_NEW_B', price: 1150000, label: '혼합벽면B (바닥/공용벽E, 안방벽P) 115만', E_areas: [['bathroom_floor', 2], ['common_bath_wall', 1]], P_areas: [['master_bath_wall', 1]] },
];
const NEW_USER_PACKAGES = [
    { id: 'USER_E_700K_MASTER', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_E_700K_COMMON', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_P_500K_MASTER', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_P_500K_COMMON', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_E_550K_FLOOR_2', price: 550000, label: '에폭시 바닥 2곳 (55만)', E_areas: [['bathroom_floor', 2]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_800K_FLOOR2_SHOWER1', price: 800000, label: '에폭시 바닥 2곳 + 샤워벽 1곳 (80만)', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_550K_FLOOR1_SHOWER1', price: 550000, label: '에폭시 바닥 1곳 + 샤워벽 1곳 (55만)', E_areas: [['bathroom_floor', 1], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_350K_BATH', price: 350000, label: '에폭시 바닥 1곳 (35만)', E_areas: [['bathroom_floor', 1]], P_areas: [], isFlexible: false, },
];
const HARDCODED_PACKAGES = [
    { id: 'POLY_550K', price: 550000, label: '폴리 5종 패키지 (55만)', P_areas: [['bathroom_floor', 2], ['shower_booth', 1], ['bathtub_wall', 1]], E_areas: [] },
    { id: 'POLY_700K_WALLS', price: 700000, label: '폴리 벽 전체 5종 패키지 (70만)', P_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]], E_areas: [] },
    { id: 'EPOXY_1300K_WALLS', price: 1300000, label: '에폭시 벽 전체 5종 패키지 (130만)', P_areas: [], E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]] },
];
const MIXED_PACKAGES = [
    ...NEW_USER_PACKAGES, 
    ...CUSTOM_MIXED_PACKAGES,
    ...ORIGINAL_MIXED_PACKAGES, 
    ...HARDCODED_PACKAGES,
];
const getPackageAreaIds = (pkg) => [
    ...pkg.P_areas.map(([id]) => id),
    ...pkg.E_areas.map(([id]) => id),
];

// =================================================================
// [컴포넌트]
// =================================================================

const PackageToast = ({ isVisible, onClose, label }) => {
    const toastLabel = label || '패키지 할인';
        
        useEffect(() => {
            if (isVisible) {
                const timer = setTimeout(() => {
                    onClose();
                }, 3000); 
                return () => clearTimeout(timer);
            }
        }, [isVisible, onClose]);
    
        if (!isVisible) return null;
    
        return (
            <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12">
                <div className="bg-indigo-800 text-white p-3 rounded-xl shadow-2xl border border-indigo-700 flex items-center justify-between animate-toast">
                    <div className="flex items-center gap-2">
                        <Gift size={18} className='text-white flex-shrink-0' /> 
                        <div className="text-sm font-bold truncate">
                            {label || '패키지 할인'} 적용되었습니다! 
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-xs font-extrabold bg-amber-400 text-indigo-900 px-2 py-1 rounded-full hover:bg-amber-300 transition active:scale-95 flex-shrink-0"
                    >
                        확인하기
                    </button>
                </div>
            </div>
        );
};

// -------------------------------------------------------------
// ⭐️ [최종 수정된] 견적서 상세 모달 (디테일 및 할인 금액 반영) ⭐️
// -------------------------------------------------------------
const QuoteModal = ({ calculation, onClose, quoteRef }) => {
    const { 
        price, 
        label, 
        minimumFeeApplied,
        itemizedPrices,
        priceBeforeAllDiscount // 할인 전 총 원가
    } = calculation;

    // 1. 총 할인 금액 계산
    const totalDiscount = priceBeforeAllDiscount - price;
    const isDiscountApplied = totalDiscount > 0;
    
    // 패키지/무료 서비스에 포함된 항목만 필터링 (시공 내역 목록에 표시될 항목)
    const packageItems = itemizedPrices.filter(i => 
        (i.isPackageItem && i.calculatedPrice === 0 && !i.isDiscount) || (i.id === 'entrance' && calculation.isFreeEntrance)
    ).map(item => ({
        label: item.label,
        materialLabel: item.materialLabel,
        quantity: item.quantity,
        unit: item.unit
    }));

    // 리뷰 할인 항목 필터링
    const discountItems = itemizedPrices.filter(i => i.isDiscount);

    // 최소 요금/패키지 적용 시의 라벨
    const displayLabel = minimumFeeApplied 
        ? '최소 시공비 적용 중' 
        : (label || '선택 항목 기반 예상 견적');
    

    // 이미지 저장 버튼 핸들러
    const handleImageSave = async () => {
        if (quoteRef.current) {
            try {
                const canvas = await html2canvas(quoteRef.current, {
                    scale: 3, 
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert('✅ 견적서 다운로드가 시작되었습니다!\n\n**파일이 다운로드 폴더에 저장되었는지 확인해주세요.**');
            } catch (error) {
                console.error('Error saving image:', error);
                alert('이미지 저장 중 오류가 발생했습니다. 브라우저 설정을 확인해주세요.');
            }
        }
    };


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            {/* max-w-sm을 유지하여 모바일 환경에 최적화 */}
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200 my-8">
                
                <div className="sticky top-0 bg-indigo-900 p-4 text-white flex justify-between items-center z-10">
                    <h3 className="font-extrabold text-lg flex items-center gap-2">
                        <List className="h-6 w-6 text-white" /> 최종 견적서
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition active:scale-95"><X size={24} /></button>
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto">
                    
                    {/* 견적서 캡처 영역 시작 (첨부 이미지 디자인 반영) */}
                    <div ref={quoteRef} className="bg-white space-y-4">
                        
                        {/* 1. 제목 영역 */}
                        <div className='text-center pt-2'>
                            {/* 폰트 크기: text-xl, 색상: #585885 (진한 남색 계열) */}
                            <h4 className='text-xl font-extrabold' style={{ color: '#585885' }}>줄눈의미학 예상 견적서</h4>
                        </div>

                        {/* 2. 패키지/할인 적용 영역 (배경색: #f0f0ff, 보더: #cccceb) */}
                        <div className='p-4 rounded-lg' style={{ backgroundColor: '#f0f0ff', border: '1px solid #cccceb' }}>
                            <div className='flex items-center justify-between'>
                                {/* 패키지 라벨: 문구 크기 text-base, 아이콘 색상 이미지 참고 */}
                                <div className='font-bold text-base flex items-center' style={{ color: '#585885' }}>
                                    <Crown size={18} className='mr-2' style={{ color: '#9987ce' }}/> {displayLabel}
                                </div>
                                {/* 총 할인 금액 문구 (여기에 표시: 우측 상단 배치) */}
                                {isDiscountApplied && (
                                    <p className='text-sm font-bold text-red-600 whitespace-nowrap'>
                                        총 {totalDiscount.toLocaleString()}원 할인!
                                    </p>
                                )}
                            </div>
                            
                            {/* 상세 설명 리스트 */}
                            <ul className='list-disc list-inside text-sm text-gray-700 mt-2 ml-1'>
                                <li>패키지 포함 영역이 할인 적용되었습니다.</li>
                                {minimumFeeApplied && <li>최소 시공비(20만원)가 적용되었습니다.</li>}
                            </ul>
                        </div>

                        {/* 3. 시공 내역 테이블 */}
                        {packageItems.length > 0 && (
                            <div className='mt-4'>
                                {/* 테이블 헤더: 폰트 크기 text-xs, 색상 #878799 (밝은 회색 계열) */}
                                <div className='grid grid-cols-3 text-xs font-bold' style={{ color: '#878799' }}>
                                    <div>시공 내역</div>
                                    <div className='text-center'>소재</div>
                                    <div className='text-right'>수량</div>
                                </div>
                                <div className='pt-1 border-t border-gray-100 mt-1'>
                                    {/* 항목 리스트: 폰트 크기 text-sm */}
                                    {packageItems.map((item, index) => (
                                        <div key={index} className='grid grid-cols-3 py-1.5 text-sm text-gray-800'>
                                            <div className='font-semibold'>{item.label}</div>
                                            <div className='text-center text-indigo-600 font-bold'>
                                                {item.materialLabel === 'Epoxy' ? 'Epoxy' : 'Poly'}
                                            </div>
                                            <div className='text-right'>{item.quantity}{item.unit}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* 4. 이벤트 할인 영역 (숨고 리뷰 이벤트) */}
                        {discountItems.length > 0 && (
                            <div className='mt-2 pt-2 border-t border-gray-100'>
                                {discountItems.map((item, index) => (
                                    <div key={index} className='flex justify-between items-center py-1'>
                                        {/* 문구 크기 text-sm */}
                                        <div className='font-semibold text-sm text-gray-700 flex items-center'>
                                            <Gift size={16} className='mr-1 text-red-500'/> {item.label}
                                        </div>
                                        {/* 할인 금액: 폰트 크기 text-lg, 색상 #ff4f4f (빨간색 계열) */}
                                        <div className='font-bold text-lg' style={{ color: '#ff4f4f' }}>
                                            -{item.originalPrice.toLocaleString()}원 
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}


                        {/* 5. 최종 금액 영역 */}
                        <div className='mt-6 pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-center'>
                            <div className='flex flex-col items-start'>
                                {/* 문구 크기 text-base */}
                                <span className='text-base font-bold text-gray-800'>최종 결제 금액</span>
                                {/* 문구 크기 text-xs */}
                                <span className='text-xs text-gray-500 mt-1'>
                                    VAT 별도 / 현장상황별 상이
                                </span>
                            </div>
                            <div className="flex items-end">
                                {/* 최종 금액: 폰트 크기 text-4xl (이미지 참조), 색상 #585885 */}
                                <span className="text-4xl font-extrabold" style={{ color: '#585885' }}>
                                    {price.toLocaleString()}
                                </span>
                                {/* '원' 문구: 폰트 크기 text-lg, 색상 #585885 */}
                                <span className="text-lg font-normal ml-1" style={{ color: '#585885' }}>원</span>
                            </div>
                        </div>

                        {/* 6. 안내 버튼 영역 */}
                        <div className='space-y-2 pt-3'>
                            <div className='w-full py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold text-center shadow-sm'>
                                바닥 30x30cm, 벽면 30x60cm 크기 기준
                            </div>
                            <div className='w-full py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold text-center shadow-sm'>
                                재시공(셀프포함)은 별도문의
                            </div>
                            <div className='w-full py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold text-center shadow-sm'>
                                조각타일 및 대리석은 시공불가
                            </div>
                        </div>

                    </div>
                    {/* 견적서 캡처 영역 종료 */}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition active:scale-95">닫기</button>
                    <button onClick={handleImageSave} className="py-3 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition active:scale-95 flex items-center justify-center gap-2">
                         <Download size={18} /> 이미지 저장
                    </button>
                </div>
            </div>
        </div>
    );
};


const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-white" /> 재료별 상세 스펙</h3>
              <button onClick={onClose} className="text-white/80 hover:text-white transition active:scale-95"><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left font-extrabold text-gray-700">구분</th>
                    <th className="px-3 py-3 text-center font-extrabold text-gray-700">폴리아스파틱</th>
                    <th className="px-3 py-3 text-center font-extrabold text-indigo-700">에폭시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-semibold text-gray-900">내구성</td>
                    <td className="px-3 py-3 text-center text-gray-600">우수</td>
                    <td className="px-3 py-3 text-center font-bold text-indigo-600">최상 (전문가용)</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-semibold text-gray-900">A/S 기간</td>
                    <td className="px-3 py-3 text-center font-bold text-indigo-600">2년</td>
                    <td className="px-3 py-3 text-center font-bold text-indigo-600">5년</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-semibold text-gray-900">시공 후 양생</td>
                    <td className="px-3 py-3 text-center text-gray-600">6시간</td>
                    <td className="px-3 py-3 text-center text-gray-600">24시간 ~ 3일</td>
                  </tr>
                </tbody>
                </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button onClick={onClose} className="w-full py-3 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition active:scale-95">확인</button>
            </div>
          </div>
        </div>
);

const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100">
            <button
                className="flex justify-between items-center w-full py-3 text-left font-semibold text-gray-800 hover:text-indigo-600 transition duration-150"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <ChevronDown size={18} className={`text-indigo-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-3 text-sm text-gray-600 animate-slide-down">
                    {answer}
                </div>
            )}
        </div>
    );
};

// ⭐️ [ColorPalette] (로직 및 스타일 유지) ⭐️
const ColorPalette = ({ selectedColorId, onSelect, onTileImageUpload, tileImageURL, brightnessLevel, onBrightnessChange }) => {
    const baseColorData = GROUT_COLORS.find(c => c.id === selectedColorId) || GROUT_COLORS[0];
    const GROUT_LINE_WIDTH = 12; 

    const effectiveTileImageURL = (tileImageURL && tileImageURL !== DEFAULT_TILE_IMAGE_URL)
        ? tileImageURL
        : DEFAULT_TILE_IMAGE_URL;
    
    // ⭐️ [로직 유지] 밝기 레벨에 따라 최종 줄눈 색상 결정 ⭐️
    const effectiveGroutColor = useMemo(() => {
        const baseHex = baseColorData.code;
        // brightnessLevel(-50~50)을 -1.0~1.0의 비율로 변환 (50이 100% 혼합)
        const level = brightnessLevel / 50; 

        if (level === 0) {
            return baseHex; // 0%는 기본 색상
        } else if (level > 0) {
            // 밝게: 기본색 vs 화이트 혼합. weight는 0.0 ~ 1.0
            const weight = level;
            return mixColors(baseHex, BRIGHT_COLOR_CODE, weight);
        } else {
            // 어둡게: 기본색 vs 119번 혼합. weight는 0.0 ~ 1.0
            const weight = Math.abs(level);
            return mixColors(baseHex, DARK_COLOR_CODE, weight);
        }
    }, [baseColorData.code, brightnessLevel]);

    // 혼합된 색상의 대비를 이용해 텍스트 색상을 결정 (간단화)
    const isDarkGrout = useMemo(() => {
        // 혼합된 색상의 밝기를 간단히 판단 (RGB 평균)
        const hex = effectiveGroutColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) < 150; // 150 기준
    }, [effectiveGroutColor]);

    const sliderTrackStyle = useMemo(() => {
        const baseColor = baseColorData.code;
        return {
            backgroundImage: `linear-gradient(to right, ${DARK_COLOR_CODE}, ${baseColor}, ${BRIGHT_COLOR_CODE})`
        };
    }, [baseColorData.code]);

    return (
        <div className='mt-5 pt-3 border-t border-gray-100 animate-fade-in'>
            <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 text-gray-800">
                <Palette className="h-4 w-4 text-indigo-600" /> 2-1. 줄눈 색상 미리보기 및 선택
            </h3>
            
            {/* 시뮬레이션 컨테이너 */}
            <div className={`transition-all duration-300`}> 
                <div 
                    className="w-full aspect-video mx-auto overflow-hidden relative bg-white" 
                >
                    {/* 1. 타일 배경 (이미지) */}
                    <div 
                        className="absolute inset-0" 
                        style={{ 
                            backgroundImage: `url(${effectiveTileImageURL})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: 1 
                        }}
                    ></div>
                    
                    {/* 2. 워터마크 레이어 (z-index 5) */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center opacity-30" 
                        style={{
                            zIndex: 5, 
                            backgroundImage: 'url(/logo.png)', 
                            backgroundSize: '30%', 
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    >
                    </div>

                    {/* ⭐️ 3. 줄눈 십자가 (혼합된 색상 적용) - z-index 10 (최상단) ⭐️ */}
                    <div 
                        className="absolute top-0 bottom-0 left-1/2"
                        style={{
                            width: `${GROUT_LINE_WIDTH}px`,
                            backgroundColor: effectiveGroutColor, // ⭐️ 혼합 색상 적용 ⭐️
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}
                    ></div>
                    <div 
                        className="absolute left-0 right-0 top-1/2"
                        style={{
                            height: `${GROUT_LINE_WIDTH}px`,
                            backgroundColor: effectiveGroutColor, // ⭐️ 혼합 색상 적용 ⭐️
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                        }}
                    ></div>
                </div>
            </div>

            {/* 선택 색상 이름 표시 및 밝기 레벨 */}
            <div className={`p-3 rounded-lg shadow-md mb-3 border border-gray-200`} style={{ backgroundColor: effectiveGroutColor }}>
                <p className={`text-sm font-bold ${isDarkGrout ? 'text-white' : 'text-gray-900'} flex items-center justify-between`}>
                    <span className='truncate'>
                        현재 선택 색상: **{baseColorData.label}** {brightnessLevel !== 0 && ` (${brightnessLevel > 0 ? '밝게' : '어둡게'} ${Math.abs(brightnessLevel)}%)`}
                    </span>
                    <CheckCircle2 size={16} className={`ml-2 flex-shrink-0 ${isDarkGrout ? 'text-amber-400' : 'text-indigo-700'}`}/>
                </p>
            </div>
            
            {/* ⭐️ [문구 위치 재수정 반영] 밝기 조절 슬라이더 ⭐️ */}
            <div className='mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100'>
                <h4 className="text-xs font-extrabold flex items-center gap-1 mb-2 text-gray-700">
                    <TrendingUp size={14} className='text-indigo-500' /> 조색 밝기 조절 
                </h4>
                <div className='flex items-center gap-3'>
                    {/* ⭐️ 수정: 어둡게를 왼쪽으로 이동 ⭐️ */}
                    <span className='text-xs font-bold text-gray-500 whitespace-nowrap'>어둡게</span> 
                    <input
                        type="range"
                        min="-50"
                        max="50"
                        step="10"
                        value={brightnessLevel}
                        onChange={(e) => onBrightnessChange(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
                        style={sliderTrackStyle}
                    />
                    {/* ⭐️ 수정: 밝게를 오른쪽으로 이동 ⭐️ */}
                    <span className='text-xs font-bold text-gray-500 whitespace-nowrap'>밝게</span> 
                </div>
                <div className='text-center mt-1 text-sm font-extrabold text-indigo-600'>
                    현재 밝기: {brightnessLevel}%
                </div>
            </div>


            {/* 타일 이미지 업로드 버튼 (유지) */}
            <div className='mb-4'>
                <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} style={{ display: 'none' }} />
                <label htmlFor="tileFileInput" className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                    <ImageIcon size={16} /> 내 타일 사진 첨부하여 미리보기
                </label>
            </div>

            {/* 색상 선택 버튼 그리드 (유지) */}
            <div className='grid grid-cols-5 sm:grid-cols-5 gap-3'>
                {GROUT_COLORS.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => {
                            onSelect(color.id);
                            onBrightnessChange(0); // 색상 선택 시 밝기 0%로 초기화
                        }}
                        className={`aspect-square rounded-lg transition-all duration-200 shadow-md flex items-center justify-center p-1 relative hover:scale-[1.02] active:scale-[0.98] ${
                            selectedColorId === color.id
                                ? 'ring-4 ring-offset-2 ring-indigo-500' // 선택 시 링 효과
                                : 'hover:shadow-lg'
                        }`}
                        style={{ backgroundColor: color.code }}
                        title={color.label}
                    >
                        {selectedColorId === color.id && (
                            <CheckCircle2 size={24} className={`absolute ${color.isDark ? 'text-amber-400' : 'text-indigo-700'} drop-shadow-md`} />
                        )}
                        <span className={`absolute bottom-0 text-[8px] font-bold py-[1px] px-1 rounded-t-sm ${color.isDark ? 'bg-white/80 text-gray-900' : 'bg-gray-900/80 text-white'}`}>{color.label}</span>
                    </button>
                ))}
            </div>
            <p className='text-xs text-gray-500 mt-3 text-center'>
                * 화면 해상도에 따라 실제 색상과 차이가 있을 수 있습니다.
            </p>
        </div>
    );
};


// ⭐️ [App Main] ⭐️
export default function App() {
    const [housingType, setHousingType] = useState('new');
    const [material, setMaterial] = useState('poly');
    const [polyOption, setPolyOption] = useState('pearl');
    const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
    const [selectedGroutColor, setSelectedGroutColor] = useState(GROUT_COLORS[0].id);
    const [brightnessLevel, setBrightnessLevel] = useState(0); 
    const [tileImageURL, setTileImageURL] = useState(DEFAULT_TILE_IMAGE_URL); 
    
    const [quantities, setQuantities] = useState(
        [...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
    );
    const [areaMaterials, setAreaMaterials] = useState(
        [...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 'poly' }), {})
    );
        
    const [selectedReviews, setSelectedReviews] = useState(new Set());
    const [showModal, setShowModal] = useState(false); // 견적서 모달 상태
    const [showMaterialModal, setShowMaterialModal] = useState(false); 
    const [showToast, setShowToast] = useState(false); 
    const [activeVideoId, setActiveVideoId] = useState(YOUTUBE_VIDEOS[0].id); 

    const quoteRef = useRef(null); 

    const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';
    const PHONE_NUMBER = '010-7734-6709';

    // 🚨 [유지] areaMaterials 의존성 간소화 (cleaner guardrail)
    useEffect(() => {
        if (quantities['entrance'] > 0 && areaMaterials['entrance'] !== 'poly') {
            setAreaMaterials(prev => ({ ...prev, 'entrance': 'poly' }));
        }
    }, [quantities['entrance']]);


    const handleQuantityChange = useCallback((id, delta) => {
        setQuantities(prev => {
            const currentQty = prev[id] || 0;
            let newQty = Math.max(0, currentQty + delta);
            const newQuantities = { ...prev, [id]: newQty };

            // 벽면/샤워부스/욕조 상호 배제 로직 (유지)
            if (newQty > 0) {
                if (id === 'master_bath_wall' && (newQuantities['shower_booth'] || 0) > 0) newQuantities['shower_booth'] = 0;
                if (id === 'common_bath_wall' && (newQuantities['bathtub_wall'] || 0) > 0) newQuantities['bathtub_wall'] = 0;
                if (id === 'shower_booth' && (newQuantities['master_bath_wall'] || 0) > 0) newQuantities['master_bath_wall'] = 0;
                if (id === 'bathtub_wall' && (newQuantities['common_bath_wall'] || 0) > 0) newQuantities['common_bath_wall'] = 0;
            }

            // 현관 자동 선택/해제 로직 (유지)
            const isBathroomFloorUpdated = id === 'bathroom_floor';
            let bathroomFloorCount = isBathroomFloorUpdated ? newQuantities['bathroom_floor'] : prev['bathroom_floor'];
            
            if (bathroomFloorCount >= 2 && newQuantities['entrance'] === 0) {
                newQuantities['entrance'] = 1;
            } 
            else if (bathroomFloorCount < 2 && prev['bathroom_floor'] >= 2 && prev['entrance'] === 1 && newQuantities['entrance'] === 1) {
                if (newQuantities['entrance'] === 1) {
                    newQuantities['entrance'] = 0;
                }
            }
            return newQuantities;
        });
    }, []);
        
    const handleAreaMaterialChange = useCallback((id, mat) => {
        if (id === 'entrance') {
            setAreaMaterials(prev => ({ ...prev, [id]: 'poly' }));
        } else {
            setAreaMaterials(prev => ({ ...prev, [id]: mat }));
        }
    }, []);
        
    const toggleReview = useCallback((id) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    // 🚨 [유지] useMemo/useCallback 의존성 최적화
    const getSelectionSummary = useCallback((q, areaMats) => {
        const summary = {};
        for (const id in q) {
            const qty = q[id];
            if (qty > 0) {
                const mat = (id === 'entrance') ? 'poly' : areaMats[id];
                const matKey = (mat === 'poly') ? 'poly' : 'kerapoxy';
                if (!summary[matKey]) {
                    summary[matKey] = {};
                }
                summary[matKey][id] = qty;
            }
        }
        if (q['entrance'] > 0) {
            if (!summary['poly']) summary['poly'] = {};
            summary['poly']['entrance'] = q['entrance'];
            if(summary['kerapoxy'] && summary['kerapoxy']['entrance']) {
                delete summary['kerapoxy']['entrance']; 
            }
        }
        return summary;
    }, []); 
        
    // 🚨 [유지] useMemo/useCallback 의존성 최적화
    const findMatchingPackage = useCallback((selectionSummary, quantities) => {
        const filterSelections = (selections) => {
            const filtered = {};
            for (const id in selections) {
                if (!OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION.includes(id)) {
                    filtered[id] = selections[id];
                }
            }
            return filtered;
        };

        const filteredPolySelections = filterSelections(selectionSummary['poly'] || {});
        const filteredEpoxySelections = filterSelections(selectionSummary['kerapoxy'] || {});
            
        const totalSelectedCount = Object.values(filteredPolySelections).reduce((sum, v) => sum + v, 0) + 
                                            Object.values(filteredEpoxySelections).reduce((sum, v) => sum + v, 0);
            
        if (totalSelectedCount === 0) return null;
        const sortedPackages = MIXED_PACKAGES; 
            
        for (const pkg of sortedPackages) {
                    let tempPolySelections = { ...filteredPolySelections };
                    let tempEpoxySelections = { ...filteredEpoxySelections };
                    let appliedAutoEntrance = false;
                    
                    if (pkg.isFlexible) {
                                           const requiredPolyAreas = pkg.P_areas.map(([id]) => id).filter(id => id !== 'entrance');
                                           const requiredEpoxyAreas = pkg.E_areas.map(([id]) => id);
                                           let baseMatch = true;
                                           for (const id of requiredPolyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                                                const requiredQty = pkg.P_areas.find(([pkId]) => pkId === id)[1];
                                                if ((tempPolySelections[id] || 0) !== requiredQty) {
                                                    baseMatch = false;
                                                    break;
                                                }
                                           }
                                           if (!baseMatch) continue;

                                           for (const id of requiredEpoxyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                                                const requiredQty = pkg.E_areas.find(([pkId]) => pkId === id)[1];
                                                if ((tempEpoxySelections[id] || 0) !== requiredQty) {
                                                    baseMatch = false;
                                                    break;
                                                }
                                           }
                                           if (!baseMatch) continue;

                                           const flexibleSelectedPolyCount = pkg.flexibleGroup.filter(id => tempPolySelections[id] > 0).length;
                                           const flexibleSelectedEpoxyCount = pkg.flexibleGroup.filter(id => tempEpoxySelections[id] > 0).length;
                                           const isPolyFlexiblePackage = pkg.id.startsWith('USER_P_');
                                           const isEpoxyFlexiblePackage = pkg.id.startsWith('USER_E_');
                                           let flexibleMatch = false;

                                           if (isPolyFlexiblePackage) {
                                                flexibleMatch = flexibleSelectedPolyCount === 1 && flexibleSelectedEpoxyCount === 0;
                                                if (flexibleMatch) {
                                                    const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempPolySelections[id] > 0);
                                                    if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                                                    if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                                                }
                                           } else if (isEpoxyFlexiblePackage) {
                                                flexibleMatch = flexibleSelectedEpoxyCount === 1 && flexibleSelectedPolyCount === 0;
                                                if (flexibleMatch) {
                                                    const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempEpoxySelections[id] > 0);
                                                    if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                                                    if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                                                }
                                           }
                                           
                                           if (baseMatch && flexibleMatch) {
                                                const packageAreaIds = new Set(getPackageAreaIds(pkg));
                                                const finalSelectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
                                                const isIdSetMatch = finalSelectedAreaIds.size === packageAreaIds.size && 
                                                                               [...finalSelectedAreaIds].every(id => packageAreaIds.has(id));

                                                if (isIdSetMatch) {
                                                    return { ...pkg, autoEntrance: appliedAutoEntrance }; 
                                                }
                                           }
                                           continue; 
                    }
                    
                    let isMatch = true;
                    for (const [id, requiredQty] of pkg.P_areas) {
                                 if ((tempPolySelections[id] || 0) !== requiredQty) { 
                                     isMatch = false;
                                     break;
                                 }
                    }
                    if (!isMatch) continue;

                    for (const [id, requiredQty] of pkg.E_areas) {
                                 if ((tempEpoxySelections[id] || 0) !== requiredQty) { 
                                     isMatch = false;
                                     break;
                                 }
                    }
                    if (!isMatch) continue;

                    const selectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
                    const packageAreaIds = new Set(getPackageAreaIds(pkg));
                    const isIdSetMatch = selectedAreaIds.size === packageAreaIds.size && 
                                                 [...selectedAreaIds].every(id => packageAreaIds.has(id));

                    if (isIdSetMatch) {
                                 return { ...pkg, autoEntrance: appliedAutoEntrance }; 
                    }
        }
        return null;
    }, []);


    const calculation = useMemo(() => {
        const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
        let itemizedPrices = []; 
            
        // 🚨 [수정] 의존성 최적화 반영: getSelectionSummary와 findMatchingPackage를 호출할 때 quantities와 areaMaterials 인자 명시
        const selectionSummary = getSelectionSummary(quantities, areaMaterials);
        const matchedPackageResult = findMatchingPackage(selectionSummary, quantities);
        const matchedPackage = matchedPackageResult ? matchedPackageResult : null;
            
        let q = { ...quantities };
        let total = 0;
        let labelText = null;
        let isPackageActive = false; 
        let isFreeEntrance = false;
        let totalAreaCount = Object.values(quantities).some(v => v > 0) ? Object.keys(quantities).filter(k => quantities[k] > 0).length : 0;
            
        let packageAreas = []; 
            
        if (matchedPackage) {
            total = matchedPackage.price;
            isPackageActive = true;
            // ⭐️ [요청 반영] 패키지 라벨 통합: 어떤 패키지든 "패키지 할인 적용 중" 문구 사용 ⭐️
            labelText = '패키지 할인 적용 중'; 
            packageAreas = getPackageAreaIds(matchedPackage);
            packageAreas.forEach(id => { q[id] = 0; });
            if (quantities['entrance'] >= 1) { 
                        isFreeEntrance = true;
                        q['entrance'] = 0;
            }
        } 
            
        if (quantities['bathroom_floor'] >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
                        isFreeEntrance = true;
                        isPackageActive = true;
                        labelText = '현관 서비스 적용 중';
                        q['entrance'] = 0;
        }
        
        // ⭐️ 할인 전 총 원가를 먼저 계산 (정가 기준) ⭐️
        let priceBeforeAllDiscount = 0;


        ALL_AREAS.forEach(area => {
            const initialCount = quantities[area.id] || 0;
            if (initialCount === 0) return;
            const count = q[area.id] || 0; 
            const areaMatId = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
            const isEpoxy = areaMatId === 'kerapoxy';
            
            // ⭐️ [변경 시작] 정가(itemOriginalTotal) 계산을 ORIGINAL_PRICES 기준으로 변경 ⭐️
            const priceKey = areaMatId === 'poly' ? 'poly' : 'epoxy';
            
            let originalPriceFromConst = (ORIGINAL_PRICES[area.id] && ORIGINAL_PRICES[area.id][priceKey] !== undefined)
                ? ORIGINAL_PRICES[area.id][priceKey] 
                : (area.basePrice * (isEpoxy ? MATERIALS.find(m => m.id === 'kerapoxy').priceMod : 1.0) * selectedHousing.multiplier);

            let itemOriginalTotal = originalPriceFromConst * initialCount;
            priceBeforeAllDiscount += itemOriginalTotal; // 총 원가 누적


            // 🚨 [유지] 견적 계산 시 사용되는 단가 로직 (할인 적용되는 가격) 🚨
            let finalUnitBasePrice = area.basePrice;
            if (area.id === 'balcony_laundry') {
                        finalUnitBasePrice = isEpoxy ? 250000 : 100000;
            } else if (area.id === 'kitchen_wall') {
                        finalUnitBasePrice = isEpoxy ? 250000 : 150000;
            } else if (area.id === 'living_room') {
                        finalUnitBasePrice = isEpoxy ? 1100000 : 550000;
            } else if (area.id === 'entrance') {
                        finalUnitBasePrice = 50000;
            } else if (BATHROOM_AREAS.some(a => a.id === area.id)) {
                        finalUnitBasePrice = area.basePrice * (isEpoxy ? 1.8 : 1.0);
            } 
            
            const calculatedPricePerUnit = Math.floor(finalUnitBasePrice * selectedHousing.multiplier);
            let finalCalculatedPrice = 0;
            let finalDiscount = 0;
            let isFreeServiceItem = false;
            let packageCount = initialCount - count; 
            
            // ⭐️ [계산 로직 유지] 패키지/무료 서비스 적용 시 가격 0원 처리 ⭐️
            if (packageCount > 0 && (matchedPackage || isFreeEntrance) && count === 0) {
                             finalCalculatedPrice = 0;
                             finalDiscount = itemOriginalTotal; // 할인액은 정가와 같음
                             isFreeServiceItem = area.id === 'entrance' || packageAreas.includes(area.id); 
            } 
            else if (area.id === 'entrance' && isFreeEntrance && !matchedPackage && count === 0) {
                             finalCalculatedPrice = 0;
                             finalDiscount = itemOriginalTotal; // 할인액은 정가와 같음
                             isFreeServiceItem = true;
            }
            else {
                             // ⭐️ [계산 로직 유지] 패키지 미적용 시의 개별 할인 로직 ⭐️
                             let remainingCalculatedPrice = calculatedPricePerUnit * count;
                             let remainingDiscount = 0;
                             
                             if (area.id === 'silicon_bathtub' && totalAreaCount >= 3) {
                                     const nonPackageOriginalPrice = 80000 * count; 
                                     const fixedPriceForRemaining = 50000 * count; 
                                     if (count > 0) {
                                             remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                                             remainingCalculatedPrice = fixedPriceForRemaining;
                                     }
                             } else if (area.id === 'silicon_living_baseboard' && totalAreaCount >= 3) {
                                     const nonPackageOriginalPrice = 400000 * count; 
                                     const fixedPriceForRemaining = 350000 * count; 
                                     if (count > 0) {
                                             remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                                             remainingCalculatedPrice = fixedPriceForRemaining;
                                     }
                             } else if (area.id === 'silicon_sink') {
                                     remainingCalculatedPrice = 30000 * count;
                             }
                             finalCalculatedPrice = remainingCalculatedPrice; 
                             finalDiscount = remainingDiscount; 
                             total += finalCalculatedPrice;
            }
            // ⭐️ [변경 끝] ⭐️
            
            finalCalculatedPrice = Math.floor(finalCalculatedPrice / 1000) * 1000;
            itemOriginalTotal = Math.floor(itemOriginalTotal / 1000) * 1000;
            finalDiscount = Math.floor(finalDiscount / 1000) * 1000;

            itemizedPrices.push({
                                 id: area.id, 
                                 label: area.label, 
                                 quantity: initialCount, 
                                 unit: area.unit, 
                                 originalPrice: itemOriginalTotal, // ⭐️ 새로운 정가 기준 적용 ⭐️
                                 calculatedPrice: finalCalculatedPrice, 
                                 discount: finalDiscount, 
                                 isFreeService: isFreeServiceItem, 
                                 isPackageItem: isFreeServiceItem || packageCount > 0 || (area.id === 'silicon_bathtub' && totalAreaCount >= 3) || (area.id === 'silicon_living_baseboard' && totalAreaCount >= 3), 
                                 isDiscount: false, 
                                 materialLabel: ['silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'].includes(area.id) ? 'Silicon' : (areaMatId === 'poly' ? 'Poly' : 'Epoxy')
            });
        });
            
        let discountAmount = 0;
        REVIEW_EVENTS.forEach(evt => {
            if (selectedReviews.has(evt.id)) {
                discountAmount += evt.discount;
                // 리뷰 할인 항목은 총 원가에는 포함되지 않으므로 priceBeforeAllDiscount에는 더하지 않습니다.
                itemizedPrices.push({ id: evt.id, label: evt.label, quantity: 1, unit: '건', originalPrice: evt.discount, calculatedPrice: 0, discount: evt.discount, isPackageItem: false, isDiscount: true, materialLabel: 'Event' });
            }
        });
        total -= discountAmount;
        
        let originalCalculatedPrice = Math.max(0, Math.floor(total / 1000) * 1000); 
        let finalPrice = originalCalculatedPrice; 
        let minimumFeeApplied = false;

        if (finalPrice > 0 && finalPrice < MIN_FEE) {
                finalPrice = MIN_FEE;
                minimumFeeApplied = true;
        }

        
            
        if (isFreeEntrance && !matchedPackage) {
                labelText = '현관 서비스 적용 중';
        } else if (matchedPackage) {
                // ⭐️ [요청 반영] 패키지 라벨 통합: 어떤 패키지든 "패키지 할인 적용 중" 문구 사용 ⭐️
                labelText = '패키지 할인 적용 중'; 
        }
        
        // ⭐️ priceBeforeAllDiscount는 이미 itemOriginalTotal을 누적했으므로 여기서 다시 계산하지 않습니다. ⭐️

        return { 
                price: finalPrice, 
                originalCalculatedPrice, 
                priceBeforeAllDiscount: Math.floor(priceBeforeAllDiscount / 1000) * 1000, // ⭐️ 최종 정가 ⭐️
                label: labelText, 
                isPackageActive: isPackageActive || isFreeEntrance, 
                isFreeEntrance: isFreeEntrance,
                discountAmount: priceBeforeAllDiscount - finalPrice, // ⭐️ 새로운 정가 기준의 총 할인액 ⭐️
                minimumFeeApplied, 
                itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount),
        };

    }, [quantities, selectedReviews, housingType, areaMaterials, getSelectionSummary, findMatchingPackage]);


    const packageActiveRef = useRef(calculation.isPackageActive);
    useEffect(() => {
        if (calculation.isPackageActive && !packageActiveRef.current) {
            setShowToast(true);
        } 
        packageActiveRef.current = calculation.isPackageActive;
    }, [calculation.isPackageActive]);
        
    const handleCloseToast = useCallback(() => {
        setShowToast(false);
    }, []);

    const handleTileImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTileImageURL(reader.result);
                alert('✅ 타일 이미지가 성공적으로 업로드되었습니다!');
            };
            reader.readAsDataURL(file);
        }
    };

    // 이미지 저장 기능은 QuoteModal 내부로 이동하고, 여기서는 참조만 남깁니다.
    // const handleImageSave = ...

    const selectedMaterialData = MATERIALS.find(m => m.id === material);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    const hasSelections = Object.values(quantities).some(v => v > 0);

    const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
    const currentEmbedUrl = getEmbedUrl(currentVideo.id);

    const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => {
        if (areaId === 'entrance') {
                return (
                    <div className='mt-2 pt-2 border-t border-gray-100'>
                        <div className="text-xs font-bold text-green-700 bg-green-100 p-1.5 rounded-md text-center">
                            현관은 폴리아스파틱 (Poly) 고정입니다.
                        </div>
                    </div>
                );
        }
        if (['silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'].includes(areaId)) {
                return (
                    <div className='mt-2 pt-2 border-t border-gray-100'>
                        <div className="text-xs font-bold text-green-700 bg-green-100 p-1.5 rounded-md text-center">
                            실리콘 시공은 별도 소재입니다.
                        </div>
                    </div>
                );
        }
        return (
                            <div className={`mt-2 ${isQuantitySelected ? 'animate-slide-down' : ''} transition-all duration-300`}>
                                    <div className='flex gap-1.5 pt-2 border-t border-gray-100'>
                                    {MATERIALS.map(mat => (
                                                    <button
                                                    key={mat.id}
                                                    onClick={(e) => {
                                                            e.stopPropagation();  
                                                            onChange(areaId, mat.id);
                                                    }}
                                                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all active:scale-95 shadow-sm 
                                                        ${currentMat === mat.id 
                                                            ? 'bg-indigo-700 text-white shadow-lg' 
                                                            : 'bg-indigo-100 text-gray-700 hover:bg-indigo-200' 
                                                        }`}
                                                    >
                                                    {mat.label.split('(')[0].trim()}
                                                    </button>
                                    ))}
                                    </div>
                            </div>
        );
    };

    const renderAreaList = (areas) => (
        <div className="space-y-3">
            {areas.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && quantities['bathroom_floor'] >= 2 && !calculation.isPackageActive;
                
                const description = area.desc || area.basePrice ? (
                    (area.desc && area.desc.trim() !== '') ? (
                        <div className="text-xs text-gray-500"><span className="block text-indigo-600">{area.desc}</span></div>
                    ) : null
                ) : null;

                return (
                    <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                                <div>
                                    <div className="font-semibold text-gray-800">{area.label}</div>
                                    {description}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md">
                                <button 
                                    onClick={() => handleQuantityChange(area.id, -1)} 
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold 
                                        ${(quantities[area.id] > 0 && !(isEntranceAutoSelected && area.id === 'entrance')) ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                                >-</button> 
                                <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                                <button 
                                    onClick={() => {
                                        handleQuantityChange(area.id, 1);
                                        if (quantities[area.id] === 0) {
                                            handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material);
                                        }
                                    }} 
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-lg transition active:scale-90
                                        ${isEntranceAutoSelected && area.id === 'entrance' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-indigo-600 hover:bg-gray-100'}
                                    `}
                                >+</button> 
                            </div>
                        </div>

                        {isSelected && (
                            <MaterialSelectButtons 
                                areaId={area.id}
                                currentMat={currentMat}
                                onChange={handleAreaMaterialChange}
                                isQuantitySelected={isSelected}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className={`min-h-screen bg-gray-50 d-gray-800 font-sans pb-40`}>
            <GlobalStyles />

            {/* 헤더 (유지) */}
            <header className="bg-indigo-900 text-white sticky top-0 z-20 shadow-xl">
            <div className="p-4 flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center"> 
                <h1 className="text-xl font-extrabold text-gray-50 tracking-wide">줄눈의미학</h1>
              </div>
              <div className='flex gap-2'> 
                <button 
                  onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} 
                  className="text-xs bg-amber-400 text-indigo-900 px-3 py-1 rounded-full font-extrabold hover:bg-amber-300 transition active:scale-95 shadow-md flex items-center"
                >
                  <Phone size={12} className="inline mr-1" /> 상담원 연결
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-xs bg-indigo-800 px-3 py-1 rounded-full text-white hover:bg-indigo-700 transition active:scale-95 shadow-md flex items-center"
                >
                  <RefreshCw size={12} className="inline mr-1" /> 초기화
                </button>
              </div>
            </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* 동영상 섹션 (유지) */}
                <section className="bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
                <h2 className="text-lg font-extrabold flex items-center gap-2 p-4 text-gray-800 border-b border-gray-100">
                <Zap className="h-5 w-5 text-red-600" /> 시공 현장 영상
              </h2>
              <div className="relative">
                <div className="aspect-video w-full">
                  <iframe
                    key={currentVideo.id} 
                    width="100%"
                    height="100%"
                    src={currentEmbedUrl} 
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  ></iframe>
                </div>
                <div className="flex p-3 gap-3 bg-gray-50 border-t border-gray-100">
                    {YOUTUBE_VIDEOS.map((video) => (
                        <button
                            key={video.id}
                            onClick={() => setActiveVideoId(video.id)}
                            className={`flex-1 py-2 text-sm font-extrabold rounded-lg transition-all duration-300 shadow-md active:scale-[0.99] ${
                                activeVideoId === video.id 
                                    ? 'bg-indigo-700 text-white' 
                                    : 'bg-white text-indigo-700 hover:bg-indigo-50' 
                            }`}
                        >
                            {video.label}
                        </button>
                    ))}
                </div>
              </div>
                </section>
                
                {/* 1. 현장 유형 섹션 (유지) */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-150">
                <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                <Home className="h-5 w-5 text-indigo-600" /> 1. 현장 유형을 선택하세요
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {HOUSING_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setHousingType(type.id)}
                    className={`p-4 rounded-lg text-center transition-all duration-200 selection-box active:scale-[0.99] shadow-md ${
                      housingType === type.id 
                        ? 'bg-indigo-700 text-white font-bold shadow-lg' 
                        : 'bg-white text-gray-600 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="text-base font-semibold">{type.label}</div>
                  </button>
                ))}
              </div>
                </section>

                {/* 2. 줄눈소재 안내 (색상 팔레트 업데이트) */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                        <Hammer className="h-5 w-5 text-indigo-600" /> 2. 줄눈소재 안내
                    </h2>
                    <div className="space-y-4">
                        {MATERIALS.map((item) => (
                        <div key={item.id} className="animate-fade-in">
                            <div onClick={() => setMaterial(item.id)} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 selection-box active:scale-[0.99] shadow-md ${item.id === material ? 'bg-indigo-700 text-white shadow-lg' : 'bg-white hover:bg-indigo-50'}`}>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <div className='flex items-center gap-3'>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition ${item.id === material ? 'border-white' : 'border-gray-400'}`}>
                                            {item.id === material && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                        <span className={`font-bold ${item.id === material ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.id === material ? 'bg-amber-400 text-indigo-900' : item.badgeColor}`}>
                                        {item.badge}
                                    </span>
                                </div>
                                <p className={`text-xs mt-1 pl-7 ${item.id === material ? 'text-indigo-200' : 'text-gray-500'}`}>{item.description}</p>
                            </div>
                            </div>
                            {item.id === 'poly' && item.id === material && (
                            <div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-300 space-y-2 animate-slide-down bg-gray-50/50 p-3 rounded-md">
                                <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Palette size={12} /> 옵션 선택 (펄 유무)</div>
                                <div className="flex gap-2">
                                <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${polyOption === 'pearl' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>펄</button>
                                <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${polyOption === 'no_pearl' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>무펄</button>
                                </div>
                            </div>
                            )}
                            {item.id === 'kerapoxy' && item.id === material && (
                            <div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-500 space-y-2 animate-slide-down bg-indigo-50/50 p-3 rounded-md"> 
                                <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Crown size={12} /> 옵션 선택 (브랜드)</div> 
                                <div className="flex gap-2">
                                <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${epoxyOption === 'kerapoxy' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>케라폭시</button> 
                                <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${epoxyOption === 'starlike' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>스타라이크</button> 
                                </div>
                            </div>
                            )}
                        </div>
                        ))}
                    </div>
                    
                    {/* ⭐️ [업데이트된 ColorPalette] ⭐️ */}
                    <ColorPalette 
                        selectedColorId={selectedGroutColor} 
                        onSelect={setSelectedGroutColor} 
                        onTileImageUpload={handleTileImageUpload} 
                        tileImageURL={tileImageURL} 
                        brightnessLevel={brightnessLevel} 
                        onBrightnessChange={setBrightnessLevel} 
                    />

                    {/* 재료 상세 비교 버튼 영역 (유지) */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex justify-center">
                        <button 
                            onClick={() => setShowMaterialModal(true)} 
                            className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-lg font-extrabold text-sm hover:bg-indigo-100 transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                        >
                            <Info size={16} className='text-indigo-500' fill='currentColor'/> 소재 양생기간 확인하기
                        </button>
                    </div>
                </section>

                {/* 3. 시공범위 선택 (유지) */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-450">
                <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                <Calculator className="h-5 w-5 text-indigo-600" /> 3. 시공범위 선택
              </h2>
              
              {/* A. 욕실 범위 */}
              <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700">
                <Bath size={16} className="text-indigo-500" /> A. 욕실 범위
              </h3>
              {renderAreaList(BATHROOM_AREAS)}

              <div className="border-t border-gray-100 mt-4 pt-4"></div>
              
              {/* B. 기타 범위 (현관/주방/베란다) */}
              <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700">
                <LayoutGrid size={16} className="text-indigo-500" /> B. 기타 범위
              </h3>
              {renderAreaList(OTHER_AREAS)}
                </section>

                {/* 4. 실리콘 시공 (유지) */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-600">
                <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                <Eraser className="h-5 w-5 text-indigo-600" /> 4. 실리콘 시공
              </h2>
              <div className="space-y-3">
                {SILICON_AREAS.map((area) => {
                  const Icon = area.icon;
                  const isSelected = quantities[area.id] > 0;

                  const description = area.desc || area.basePrice ? (
                              (area.desc && area.desc.trim() !== '') ? (
                                  <div className="text-xs text-gray-500"><span className="block text-indigo-600">{area.desc}</span></div>
                              ) : null
                          ) : null;

                  return (
                    <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}> 
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                                <div>
                                    <div className="font-semibold text-gray-800">{area.label}</div>
                                    {description}
                                </div>
                            </div>
                            {/* ⭐️ [유지] 수량 증감 버튼: border border-gray-200 제거 ⭐️ */}
                            <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md">
                                <button 
                                    onClick={() => handleQuantityChange(area.id, -1)} 
                                    className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                                >-</button> 
                                <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                                <button 
                                    onClick={() => {
                                        handleQuantityChange(area.id, 1);
                                    }} 
                                    className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90"
                                >+</button> 
                            </div>
                        </div>
                    </div>
                  );
                })}
                </div>
                </section>
                
                {/* 자주 묻는 질문 (FAQ) (유지) */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-750">
                <h2 className="text-lg font-extrabold text-gray-800 mb-2 flex items-center gap-2 border-b pb-2">
                    <HelpCircle className="h-5 w-5 text-indigo-600"/> 자주 묻는 질문
                </h2>
                <div className="space-y-1">
                    {FAQ_ITEMS.map((item, index) => (
                        <Accordion key={index} question={item.question} answer={item.answer} />
                    ))}
                </div>
                </section>

                {/* 숨고 후기 바로가기 (유지) */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
                className="w-full py-3 rounded-lg bg-indigo-700 text-white font-bold text-base hover:bg-indigo-800 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Star size={20} fill="currentColor" className="text-white" /> 
                고객 만족도 확인 (숨고 평점 5.0+)
              </button>
                </div>
            </main>

            {/* 하단 고정바 */}
            <>
            <PackageToast isVisible={showToast} onClose={handleCloseToast} label={calculation.label} />

            {/* ⭐️ [유지] hasSelections가 true일 때만 하단 견적 바 렌더링 ⭐️ */}
            {hasSelections && (
                <div className="fixed bottom-0 left-0 right-0 bg-indigo-900 shadow-2xl safe-area-bottom z-20 animate-slide-down">
                    <div className="max-w-md mx-auto p-4 flex flex-col gap-2"> 
                        
                        {/* 1. 금액 및 정보 영역 */}
                        <div className='flex items-center justify-between w-full text-white'> 
                            
                            {/* 좌측: 금액 정보 (총 예상 견적 문구 화이트 강조) */}
                            <div className='flex flex-col items-start gap-1'> 
                                <span className='text-sm font-semibold text-white'>총 예상 견적</span>
                                <div className="flex items-end gap-1">
                                    {/* 2. 최종 적용 가격 */}
                                    <span className="text-3xl font-extrabold text-white">{calculation.price.toLocaleString()}</span>
                                    <span className="text-base font-normal text-white">원</span>
                                </div>
                            </div>
                            
                            {/* 🚨 [유지] 우측: 패키지/최소비용 라벨 🚨 */}
                            <div className='flex flex-col items-end justify-end h-full pt-1'> 
                                
                                {/* A. 최소 출장비 적용 안내 (Clock 아이콘) */}
                                {calculation.minimumFeeApplied && (
                                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-red-300 mb-0.5 whitespace-nowrap">
                                        <Clock size={12} className='inline mr-0.5 text-red-300'/> 최소 출장비 적용
                                    </div>
                                )}

                                {/* B. 원래 금액 스트라이크 아웃 */}
                                {((calculation.minimumFeeApplied || calculation.isPackageActive) && (calculation.priceBeforeAllDiscount > calculation.price)) && (
                                    <span className="text-xs text-gray-400 line-through font-normal whitespace-nowrap">
                                        {calculation.priceBeforeAllDiscount.toLocaleString()}원
                                    </span>
                                )}

                                {/* C. 패키지 적용 라벨 */}
                                {calculation.label && !calculation.minimumFeeApplied && (
                                    <div className="text-xs font-bold text-amber-300 whitespace-nowrap">
                                        <Crown size={12} className='inline mr-1 text-amber-300'/> {calculation.label}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. 견적서 확인 및 카카오톡 문의 버튼 (한 줄 배치) */}
                        <div className='grid grid-cols-2 gap-3'>
                            {/* 견적서 확인 버튼 */}
                            <button 
                                onClick={() => {
                                    setShowModal(true); 
                                    setShowToast(false); 
                                }} 
                                className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all 
                                    bg-indigo-700 text-white hover:bg-indigo-800 active:bg-indigo-900 shadow-md
                                `}
                            >
                                견적서 확인
                            </button>
                            
                            {/* 카카오톡 예약 문의 버튼 */}
                            <a 
                                href={KAKAO_CHAT_URL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all 
                                    bg-yellow-400 text-gray-800 hover:bg-yellow-500 active:bg-yellow-600 shadow-md flex items-center justify-center
                                `}
                            >
                                카톡 예약 문의
                            </a>
                        </div>
                    </div>
                </div>
            )}
            </>

            {/* 재료 상세 비교 모달 표시 (유지) */}
            {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
            
            {/* ⭐️ [추가] 견적서 상세 모달 렌더링 ⭐️ */}
            {showModal && (
                <QuoteModal
                    calculation={calculation}
                    onClose={() => setShowModal(false)}
                    quoteRef={quoteRef}
                />
            )}
        </div>
    );
}