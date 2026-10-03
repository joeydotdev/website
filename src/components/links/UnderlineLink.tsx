import * as React from 'react';

import clsxm from '@/lib/clsxm';

import UnstyledLink, {
  UnstyledLinkProps,
} from '@/components/links/UnstyledLink';

const UnderlineLink = React.forwardRef<HTMLAnchorElement, UnstyledLinkProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <UnstyledLink
        ref={ref}
        {...rest}
        className={clsxm(
          'inline-flex items-center font-semibold underline',
          'focus:outline-none focus-visible:rounded focus-visible:ring focus-visible:ring-primary-400 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
          className
        )}
      >
        {children}
      </UnstyledLink>
    );
  }
);

export default UnderlineLink;
