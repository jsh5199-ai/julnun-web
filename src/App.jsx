import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
    CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon, Download, DollarSign, List, Layers, Check, ShieldCheck, Ruler, Settings, ThumbsUp, MoveHorizontal, Bell, Share2, Camera, ChevronRight, PlayCircle
} from 'lucide-react';

// =================================================================
// ⭐️ 상수 및 데이터
// =================================================================
const MIN_FEE = 200000;
const KAKAO_CHAT_URL = 'http://pf.kakao.com/_jAxnYn/chat';
const PHONE_NUMBER = '010-7734-6709';
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

const BRIGHT_COLOR_CODE = '#ffffff';
const DARK_COLOR_CODE = '#565556';

const ORIGINAL_PRICES = {
    'master_bath_floor': { poly: 230000, epoxy: 400000 },
    'common_bath_floor': { poly: 230000, epoxy: 400000 },
    'shower_booth': { poly: 150000, epoxy: 300000 },
    'bathtub_wall': { poly: 150000, epoxy: 300000 },
    'master_bath_wall': { poly: 300000, epoxy: 600000 },
    'common_bath_wall': { poly: 300000, epoxy: 600000 },
    'entrance': { poly: 50000, epoxy: 100000 },
    'balcony_laundry': { poly: 100000, epoxy: 250000 },
    'kitchen_wall': { poly: 150000, epoxy: 250000 },
    'living_room': { poly: 550000, epoxy: 1100000 },
    'silicon_bathtub': { poly: 80000, epoxy: 80000 },
    'silicon_kitchen_top': { poly: 50000, epoxy: 50000 },
    'silicon_living_baseboard': { poly: 400000, epoxy: 400000 },
};

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
// ⭐️ 스타일 정의
// =================================================================
const GlobalStyles = () => (
    <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body { font-family: 'Pretendard', sans-serif; background-color: #F8F9FB; color: #1e293b; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        .shadow-soft { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
        .shadow-glow { box-shadow: 0 0 20px rgba(79, 70, 229, 0.15); }
        
        input[type=range] {
            -webkit-appearance: none;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #ffffff;
            border: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            margin-top: -10px;
            cursor: pointer;
            transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:active { transform: scale(1.1); }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            border-radius: 2px;
        }
        
        /* ⭐️ 하단 Safe Area 대응 클래스 */
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    `}</style>
);

const HOUSING_TYPES = [
    { id: 'new', label: '신축 아파트 (입주예정)', multiplier: 1.0 },
    { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];
const MATERIALS = [
    {
        id: 'poly', label: '폴리아스파틱', priceMod: 1.0,
        description: '우수한 광택과 가성비, 빠른 양생',
        badge: 'STANDARD', badgeColor: 'bg-slate-100 text-slate-600'
    },
    {
        id: 'kerapoxy', label: '에폭시', priceMod: 1.8,
        description: '호텔같은 무광택, 반영구적 수명',
        badge: 'PREMIUM', badgeColor: 'bg-amber-100 text-amber-700'
    },
];

const BATHROOM_AREAS = [
    { id: 'master_bath_floor', label: '안방 욕실바닥', basePrice: 150000, icon: Bath, unit: '개소' },
    { id: 'common_bath_floor', label: '공용 욕실바닥', basePrice: 150000, icon: Bath, unit: '개소' },
    { id: 'shower_booth', label: '샤워부스 벽면', basePrice: 150000, icon: LayoutGrid, unit: '구역' },
    { id: 'bathtub_wall', label: '욕조 벽면', basePrice: 150000, icon: LayoutGrid, unit: '구역' },
    { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: LayoutGrid, unit: '구역' },
    { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: LayoutGrid, unit: '구역' },
];
const OTHER_AREAS = [
    { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소', desc: '바닥 2곳 이상 시공 시 무료' },
    { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: Layers, unit: '개소', desc: '' },
    { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: '' },
    { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '' },
];
const SILICON_AREAS = [
    { id: 'silicon_bathtub', label: '욕조 테두리', basePrice: 80000, icon: Eraser, unit: '개소', desc: '' },
    { id: 'silicon_kitchen_top', label: '주방 상판 실리콘', basePrice: 50000, icon: Utensils, unit: '개소', desc: '' },
    { id: 'silicon_living_baseboard', label: '거실 걸레받이', basePrice: 400000, icon: Sofa, unit: '구역', desc: '' },
];
const ALL_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS, ...SILICON_AREAS];
const REVIEW_EVENTS = [
    { id: 'soomgo_review', label: '숨고 포토리뷰 약속', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
];
const FAQ_ITEMS = [
    { question: "Q1. 시공 시간은 얼마나 걸리나요?", answer: "시공범위에 따라 다르지만, 평균적으로 4~6시간 정도 소요되고 있으며 범위/소재에 따라 최대 2일 시공이 걸리는 경우도 있습니다." },
    { question: "Q2. 줄눈 시공 후 바로 사용 가능한가요?", answer: "줄눈시공 후 폴리아스파틱은 6시간, 케라폭시는 2~3일, 스타라이크는 24시간 정도 양생기간이 필요합니다. 그 시간 동안은 물 사용을 자제해주시는 것이 가장 좋습니다." },
    { question: "Q3. 왜 줄눈 시공을 해야 하나요?", answer: "줄눈은 곰팡이와 물때가 끼는 것을 방지하고, 타일 틈새 오염을 막아 청소가 쉬워지며, 인테리어 효과까지 얻을 수 있는 필수 시공입니다." },
    { question: "Q4. A/S 기간 및 조건은 어떻게 되나요?", answer: "시공 후 폴리아스파틱은 2년, 에폭시는 5년의 A/S를 제공합니다. 단, 고객 부주의나 타일 문제로 인한 하자는 소액의 출장비가 발생할 수 있습니다." },
    { question: "Q5. 구축 아파트도 시공이 가능한가요?", answer: "네, 가능합니다. 기존 줄눈을 제거하는 그라인딩 작업이 추가로 필요하며, 현재 견적은 신축/구축 동일하게 적용됩니다." },
];
const YOUTUBE_VIDEOS = [
    { id: 'XekG8hevWpA', title: '에폭시 시공영상 (벽면/바닥)', label: '에폭시 시공' },
    { id: 'M6Aq_VVaG0s', title: '밑작업 영상 (라인 그라인딩)', label: '밑작업 과정' },
];
const getEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&rel=0`;

const OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION = ['entrance', 'balcony_laundry', 'kitchen_wall', 'living_room', 'silicon_bathtub', 'silicon_kitchen_top', 'silicon_living_baseboard'];

// 패키지 정의
const ORIGINAL_MIXED_PACKAGES = [
    { id: 'P_MIX_01', price: 750000, label: '혼합패키지 01', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_02', price: 750000, label: '혼합패키지 02', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_03_OLD', price: 800000, label: '혼합패키지 03 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1]] },
    { id: 'P_MIX_04_OLD', price: 800000, label: '혼합패키지 04 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['common_bath_wall', 1]] },
    { id: 'P_MIX_05_OLD', price: 1050000, label: '혼합패키지 05 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1], ['common_bath_wall', 1]] },
    { id: 'P_MIX_06', price: 830000, label: '혼합패키지 06', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_07', price: 830000, label: '혼합패키지 07', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_08', price: 850000, label: '혼합패키지 08', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1], ['shower_booth', 1]] },
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
    { 
        id: 'MIXED_FLOOR_500K_A', 
        price: 500000, 
        label: '복합 바닥 2곳 (폴리+에폭시)', 
        P_areas: [['master_bath_floor', 1]], 
        E_areas: [['common_bath_floor', 1]],
        isFlexible: false 
    },
    { 
        id: 'MIXED_FLOOR_500K_B', 
        price: 500000, 
        label: '복합 바닥 2곳 (에폭시+폴리)', 
        P_areas: [['common_bath_floor', 1]], 
        E_areas: [['master_bath_floor', 1]],
        isFlexible: false 
    },
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
// [컴포넌트] 실시간 예약 알림 (Ticker)
// =================================================================
const ReservationTicker = ({ variant = 'default' }) => {
    const messages = [
        "인천 연수구 박**님 12월 22일 예약완료",
        "인천 서구 한**님 12월 23일 예약완료",
        "경기 성남시 이**님 2월 13일 예약완료",
        "경기 용인시 하**님 12월 18일 예약완료",
        "서울 양천구 오**님 12월 14일 예약완료",
        "서울 송파구 김**님 1월 26일 예약완료",
        "서울 송파구 임**님 1월 14일 예약완료",
        "경기 시흥시 이**님 12월 11일 예약완료"
    ];
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false); // 페이드 아웃
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % messages.length);
                setIsVisible(true); // 페이드 인
            }, 500);
        }, 4000); // 4초마다 변경

        return () => clearInterval(interval);
    }, []);

    if (variant === 'top-bar') {
        return (
            <div className="w-full bg-slate-50 border-b border-slate-100 py-2.5 flex justify-center items-center overflow-hidden relative">
                <div className={`flex items-center gap-2 transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-slate-500 tracking-tight">{messages[index]}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full flex justify-center pb-2 transition-all duration-500`}>
             <div className={`bg-slate-900/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-2 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <Bell size={12} className="text-amber-400" fill="currentColor" />
                <span className="text-[11px] font-medium truncate">{messages[index]}</span>
            </div>
        </div>
    );
};

const QuoteModal = ({ calculation, onClose, quoteRef, selectedReviews, toggleReview }) => {
    const { price, label, minimumFeeApplied, itemizedPrices, priceBeforeAllDiscount } = calculation;
    const totalDiscount = priceBeforeAllDiscount - price;
    const isDiscountApplied = totalDiscount > 0;
    const packageItems = itemizedPrices.filter(i => i.quantity > 0 && !i.isDiscount);
    const discountItems = itemizedPrices.filter(i => i.isDiscount);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10 sticky top-0">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 tracking-tight">
                        견적서 확인
                    </h3>
                    <button onClick={onClose} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"><X size={20} /></button>
                </div>

                <div className="p-5 overflow-y-auto bg-[#F8F9FB] flex-1">
                    <div ref={quoteRef} className="space-y-4">
                        
                        <div className='bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50'>
                             <div className='flex justify-between items-start mb-4'>
                                <div className='flex items-center gap-1.5'>
                                    {(minimumFeeApplied || label) && (
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md text-white shadow-sm relative overflow-hidden ${minimumFeeApplied ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                                            <span className="relative z-10">{minimumFeeApplied ? '최소비용' : label}</span>
                                            <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)' }}></div>
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* 가격 표시 영역 - 트렌디한 디자인 */}
                            <div className="text-center py-2">
                                {(isDiscountApplied || minimumFeeApplied) && (priceBeforeAllDiscount > price) && (
                                    <div className="text-sm text-slate-400 line-through font-medium mb-1">
                                        {priceBeforeAllDiscount.toLocaleString()}원
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {price.toLocaleString()}
                                    </span>
                                    <span className="text-lg font-bold text-slate-500 mt-2">원</span>
                                </div>
                            </div>
                            
                            {(minimumFeeApplied || isDiscountApplied) && (
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    {minimumFeeApplied && <div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Info size={12} /> 최소 시공비(20만원) 적용됨</div>}
                                    
                                    {isDiscountApplied && (
                                        <div className="space-y-1.5">
                                            <div className="text-xs text-slate-600 flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg">
                                                <CheckCircle2 size={14} className="text-indigo-600 shrink-0"/>
                                                <span className="font-medium">변기테두리, 바닥테두리 서비스 포함</span>
                                            </div>
                                            <div className="text-xs text-slate-600 flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg">
                                                <CheckCircle2 size={14} className="text-indigo-600 shrink-0"/>
                                                <span className="font-medium">젠다이 실리콘 오염방지코팅 서비스 포함</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {packageItems.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">상세 내역</h4>
                                <div className='space-y-3'>
                                    {packageItems.map((item, index) => {
                                        const areaInfo = ALL_AREAS.find(a => a.id === item.id);
                                        
                                        let badgeClass = 'bg-slate-100 text-slate-500';
                                        if (item.materialLabel === '에폭시') badgeClass = 'bg-amber-100 text-amber-700';
                                        else if (item.materialLabel === '폴리아스파틱') badgeClass = 'bg-indigo-50 text-indigo-600';
                                        else if (item.materialLabel === '실리콘') badgeClass = 'bg-emerald-50 text-emerald-600';

                                        return (
                                            <div key={index} className='flex justify-between items-center text-sm'>
                                                <div className="flex flex-col">
                                                    <span className='font-bold text-slate-700'>{item.label}</span>
                                                    <span className={`text-[10px] font-semibold w-fit px-1.5 py-0.5 rounded mt-0.5 ${badgeClass}`}>
                                                        {item.materialLabel}
                                                    </span>
                                                </div>
                                                <span className='font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg text-xs'>{item.quantity}{areaInfo ? areaInfo.unit : '개소'}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {discountItems.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">할인 내역</h4>
                                <div className='space-y-2'>
                                    {discountItems.map((item, index) => (
                                        <div key={index} className='flex justify-between items-center'>
                                            <div className='flex items-center gap-1.5 text-xs font-medium text-slate-600'>
                                                <Gift size={12} className='text-rose-500'/> {item.label}
                                            </div>
                                            <div className='font-bold text-xs text-rose-500'>-{item.originalPrice.toLocaleString()}원</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => toggleReview('soomgo_review')}
                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${isSoomgoReviewApplied ? 'bg-rose-50/50 border-rose-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSoomgoReviewApplied ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Star size={16} fill={isSoomgoReviewApplied ? "currentColor" : "none"} />
                                </div>
                                <div className="text-left">
                                    <div className={`text-sm font-bold ${isSoomgoReviewApplied ? 'text-rose-700' : 'text-slate-700'}`}>{soomgoReviewEvent.label}</div>
                                    <div className="text-xs text-rose-500 font-semibold mt-0.5">20,000원 추가 할인 혜택</div>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSoomgoReviewApplied ? 'border-rose-500 bg-rose-500' : 'border-slate-300'}`}>
                                {isSoomgoReviewApplied && <Check size={12} className="text-white" strokeWidth={4} />}
                            </div>
                        </button>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed">
                        * 타일크기 바닥 30x30cm, 벽 30x60cm 기준<br/>
                        * 구축(거주중)의 경우 그라인딩 작업으로 소음/분진이 발생할 수 있습니다.
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 shrink-0">
                     <a
                        href={KAKAO_CHAT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 bg-[#FAE100] text-[#371D1E] rounded-xl font-bold hover:brightness-95 transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                        <Layers size={18} /> 카카오톡 상담
                    </a>
                    <a
                        href={`tel:${PHONE_NUMBER}`}
                        className="py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                       <Phone size={18} /> 상담원 연결
                    </a>
                </div>
            </div>
        </div>
    );
};

const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
            <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900"><Info className="h-5 w-5 text-indigo-500" /> 소재 선택 가이드</h3>
              <button onClick={onClose} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-[#F8F9FB]">
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 rounded-3xl bg-white shadow-soft border border-slate-100 text-center relative group overflow-hidden">
                         <div className="absolute top-0 inset-x-0 h-1 bg-slate-200"></div>
                        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Standard</div>
                        <div className="text-xl font-black text-slate-800 mb-4">폴리</div>
                        <ul className="text-xs text-slate-600 space-y-2 text-left">
                            <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 우수한 광택감</li>
                            <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 합리적인 비용</li>
                            <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 6시간 빠른양생</li>
                        </ul>
                    </div>
                    <div className="p-5 rounded-3xl bg-white shadow-soft border border-indigo-100 text-center relative group overflow-hidden ring-1 ring-indigo-50">
                        <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500"></div>
                        <div className="absolute top-3 right-3 text-indigo-600">
                             <Crown size={16} fill="currentColor" className="opacity-20"/>
                        </div>
                        <div className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wide">Premium</div>
                        <div className="text-xl font-black text-slate-800 mb-4">에폭시</div>
                        <ul className="text-xs text-slate-600 space-y-2 text-left">
                            <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> 반영구적 수명</li>
                            <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> 고급 무광택</li>
                            <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> 강력한 방수</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-center font-bold text-slate-500 text-xs">구분</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-700 text-xs">폴리아스파틱</th>
                                <th className="px-4 py-3 text-center font-bold text-indigo-600 text-xs">에폭시</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            <tr>
                                <td className="px-4 py-3 text-center font-medium text-slate-400 text-xs">내구성</td>
                                <td className="px-4 py-3 text-center text-slate-600 text-xs">우수 (5년+)</td>
                                <td className="px-4 py-3 text-center font-bold text-indigo-600 text-xs">반영구</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-center font-medium text-slate-400 text-xs">광택</td>
                                <td className="px-4 py-3 text-center text-slate-600 text-xs">유광</td>
                                <td className="px-4 py-3 text-center font-bold text-indigo-600 text-xs">무광/무펄</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-center font-medium text-slate-400 text-xs">시공시간</td>
                                <td className="px-4 py-3 text-center font-bold text-blue-600 text-xs">4~6시간</td>
                                <td className="px-4 py-3 text-center text-slate-600 text-xs">1~2일</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                        <CheckCircle2 size={16} className="text-indigo-500"/> 나에게 맞는 소재는?
                    </h4>
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-3">
                         <div className="shrink-0 mt-0.5"><ThumbsUp size={16} className="text-slate-400"/></div>
                         <div>
                            <div className="font-bold text-slate-700 text-sm mb-1">폴리아스파틱 추천</div>
                            <p className="text-xs text-slate-500 leading-snug">전/월세 등 단기 거주 예정이시거나, 빠른 시공과 가성비를 중요하게 생각하시는 분께 적합합니다.</p>
                         </div>
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shadow-sm flex gap-3">
                         <div className="shrink-0 mt-0.5"><Crown size={16} className="text-indigo-500"/></div>
                         <div>
                            <div className="font-bold text-indigo-700 text-sm mb-1">에폭시 추천</div>
                            <p className="text-xs text-indigo-600/80 leading-snug">자가 거주로 5년 이상 계획하시거나, 호텔 같은 고급스러운 인테리어 효과를 원하시는 분께 적합합니다.</p>
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
                <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg active:scale-[0.98]">확인했습니다</button>
            </div>
          </div>
        </div>
);

const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`pr-4 leading-relaxed font-bold transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-700 group-hover:text-slate-900'}`}>{question}</span>
                <ChevronDown size={20} className={`text-slate-300 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="text-sm text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl">
                        {answer}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ColorPalette = ({ selectedColorId, onSelect, onTileImageUpload, tileImageURL, brightnessLevel, onBrightnessChange, onTileImageReset }) => {
    const baseColorData = GROUT_COLORS.find(c => c.id === selectedColorId) || GROUT_COLORS[0];
    const GROUT_LINE_WIDTH = 12;
    const [showCameraHint, setShowCameraHint] = useState(false);
    const simulationRef = useRef(null);

    const effectiveTileImageURL = (tileImageURL && tileImageURL !== DEFAULT_TILE_IMAGE_URL) ? tileImageURL : DEFAULT_TILE_IMAGE_URL;

    const effectiveGroutColor = useMemo(() => {
        const baseHex = baseColorData.code;
        const level = brightnessLevel / 50;
        if (level === 0) return baseHex;
        const weight = Math.abs(level);
        return mixColors(baseHex, level > 0 ? BRIGHT_COLOR_CODE : DARK_COLOR_CODE, weight);
    }, [baseColorData.code, brightnessLevel]);

    const sliderTrackStyle = useMemo(() => ({
        backgroundImage: `linear-gradient(to right, ${DARK_COLOR_CODE}, ${baseColorData.code}, ${BRIGHT_COLOR_CODE})`
    }), [baseColorData.code]);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShowCameraHint(true);
            }
        }, { threshold: 0.6 });

        if (simulationRef.current) observer.observe(simulationRef.current);
        return () => observer.disconnect();
    }, []);


    return (
        <div className='mt-8 pt-8 border-t border-slate-100'>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-5 text-slate-900">
                <Palette className="h-5 w-5 text-indigo-500" /> 색상 미리보기
            </h3>

            {/* 1. 시뮬레이션 화면 */}
            <div ref={simulationRef} className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-6 bg-slate-100 group aspect-video mx-auto max-w-md">
                <div className="w-full h-full relative bg-slate-200">
                    <div className="absolute inset-0 transition-all duration-500" style={{ backgroundImage: `url(${effectiveTileImageURL})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }}></div>
                    <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url(/logo.png)', backgroundSize: '30%', backgroundRepeat: 'repeat', zIndex: 5 }}></div>
                    
                    {/* 줄눈 라인 */}
                    <div className="absolute top-0 bottom-0 left-1/2 shadow-sm" style={{ width: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, transform: 'translateX(-50%)', zIndex: 10, mixBlendMode: 'normal', opacity: 0.9 }}></div>
                    <div className="absolute left-0 right-0 top-1/2 shadow-sm" style={{ height: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, transform: 'translateY(-50%)', zIndex: 10, mixBlendMode: 'normal', opacity: 0.9 }}></div>
                    
                    {/* 광택 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20"></div>
                </div>
                
                 {/* 사진 업로드 버튼 */}
                 <div className="absolute bottom-4 right-4 z-30">
                     <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} style={{ display: 'none' }} />
                    <label htmlFor="tileFileInput" className="p-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full cursor-pointer shadow-lg transition flex items-center justify-center">
                        <Camera size={18} />
                    </label>
                 </div>

                 {/* 스마트 카메라 힌트 */}
                 {showCameraHint && tileImageURL === DEFAULT_TILE_IMAGE_URL && (
                    <div className="absolute bottom-16 right-4 z-40 animate-bounce transition-opacity duration-500 pointer-events-none">
                        <div className="bg-indigo-600 text-white text-[11px] font-bold px-4 py-2 rounded-2xl shadow-xl relative">
                            ✨ 우리집 타일을 찍어서 확인해보세요!
                            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-indigo-600 rotate-45 transform"></div>
                        </div>
                    </div>
                 )}

                 {tileImageURL !== DEFAULT_TILE_IMAGE_URL && (
                     <button onClick={onTileImageReset} className="absolute bottom-4 right-16 z-30 p-2.5 bg-white/80 hover:bg-white backdrop-blur-md text-slate-700 rounded-full cursor-pointer shadow-lg transition flex items-center justify-center">
                         <RefreshCw size={18} />
                     </button>
                 )}
            </div>

            {/* 2. Tone & Mood 슬라이더 */}
            <div className='mb-6 p-5 bg-white rounded-3xl shadow-soft border border-slate-100/50'>
                <div className='flex items-center justify-between mb-4'>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-4 border-white shadow-md transition-colors duration-300" style={{backgroundColor: effectiveGroutColor}}></div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Color</div>
                            <div className="text-sm font-black text-slate-800">{baseColorData.label}</div>
                        </div>
                     </div>
                </div>
                <div className='flex items-center gap-4'>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Dark</span>
                    <input
                        type="range" min="-50" max="50" step="10"
                        value={brightnessLevel}
                        onChange={(e) => onBrightnessChange(Number(e.target.value))}
                        className="flex-1 h-3 rounded-full appearance-none cursor-pointer"
                        style={sliderTrackStyle}
                    />
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Light</span>
                </div>
            </div>

            {/* 4. 색상 선택 그리드 */}
            <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100/50">
                <div className="text-xs font-bold text-slate-400 mb-3 ml-1">컬러 선택</div>
                <div className='grid grid-cols-5 gap-3'>
                    {GROUT_COLORS.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => { onSelect(color.id); onBrightnessChange(0); }}
                            className={`aspect-square rounded-2xl shadow-sm transition-all duration-300 relative group overflow-hidden ${
                                selectedColorId === color.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 z-10 shadow-md' : 'hover:scale-105 hover:shadow-md'
                            }`}
                            style={{ backgroundColor: color.code }}
                        >
                            {selectedColorId === color.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                                    <CheckCircle2 size={24} className={`${color.isDark ? 'text-white' : 'text-slate-900'} drop-shadow-md`} strokeWidth={2.5} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
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
    const [quantities, setQuantities] = useState([...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {}));
    const [areaMaterials, setAreaMaterials] = useState([...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 'poly' }), {}));
    const [selectedReviews, setSelectedReviews] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(YOUTUBE_VIDEOS[0].id);
    const quoteRef = useRef(null);
    const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';

    useEffect(() => {
        if (quantities['entrance'] > 0 && areaMaterials['entrance'] !== 'poly') {
            setAreaMaterials(prev => ({ ...prev, 'entrance': 'poly' }));
        }
    }, [quantities['entrance']]);

    // ⭐️ 수량 변경 핸들러
    const handleQuantityChange = useCallback((id, delta) => {
        setQuantities(prev => {
            const currentQty = prev[id] || 0;
            let newQty = Math.max(0, currentQty + delta);
            const newQuantities = { ...prev, [id]: newQty };
            if (newQty > 0) {
                if (id === 'master_bath_wall' && (newQuantities['shower_booth'] || 0) > 0) newQuantities['shower_booth'] = 0;
                if (id === 'common_bath_wall' && (newQuantities['bathtub_wall'] || 0) > 0) newQuantities['bathtub_wall'] = 0;
                if (id === 'shower_booth' && (newQuantities['master_bath_wall'] || 0) > 0) newQuantities['master_bath_wall'] = 0;
                if (id === 'bathtub_wall' && (newQuantities['common_bath_wall'] || 0) > 0) newQuantities['common_bath_wall'] = 0;
            }
            
            const prevFloorCount = (prev['master_bath_floor'] || 0) + (prev['common_bath_floor'] || 0);
            const newFloorCount = (newQuantities['master_bath_floor'] || 0) + (newQuantities['common_bath_floor'] || 0);

            if (newFloorCount >= 2 && newQuantities['entrance'] === 0) { 
                newQuantities['entrance'] = 1; 
            }
            else if (newFloorCount < 2 && prevFloorCount >= 2 && prev['entrance'] === 1 && newQuantities['entrance'] === 1) {
                if (newQuantities['entrance'] === 1) { newQuantities['entrance'] = 0; }
            }
            return newQuantities;
        });
    }, []);

    const handleAreaMaterialChange = useCallback((id, mat) => {
        if (id === 'entrance') { setAreaMaterials(prev => ({ ...prev, [id]: 'poly' })); }
        else { setAreaMaterials(prev => ({ ...prev, [id]: mat })); }
    }, []);

    const toggleReview = useCallback((id) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    }, []);

    const getSelectionSummary = useCallback((q, areaMats) => {
        const summary = {};
        for (const id in q) {
            const qty = q[id];
            if (qty > 0) {
                const mat = (id === 'entrance') ? 'poly' : areaMats[id];
                const matKey = (mat === 'poly') ? 'poly' : 'kerapoxy';
                if (!summary[matKey]) summary[matKey] = {};
                summary[matKey][id] = qty;
            }
        }
        if (q['entrance'] > 0) {
            if (!summary['poly']) summary['poly'] = {};
            summary['poly']['entrance'] = q['entrance'];
            if(summary['kerapoxy'] && summary['kerapoxy']['entrance']) delete summary['kerapoxy']['entrance'];
        }
        return summary;
    }, []);

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

        const virtualPolyFloors = (filteredPolySelections['master_bath_floor'] || 0) + (filteredPolySelections['common_bath_floor'] || 0);
        const virtualEpoxyFloors = (filteredEpoxySelections['master_bath_floor'] || 0) + (filteredEpoxySelections['common_bath_floor'] || 0);
        
        if (virtualPolyFloors > 0) filteredPolySelections['bathroom_floor'] = virtualPolyFloors;
        if (virtualEpoxyFloors > 0) filteredEpoxySelections['bathroom_floor'] = virtualEpoxyFloors;

        const totalSelectedCount = Object.values(filteredPolySelections).reduce((sum, v) => sum + v, 0) +
                                   Object.values(filteredEpoxySelections).reduce((sum, v) => sum + v, 0) 
                                   - (virtualPolyFloors > 0 ? virtualPolyFloors : 0)
                                   - (virtualEpoxyFloors > 0 ? virtualEpoxyFloors : 0);

        if (totalSelectedCount === 0) return null;
        const sortedPackages = MIXED_PACKAGES;

        for (const pkg of sortedPackages) {
            let tempPolySelections = { ...filteredPolySelections };
            let tempEpoxySelections = { ...filteredEpoxySelections };
            let appliedAutoEntrance = false;

            const pkgAreaIds = getPackageAreaIds(pkg);
            const usesGenericFloor = pkgAreaIds.includes('bathroom_floor');
            
            if (usesGenericFloor) {
                delete tempPolySelections['master_bath_floor'];
                delete tempPolySelections['common_bath_floor'];
                delete tempEpoxySelections['master_bath_floor'];
                delete tempEpoxySelections['common_bath_floor'];
            } else {
                delete tempPolySelections['bathroom_floor'];
                delete tempEpoxySelections['bathroom_floor'];
            }

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
                    flexibleMatch = flexibleSelectedEpoxyCount === 1 && flexibleSelectedEpoxyCount === 0;
                    if (flexibleMatch) {
                        const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempEpoxySelections[id] > 0);
                        if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                        if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                    }
                }

                if (baseMatch && flexibleMatch) {
                    return { ...pkg, autoEntrance: appliedAutoEntrance };
                }
                continue;
            }

            let isMatch = true;
            for (const [id, requiredQty] of pkg.P_areas) {
                if ((tempPolySelections[id] || 0) !== requiredQty) {
                    isMatch = false; break;
                }
            }
            if (!isMatch) continue;

            for (const [id, requiredQty] of pkg.E_areas) {
                if ((tempEpoxySelections[id] || 0) !== requiredQty) {
                    isMatch = false; break;
                }
            }
            if (!isMatch) continue;

            const selectedAreaIds = new Set([
                ...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), 
                ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)
            ]);
            const packageAreaIdsSet = new Set(getPackageAreaIds(pkg));
            
            const isIdSetMatch = selectedAreaIds.size === packageAreaIdsSet.size &&
                                     [...selectedAreaIds].every(id => packageAreaIdsSet.has(id));

            if (isIdSetMatch) {
                return { ...pkg, autoEntrance: appliedAutoEntrance };
            }
        }
        return null;
    }, []);

    const calculation = useMemo(() => {
          const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
        let itemizedPrices = [];

        const selectionSummary = getSelectionSummary(quantities, areaMaterials);
        const matchedPackageResult = findMatchingPackage(selectionSummary, quantities);
        const matchedPackage = matchedPackageResult ? matchedPackageResult : null;

        let q = { ...quantities };
        let total = 0;
        let labelText = null;
        let isPackageActive = false;
        let isFreeEntrance = false;
        let totalAreaCount = Object.values(quantities).some(v => v > 0) ? Object.keys(quantities).filter(k => quantities[k] > 0).length : 0;
        
        let totalBathroomFloorCount = (q['master_bath_floor'] || 0) + (q['common_bath_floor'] || 0);

        let packageAreas = [];

        if (matchedPackage) {
            total = matchedPackage.price;
            isPackageActive = true;
            labelText = '패키지 할인 적용';
            packageAreas = getPackageAreaIds(matchedPackage);
            
            packageAreas.forEach(id => { 
                if (id === 'bathroom_floor') {
                    q['master_bath_floor'] = 0;
                    q['common_bath_floor'] = 0;
                } else {
                    q[id] = 0; 
                }
            });

            if (quantities['entrance'] >= 1) {
                isFreeEntrance = true;
                q['entrance'] = 0;
            }
        }

        if (totalBathroomFloorCount >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
            isFreeEntrance = true;
            isPackageActive = true;
            labelText = '현관 서비스 적용';
            q['entrance'] = 0;
        }

        let priceBeforeAllDiscount = 0;

        ALL_AREAS.forEach(area => {
            const initialCount = quantities[area.id] || 0;
            if (initialCount === 0) return;
            const count = q[area.id] || 0;
            const areaMatId = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
            const isEpoxy = areaMatId === 'kerapoxy';

            const priceKey = areaMatId === 'poly' ? 'poly' : 'epoxy';

            let originalPriceFromConst = (ORIGINAL_PRICES[area.id] && ORIGINAL_PRICES[area.id][priceKey] !== undefined)
                ? ORIGINAL_PRICES[area.id][priceKey]
                : (area.basePrice * (isEpoxy ? MATERIALS.find(m => m.id === 'kerapoxy').priceMod : 1.0) * selectedHousing.multiplier);

            let itemOriginalTotal = originalPriceFromConst * initialCount;
            priceBeforeAllDiscount += itemOriginalTotal; 

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
            } else if (area.id === 'silicon_kitchen_top') {
                finalUnitBasePrice = 50000;
            }

            const calculatedPricePerUnit = Math.floor(finalUnitBasePrice * selectedHousing.multiplier);
            let finalCalculatedPrice = 0;
            let finalDiscount = 0;
            let isFreeServiceItem = false;
            
            let packageCount = initialCount - count;

            let isPackageItemFlag = false;

            const isAreaInPackage = packageAreas.includes(area.id) || (area.id.includes('bath_floor') && packageAreas.includes('bathroom_floor'));

            if ((matchedPackage || isFreeEntrance) && isAreaInPackage && count === 0) {
                 finalCalculatedPrice = 0;
                 finalDiscount = itemOriginalTotal; 
                 isFreeServiceItem = area.id === 'entrance' || isAreaInPackage;
                 isPackageItemFlag = true; 
            }
            else if (area.id === 'entrance' && isFreeEntrance && !matchedPackage && count === 0) {
                finalCalculatedPrice = 0;
                finalDiscount = itemOriginalTotal; 
                isFreeServiceItem = true;
                isPackageItemFlag = true; 
            }
            else {
                let remainingCalculatedPrice = calculatedPricePerUnit * count;
                let remainingDiscount = 0;

                if (area.id === 'silicon_bathtub' && totalAreaCount >= 3) {
                    const nonPackageOriginalPrice = 80000 * count;
                    const fixedPriceForRemaining = 50000 * count;
                    if (count > 0) {
                        remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                        remainingCalculatedPrice = fixedPriceForRemaining;
                        isPackageItemFlag = true; 
                    }
                } else if (area.id === 'silicon_living_baseboard' && totalAreaCount >= 3) {
                    const nonPackageOriginalPrice = 400000 * count;
                    const fixedPriceForRemaining = 350000 * count;
                    if (count > 0) {
                        remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                        remainingCalculatedPrice = fixedPriceForRemaining;
                        isPackageItemFlag = true;
                    }
                } else if (area.id === 'silicon_sink') {
                    remainingCalculatedPrice = 30000 * count;
                }
                finalCalculatedPrice = remainingCalculatedPrice;
                finalDiscount = remainingDiscount;
                total += finalCalculatedPrice;
            }

            finalCalculatedPrice = Math.floor(finalCalculatedPrice / 1000) * 1000;
            itemOriginalTotal = Math.floor(itemOriginalTotal / 1000) * 1000;
            finalDiscount = Math.floor(finalDiscount / 1000) * 1000;

            itemizedPrices.push({
                id: area.id,
                label: area.label,
                quantity: initialCount, 
                unit: area.unit,
                originalPrice: itemOriginalTotal, 
                calculatedPrice: finalCalculatedPrice,
                discount: finalDiscount,
                isFreeService: isFreeServiceItem,
                isPackageItem: isPackageItemFlag || !isFreeServiceItem && (isPackageActive || finalDiscount > 0),
                isDiscount: false,
                materialLabel: ['silicon_bathtub', 'silicon_kitchen_top', 'silicon_living_baseboard'].includes(area.id) 
                    ? '실리콘' 
                    : (areaMatId === 'poly' ? '폴리아스파틱' : '에폭시')
            });
        });

        let discountAmount = 0;
        REVIEW_EVENTS.forEach(evt => {
            if (selectedReviews.has(evt.id)) {
                discountAmount += evt.discount;
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
            labelText = '현관 서비스 적용';
        } else if (matchedPackage) {
            labelText = '패키지 할인 적용';
        }

        return {
            price: finalPrice,
            originalCalculatedPrice,
            priceBeforeAllDiscount: Math.floor(priceBeforeAllDiscount / 1000) * 1000, 
            label: labelText,
            isPackageActive: isPackageActive || isFreeEntrance,
            isFreeEntrance: isFreeEntrance,
            discountAmount: priceBeforeAllDiscount - finalPrice, 
            minimumFeeApplied,
            itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount),
        };
    }, [quantities, selectedReviews, housingType, areaMaterials, getSelectionSummary, findMatchingPackage]);

    const handleTileImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => { setTileImageURL(reader.result); };
            reader.readAsDataURL(file);
        }
    };
    const handleTileImageReset = useCallback(() => { setTileImageURL(DEFAULT_TILE_IMAGE_URL); }, []);

    const selectedMaterialData = MATERIALS.find(m => m.id === material);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    const hasSelections = Object.values(quantities).some(v => v > 0);
    const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
    const currentEmbedUrl = getEmbedUrl(currentVideo.id);

    const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => {
        if (areaId === 'entrance') {
            return (
                <div className='mt-4 pt-3 border-t border-slate-50 flex items-center justify-center'>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Check size={10}/> 현관은 폴리아스파틱 적용
                     </span>
                </div>
            );
        }
        if (['silicon_bathtub', 'silicon_kitchen_top', 'silicon_living_baseboard'].includes(areaId)) {
            return (
                <div className='mt-4 pt-3 border-t border-slate-50 flex items-center justify-center'>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Check size={10}/> 실리콘 전용 소재
                    </span>
                </div>
            );
        }
        return (
            <div className={`mt-4 pt-3 border-t border-slate-50 ${isQuantitySelected ? 'animate-slide-down' : ''}`}>
                <div className='flex gap-2 bg-slate-50 p-1 rounded-xl'>
                    {MATERIALS.map(mat => (
                        <button
                            key={mat.id}
                            onClick={(e) => { e.stopPropagation(); onChange(areaId, mat.id); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative
                                ${currentMat === mat.id
                                    ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {mat.label.split('(')[0].trim()}
                            {currentMat === mat.id && (
                                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${mat.id === 'poly' ? 'bg-indigo-500' : 'bg-amber-500'}`}></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderAreaList = (areas) => (
        <div className="grid grid-cols-1 gap-4">
            {areas.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
                
                const totalBathroomFloor = (quantities['master_bath_floor'] || 0) + (quantities['common_bath_floor'] || 0);
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && totalBathroomFloor >= 2 && !calculation.isPackageActive;
                
                const description = area.desc || area.basePrice ? ((area.desc && area.desc.trim() !== '') ? (<div className="text-[10px] text-indigo-500 mt-1 font-medium">{area.desc}</div>) : null) : null;

                return (
                    <div key={area.id} className={`flex flex-col p-5 rounded-3xl transition-all duration-300 relative overflow-hidden group ${isSelected ? 'bg-white ring-2 ring-indigo-500/10 shadow-glow z-10' : 'bg-white shadow-soft border border-transparent hover:border-slate-100'}`}>
                        {/* 배경 효과 */}
                        {isSelected && <div className="absolute inset-0 bg-indigo-50/20 pointer-events-none"></div>}

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300 group-hover:text-indigo-400 group-hover:bg-indigo-50'}`}>
                                    <Icon size={22} strokeWidth={2} />
                                </div>
                                <div>
                                    <div className={`font-bold text-base transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{area.label}</div>
                                    {description}
                                </div>
                            </div>
                            
                            {/* 트렌디한 카운터 UI */}
                            <div className={`flex items-center gap-1 rounded-full p-1 transition-all duration-300 ${isSelected ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                                <button
                                    onClick={() => handleQuantityChange(area.id, -1)}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-all active:scale-90 ${quantities[area.id] > 0 ? 'bg-white shadow-sm text-slate-800 hover:text-red-500' : 'text-slate-300'}`}
                                >-</button>
                                <span className={`w-8 text-center text-sm font-black ${quantities[area.id] > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                                <button
                                    onClick={() => { handleQuantityChange(area.id, 1); if (quantities[area.id] === 0) handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material); }}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-all active:scale-90 ${quantities[area.id] > 0 ? 'bg-indigo-500 text-white shadow-md' : 'bg-white shadow-sm text-slate-400 hover:text-indigo-600'}`}
                                >+</button>
                            </div>
                        </div>
                        {isSelected && (
                            <MaterialSelectButtons areaId={area.id} currentMat={currentMat} onChange={handleAreaMaterialChange} isQuantitySelected={isSelected} />
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className={`min-h-screen bg-[#F8F9FB] font-sans pb-48 selection:bg-indigo-100 selection:text-indigo-900`}>
            <GlobalStyles />

            <header className="sticky top-0 z-40 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-slate-100/50">
                 <ReservationTicker variant="top-bar" />
                <div className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            줄눈의미학<span className="text-indigo-600 text-[10px] font-bold ml-1 align-top">PRO</span>
                        </h1>
                    </div>
                    <div className='flex gap-2'>
                        <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition active:scale-90">
                            <Phone size={18} />
                        </button>
                        <button onClick={() => window.location.reload()} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition active:scale-90">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-5 space-y-10">
                
                <section className="animate-fade-in">
                    <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-soft mb-4 aspect-video relative group">
                        <iframe key={currentVideo.id} width="100%" height="100%" src={currentEmbedUrl} title={currentVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0 opacity-90 group-hover:opacity-100 transition-opacity duration-500"></iframe>
                    </div>

                    <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex gap-1">
                        {YOUTUBE_VIDEOS.map((video) => (
                            <button
                                key={video.id}
                                onClick={() => setActiveVideoId(video.id)}
                                className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 ${activeVideoId === video.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <PlayCircle size={14} className={activeVideoId === video.id ? "text-amber-400" : "text-slate-400"} fill={activeVideoId === video.id ? "currentColor" : "none"}/>
                                {video.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="animate-fade-in delay-200">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200">1</span>
                        소재를 선택해주세요
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {MATERIALS.map((item) => {
                            const isSelected = item.id === material;
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setMaterial(item.id)} 
                                    className={`relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-300 group flex flex-col justify-between
                                        ${isSelected 
                                            ? 'ring-2 ring-indigo-500 shadow-xl bg-white scale-[1.02]' 
                                            : 'bg-white border border-slate-100 shadow-soft hover:shadow-md hover:-translate-y-1'
                                        }`}
                                >
                                    <div className="p-5 relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 bg-slate-50'}`}>
                                                {isSelected && <Check size={12} strokeWidth={4} />}
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-md ${item.id === 'poly' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                                {item.badge}
                                            </span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className={`font-black text-lg block mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</span>
                                            <p className="text-xs text-slate-400 leading-snug">{item.description}</p>
                                        </div>

                                        <div className={`transition-all duration-300 overflow-hidden ${isSelected ? 'max-h-20 opacity-100 mt-auto pt-2' : 'max-h-0 opacity-0'}`}>
                                            <div className="bg-slate-50 rounded-xl p-1 flex gap-1">
                                                {item.id === 'poly' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); setPolyOption('pearl'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${polyOption === 'pearl' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>펄</button>
                                                        <button onClick={(e) => { e.stopPropagation(); setPolyOption('no_pearl'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${polyOption === 'no_pearl' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>무펄</button>
                                                    </>
                                                )}
                                                {item.id === 'kerapoxy' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('starlike'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${epoxyOption === 'starlike' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400'}`}>스타라이크</button>
                                                        <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('kerapoxy'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${epoxyOption === 'kerapoxy' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400'}`}>케라폭시</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={() => setShowMaterialModal(true)} className="w-full mt-4 py-3.5 bg-white border border-slate-100 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-50 hover:text-slate-700 transition shadow-soft flex items-center justify-center gap-2 group">
                        <HelpCircle size={16} className='text-slate-400 group-hover:text-indigo-500 transition-colors'/> 소재 차이가 궁금하신가요?
                        <ChevronRight size={14} className='text-slate-300'/>
                    </button>

                    <ColorPalette
                        selectedColorId={selectedGroutColor} onSelect={setSelectedGroutColor}
                        onTileImageUpload={handleTileImageUpload} tileImageURL={tileImageURL}
                        brightnessLevel={brightnessLevel} onBrightnessChange={setBrightnessLevel}
                        onTileImageReset={handleTileImageReset}
                    />
                </section>

                <section className="animate-fade-in delay-300 pt-8 border-t border-slate-200/50">
                     <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200">2</span>
                        시공 범위를 선택해주세요
                    </h2>

                    <div className="bg-indigo-50 rounded-3xl p-5 border border-indigo-100 shadow-sm flex flex-col gap-3 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/30 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex items-center gap-3 relative z-10">
                             <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600">
                                <ShieldCheck size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-indigo-900">신축·구축 동일 정가제</div>
                                <div className="text-xs text-indigo-600/70 mt-0.5">바닥 30X30cm, 벽 30X60cm 타일크기 기준</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-2 mb-4'>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Bathroom</span>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    {renderAreaList(BATHROOM_AREAS)}

                    <div className='flex items-center gap-2 mb-4 mt-10'>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Living & Kitchen</span>
                         <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    {renderAreaList(OTHER_AREAS)}
                </section>

                   <section className="animate-fade-in delay-500 pt-8 border-t border-slate-200/50">
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200">3</span>
                        실리콘 리폼
                    </h2>
                    {renderAreaList(SILICON_AREAS)}
                </section>

                <section className="bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 animate-fade-in delay-700">
                    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-indigo-500"/> 자주 묻는 질문
                    </h2>
                    <div className="space-y-1">
                        {FAQ_ITEMS.map((item, index) => <Accordion key={index} question={item.question} answer={item.answer} />)}
                    </div>
                </section>

                <button
                    onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
                    className="w-full py-5 rounded-[2rem] bg-white text-slate-900 font-bold text-base hover:bg-slate-50 transition shadow-soft border border-slate-200 flex items-center justify-center gap-2 active:scale-95 group"
                >
                    <div className="bg-amber-100 p-1.5 rounded-full text-amber-500 group-hover:bg-amber-400 group-hover:text-white transition-colors">
                        <Star size={18} fill="currentColor" />
                    </div>
                    실제 고객 후기 보러가기 <span className="text-slate-400 font-normal text-sm">(5.0점)</span>
                </button>
            </main>

            {/* ⭐️ [최종 수정] 하단 견적 바 (Bottom Sheet) */}
            {hasSelections && (
                <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
                    <div className="max-w-lg mx-auto">
                        <div className="bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-100 px-6 pt-5 pb-10 rounded-t-3xl safe-area-bottom">
                            <div className='flex items-center justify-between mb-5'>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimate</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{calculation.price.toLocaleString()}</span>
                                        <span className="text-lg font-bold text-slate-400">원</span>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end gap-1'>
                                    {calculation.minimumFeeApplied && (
                                        <div className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                                            최소 출장비 적용
                                        </div>
                                    )}
                                    {calculation.label && !calculation.minimumFeeApplied && (
                                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                                            <Sparkles size={10} fill="currentColor"/> {calculation.label}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <button
                                    onClick={() => { setShowModal(true); }}
                                    className="h-14 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-slate-200"
                                >
                                    <List size={20} /> 견적서 확인
                                </button>
                                <a
                                    href={KAKAO_CHAT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-14 rounded-2xl font-bold text-[#371D1E] bg-[#FAE100] hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-yellow-100"
                                >
                                    <Layers size={20} /> 카톡상담
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
            {showModal && (
                <QuoteModal
                    calculation={calculation}
                    onClose={() => setShowModal(false)}
                    quoteRef={quoteRef}
                    selectedReviews={selectedReviews}
                    toggleReview={toggleReview}
                />
            )}
        </div>
    );
}