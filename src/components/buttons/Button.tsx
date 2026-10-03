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
          'inline-flex items-center rounded-sm px-2.5 py-1 text-sm font-medium',
          'focus:outline-none focus-visible:ring focus-visible:ring-primary-400 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
          'transition-colors duration-75',
          //#region  //*=========== Variants ===========
          [
            variant === 'primary' && [
              'bg-primary-500 text-primary-50',
              'border border-primary-600',
              'hover:bg-primary-600 hover:text-primary-50',
              'active:bg-primary-700',
              'disabled:bg-primary-700 disabled:hover:bg-primary-700',
            ],
            variant === 'outline' && [
              isDarkBg
                ? [
                    'text-primary-200',
                    'border border-primary-600',
                    'hover:bg-primary-800 active:bg-primary-700 disabled:bg-primary-800',
                  ]
                : [
                    'text-primary-500',
                    'border border-primary-500',
                    'hover:bg-primary-50 active:bg-primary-100 disabled:bg-primary-100',
                  ],
            ],
            variant === 'ghost' && [
              'shadow-none border border-transparent',
              isDarkBg
                ? 'text-ink hover:bg-primary-800 active:bg-primary-700 disabled:bg-primary-800'
                : 'text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:bg-primary-100',
            ],
            variant === 'light' && [
              'bg-primary-50 text-primary-900',
              'border border-primary-300',
              'hover:bg-primary-100 hover:text-primary-900',
              'active:bg-primary-200 disabled:bg-primary-200',
            ],
            variant === 'dark' && [
              'bg-primary-800 text-primary-50',
              'border border-primary-700',
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
                'text-primary-200': ['outline', 'ghost'].includes(variant),
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
