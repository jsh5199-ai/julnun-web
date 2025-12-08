import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
    CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon, Download, DollarSign, List, Layers, Check, ShieldCheck, Ruler, Settings, ThumbsUp, MoveHorizontal, Bell, Share2, Camera
} from 'lucide-react';

// =================================================================
// ⭐️ 상수 및 데이터 (비즈니스 로직 유지)
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
// 💎 4K Premium Global Styles (고화질 스타일)
// =================================================================
const GlobalStyles = () => (
    <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body { 
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; 
            background-color: #f1f5f9; 
            -webkit-font-smoothing: antialiased; 
            -moz-osx-font-smoothing: grayscale;
        }
        
        ::-webkit-scrollbar { display: none; }
        
        @keyframes gentle-fade-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes premium-slide-up { 
            from { transform: translateY(100%); opacity: 0; } 
            to { transform: translateY(0); opacity: 1; } 
            animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes pulse-subtle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }

        .animate-premium-in { animation: gentle-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-premium { animation: premium-slide-up 0.5s forwards; }

        .card-premium-hover {
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-premium-hover:active { transform: scale(0.98); }

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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-top: -10px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:active { transform: scale(1.1); }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            border-radius: 2px;
        }
        
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
        description: '우수한 광택과 합리적인 가격의 스탠다드 소재',
        badge: 'STANDARD', badgeColor: 'bg-slate-100 text-slate-600'
    },
    {
        id: 'kerapoxy', label: '에폭시', priceMod: 1.8,
        description: '반영구적인 내구성과 고급스러운 무광 텍스처',
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
        "인천 연수구 박**님 12월 22일 예약이 완료되었습니다.",
        "인천 서구 한**님 12월 23일 예약이 완료되었습니다.",
        "경기 성남시 이**님 2월 13일 예약이 완료되었습니다.",
        "경기 용인시 하**님 12월 18일 예약이 완료되었습니다.",
        "서울 양천구 오**님 12월 14일 예약이 완료되었습니다.",
        "서울 송파구 김**님 1월 26일 예약이 완료되었습니다.",
        "서울 송파구 임**님 1월 14일 예약이 완료되었습니다.",
        "경기 시흥시 이**님 12월 11일 예약이 완료되었습니다."
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

    // ⭐️ Top Bar Variant (헤더 상단)
    if (variant === 'top-bar') {
        return (
            <div className="w-full bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border-b border-indigo-100/50 py-2.5 flex justify-center items-center overflow-hidden relative z-40">
                <div className={`flex items-center gap-2 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-indigo-100 p-1 rounded-full"><Bell size={10} className="text-indigo-600 animate-pulse" /></div>
                    <span className="text-[11px] font-bold text-indigo-900 tracking-tight truncate">{messages[index]}</span>
                </div>
            </div>
        );
    }

    // Default Variant (하단 플로팅 내부용)
    return (
        <div className={`w-full flex justify-center pb-3 transition-all duration-500`}>
             <div className={`bg-slate-800/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-2 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <Bell size={12} className="text-yellow-400 animate-pulse" />
                <span className="text-[11px] font-medium truncate">{messages[index]}</span>
            </div>
        </div>
    );
};

// =================================================================
// [컴포넌트] 견적 확인 모달 (Fintech Style) - ⭐️ [수정됨]
// =================================================================
const QuoteModal = ({ calculation, onClose, quoteRef, selectedReviews, toggleReview }) => {
    const { price, label, minimumFeeApplied, itemizedPrices, priceBeforeAllDiscount } = calculation;
    const totalDiscount = priceBeforeAllDiscount - price;
    const isDiscountApplied = totalDiscount > 0;
    const packageItems = itemizedPrices.filter(i => i.quantity > 0 && !i.isDiscount);
    const discountItems = itemizedPrices.filter(i => i.isDiscount);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');

    // ⭐️ 소재별 뱃지 색상 결정 함수
    const getBadgeStyle = (label) => {
        if (label === '에폭시') return 'bg-amber-100 text-amber-700 border border-amber-200';
        if (label === '폴리아스파틱') return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
        if (label === '실리콘') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        return 'bg-slate-100 text-slate-500';
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-premium-in">
            <div className="bg-white w-full max-w-sm sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden animate-slide-up-premium max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">상세 견적서</h3>
                    <button onClick={onClose} className="bg-slate-100 p-2.5 rounded-full text-slate-500 hover:bg-slate-200 transition"><X size={18} /></button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                    <div ref={quoteRef} className="bg-white rounded-3xl shadow-sm border border-slate-100/80 p-6 space-y-6 relative overflow-hidden">
                        {/* 배경 워터마크 효과 */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 text-slate-50 opacity-50 pointer-events-none">
                            <Crown size={120} />
                        </div>

                        {/* 가격 헤더 */}
                        <div className="relative z-10 text-center pb-6 border-b border-dashed border-slate-200">
                             {(minimumFeeApplied || label) && (
                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold mb-3 shadow-sm ${minimumFeeApplied ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {minimumFeeApplied ? <Info size={10}/> : <Crown size={10}/>}
                                    {minimumFeeApplied ? '최소비용 적용' : label}
                                </div>
                            )}
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
                                    {price.toLocaleString()}
                                </span>
                                <span className="text-lg font-bold text-slate-400">원</span>
                            </div>
                            {(isDiscountApplied || minimumFeeApplied) && (priceBeforeAllDiscount > price) && (
                                <div className="text-sm text-slate-400 line-through font-medium mt-1">
                                    {priceBeforeAllDiscount.toLocaleString()}원
                                </div>
                            )}
                        </div>

                        {/* ⭐️ [수정됨] 상세 내역 리스트: 이름+갯수 / 소재뱃지 (금액 제거) */}
                        <div className="space-y-3 relative z-10">
                            {packageItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm group border-b border-slate-50 last:border-0 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">{item.label}</span>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {item.quantity}{ALL_AREAS.find(a=>a.id===item.id)?.unit}
                                        </span>
                                    </div>
                                    {/* ⭐️ 소재별 색상 적용된 뱃지 */}
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${getBadgeStyle(item.materialLabel)}`}>
                                        {item.materialLabel}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        {/* 할인 내역 */}
                        {discountItems.length > 0 && (
                            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2">
                                {discountItems.map((item, index) => (
                                    <div key={index} className='flex justify-between items-center text-xs'>
                                        <div className='flex items-center gap-1.5 font-bold text-rose-600'>
                                            <Gift size={12}/> {item.label}
                                        </div>
                                        <div className='font-bold text-rose-600'>-{item.originalPrice.toLocaleString()}원</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* 숨고 리뷰 버튼 */}
                         <button
                            onClick={() => toggleReview('soomgo_review')}
                            className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${isSoomgoReviewApplied ? 'bg-gradient-to-br from-rose-500 to-pink-600 border-transparent text-white shadow-lg shadow-rose-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`p-2 rounded-full ${isSoomgoReviewApplied ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-500'}`}>
                                    <Star size={16} fill={isSoomgoReviewApplied ? "currentColor" : "currentColor"} />
                                </div>
                                <div className="text-left">
                                    <div className={`text-sm font-bold ${isSoomgoReviewApplied ? 'text-white' : 'text-slate-800'}`}>숨고 포토리뷰 약속</div>
                                    <div className={`text-xs font-medium ${isSoomgoReviewApplied ? 'text-white/90' : 'text-rose-500'}`}>즉시 20,000원 할인 적용</div>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSoomgoReviewApplied ? 'border-white bg-white text-rose-500' : 'border-slate-200 bg-slate-50'}`}>
                                {isSoomgoReviewApplied && <Check size={14} strokeWidth={4} />}
                            </div>
                        </button>
                    </div>
                </div>

                {/* 하단 버튼 그룹 */}
                <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 safe-area-bottom">
                     <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="py-4 bg-[#FAE100] text-[#371D1E] rounded-2xl font-black text-sm hover:bg-[#ffe600] transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
                        <Layers size={18} fill="currentColor"/> 카톡 상담
                    </a>
                    <a href={`tel:${PHONE_NUMBER}`} className="py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                        <Phone size={18} /> 상담원 통화
                    </a>
                </div>
            </div>
        </div>
    );
};

const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-premium-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up-premium max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-amber-400" /> 소재별 장단점 및 추천</h3>
              <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-500 mb-1">Standard</div>
                        <div className="text-lg font-black text-slate-800 mb-2">폴리</div>
                        <ul className="text-xs text-slate-600 space-y-1 text-left">
                            <li className="flex gap-1.5"><ThumbsUp size={12} className="text-indigo-500 mt-0.5"/> 우수한 광택</li>
                            <li className="flex gap-1.5"><ThumbsUp size={12} className="text-indigo-500 mt-0.5"/> 합리적 비용</li>
                            <li className="flex gap-1.5"><ThumbsUp size={12} className="text-indigo-500 mt-0.5"/> 6시간 빠른양생</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-400 text-white text-[9px] px-2 py-0.5 font-bold rounded-bl-lg">BEST</div>
                        <div className="text-xs font-bold text-indigo-500 mb-1">Premium</div>
                        <div className="text-lg font-black text-indigo-900 mb-2">에폭시</div>
                        <ul className="text-xs text-slate-700 space-y-1 text-left">
                            <li className="flex gap-1.5"><Star size={12} className="text-amber-500 mt-0.5"/> 반영구적 수명</li>
                            <li className="flex gap-1.5"><Star size={12} className="text-amber-500 mt-0.5"/> 고급 무광택</li>
                            <li className="flex gap-1.5"><Star size={12} className="text-amber-500 mt-0.5"/> 강력한 방수</li>
                        </ul>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-3 py-3 text-center font-bold text-slate-600 w-1/3">구분</th>
                                <th className="px-3 py-3 text-center font-bold text-slate-700 w-1/3">폴리</th>
                                <th className="px-3 py-3 text-center font-bold text-indigo-700 w-1/3">에폭시</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">내구성</td>
                                <td className="px-3 py-3 text-center text-slate-600">우수 (5년+)</td>
                                <td className="px-3 py-3 text-center font-bold text-indigo-600">최상 (반영구)</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">광택</td>
                                <td className="px-3 py-3 text-center text-slate-600">유광</td>
                                <td className="px-3 py-3 text-center font-bold text-indigo-600">무광/무펄</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">시공 시간</td>
                                <td className="px-3 py-3 text-center font-bold text-blue-600">4~8시간</td>
                                <td className="px-3 py-3 text-center text-slate-600">1~2일</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">물 사용</td>
                                <td className="px-3 py-3 text-center font-bold text-blue-600">6시간 후</td>
                                <td className="px-3 py-3 text-center text-slate-600">24~48시간 후</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-indigo-500"/> 나에게 맞는 소재는?
                    </h4>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1">👍 폴리아스파틱을 추천해요</div>
                        <ul className="text-xs text-slate-500 space-y-1 ml-1 list-disc list-inside">
                            <li>전세/월세 등 단기 거주 예정이신 분</li>
                            <li>빠른 시공과 저렴한 비용을 원하시는 분</li>
                        </ul>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="font-bold text-indigo-900 mb-1">👑 에폭시를 추천해요</div>
                        <ul className="text-xs text-indigo-800/80 space-y-1 ml-1 list-disc list-inside">
                            <li>자가 거주 또는 10년 이상 장기 거주 예정이신 분</li>
                            <li>호텔처럼 차분하고 고급스러운 미관을 원하시는 분</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
                <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg active:scale-[0.98]">확인했습니다</button>
            </div>
          </div>
        </div>
);

const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left font-bold text-slate-700 hover:text-indigo-600 transition duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className='pr-4 leading-relaxed'>{question}</span>
                <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-sm text-slate-500 leading-relaxed animate-premium-in bg-slate-50/50 p-3 rounded-lg mb-2">
                    {answer}
                </div>
            )}
        </div>
    );
};

const ColorPalette = ({ selectedColorId, onSelect, onTileImageUpload, tileImageURL, brightnessLevel, onBrightnessChange, onTileImageReset }) => {
    const baseColorData = GROUT_COLORS.find(c => c.id === selectedColorId) || GROUT_COLORS[0];
    const GROUT_LINE_WIDTH = 12;

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

    return (
        <div className='mt-8 pt-6 border-t border-slate-100'>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
                <Palette className="h-5 w-5 text-indigo-500" /> 색상 미리보기
            </h3>

            {/* 1. 시뮬레이션 화면 */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-4 bg-slate-100 group">
                <div className="w-full aspect-video relative bg-slate-200">
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${effectiveTileImageURL})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }}></div>
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(/logo.png)', backgroundSize: '30%', backgroundRepeat: 'repeat', zIndex: 5 }}></div>
                    
                    {/* 줄눈 라인 */}
                    <div className="absolute top-0 bottom-0 left-1/2" style={{ width: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, transform: 'translateX(-50%)', zIndex: 10 }}></div>
                    <div className="absolute left-0 right-0 top-1/2" style={{ height: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, transform: 'translateY(-50%)', zIndex: 10 }}></div>
                </div>
            </div>

            {/* 2. Tone & Mood 슬라이더 */}
            <div className='mb-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm'>
                <div className='flex items-center justify-between mb-3'>
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm" style={{backgroundColor: effectiveGroutColor}}></div>
                        <span className="text-sm font-bold text-slate-800">{baseColorData.label}</span>
                     </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {brightnessLevel > 0 ? '밝게' : brightnessLevel < 0 ? '어둡게' : '기본'} {Math.abs(brightnessLevel)}%
                    </span>
                </div>
                <div className='flex items-center gap-4'>
                    <span className='text-xs font-medium text-slate-400'>Dark</span>
                    <input
                        type="range" min="-50" max="50" step="10"
                        value={brightnessLevel}
                        onChange={(e) => onBrightnessChange(Number(e.target.value))}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={sliderTrackStyle}
                    />
                    <span className='text-xs font-medium text-slate-400'>Light</span>
                </div>
            </div>

            {/* 3. 우리집 타일 찍기 버튼 */}
            <div className='mb-6 flex gap-3'>
                <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} style={{ display: 'none' }} />
                <label htmlFor="tileFileInput" className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                    <ImageIcon size={16} className="text-slate-400"/> 우리집 타일 첨부하기
                </label>
                {tileImageURL !== DEFAULT_TILE_IMAGE_URL && (
                    <button onClick={onTileImageReset} className="py-3 px-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow-sm">
                        <RefreshCw size={16} />
                    </button>
                )}
            </div>

            {/* 4. 색상 선택 그리드 */}
            <div className='grid grid-cols-5 gap-3'>
                {GROUT_COLORS.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => { onSelect(color.id); onBrightnessChange(0); }}
                        className={`aspect-square rounded-xl shadow-sm transition-all duration-300 relative group overflow-hidden ${
                            selectedColorId === color.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 z-10' : 'hover:scale-105 hover:shadow-md'
                        }`}
                        style={{ backgroundColor: color.code }}
                    >
                        {selectedColorId === color.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <CheckCircle2 size={20} className={`${color.isDark ? 'text-white' : 'text-slate-900'} drop-shadow-sm`} />
                            </div>
                        )}
                        <span className={`absolute bottom-0 inset-x-0 text-[9px] font-bold py-1 text-center truncate ${color.isDark ? 'text-white bg-black/30' : 'text-slate-900 bg-white/50'}`}>
                            {color.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// ⭐️ [App Main] ⭐️
export default function App() {
    // ... (기존 state 및 로직 유지) ...
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

    // ⭐️ 수량 변경 핸들러 (바닥 2곳 합산 로직 포함)
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
            
            // 바닥 합산 계산 (안방+공용)
            const prevFloorCount = (prev['master_bath_floor'] || 0) + (prev['common_bath_floor'] || 0);
            const newFloorCount = (newQuantities['master_bath_floor'] || 0) + (newQuantities['common_bath_floor'] || 0);

            // 현관 무료 로직 (바닥 2곳 이상 시 자동 선택)
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

        // ⭐️ [중요] 안방/공용 바닥을 'bathroom_floor'라는 가상의 키로 합산하여 패키지 매칭
        const virtualPolyFloors = (filteredPolySelections['master_bath_floor'] || 0) + (filteredPolySelections['common_bath_floor'] || 0);
        const virtualEpoxyFloors = (filteredEpoxySelections['master_bath_floor'] || 0) + (filteredEpoxySelections['common_bath_floor'] || 0);
        
        // 기존 개별 키는 유지하되, 패키지 매칭용 합산 키 추가
        if (virtualPolyFloors > 0) filteredPolySelections['bathroom_floor'] = virtualPolyFloors;
        if (virtualEpoxyFloors > 0) filteredEpoxySelections['bathroom_floor'] = virtualEpoxyFloors;

        const totalSelectedCount = Object.values(filteredPolySelections).reduce((sum, v) => sum + v, 0) +
                                   Object.values(filteredEpoxySelections).reduce((sum, v) => sum + v, 0) 
                                   - (virtualPolyFloors > 0 ? virtualPolyFloors : 0) // 중복 합산 방지 (가상키 제외)
                                   - (virtualEpoxyFloors > 0 ? virtualEpoxyFloors : 0);

        if (totalSelectedCount === 0) return null;
        const sortedPackages = MIXED_PACKAGES;

        for (const pkg of sortedPackages) {
            let tempPolySelections = { ...filteredPolySelections };
            let tempEpoxySelections = { ...filteredEpoxySelections };
            let appliedAutoEntrance = false;

            // ⭐️ 패키지 타입에 따라 비교할 키(Key) 정리 (Aliasing 처리)
            const pkgAreaIds = getPackageAreaIds(pkg);
            const usesGenericFloor = pkgAreaIds.includes('bathroom_floor');
            
            // 이 패키지가 'bathroom_floor'를 쓴다면 -> 구체적 바닥 키(master/common)는 비교 대상에서 제거
            // 이 패키지가 구체적 바닥 키를 쓴다면 -> 가상 키(bathroom_floor)는 비교 대상에서 제거
            if (usesGenericFloor) {
                delete tempPolySelections['master_bath_floor'];
                delete tempPolySelections['common_bath_floor'];
                delete tempEpoxySelections['master_bath_floor'];
                delete tempEpoxySelections['common_bath_floor'];
            } else {
                delete tempPolySelections['bathroom_floor'];
                delete tempEpoxySelections['bathroom_floor'];
            }

            // Flexible 패키지 로직 (기존 유지)
            if (pkg.isFlexible) {
                // ...
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

            // Standard Package Logic
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

            // ID Set Check
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
                <div className='mt-3 pt-2 border-t border-slate-100 flex items-center justify-center'>
                     <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                         현관 = 폴리아스파틱 (Poly) 고정
                     </span>
                </div>
            );
        }
        if (['silicon_bathtub', 'silicon_kitchen_top', 'silicon_living_baseboard'].includes(areaId)) {
            return (
                <div className='mt-3 pt-2 border-t border-slate-100 flex items-center justify-center'>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        실리콘 전용 소재
                    </span>
                </div>
            );
        }
        return (
            <div className={`mt-3 pt-2 border-t border-slate-100 ${isQuantitySelected ? 'animate-premium-in' : ''}`}>
                <div className='flex gap-2'>
                    {MATERIALS.map(mat => (
                        <button
                            key={mat.id}
                            onClick={(e) => { e.stopPropagation(); onChange(areaId, mat.id); }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 border
                                ${currentMat === mat.id
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
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
        <div className="space-y-4">
            {areas.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
                
                // ⭐️ 자동선택 로직 (안방+공용 바닥 합산 >= 2 이면 현관 자동)
                const totalBathroomFloor = (quantities['master_bath_floor'] || 0) + (quantities['common_bath_floor'] || 0);
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && totalBathroomFloor >= 2 && !calculation.isPackageActive;
                
                const description = area.desc || area.basePrice ? ((area.desc && area.desc.trim() !== '') ? (<div className="text-xs text-indigo-500 mt-0.5">{area.desc}</div>) : null) : null;

                return (
                    <div key={area.id} className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 group ${isSelected ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-lg' : 'bg-white border-transparent hover:border-slate-200 card-premium-hover shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors duration-300 ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
                                    <Icon size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className={`font-bold text-base transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{area.label}</div>
                                    {description}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => handleQuantityChange(area.id, -1)}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-all active:scale-90 bg-white shadow-sm ${quantities[area.id] > 0 ? 'text-slate-800 hover:text-red-500' : 'text-slate-300'}`}
                                >-</button>
                                <span className={`w-6 text-center text-sm font-black ${quantities[area.id] > 0 ? 'text-slate-800' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                                <button
                                    onClick={() => { handleQuantityChange(area.id, 1); if (quantities[area.id] === 0) handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material); }}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-all active:scale-90 bg-white shadow-sm hover:text-indigo-600 hover:bg-indigo-50 text-slate-800`}
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

    // ⭐️ 4K Premium UI Layout
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-48 selection:bg-indigo-500 selection:text-white">
            <GlobalStyles />

            {/* 💎 Header: 불투명한 흰색 배경 + 부드러운 그림자 */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all duration-300">
                <ReservationTicker variant="top-bar" />
                <div className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                            M
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tighter">
                            MIHAK<span className="text-indigo-600 text-[10px] font-bold ml-1 align-top bg-indigo-50 px-1 rounded">PRO</span>
                        </h1>
                    </div>
                    <div className='flex gap-2'>
                        <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 border border-slate-100 hover:bg-white hover:shadow-md hover:text-indigo-600 transition active:scale-95">
                            <Phone size={18} />
                        </button>
                        <button onClick={() => window.location.reload()} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 border border-slate-100 hover:bg-white hover:shadow-md hover:text-indigo-600 transition active:scale-95">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-5 space-y-10">
                
                {/* 1. Video Section: 4K 카드 디자인 */}
                <section className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/60 border border-white animate-premium-in group relative transform transition-all hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-slate-900/5 z-10 pointer-events-none group-hover:opacity-0 transition"></div>
                    <div className="relative aspect-video w-full bg-slate-900">
                         <iframe key={currentVideo.id} width="100%" height="100%" src={currentEmbedUrl} title={currentVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0"></iframe>
                    </div>
                    <div className="p-2 flex gap-2 bg-white/80 backdrop-blur-md">
                        {YOUTUBE_VIDEOS.map((video) => (
                            <button
                                key={video.id}
                                onClick={() => setActiveVideoId(video.id)}
                                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 active:scale-[0.98] ${activeVideoId === video.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {video.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Materials Section */}
                <section className="animate-premium-in" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200">1</div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">어떤 소재로 할까요?</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                        {MATERIALS.map((item) => {
                            const isSelected = item.id === material;
                            // 테마 로직 유지하되 스타일 클래스 강화
                            const theme = item.id === 'poly' 
                                ? { 
                                    bg: 'bg-white', 
                                    activeBg: 'bg-gradient-to-br from-indigo-50/50 to-white',
                                    border: 'border-slate-100', 
                                    activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20',
                                    badge: 'bg-slate-100 text-slate-600'
                                  }
                                : { 
                                    bg: 'bg-[#FFFCF5]', 
                                    activeBg: 'bg-gradient-to-br from-[#FFF8E1] to-[#FFFCF5]',
                                    border: 'border-amber-100', 
                                    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
                                    badge: 'bg-amber-100 text-amber-700'
                                  };

                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setMaterial(item.id)} 
                                    className={`relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-300 group ${isSelected ? `${theme.activeBorder} shadow-xl ${theme.activeBg}` : `${theme.border} border shadow-sm hover:shadow-lg bg-white`}`}
                                >
                                    <div className="p-7 relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${item.id === 'poly' ? 'bg-slate-400' : 'bg-amber-400'}`}>{item.badge}</span>
                                                </div>
                                                <span className={`font-black text-2xl ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? `bg-slate-900 border-slate-900` : 'border-slate-200 bg-white'}`}>
                                                {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed font-medium ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {item.description}
                                        </p>
                                        
                                        {/* 상세 옵션 버튼 */}
                                        <div className={`grid grid-rows-[0fr] transition-all duration-500 ease-in-out ${isSelected ? 'grid-rows-[1fr] mt-6' : 'mt-0'}`}>
                                            <div className="overflow-hidden">
                                                <div className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-inner flex gap-2">
                                                     {item.id === 'poly' && (
                                                        <>
                                                            <button onClick={(e) => { e.stopPropagation(); setPolyOption('pearl'); }} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all shadow-sm ${polyOption === 'pearl' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-white'}`}>펄</button>
                                                            <button onClick={(e) => { e.stopPropagation(); setPolyOption('no_pearl'); }} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all shadow-sm ${polyOption === 'no_pearl' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-white'}`}>무펄</button>
                                                        </>
                                                    )}
                                                    {item.id === 'kerapoxy' && (
                                                        <>
                                                            <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('starlike'); }} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all shadow-sm ${epoxyOption === 'starlike' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-amber-50/50 text-amber-600/60 hover:bg-white'}`}>스타라이크 EVO</button>
                                                            <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('kerapoxy'); }} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all shadow-sm ${epoxyOption === 'kerapoxy' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-amber-50/50 text-amber-600/60 hover:bg-white'}`}>케라폭시</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <button onClick={() => setShowMaterialModal(true)} className="w-full mt-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-1.5">
                        <HelpCircle size={14} className='text-indigo-500'/> 소재 선택이 고민되시나요? 비교 가이드 보기
                    </button>

                     <ColorPalette
                        selectedColorId={selectedGroutColor} onSelect={setSelectedGroutColor}
                        onTileImageUpload={handleTileImageUpload} tileImageURL={tileImageURL}
                        brightnessLevel={brightnessLevel} onBrightnessChange={setBrightnessLevel}
                        onTileImageReset={handleTileImageReset}
                    />
                </section>

                {/* 3. Areas Section */}
                <section className="animate-premium-in" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-3 mb-6 pt-10 border-t border-slate-200">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200">2</div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">간편 견적 확인</h2>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 flex flex-col gap-3 mb-8">
                         <div className="flex items-start gap-4">
                             <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 mt-0.5">
                                <ShieldCheck size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-indigo-900">추가금 없는 정가제</div>
                                <div className="text-xs text-indigo-700/70 mt-1 leading-relaxed">신축/구축 동일 가격이며, 바닥 30x30cm, 벽 30x60cm 타일크기 기준입니다.</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-4 ml-1 uppercase tracking-widest">Bathroom</h3>
                            {renderAreaList(BATHROOM_AREAS)}
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-4 ml-1 uppercase tracking-widest">Living & Kitchen</h3>
                            {renderAreaList(OTHER_AREAS)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-6 mt-12">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200">3</div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">실리콘 재시공</h2>
                            </div>
                            {renderAreaList(SILICON_AREAS)}
                        </div>
                    </div>
                </section>

                {/* FAQ 및 리뷰 섹션 */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-premium-in" style={{ animationDelay: '300ms' }}>
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <HelpCircle className="h-6 w-6 text-amber-400"/> 자주 묻는 질문
                    </h2>
                    <div className="space-y-1">
                        {FAQ_ITEMS.map((item, index) => <Accordion key={index} question={item.question} answer={item.answer} />)}
                    </div>
                </section>
                
                 <button
                    onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
                    className="w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition transform active:scale-[0.98] shadow-2xl shadow-slate-300 flex items-center justify-center gap-2"
                >
                    <Star size={22} className="text-yellow-400" fill="currentColor" />
                    실제 고객 후기 확인 (5.0점)
                </button>

            </main>

            {/* 💎 ⭐️ [수정됨] Bottom Floating Island Bar: 바닥에서 띄워진 완전 불투명 카드 */}
            {hasSelections && (
                <div className="fixed bottom-6 left-4 right-4 z-50 animate-slide-up-premium">
                    <div className="max-w-lg mx-auto">
                        <div className="px-5 pb-2">
                            <ReservationTicker />
                        </div>
                        {/* glass-premium 제거 -> 완전 불투명 bg-white, 둥근 모서리, 강한 그림자 */}
                        <div className="bg-white border border-slate-100 px-6 pt-6 pb-8 rounded-[2.5rem] shadow-2xl shadow-slate-400/20 safe-area-bottom">
                            <div className='flex items-end justify-between mb-5'>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 mb-1 ml-1">총 견적 예상금액</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{calculation.price.toLocaleString()}</span>
                                        <span className="text-lg font-bold text-slate-500">원</span>
                                    </div>
                                </div>
                                
                                <div className='flex flex-col items-end'>
                                     {calculation.minimumFeeApplied && (
                                        <div className="text-[10px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full mb-1 shadow-sm animate-pulse">
                                            최소비용 적용
                                        </div>
                                    )}
                                    {((calculation.minimumFeeApplied || calculation.isPackageActive) && (calculation.priceBeforeAllDiscount > calculation.price)) && (
                                        <span className="text-sm text-slate-400 line-through font-medium">
                                            {calculation.priceBeforeAllDiscount.toLocaleString()}원
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className='grid grid-cols-5 gap-3'>
                                <button
                                    onClick={() => { setShowModal(true); }}
                                    className="col-span-3 py-4 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-400/30 active:scale-[0.96] transition-all flex items-center justify-center gap-2 text-base"
                                >
                                    <List size={20} /> 견적서 보기
                                </button>
                                <a
                                    href={KAKAO_CHAT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="col-span-2 py-4 rounded-2xl font-bold text-[#371D1E] bg-[#FAE100] hover:bg-[#ffe600] shadow-lg shadow-yellow-400/20 active:scale-[0.96] transition-all flex items-center justify-center gap-2 text-base"
                                >
                                    <Layers size={20} /> 상담
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modals */}
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