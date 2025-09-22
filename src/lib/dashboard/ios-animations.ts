/**
 * iOS 스타일 애니메이션 정의
 * Framer Motion 기반의 iOS 스타일 애니메이션 설정
 */

import { Variants, Transition, TargetAndTransition } from 'framer-motion';

/**
 * Wiggle 애니메이션 설정
 * iOS 홈 화면의 앱 아이콘 흔들림 효과 재현
 */
export const wiggleAnimation: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
  },
  wiggle: {
    rotate: [-2, 2, -2, 2, 0],
    scale: [1, 0.98, 1, 0.98, 1],
    transition: {
      rotate: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
      scale: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },
};

/**
 * 드래그 스프링 애니메이션 설정
 */
export const dragSpringTransition: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

/**
 * 드래그 시작 시 애니메이션
 */
export const dragStartAnimation: TargetAndTransition = {
  scale: 1.1,
  opacity: 0.8,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  zIndex: 1000,
  transition: {
    duration: 0.2,
    ease: 'easeOut',
  },
};

/**
 * 드래그 종료 시 애니메이션
 */
export const dragEndAnimation: TargetAndTransition = {
  scale: 1,
  opacity: 1,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  zIndex: 'auto',
  transition: dragSpringTransition,
};

/**
 * 재배치 트랜지션 효과
 */
export const layoutTransition: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 350,
  mass: 0.5,
};

/**
 * 편집 모드 진입 애니메이션
 */
export const enterEditModeAnimation: Variants = {
  normal: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  edit: {
    scale: 0.95,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * 삭제 버튼 애니메이션
 */
export const deleteButtonAnimation: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -90,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
      delay: 0.1,
    },
  },
  hover: {
    scale: 1.2,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.9,
  },
};

/**
 * 위젯 추가 애니메이션
 */
export const addWidgetAnimation: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
    y: 20,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * 페이지 전환 애니메이션
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};