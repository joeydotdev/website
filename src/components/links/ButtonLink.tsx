import * as React from 'react';

import clsxm from '@/lib/clsxm';

import UnstyledLink, {
  UnstyledLinkProps,
} from '@/components/links/UnstyledLink';

enum ButtonVariant {
  'primary',
  'outline',
  'ghost',
  'light',
  'dark',
}

type ButtonLinkProps = {
  isDarkBg?: boolean;
  variant?: keyof typeof ButtonVariant;
} & UnstyledLinkProps;

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    { children, className, variant = 'primary', isDarkBg = true, ...rest },
    ref
  ) => {
    return (
      <UnstyledLink
        ref={ref}
        {...rest}
        className={clsxm(
          'inline-flex items-center rounded-none px-2 py-0.5 text-[11px] font-bold no-underline',
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
          className
        )}
      >
        {children}
      </UnstyledLink>
    );
  }
);

export default ButtonLink;
