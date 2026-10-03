import * as React from 'react';
import { ImSpinner2 } from 'react-icons/im';

import clsxm from '@/lib/clsxm';

enum ButtonVariant {
  'primary',
  'outline',
  'ghost',
  'light',
  'dark',
}

type ButtonProps = {
  isLoading?: boolean;
  isDarkBg?: boolean;
  variant?: keyof typeof ButtonVariant;
} & React.ComponentPropsWithRef<'button'>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled: buttonDisabled,
      isLoading,
      variant = 'primary',
      isDarkBg = true,
      ...rest
    },
    ref
  ) => {
    const disabled = isLoading || buttonDisabled;

    return (
      <button
        ref={ref}
        type='button'
        disabled={disabled}
        className={clsxm(
          'inline-flex items-center rounded-none px-2 py-0.5 text-[11px] font-bold',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-400',
          'transition-colors duration-75',
          //#region  //*=========== Variants ===========
          [
            variant === 'primary' && [
              'bg-primary-600 text-primary-50',
              'border border-primary-500',
              'hover:bg-primary-500 hover:text-primary-50',
              'active:bg-primary-700',
              'disabled:bg-primary-800 disabled:hover:bg-primary-800',
            ],
            variant === 'outline' && [
              isDarkBg
                ? [
                    'text-link',
                    'border border-border',
                    'hover:bg-primary-800 active:bg-primary-700 disabled:bg-primary-800',
                  ]
                : [
                    'text-primary-500',
                    'border border-primary-500',
                    'hover:bg-primary-50 active:bg-primary-100 disabled:bg-primary-100',
                  ],
            ],
            variant === 'ghost' && [
              'border border-transparent shadow-none',
              isDarkBg
                ? 'text-link hover:bg-primary-800 hover:text-primary-50 active:bg-primary-700'
                : 'text-primary-500 hover:bg-primary-50 active:bg-primary-100',
            ],
            variant === 'light' && [
              'bg-primary-100 text-primary-900',
              'border border-primary-400',
              'hover:bg-primary-50',
              'active:bg-primary-200 disabled:bg-primary-200',
            ],
            variant === 'dark' && [
              'bg-primary-800 text-primary-50',
              'border border-border',
              'hover:bg-primary-700 active:bg-primary-600 disabled:bg-primary-800',
            ],
          ],
          //#endregion  //*======== Variants ===========
          'disabled:cursor-not-allowed',
          isLoading &&
            'relative text-transparent transition-none hover:text-transparent disabled:cursor-wait',
          className
        )}
        {...rest}
      >
        {isLoading && (
          <div
            className={clsxm(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              {
                'text-primary-50': ['primary', 'dark'].includes(variant),
                'text-primary-900': ['light'].includes(variant),
                'text-link': ['outline', 'ghost'].includes(variant),
              }
            )}
          >
            <ImSpinner2 className='animate-spin' />
          </div>
        )}
        {children}
      </button>
    );
  }
);

export default Button;
