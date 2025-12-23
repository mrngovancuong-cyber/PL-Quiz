import React, { useEffect, useState } from 'react';
import { Question } from '../types';
import { playSound } from './SoundManager';

interface ModalProps {
  type: 'audience' | 'expert';
  question: Question;
  onClose: () => void;
}

export const LifelineModal: React.FC<ModalProps> = ({ type, question, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playSound('thinking');
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white text-pl-dark w-full max-w-md rounded-2xl p-6 relative border-4 border-pl-purple shadow-2xl">
        <h3 className="text-center font-black text-2xl mb-4 uppercase tracking-tighter text-pl-purple">
          {type === 'audience' ? 'Ý Kiến Khán Giả' : 'Tham Vấn Chuyên Gia'}
        </h3>

        {loading ? (
          <div className="flex flex-col items-center py-8">
             <div className="w-16 h-16 border-4 border-pl-green border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-bold text-pl-purple animate-pulse">Đang kết nối...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
             {type === 'audience' ? <AudienceChart question={question} /> : <ExpertAdvice question={question} />}
             <button 
                onClick={onClose}
                className="mt-6 w-full bg-pl-purple text-white font-black py-3 rounded-xl hover:bg-pl-dark transition-colors"
             >
                ĐÃ HIỂU
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AudienceChart: React.FC<{ question: Question }> = ({ question }) => {
    // Generate biased random data
    const data = [0,0,0,0];
    let remaining = 100;
    // 70-90% chance for correct answer
    const correctVal = 60 + Math.floor(Math.random() * 30);
    data[question.c] = correctVal;
    remaining -= correctVal;
    
    // Distribute rest
    question.a.forEach((_, i) => {
        if (i !== question.c) {
            const val = Math.floor(Math.random() * remaining);
            data[i] = val;
            remaining -= val;
        }
    });
    // Add remainder to random wrong
    const wrongIdx = question.a.findIndex((_, i) => i !== question.c);
    if(wrongIdx > -1) data[wrongIdx] += remaining;

    return (
        <div className="h-48 flex items-end justify-around gap-2 bg-gray-100 rounded-xl p-4 border border-gray-200">
            {data.map((val, i) => (
                <div key={i} className="flex flex-col items-center w-1/4 h-full justify-end group">
                    <div 
                        className="w-full bg-pl-purple rounded-t-md transition-all duration-1000 relative group-hover:bg-pl-pink" 
                        style={{ height: `${val}%` }}
                    >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-xs text-pl-dark">{val}%</span>
                    </div>
                    <span className="font-black mt-2 text-pl-dark text-lg">{String.fromCharCode(65 + i)}</span>
                </div>
            ))}
        </div>
    );
};

const ExpertAdvice: React.FC<{ question: Question }> = ({ question }) => {
    // Danh sách chuyên gia gốc
    const experts = [
        {
            name: "Arsène Wenger",
            title: "Huyền thoại Arsenal",
            avatar: "👴",
            theme: "text-red-600",
            accuracy: 0.9,
            quotes: [
                "Sự tự tin là một thứ rất mong manh. Nó đến bằng đi bộ nhưng ra đi bằng máy bay. Hãy tin vào đáp án [ANS]!",
                "Đừng sợ hãi khi đặt mục tiêu quá cao. Đừng nghi ngờ phương án [ANS].",
                "Bạn không thể mua được tinh thần chiến đấu bằng tiền. Chọn đáp án [ANS] để thắng giải thưởng.",
                "Tôi tin rằng cầu thủ là những nghệ sĩ. Tôi cũng tin vào phương án [ANS]."
            ]
        },
        {
            name: "Sir Alex Ferguson",
            title: "Huyền thoại Man Utd",
            avatar: "🧓",
            theme: "text-blue-700",
            accuracy: 0.9,
            quotes: [
                "Fergie Time rồi! Hãy chọn [ANS] để lật ngược tình thế.",
                "Nếu bạn bỏ cuộc một lần, bạn sẽ bỏ cuộc lần thứ hai. Chọn [ANS] để không bỏ cuộc.",
                "Phong độ là nhất thời, đẳng cấp là mãi mãi. Phương án [ANS] chính là đẳng cấp.",
                "Tôi không bao giờ chơi vì một trận hòa trong đời mình. Tôi chọn [ANS] để có 3 điểm."
            ]
        },
        {
            name: "Tạ Biên Cương",
            title: "Bình luận viên VTV",
            avatar: "🤵",
            theme: "text-green-600",
            accuracy: 0.25, // Thánh Cương tỉ lệ thấp
            quotes: [
                "Sau khi kết thúc hiệp 1 thì trận đấu vẫn có thể còn 45 phút nữa. Tất tay vào [ANS] thôi.",
                "Nếu không có thủ môn thì có lẽ sẽ có nhiều hơn 1 bàn thắng! [ANS] chính là thủ môn xịn.",
                "Bóng đá không có biên giới, và với Biên Cương, tình yêu bóng đá là vô tận.! Chọn [ANS] nhé!",
                "Sân vận động hôm nay không còn một chỗ kín. Đáp án [ANS] vừa được hé lộ."
            ]
        }
    ];

    // Chọn ngẫu nhiên 1 chuyên gia
    const [expert] = useState(() => experts[Math.floor(Math.random() * experts.length)]);
    
    // Tính toán đáp án khuyên dùng dựa trên độ chính xác
    const [advice] = useState(() => {
        const isCorrect = Math.random() < expert.accuracy;
        let recommendedIdx;
        
        if (isCorrect) {
            recommendedIdx = question.c;
        } else {
            // Chọn bừa một đáp án sai
            const wrongIndices = question.a.map((_, i) => i).filter(i => i !== question.c);
            recommendedIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        }
        
        const recommendedChar = String.fromCharCode(65 + recommendedIdx);
        const randomQuote = expert.quotes[Math.floor(Math.random() * expert.quotes.length)];
        return randomQuote.replace("[ANS]", recommendedChar);
    });

    return (
        <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full border-4 overflow-hidden mb-3 bg-gray-100 flex items-center justify-center text-5xl shadow-md`}>
                {expert.avatar}
            </div>
            <p className="font-black text-lg uppercase">{expert.name}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">{expert.title}</p>
            
            <div className="relative p-6 rounded-xl border-l-4 border-pl-purple bg-gray-50 shadow-inner w-full">
                <span className="absolute -top-3 left-4 bg-pl-purple text-white text-[10px] px-2 py-0.5 rounded-full font-bold italic uppercase">
                    Lời khuyên
                </span>
                <p className={`text-center italic leading-relaxed font-semibold ${expert.theme}`}>
                    "{advice}"
                </p>
            </div>
        </div>
    );
}